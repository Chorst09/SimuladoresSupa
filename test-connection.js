// Teste rápido de conexão com Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfuhtdckdgovfbgnlyie.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGNrZGdvdmZiZ25seWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTU1MjksImV4cCI6MjA3Mzc3MTUyOX0.3bet4TkkR-A6V4H9b05iulxshV1bfx0i0oVYh_uWbUc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🧪 Testando conexão com Supabase...');
  
  try {
    // Testar inserção
    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          name: 'Teste Conexão',
          email: 'teste@conexao.com',
          message: 'Testando conexão direta'
        }
      ])
      .select();

    if (error) {
      console.log('❌ Erro:', error);
    } else {
      console.log('✅ Sucesso! Dados inseridos:', data);
    }
  } catch (err) {
    console.log('❌ Erro de conexão:', err.message);
  }
}

testConnection();
