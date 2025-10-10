import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body

    console.log('🔄 API /create-user-confirmed - Criando usuário com confirmação automática:', { email, role })

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email e senha são obrigatórios'
      }, { status: 400 })
    }

    if (!supabaseServiceKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada')
      return NextResponse.json({
        success: false,
        error: 'Configuração do servidor incompleta - Service Key necessária'
      }, { status: 500 })
    }

    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // First, try to create user with admin privileges
    console.log('🔄 Criando usuário com privilégios admin...')
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // This should skip email confirmation
      user_metadata: {
        full_name: name || email,
        role: role || 'user',
        created_by_admin: true
      }
    })

    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError)

      if (authError.message.includes('User already registered')) {
        return NextResponse.json({
          success: false,
          error: 'Este email já está cadastrado no sistema'
        }, { status: 400 })
      }

      throw authError
    }

    if (!authData.user) {
      throw new Error('Usuário não foi criado')
    }

    console.log('✅ Usuário criado:', authData.user.id, 'Email confirmado:', authData.user.email_confirmed_at)

    // Force email confirmation if not already confirmed
    if (!authData.user.email_confirmed_at) {
      console.log('🔄 Forçando confirmação de email...')

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        authData.user.id,
        {
          email_confirm: true
        }
      )

      if (updateError) {
        console.error('❌ Erro ao confirmar email:', updateError)
      } else {
        console.log('✅ Email confirmado forçadamente')
      }
    }

    // Wait a moment for database consistency
    await new Promise(resolve => setTimeout(resolve, 500))

    // Create or update profile with password_changed flag
    console.log('🔄 Criando profile para usuário:', authData.user.id)

    const profileData = {
      id: authData.user.id,
      email: email,
      full_name: name || email,
      role: role || 'user',
      password_changed: false, // Force password change on first login
      created_by_admin: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('📝 Dados do profile:', profileData)

    const { data: profileData_result, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id'
      })
      .select()

    if (profileError) {
      console.error('❌ Erro ao criar/atualizar profile:', profileError)
      // Don't throw error, user was created successfully
    } else {
      console.log('✅ Profile criado/atualizado:', profileData_result)
    }

    // Verify the user was created by querying it back
    const { data: verifyUser, error: verifyError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (verifyError) {
      console.error('⚠️ Erro ao verificar usuário criado:', verifyError)
    } else {
      console.log('✅ Usuário verificado no banco:', verifyUser)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: email,
        full_name: name || email,
        role: role || 'user',
        email_confirmed: true
      },
      message: 'Usuário criado com sucesso! Email confirmado automaticamente pelo administrador.'
    })

  } catch (error: any) {
    console.error('❌ Erro na API /create-user-confirmed:', error)

    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 })
  }
}