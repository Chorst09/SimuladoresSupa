import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST() {
  try {
    // Usar apenas chave anônima para evitar problemas de API key
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    console.log('🔧 Retornando instruções para correção manual...')

    return NextResponse.json({
      success: true,
      message: 'Execute os comandos SQL manualmente no Supabase Dashboard',
      instructions: [
        '1. Acesse https://supabase.com/dashboard',
        '2. Selecione seu projeto',
        '3. Vá em SQL Editor',
        '4. Execute: ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;',
        '5. Execute: SELECT COUNT(*) FROM profiles;',
        '6. Se funcionar, o RLS foi desabilitado com sucesso',
        '7. Recarregue a página do gerenciamento de usuários'
      ],
      sql_commands: [
        'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;',
        'DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON profiles;',
        'DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON profiles;',
        'DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;',
        'SELECT COUNT(*) FROM profiles;'
      ]
    })

  } catch (error: any) {
    console.error('❌ Erro na correção RLS:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      instructions: [
        'Execute manualmente no Supabase SQL Editor:',
        'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;',
        'Depois teste novamente o sistema'
      ]
    }, { status: 500 })
  }
}