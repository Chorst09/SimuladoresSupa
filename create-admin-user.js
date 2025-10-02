// Script para criar usuário admin de teste
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfuhtdckdgovfbgnlyie.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGNrZGdvdmZiZ25seWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTU1MjksImV4cCI6MjA3Mzc3MTUyOX0.3bet4TkkR-A6V4H9b05iulxshV1bfx0i0oVYh_uWbUc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  try {
    console.log('🔄 Criando usuário admin de teste...');
    
    // Tentar inserir diretamente na tabela profiles
    const adminUser = {
      id: '00000000-0000-0000-0000-000000000001', // ID fixo para teste
      email: 'admin@test.com',
      role: 'admin',
      full_name: 'Administrador Teste',
      password_changed: true,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert(adminUser)
      .select();
    
    if (error) {
      console.error('❌ Erro ao criar usuário:', error.message);
      
      // Tentar sem password_changed
      console.log('🔄 Tentando sem password_changed...');
      const { id, password_changed, ...userWithoutPasswordChanged } = adminUser;
      
      const { data: data2, error: error2 } = await supabase
        .from('profiles')
        .upsert(userWithoutPasswordChanged)
        .select();
      
      if (error2) {
        console.error('❌ Erro mesmo sem password_changed:', error2.message);
      } else {
        console.log('✅ Usuário criado sem password_changed:', data2);
      }
    } else {
      console.log('✅ Usuário admin criado com sucesso:', data);
    }
    
    // Verificar se foi criado
    console.log('\n🔍 Verificando usuários na tabela...');
    const { data: allUsers, error: selectError } = await supabase
      .from('profiles')
      .select('*');
    
    if (selectError) {
      console.error('❌ Erro ao buscar usuários:', selectError.message);
    } else {
      console.log(`✅ Total de usuários: ${allUsers?.length || 0}`);
      allUsers?.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

createAdminUser();