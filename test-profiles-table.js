require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProfilesTable() {
  try {
    console.log('🔍 Testando tabela profiles...')
    
    // Verificar se a tabela existe e tem dados
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    if (error) {
      console.log('❌ Erro ao acessar tabela profiles:', error.message)
      return
    }
    
    console.log('✅ Tabela profiles acessível!')
    console.log('📊 Dados encontrados:', data?.length || 0, 'registros')
    
    if (data && data.length > 0) {
      console.log('👥 Usuários na tabela:')
      data.forEach(user => {
        console.log(`- ${user.email} (${user.role})`)
      })
    } else {
      console.log('⚠️ Nenhum usuário encontrado na tabela profiles')
      console.log('💡 Isso explica por que o login não funciona!')
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message)
  }
}

testProfilesTable()