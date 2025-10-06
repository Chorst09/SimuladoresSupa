import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName } = await request.json();

    if (!userEmail) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY não configurada');
      return NextResponse.json({ error: 'Configuração de email não disponível' }, { status: 500 });
    }

    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

    const emailContent = {
      to: [userEmail],
      subject: '❌ Solicitação de acesso não aprovada - Simuladores Double TI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc2626;">
            <p style="margin: 0; color: #991b1b; font-size: 14px;">
              <strong>🔒 Sistema Simuladores Double TI</strong><br>
              Informação sobre sua solicitação de acesso.
            </p>
          </div>
          
          <h2 style="color: #dc2626;">❌ Solicitação Não Aprovada</h2>
          
          <p>Olá <strong>${userName}</strong>,</p>
          
          <p>Agradecemos seu interesse no Sistema Simuladores Double TI. Infelizmente, sua solicitação de acesso não foi aprovada neste momento.</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">📋 Detalhes:</h3>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Data da Decisão:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            <p><strong>Status:</strong> Acesso não aprovado</p>
          </div>
          
          <h3 style="color: #2563eb;">🤔 Possíveis Motivos:</h3>
          <ul>
            <li>Informações incompletas ou incorretas no cadastro</li>
            <li>Não atendimento aos critérios de acesso atuais</li>
            <li>Limitações de capacidade do sistema</li>
            <li>Política interna da empresa</li>
          </ul>
          
          <h3 style="color: #059669;">🔄 Próximos Passos:</h3>
          <p>Se você acredita que houve um equívoco ou gostaria de mais informações sobre os critérios de acesso, entre em contato conosco:</p>
          
          <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>💡 Importante:</strong> Você pode tentar se cadastrar novamente no futuro, 
              quando os critérios de acesso podem ter mudado.
            </p>
          </div>
          
          <h3 style="color: #2563eb;">📞 Contato:</h3>
          <p>Para esclarecimentos ou nova solicitação:</p>
          <ul>
            <li>Email: suporte@doubletelecom.com.br</li>
            <li>Sistema: ${baseUrl}</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}" 
               style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 14px;">
              🌐 Visitar Site
            </a>
          </div>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            Este email foi enviado automaticamente pelo Sistema Simuladores Double TI.<br>
            Agradecemos seu interesse em nossos serviços.
          </p>
        </div>
      `
    };

    // Enviar email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: emailContent.to,
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Email de negação enviado com sucesso:', result);
      return NextResponse.json({ 
        success: true, 
        message: 'Email de negação enviado com sucesso',
        emailId: result.id 
      });
    } else {
      console.error('Erro ao enviar email de negação:', result);
      return NextResponse.json({ 
        error: 'Erro ao enviar email de negação',
        details: result 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro ao processar envio de email de negação:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}