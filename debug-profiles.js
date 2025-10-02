// Script para debugar a tabela profiles
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfuhtdckdgovfbgnlyie.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGNrZGdvdmZiZ25seWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTU1MjksImV4cCI6MjA3Mzc3MTUyOX0.3bet4TkkR-A6V4H9b05iulxshV1bfx0i0oVYh_uWbUc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProfiles() {
  try {
    console.log('🔍 Debugando tabela profiles...\n');
    
    // 1. Verificar se a tabela existe e suas colunas
    console.log('1️⃣ Verificando estrutura da tabela...');
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'profiles')
      .order('ordinal_position');
    
    if (columnError) {
      console.error('❌ Erro ao verificar colunas:', columnError.message);
    } else if (columns && columns.length > 0) {
      console.log('✅ Colunas encontradas:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
    } else {
      console.log('⚠️ Nenhuma coluna encontrada ou tabela não existe');
    }
    
    // 2. Tentar contar registros
    console.log('\n2️⃣ Verificando registros...');
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar registros:', countError.message);
    } else {
      console.log(`✅ Total de registros: ${count}`);
    }
    
    // 3. Tentar buscar alguns registros
    console.log('\n3️⃣ Buscando registros...');
    const { data: profiles, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (selectError) {
      console.error('❌ Erro ao buscar registros:', selectError.message);
    } else {
      console.log(`✅ Registros encontrados: ${profiles?.length || 0}`);
      if (profiles && profiles.length > 0) {
        profiles.forEach((profile, index) => {
          console.log(`   ${index + 1}. ${profile.email} (${profile.role}) - password_changed: ${profile.password_changed}`);
        });
      }
    }
    
    // 4. Verificar usuários autenticados
    console.log('\n4️⃣ Verificando usuários do Auth...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erro ao listar usuários do Auth:', authError.message);
    } else {
      console.log(`✅ Usuários no Auth: ${authUsers.users?.length || 0}`);
      authUsers.users?.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (ID: ${user.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

debugProfiles();