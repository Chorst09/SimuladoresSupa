// Teste das variáveis de ambiente no Vercel
const testVercelEnv = async () => {
  try {
    console.log('🧪 Testando configuração do Vercel...');
    
    // Testar API GET primeiro
    const getResponse = await fetch('https://simuladores-supa-v2.vercel.app/api/test-email', {
      method: 'GET'
    });

    const getResult = await getResponse.json();
    console.log('📊 Configuração:', getResult);
    
    if (!getResult.resendConfigured) {
      console.log('❌ RESEND_API_KEY não está configurada no Vercel!');
      console.log('🔧 Você precisa adicionar a variável de ambiente no dashboard do Vercel');
      return;
    }

    // Se configurada, testar envio
    console.log('✅ Resend configurado, testando envio...');
    
    const postResponse = await fetch('https://simuladores-supa-v2.vercel.app/api/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const postResult = await postResponse.json();
    console.log('📧 Resultado do teste:', postResult);
    
    if (postResult.success) {
      console.log('✅ Email de teste enviado com sucesso!');
      console.log('📬 Verifique o email chorstconsult@gmail.com');
    } else {
      console.log('❌ Erro no envio:', postResult.error);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

testVercelEnv();