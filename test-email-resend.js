// Teste do Resend - Execute com: node test-email-resend.js
const RESEND_API_KEY = 're_hEHeZW6M_5dBhx9Uw6wBGQX5MeHyRbEEc';

async function testResendEmail() {
  try {
    console.log('🔄 Testando envio de email com Resend...');
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: ['carlos.horst@doubletelcom.com.br'],
        subject: 'Teste - Sistema Simuladores Double TI',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🎉 Email de Teste</h2>
            <p>Este é um email de teste do sistema Simuladores Double TI.</p>
            <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            <p>Se você recebeu este email, o sistema de notificações está funcionando perfeitamente!</p>
            <hr style="margin: 20px 0;">
            <p style="color: #6b7280; font-size: 12px;">
              Este email foi enviado automaticamente para testar o sistema.
            </p>
          </div>
        `
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email enviado com sucesso!');
      console.log('📧 ID do email:', result.id);
      console.log('📊 Resultado completo:', result);
    } else {
      console.error('❌ Erro ao enviar email:', result);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testResendEmail();