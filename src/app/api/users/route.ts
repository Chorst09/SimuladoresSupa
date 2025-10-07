import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use available keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  try {
    console.log('🔄 API /users - Carregando usuários...')
    
    // Use only anon key since service key is invalid
    console.log('🔑 Usando apenas Anon Key (service key inválida)...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('❌ Erro ao buscar profiles:', profilesError)
      
      // If RLS is blocking, return helpful message
      if (profilesError.message?.includes('RLS') || profilesError.message?.includes('policy')) {
        return NextResponse.json({
          success: false,
          error: 'RLS está limitando o acesso. Apenas 2 usuários visíveis. Clique em "🚨 Corrigir RLS" para ver todos os 9 usuários.',
          users: [],
          count: 0,
          needsRlsFix: true,
          method: 'anon_blocked'
        })
      }
      
      throw profilesError
    }

    console.log(`✅ ${profiles?.length || 0} usuários encontrados`)
    console.log('👥 Usuários:', profiles?.map(u => ({ email: u.email, role: u.role })))

    // If we only got 2 users but expect more, suggest RLS fix
    if (profiles && profiles.length === 2) {
      console.log('⚠️ Apenas 2 usuários encontrados - RLS pode estar limitando')
    }

    return NextResponse.json({
      success: true,
      users: profiles || [],
      count: profiles?.length || 0,
      method: 'anon',
      warning: profiles?.length === 2 ? 'RLS pode estar limitando o acesso. Use "Corrigir RLS" para ver todos os usuários.' : null
    })

  } catch (error: any) {
    console.error('❌ Erro na API /users:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      users: [],
      count: 0,
      method: 'error'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body

    console.log('🔄 API /users POST - Criando usuário:', { email, role })
    console.log('🔑 Debug - supabaseUrl:', supabaseUrl ? 'OK' : 'MISSING')
    console.log('🔑 Debug - supabaseServiceKey:', supabaseServiceKey ? 'OK' : 'MISSING')
    console.log('🔑 Debug - supabaseAnonKey:', supabaseAnonKey ? 'OK' : 'MISSING')

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email e senha são obrigatórios'
      }, { status: 400 })
    }

    // Check if we have service role key for admin operations
    if (!supabaseServiceKey) {
      console.log('❌ Service Role Key não encontrada')
      return NextResponse.json({
        success: false,
        error: 'Service Role Key não configurada. Use o cadastro público em /signup',
        needsServiceKey: true
      }, { status: 400 })
    }

    // Validate required parameters
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(`Missing required parameters: URL=${!!supabaseUrl}, Key=${!!supabaseServiceKey}`)
    }

    console.log('🔧 Criando cliente Supabase admin...')
    
    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('✅ Cliente Supabase admin criado')

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