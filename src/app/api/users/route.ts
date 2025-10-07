import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Use available keys
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  try {
    console.log('🔄 API /users - Carregando usuários...')
    console.log('🔑 Debug - URL:', supabaseUrl ? 'OK' : 'MISSING')
    console.log('🔑 Debug - Service Key:', supabaseServiceKey ? 'OK' : 'MISSING')
    console.log('🔑 Debug - Anon Key:', supabaseAnonKey ? 'OK' : 'MISSING')
    
    // First, try with service role key if available
    if (supabaseServiceKey) {
      try {
        console.log('🔑 Tentando com Service Role Key...')
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })

        // Try different approaches to get all users
        let profiles = null;
        let profilesError = null;

        // Approach 1: Simple select all
        console.log('🔍 Tentativa 1: SELECT * simples...')
        const result1 = await supabaseAdmin
          .from('profiles')
          .select('*')

        if (!result1.error && result1.data) {
          profiles = result1.data;
          console.log(`✅ Abordagem 1 funcionou: ${profiles.length} usuários`)
        } else {
          console.log('❌ Abordagem 1 falhou:', result1.error)
          
          // Approach 2: Select with specific columns
          console.log('🔍 Tentativa 2: SELECT com colunas específicas...')
          const result2 = await supabaseAdmin
            .from('profiles')
            .select('id, email, full_name, role, created_at, updated_at')

          if (!result2.error && result2.data) {
            profiles = result2.data;
            console.log(`✅ Abordagem 2 funcionou: ${profiles.length} usuários`)
          } else {
            console.log('❌ Abordagem 2 falhou:', result2.error)
            profilesError = result2.error;
          }
        }

        if (profiles && profiles.length > 0) {
          console.log(`✅ ${profiles.length} usuários encontrados com Service Role Key`)
          console.log('👥 Usuários encontrados:', profiles.map(u => ({ email: u.email, role: u.role })))
          
          return NextResponse.json({
            success: true,
            users: profiles,
            count: profiles.length,
            method: 'service_role'
          })
        } else {
          console.log('❌ Nenhum usuário encontrado com Service Role Key:', profilesError)
        }
      } catch (serviceError) {
        console.log('❌ Falha ao usar Service Role Key:', serviceError)
      }
    }

    // Fallback: try with anon key
    console.log('🔑 Tentando com Anon Key...')
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { data: profiles, error: profilesError } = await supabaseAnon
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('❌ Erro ao buscar profiles com Anon Key:', profilesError)
      
      // If RLS is blocking, return helpful message
      if (profilesError.message?.includes('RLS') || profilesError.message?.includes('policy')) {
        return NextResponse.json({
          success: false,
          error: 'Políticas RLS estão bloqueando o acesso. Clique em "🚨 Corrigir RLS" para resolver.',
          users: [],
          count: 0,
          needsRlsFix: true,
          method: 'anon_blocked'
        })
      }
      
      throw profilesError
    }

    console.log(`✅ ${profiles?.length || 0} usuários encontrados com Anon Key`)

    return NextResponse.json({
      success: true,
      users: profiles || [],
      count: profiles?.length || 0,
      method: 'anon'
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