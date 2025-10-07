import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body

    console.log('🔄 API /create-user-simple - Criando usuário:', { email, role })

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email e senha são obrigatórios'
      }, { status: 400 })
    }

    // Create client with anon key
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Create user using normal signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name || email,
          role: role || 'user'
        }
      }
    })

    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError)
      
      // Handle specific errors
      if (authError.message.includes('User already registered')) {
        return NextResponse.json({
          success: false,
          error: 'Este email já está cadastrado no sistema'
        }, { status: 400 })
      }
      
      if (authError.message.includes('only request this after')) {
        return NextResponse.json({
          success: false,
          error: 'Limite de criação atingido. Aguarde 1 minuto e tente novamente'
        }, { status: 429 })
      }
      
      throw authError
    }

    if (!authData.user) {
      throw new Error('Usuário não foi criado')
    }

    // Try to create profile (may fail due to RLS, but that's ok)
    try {
      const { error: profileError } = await supabase
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
        console.warn('⚠️ Erro ao criar profile (pode ser RLS):', profileError)
        // Don't throw error, profile might be created by trigger
      }
    } catch (profileError) {
      console.warn('⚠️ Erro ao criar profile:', profileError)
      // Continue anyway, profile might be created by database trigger
    }

    console.log('✅ Usuário criado:', authData.user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: email,
        full_name: name || email,
        role: role || 'user'
      },
      message: 'Usuário criado com sucesso! Pode ser necessário confirmar o email.'
    })

  } catch (error: any) {
    console.error('❌ Erro na API /create-user-simple:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}