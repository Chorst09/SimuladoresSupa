// Teste de autenticação Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfuhtdckdgovfbgnlyie.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGNrZGdvdmZiZ25seWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTU1MjksImV4cCI6MjA3Mzc3MTUyOX0.3bet4TkkR-A6V4H9b05iulxshV1bfx0i0oVYh_uWbUc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  try {
    console.log('🔄 Testando configurações de autenticação...');
    
    // Verificar se conseguimos acessar as configurações de auth
    const { data: session, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erro ao obter sessão:', error.message);
    } else {
      console.log('✅ Configurações de auth acessíveis');
      console.log('📊 Sessão atual:', session?.session ? 'Ativa' : 'Nenhuma');
    }
    
    // Verificar se conseguimos acessar usuários (sem login)
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('⚠️ Nenhum usuário logado (normal):', userError.message);
    } else {
      console.log('👤 Usuário atual:', user?.user?.email || 'Nenhum');
    }
    
    // Testar se o endpoint de auth está funcionando
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });
      
      if (response.ok) {
        const settings = await response.json();
        console.log('✅ Endpoint de auth funcionando');
        console.log('⚙️ Configurações:', {
          external_email_enabled: settings.external?.email?.enabled,
          external_phone_enabled: settings.external?.phone?.enabled,
          disable_signup: settings.disable_signup
        });
      } else {
        console.error('❌ Endpoint de auth com problema:', response.status, response.statusText);
      }
    } catch (fetchError) {
      console.error('❌ Erro ao acessar endpoint de auth:', fetchError.message);
    }
    
  } catch (err) {
    console.error('❌ Erro geral:', err.message);
  }
}

testAuth();