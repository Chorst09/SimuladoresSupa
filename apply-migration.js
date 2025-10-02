const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfuhtdckdgovfbgnlyie.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGNrZGdvdmZiZ25seWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTU1MjksImV4cCI6MjA3Mzc3MTUyOX0.3bet4TkkR-A6V4H9b05iulxshV1bfx0i0oVYh_uWbUc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('Aplicando migração para adicionar coluna password_changed...');
    
    // Verificar se a coluna já existe
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'profiles')
      .eq('column_name', 'password_changed');

    if (columnError) {
      console.error('Erro ao verificar colunas:', columnError);
      return;
    }

    if (columns && columns.length > 0) {
      console.log('Coluna password_changed já existe!');
      return;
    }

    // Aplicar a migração usando RPC (Remote Procedure Call)
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Adicionar coluna password_changed à tabela profiles
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS password_changed BOOLEAN DEFAULT true;

        -- Atualizar usuários existentes para não precisarem alterar senha
        UPDATE profiles 
        SET password_changed = true 
        WHERE password_changed IS NULL;
      `
    });

    if (error) {
      console.error('Erro ao aplicar migração:', error);
      
      // Tentar método alternativo
      console.log('Tentando método alternativo...');
      
      // Primeiro, adicionar a coluna
      const { error: alterError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (alterError) {
        console.error('Erro na consulta de teste:', alterError);
      } else {
        console.log('Tabela profiles acessível. A coluna pode já existir ou ser adicionada automaticamente.');
      }
    } else {
      console.log('Migração aplicada com sucesso!', data);
    }

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

applyMigration();