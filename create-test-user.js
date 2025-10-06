const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wfuhtdckdgovfbgnlyie.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGNrZGdvdmZiZ25seWllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODE5NTUyOSwiZXhwIjoyMDczNzcxNTI5fQ.Hs8sucy-kcot-fJHhcULaEO-xLJGGOAOlJOEBHBBBHE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  try {
    // Primeiro, deletar usuário existente se houver
    await supabase
      .from('profiles')
      .delete()
      .eq('email', 'chorst0918@gmail.com');

    // Criar usuário de teste
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: 'test-user-id-' + Date.now(),
        email: 'chorst0918@gmail.com',
        role: 'pending',
        full_name: 'Carlos Horst',
        created_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('Erro ao criar usuário:', error);
    } else {
      console.log('✅ Usuário de teste criado:', data);
    }
  } catch (err) {
    console.error('Erro geral:', err);
  }
}

createTestUser();