import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName } = await request.json();

    // Buscar todos os administradores para enviar email
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('role', 'admin');

    if (adminError) {
      console.error('Erro ao buscar administradores:', adminError);
      return NextResponse.json(
        { error: 'Erro ao buscar administradores' },
        { status: 500 }
      );
    }

    if (!admins || admins.length === 0) {
      console.log('Nenhum administrador encontrado');
      return NextResponse.json(
        { message: 'Nenhum administrador encontrado para notificar' },
        { status: 200 }
      );
    }

    // Implementar envio de email usando fetch (funciona sem dependências extras)
    const emailContent = {
      to: admins.map(admin => admin.email),
      subject: 'Nova solicitação de acesso - Simuladores Double TI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nova Solicitação de Acesso</h2>
          <p>Um novo usuário solicitou acesso ao sistema:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Nome:</strong> ${userName || 'Não informado'}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          <p>Para aprovar este usuário, acesse o painel administrativo:</p>
          <a href="https://simuladores-supa-v2.vercel.app/admin-user-management" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0;">
            Gerenciar Usuários
          </a>
          <h3>Níveis de Acesso Disponíveis:</h3>
          <ul>
            <li><strong>admin:</strong> Acesso total ao sistema</li>
            <li><strong>director:</strong> Acesso a relatórios e gestão</li>
            <li><strong>user:</strong> Acesso básico às calculadoras</li>
          </ul>
          <hr style="margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Este email foi enviado automaticamente pelo sistema Simuladores Double TI.
          </p>
        </div>
      `
    };

    // Tentar enviar email usando diferentes métodos
    let emailSent = false;
    let emailError = null;

    // Método 1: Tentar usar Resend se a chave estiver disponível
    if (process.env.RESEND_API_KEY) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'onboarding@resend.dev', // Email padrão do Resend para teste
            to: ['chorstconsult@gmail.com'], // Seu email verificado (Resend só permite este email sem domínio verificado)
            subject: emailContent.subject,
            html: emailContent.html,
          }),
        });

        if (resendResponse.ok) {
          emailSent = true;
          console.log('✅ Email enviado via Resend');
        } else {
          const errorData = await resendResponse.text();
          emailError = `Resend error: ${errorData}`;
        }
      } catch (error: any) {
        emailError = `Resend error: ${error.message}`;
      }
    }

    // Método 2: Log detalhado para debug (sempre executado)
    console.log('📧 Detalhes do email de aprovação:', {
      admins: admins.map(admin => ({ email: admin.email, name: admin.full_name })),
      newUser: { email: userEmail, name: userName },
      emailSent,
      emailError,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      message: emailSent ? 'Email de aprovação enviado com sucesso' : 'Solicitação registrada - Administradores serão notificados',
      admins: admins.length,
      emailSent,
      emailError: emailError || undefined,
      adminEmails: admins.map(admin => admin.email)
    });

  } catch (error) {
    console.error('Erro ao enviar email de aprovação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}