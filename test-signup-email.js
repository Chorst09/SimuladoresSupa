// Teste completo do fluxo de cadastro e envio de email
const testSignupFlow = async () => {
  try {
    console.log('🧪 Testando fluxo completo de cadastro...');
    
    // Simular um cadastro real
    const response = await fetch('https://simuladores-supa-v2.vercel.app/api/send-approval-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail: 'teste.usuario@exemplo.com',
        userName: 'Usuário de Teste'
      }),
    });

    const result = await response.json();
    
    console.log('📊 Status:', response.status);
    console.log('📧 Resultado completo:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ API de aprovação funcionando!');
      console.log('📬 Email enviado para:', result.adminEmails);
      console.log('📨 Status do envio:', result.emailSent ? 'Enviado' : 'Não enviado');
      if (result.emailError) {
        console.log('❌ Erro no email:', result.emailError);
      }
    } else {
      console.log('❌ Erro na API:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

testSignupFlow();