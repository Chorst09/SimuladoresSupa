// Script de teste para verificar a conexão com Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://wfuhtdckdgovfbgnlyie.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGNrZGdvdmZiZ25seWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTU1MjksImV4cCI6MjA3Mzc3MTUyOX0.3bet4TkkR-A6V4H9b05iulxshV1bfx0i0oVYh_uWbUc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('🧪 Testando conexão com Supabase...\n');

  try {
    // Teste 1: Verificar conexão
    console.log('1️⃣ Testando conexão básica...');
    const { data, error } = await supabase.from('contacts').select('count', { count: 'exact' });
    
    if (error) {
      console.log('❌ Erro na conexão:', error.message);
      return;
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log(`📊 Total de registros na tabela contacts: ${data.length}\n`);

    // Teste 2: Inserir dados de teste
    console.log('2️⃣ Testando inserção de dados...');
    const testData = {
      name: 'Teste Supabase',
      email: 'teste@supabase.com',
      message: 'Esta é uma mensagem de teste para verificar se a inserção está funcionando.'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('contacts')
      .insert([testData])
      .select();

    if (insertError) {
      console.log('❌ Erro na inserção:', insertError.message);
      return;
    }

    console.log('✅ Dados inseridos com sucesso!');
    console.log('📝 Dados inseridos:', insertData[0]);
    console.log(`🆔 ID gerado: ${insertData[0].id}\n`);

    // Teste 3: Buscar dados
    console.log('3️⃣ Testando busca de dados...');
    const { data: selectData, error: selectError } = await supabase
      .from('contacts')
      .select('*')
      .eq('email', 'teste@supabase.com')
      .order('created_at', { ascending: false })
      .limit(1);

    if (selectError) {
      console.log('❌ Erro na busca:', selectError.message);
      return;
    }

    console.log('✅ Busca realizada com sucesso!');
    console.log('🔍 Dados encontrados:', selectData[0]);
    console.log(`📅 Criado em: ${new Date(selectData[0].created_at).toLocaleString('pt-BR')}\n`);

    // Teste 4: Limpar dados de teste
    console.log('4️⃣ Limpando dados de teste...');
    const { error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .eq('email', 'teste@supabase.com');

    if (deleteError) {
      console.log('⚠️ Aviso: Não foi possível limpar os dados de teste:', deleteError.message);
    } else {
      console.log('✅ Dados de teste removidos com sucesso!\n');
    }

    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Supabase está configurado corretamente e pronto para uso.');

  } catch (error) {
    console.log('❌ Erro inesperado:', error.message);
  }
}

// Executar os testes
testSupabaseConnection();
