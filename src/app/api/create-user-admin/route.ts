import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body

    console.log('🔄 API /create-user-admin - Criando usuário como admin:', { email, role })

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
        error: 'Configuração do servidor incompleta'
      }, { status: 500 })
    }

    // Create client with service key (bypasses RLS and email confirmation)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Create user using admin client (no email confirmation required)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
      phone_confirm: true, // Skip phone confirmation if applicable
      user_metadata: {
        full_name: name || email,
        role: role || 'user'
      }
    })

    // If user was created successfully, also update their email verification status
    if (authData.user && !authError) {
      try {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          authData.user.id,
          {
            email_confirm: true,
            user_metadata: {
              full_name: name || email,
              role: role || 'user'
            }
          }
        )
        
        if (updateError) {
          console.warn('⚠️ Erro ao confirmar email do usuário:', updateError)
        } else {
          console.log('✅ Email confirmado automaticamente para:', email)
        }
      } catch (updateError) {
        console.warn('⚠️ Erro ao atualizar status de confirmação:', updateError)
      }
    }

    if (authError) {
      console.error('❌ Erro ao criar usuário com admin:', authError)
      
      // Handle specific errors
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

    // Create profile using service key (bypasses RLS)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        full_name: name || email,
        role: role || 'user',
        password_changed: false, // Force password change on first login
        created_by_admin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('❌ Erro ao criar profile:', profileError)
      // Don't throw error, user was created successfully
    }

    console.log('✅ Usuário criado com sucesso (admin):', authData.user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: email,
        full_name: name || email,
        role: role || 'user'
      },
      message: 'Usuário criado com sucesso! Não é necessário confirmar email.'
    })

  } catch (error: any) {
    console.error('❌ Erro na API /create-user-admin:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 })
  }
}