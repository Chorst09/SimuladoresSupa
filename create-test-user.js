require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUser() {
  try {
    console.log('👤 Criando usuário de teste...')
    
    // Primeiro, vamos criar um usuário via auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@example.com',
      password: '123456789',
      options: {
        data: {
          full_name: 'Admin Test'
        }
      }
    })
    
    if (authError) {
      console.log('❌ Erro ao criar usuário auth:', authError.message)
      
      // Se o usuário já existe, vamos tentar fazer login para pegar o ID
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'admin@example.com',
        password: '123456789'
      })
      
      if (loginError) {
        console.log('❌ Erro ao fazer login:', loginError.message)
        return
      }
      
      console.log('✅ Login bem-sucedido, usando usuário existente')
      authData.user = loginData.user
    }
    
    if (authData.user) {
      console.log('✅ Usuário auth criado/encontrado:', authData.user.email)
      
      // Agora criar o perfil na tabela profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: 'Admin Test',
          role: 'admin'
        })
        .select()
      
      if (profileError) {
        console.log('❌ Erro ao criar perfil:', profileError.message)
        return
      }
      
      console.log('✅ Perfil criado na tabela profiles!')
      console.log('📋 Dados do perfil:', profileData)
      
      // Verificar se foi criado corretamente
      const { data: checkData, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'admin@example.com')
        .single()
      
      if (checkError) {
        console.log('❌ Erro ao verificar perfil:', checkError.message)
        return
      }
      
      console.log('✅ Verificação bem-sucedida!')
      console.log('👤 Usuário criado:')
      console.log(`   Email: ${checkData.email}`)
      console.log(`   Role: ${checkData.role}`)
      console.log(`   Nome: ${checkData.full_name}`)
      console.log('')
      console.log('🎯 Agora você pode fazer login com:')
      console.log('   Email: admin@example.com')
      console.log('   Senha: 123456789')
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message)
  }
}

createTestUser()