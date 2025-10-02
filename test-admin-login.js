// Script para testar login de admin
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfuhtdckdgovfbgnlyie.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGNrZGdvdmZiZ25seWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTU1MjksImV4cCI6MjA3Mzc3MTUyOX0.3bet4TkkR-A6V4H9b05iulxshV1bfx0i0oVYh_uWbUc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminLogin() {
  try {
    console.log('🔍 Testando processo de login de admin...\n');
    
    // Simular o que acontece quando um admin faz login
    const adminEmails = ['carlos.horst@doubletelecom.com.br', 'admin@example.com'];
    
    for (const email of adminEmails) {
      console.log(`📧 Testando email: ${email}`);
      
      // Verificar se já existe na tabela profiles
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.log(`   ❌ Erro ao verificar perfil: ${profileError.message}`);
      } else if (existingProfile) {
        console.log(`   ✅ Perfil já existe: ${existingProfile.role}`);
      } else {
        console.log(`   ⚠️ Perfil não existe - será criado no primeiro login`);
      }
    }
    
    console.log('\n💡 Para resolver:');
    console.log('1. Faça login na aplicação com carlos.horst@doubletelecom.com.br');
    console.log('2. O sistema criará automaticamente o perfil de admin');
    console.log('3. Acesse a gestão de usuários');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testAdminLogin();