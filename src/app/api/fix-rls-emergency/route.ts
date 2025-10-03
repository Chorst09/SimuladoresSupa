import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🔧 Iniciando correção emergencial RLS...')

    // Primeiro, vamos tentar acessar a tabela diretamente para ver se funciona
    let canAccess = false
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true })
      
      if (!error) {
        canAccess = true
        console.log('✅ Tabela profiles acessível')
      }
    } catch (e) {
      console.log('❌ Tabela profiles inacessível devido ao RLS')
    }

    // Se não conseguimos acessar, o RLS está causando problema
    if (!canAccess) {
      // Vamos tentar usar uma abordagem diferente
      // Criar admin usando auth diretamente
      console.log('🔧 Tentando abordagem alternativa...')
      
      // Verificar se conseguimos pelo menos ver a estrutura
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        throw new Error(`Erro ao acessar usuários auth: ${authError.message}`)
      }

      console.log(`📊 Usuários auth encontrados: ${authUsers.users.length}`)

      return NextResponse.json({
        success: true,
        message: 'RLS precisa ser corrigido manualmente no Supabase',
        instructions: [
          '1. Acesse o Supabase Dashboard',
          '2. Vá em SQL Editor',
          '3. Execute: ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;',
          '4. Execute: DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON profiles;',
          '5. Execute: DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON profiles;',
          '6. Execute: DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;',
          '7. Execute: SELECT COUNT(*) FROM profiles;',
          '8. Se funcionar, o problema está resolvido'
        ],
        details: {
          rls_blocking_access: true,
          auth_users_count: authUsers.users.length,
          manual_fix_required: true
        }
      })
    }

    // Se chegamos aqui, a tabela está acessível
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    console.log(`✅ Tabela profiles funcionando. Total: ${count}`)

    // Criar admin de emergência
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .upsert({
        email: 'admin@doubletelcom.com.br',
        role: 'admin',
        full_name: 'Administrador Sistema',
        status: 'approved'
      }, {
        onConflict: 'email'
      })
      .select()

    if (adminError) {
      console.log('⚠️ Erro ao criar admin:', adminError.message)
    } else {
      console.log('✅ Admin criado/atualizado:', adminData)
    }

    // Verificar admins existentes
    const { data: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, status')
      .eq('role', 'admin')

    return NextResponse.json({
      success: true,
      message: 'Sistema funcionando! RLS não está bloqueando.',
      details: {
        total_profiles: count,
        admins_found: admins?.length || 0,
        admins: admins,
        admin_created: !adminError
      }
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