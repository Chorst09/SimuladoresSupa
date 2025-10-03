// Criar admin diretamente no Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfuhtdckdgovfbgnlyie.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGNrZGdvdmZiZ25seWllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5NTUyOSwiZXhwIjoyMDczNzcxNTI5fQ.Hs8sucy-kcot-fJHhcULaEO-xLJGGOAOlJOEBHBBBHE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
  try {
    console.log('🔄 Criando usuário admin...');
    
    const adminEmail = 'admin@doubletelcom.com.br';
    const adminPassword = 'admin123456';
    
    // Criar usuário usando admin API
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true // Confirmar email automaticamente
    });
    
    if (userError) {
      console.error('❌ Erro ao criar usuário:', userError.message);
      return false;
    }
    
    console.log('✅ Usuário criado:', userData.user.email);
    
    // Criar perfil na tabela profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userData.user.id,
        email: adminEmail,
        role: 'admin',
        full_name: 'Administrador Sistema',
        status: 'approved'
      }, {
        onConflict: 'id'
      })
      .select();
    
    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError.message);
    } else {
      console.log('✅ Perfil criado:', profileData);
    }
    
    // Testar login
    console.log('🔐 Testando login...');
    const supabaseClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGNrZGdvdmZiZ25seWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTU1MjksImV4cCI6MjA3Mzc3MTUyOX0.3bet4TkkR-A6V4H9b05iulxshV1bfx0i0oVYh_uWbUc');
    
    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });
    
    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
    } else {
      console.log('✅ Login funcionando!');
      console.log('👤 Usuário logado:', loginData.user.email);
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Erro geral:', err.message);
    return false;
  }
}

createAdmin();