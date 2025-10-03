// Teste da API de aprovação - Execute com: node test-approval-email-api.js

async function testApprovalEmailAPI() {
  try {
    console.log('🔄 Testando API de email de aprovação...');
    
    const response = await fetch('http://localhost:3000/api/send-approval-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail: 'teste@exemplo.com',
        userName: 'Usuário Teste'
      }),
    });

    const result = await response.json();
    
    console.log('📊 Status:', response.status);
    console.log('📧 Resultado:', result);
    
    if (response.ok) {
      console.log('✅ API funcionando corretamente!');
    } else {
      console.error('❌ Erro na API:', result);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
  }
}

testApprovalEmailAPI();