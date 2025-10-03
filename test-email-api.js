// Teste da nova API de email
const testEmailAPI = async () => {
  try {
    console.log('🧪 Testando API de email...');
    
    const response = await fetch('https://simuladores-supa-v2.vercel.app/api/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const result = await response.json();
    
    console.log('📊 Status:', response.status);
    console.log('📧 Resultado:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Email de teste enviado com sucesso!');
    } else {
      console.log('❌ Erro no envio:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

testEmailAPI();