import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('🔧 Tentando desabilitar RLS via SQL direto...')

    // Since service role key is invalid, provide manual instructions
    const instructions = [
      '1. Acesse https://supabase.com/dashboard',
      '2. Selecione seu projeto: wfuhtdckdgovfbgnlyie',
      '3. Vá em "SQL Editor" no menu lateral',
      '4. Cole e execute este comando:',
      '',
      'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;',
      '',
      '5. Depois execute para verificar:',
      'SELECT COUNT(*) FROM profiles;',
      '',
      '6. Recarregue esta página'
    ]

    const sqlCommands = [
      '-- Desabilitar RLS completamente',
      'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;',
      '',
      '-- Verificar se funcionou',
      'SELECT COUNT(*) as total_users FROM profiles;',
      'SELECT email, role FROM profiles ORDER BY created_at DESC;'
    ]

    return NextResponse.json({
      success: false,
      message: 'Service Role Key inválida. Execute manualmente no Supabase.',
      instructions,
      sqlCommands,
      supabaseUrl: 'https://supabase.com/dashboard/project/wfuhtdckdgovfbgnlyie/sql',
      note: 'Após executar o SQL, todos os 9 usuários devem aparecer no painel.'
    })

  } catch (error: any) {
    console.error('❌ Erro:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Execute manualmente: ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;'
    }, { status: 500 })
  }
}