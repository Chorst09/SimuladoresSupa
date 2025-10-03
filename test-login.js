// Teste de login com Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfuhtdckdgovfbgnlyie.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGNrZGdvdmZiZ25seWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTU1MjksImV4cCI6MjA3Mzc3MTUyOX0.3bet4TkkR-A6V4H9b05iulxshV1bfx0i0oVYh_uWbUc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  try {
    console.log('🔄 Testando login com Supabase...');
    
    // Primeiro, vamos verificar se conseguimos criar um usuário de teste
    const testEmail = 'admin@doubletelcom.com.br';
    const testPassword = 'test123456';
    
    console.log('📝 Tentando criar usuário de teste...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      console.log('⚠️ Erro ao criar usuário (pode já existir):', signUpError.message);
    } else {
      console.log('✅ Usuário criado ou já existe');
    }
    
    // Agora vamos tentar fazer login
    console.log('🔐 Tentando fazer login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      console.error('❌ Código do erro:', loginError.status);
      return false;
    }
    
    console.log('✅ Login realizado com sucesso!');
    console.log('👤 Usuário:', loginData.user?.email);
    return true;
    
  } catch (err) {
    console.error('❌ Erro geral:', err.message);
    return false;
  }
}

testLogin();