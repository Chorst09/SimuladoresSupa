// Script para testar se a gestão de usuários está funcionando
// Execute: node test-user-management.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfuhtdckdgovfbgnlyie.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGNrZGdvdmZiZ25seWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTU1MjksImV4cCI6MjA3Mzc3MTUyOX0.3bet4TkkR-A6V4H9b05iulxshV1bfx0i0oVYh_uWbUc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUserManagement() {
  try {
    console.log('🔍 Testando carregamento de usuários...');
    
    // Tentar carregar usuários com password_changed
    let { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at, password_changed')
      .limit(5);
    
    if (error && error.message?.includes('password_changed')) {
      console.log('⚠️ Coluna password_changed não existe, tentando sem ela...');
      
      // Tentar sem a coluna
      const { data: usersFallback, error: errorFallback } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .limit(5);
      
      if (errorFallback) {
        throw errorFallback;
      }
      
      users = usersFallback;
      console.log('✅ Carregamento funcionando sem coluna password_changed');
    } else if (error) {
      throw error;
    } else {
      console.log('✅ Carregamento funcionando com coluna password_changed');
    }
    
    console.log(`📊 Encontrados ${users?.length || 0} usuários:`);
    users?.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
    // Verificar estrutura da tabela
    console.log('\n🔍 Verificando estrutura da tabela profiles...');
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'profiles')
      .order('ordinal_position');
    
    if (!columnError && columns) {
      console.log('📋 Colunas da tabela profiles:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testUserManagement();