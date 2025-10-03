// Teste da API de email direto
const testDirectEmail = async () => {
  try {
    console.log('🧪 Testando API de email direto...');
    
    // Aguardar deploy
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    const response = await fetch('https://simuladores-supa-v2.vercel.app/api/send-email-direct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail: 'teste.direto@exemplo.com',
        userName: 'Teste Email Direto'
      }),
    });

    const result = await response.json();
    
    console.log('📊 Status:', response.status);
    console.log('📧 Resultado:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Email direto enviado com sucesso!');
      console.log('📬 Verifique o email carlos.horst@doubletelecom.com.br');
    } else {
      console.log('❌ Erro no email direto:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

testDirectEmail();