import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use available keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  try {
    console.log('🔄 API /users - Carregando usuários...')
    
    // Try service role key first, fallback to anon key
    const keyToUse = supabaseServiceKey || supabaseAnonKey
    console.log('🔑 Usando chave:', supabaseServiceKey ? 'Service Role' : 'Anon')
    
    const supabaseClient = createClient(supabaseUrl, keyToUse, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get all users from profiles table
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError)
      
      // If RLS is blocking, return helpful message
      if (profilesError.message?.includes('RLS') || profilesError.message?.includes('policy')) {
        return NextResponse.json({
          success: false,
          error: 'Políticas RLS estão bloqueando o acesso. Execute o script SQL de correção.',
          users: [],
          count: 0,
          needsRlsFix: true
        })
      }
      
      throw profilesError
    }

    console.log(`✅ ${profiles?.length || 0} usuários encontrados`)

    return NextResponse.json({
      success: true,
      users: profiles || [],
      count: profiles?.length || 0
    })

  } catch (error: any) {
    console.error('❌ Erro na API /users:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      users: [],
      count: 0
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body

    console.log('🔄 API /users POST - Criando usuário:', { email, role })

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email e senha são obrigatórios'
      }, { status: 400 })
    }

    // Check if we have service role key for admin operations
    if (!supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Service Role Key não configurada. Use o cadastro público em /signup',
        needsServiceKey: true
      }, { status: 400 })
    }

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Create user in auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm email
    })

    if (authError) {
      console.error('❌ Erro ao criar usuário na auth:', authError)
      throw authError
    }

    if (!authData.user) {
      throw new Error('Usuário não foi criado')
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: name || email,
        role: role || 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('❌ Erro ao criar profile:', profileError)
      // Try to delete the auth user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    console.log('✅ Usuário criado com sucesso:', authData.user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: email,
        full_name: name || email,
        role: role || 'user'
      }
    })

  } catch (error: any) {
    console.error('❌ Erro na API /users POST:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}