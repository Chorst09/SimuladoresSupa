// Debug completo do fluxo de emails
const debugEmailFlow = async () => {
  try {
    console.log('🔍 Debugando fluxo completo de emails...');

    // Teste 1: Verificar se a API de teste funciona
    console.log('\n1️⃣ Testando API de teste de email...');
    const testResponse = await fetch('https://simuladores-supa-v2.vercel.app/api/test-email', {
      method: 'GET'
    });

    const testResult = await testResponse.json();
    console.log('📊 Configuração do Vercel:', testResult);

    if (!testResult.resendConfigured) {
      console.log('❌ PROBLEMA: RESEND_API_KEY não está configurada no Vercel!');
      return;
    }

    // Teste 2: Testar envio direto
    console.log('\n2️⃣ Testando envio direto de email...');
    const directResponse = await fetch('https://simuladores-supa-v2.vercel.app/api/test-email', {
      method: 'POST'
    });

    const directResult = await directResponse.json();
    console.log('📧 Resultado do envio direto:', directResult);

    // Teste 3: Testar API de aprovação
    console.log('\n3️⃣ Testando API de aprovação...');
    const approvalResponse = await fetch('https://simuladores-supa-v2.vercel.app/api/send-approval-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail: 'debug@teste.com',
        userName: 'Debug Teste'
      }),
    });

    const approvalResult = await approvalResponse.json();
    console.log('🔔 Resultado da API de aprovação:', JSON.stringify(approvalResult, null, 2));

    // Análise dos resultados
    console.log('\n📋 ANÁLISE DOS RESULTADOS:');
    console.log('='.repeat(50));

    if (testResult.resendConfigured) {
      console.log('✅ Resend configurado no Vercel');
    } else {
      console.log('❌ Resend NÃO configurado no Vercel');
    }

    if (directResult.success) {
      console.log('✅ Envio direto funcionando');
    } else {
      console.log('❌ Envio direto com problema:', directResult.error);
    }

    if (approvalResult.emailSent) {
      console.log('✅ API de aprovação enviando emails');
    } else {
      console.log('❌ API de aprovação NÃO enviando emails');
      console.log('   Erro:', approvalResult.emailError);
    }

  } catch (error) {
    console.error('❌ Erro no debug:', error);
  }
};

debugEmailFlow();