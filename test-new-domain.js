// Teste do novo domínio e API key
const testNewDomain = async () => {
  try {
    console.log('🧪 Testando novo domínio e API key...');
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_UGUJ3fpU_4vzyKYfgLVo2G2qNosSLfhrj',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: ['carlos.horst@doubletelecom.com.br'],
        subject: 'Teste - Novo Domínio Configurado - Simuladores Double TI',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2563eb;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>🎯 Sistema Simuladores Double TI</strong><br>
                Teste do novo domínio verificado funcionando!
              </p>
            </div>
            <h2 style="color: #2563eb;">✅ Domínio Configurado com Sucesso!</h2>
            <p>Este é um teste para confirmar que:</p>
            <ul>
              <li>✅ Domínio <strong>doubletelecom.com.br</strong> está verificado</li>
              <li>✅ Nova API key está funcionando</li>
              <li>✅ Emails chegam diretamente no email corporativo</li>
            </ul>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              <p><strong>Status:</strong> Sistema de emails funcionando perfeitamente!</p>
            </div>
            <hr style="margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              Este email foi enviado automaticamente pelo sistema Simuladores Double TI.
            </p>
          </div>
        `
      }),
    });

    const result = await response.text();
    
    console.log('📊 Status:', response.status);
    console.log('📧 Resultado:', result);
    
    if (response.ok) {
      console.log('✅ Email enviado com sucesso para o domínio corporativo!');
      console.log('📬 Verifique o email carlos.horst@doubletelecom.com.br');
    } else {
      console.log('❌ Erro no envio:', result);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
};

testNewDomain();