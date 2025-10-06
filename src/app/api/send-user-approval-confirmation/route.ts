import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName, role } = await request.json();

    if (!userEmail || !role) {
      return NextResponse.json({ error: 'Email e role são obrigatórios' }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY não configurada');
      return NextResponse.json({ error: 'Configuração de email não disponível' }, { status: 500 });
    }

    // Mapear roles para descrições amigáveis
    const roleDescriptions = {
      admin: 'Administrador - Acesso total ao sistema',
      director: 'Diretor - Acesso a relatórios e gestão',
      user: 'Usuário - Acesso básico às calculadoras'
    };

    const roleDescription = roleDescriptions[role as keyof typeof roleDescriptions] || role;
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

    const emailContent = {
      to: [userEmail],
      subject: '✅ Seu acesso foi aprovado - Simuladores Double TI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #059669;">
            <p style="margin: 0; color: #065f46; font-size: 14px;">
              <strong>🎉 Sistema Simuladores Double TI</strong><br>
              Parabéns! Seu acesso foi aprovado com sucesso.
            </p>
          </div>
          
          <h2 style="color: #059669;">✅ Acesso Aprovado!</h2>
          
          <p>Olá <strong>${userName}</strong>,</p>
          
          <p>Temos o prazer de informar que sua solicitação de acesso ao Sistema Simuladores Double TI foi <strong>aprovada</strong>!</p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
            <h3 style="color: #059669; margin-top: 0;">📋 Detalhes do seu Acesso:</h3>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Nível de Acesso:</strong> ${roleDescription}</p>
            <p><strong>Data de Aprovação:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          
          <h3 style="color: #2563eb;">🚀 Próximos Passos:</h3>
          <ol>
            <li>Acesse o sistema usando o link abaixo</li>
            <li>Faça login com seu email e senha cadastrados</li>
            <li>Explore as funcionalidades disponíveis para seu nível de acesso</li>
          </ol>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${baseUrl}/login" 
               style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: bold;">
              🔐 Acessar Sistema
            </a>
          </div>
          
          <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>💡 Dica:</strong> Salve este email para referência futura. 
              Se tiver dúvidas sobre como usar o sistema, entre em contato com nossa equipe.
            </p>
          </div>
          
          <h3 style="color: #2563eb;">📞 Suporte:</h3>
          <p>Se precisar de ajuda ou tiver alguma dúvida, nossa equipe está à disposição:</p>
          <ul>
            <li>Email: suporte@doubletelecom.com.br</li>
            <li>Sistema: ${baseUrl}</li>
          </ul>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            Este email foi enviado automaticamente pelo Sistema Simuladores Double TI.<br>
            Você está recebendo este email porque solicitou acesso ao nosso sistema.
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
      console.log('Email de confirmação enviado com sucesso:', result);
      return NextResponse.json({ 
        success: true, 
        message: 'Email de confirmação enviado com sucesso',
        emailId: result.id 
      });
    } else {
      console.error('Erro ao enviar email de confirmação:', result);
      return NextResponse.json({ 
        error: 'Erro ao enviar email de confirmação',
        details: result 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro ao processar envio de email de confirmação:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}