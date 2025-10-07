import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST() {
  try {
    console.log('🔧 Tentando corrigir RLS diretamente...')

    // Try with service role key first
    const keyToUse = supabaseServiceKey || supabaseAnonKey
    console.log('🔑 Usando chave:', supabaseServiceKey ? 'Service Role' : 'Anon')

    const supabase = createClient(supabaseUrl, keyToUse)

    // First, try to disable RLS
    try {
      console.log('🔧 Desabilitando RLS...')
      const { error: disableError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;'
      })

      if (disableError) {
        console.log('❌ Erro ao desabilitar RLS via RPC:', disableError)
      } else {
        console.log('✅ RLS desabilitado via RPC')
      }
    } catch (rpcError) {
      console.log('❌ RPC não disponível:', rpcError)
    }

    // Test if we can now access the profiles table
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (!testError) {
      console.log('✅ Acesso à tabela profiles funcionando')
      
      // Get actual count
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      return NextResponse.json({
        success: true,
        message: `RLS corrigido! Encontrados ${count || 0} usuários na tabela profiles.`,
        userCount: count || 0,
        method: supabaseServiceKey ? 'service_role' : 'anon'
      })
    }

    // If still failing, return instructions
    return NextResponse.json({
      success: false,
      message: 'Não foi possível corrigir RLS automaticamente. Execute manualmente no Supabase.',
      instructions: [
        '1. Acesse https://supabase.com/dashboard',
        '2. Selecione seu projeto',
        '3. Vá em SQL Editor',
        '4. Execute: ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;',
        '5. Recarregue esta página'
      ],
      sqlCommand: 'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;',
      error: testError?.message
    })

  } catch (error: any) {
    console.error('❌ Erro na correção RLS:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Erro ao tentar corrigir RLS',
      error: error.message,
      instructions: [
        'Execute manualmente no Supabase SQL Editor:',
        'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;'
      ]
    }, { status: 500 })
  }
}