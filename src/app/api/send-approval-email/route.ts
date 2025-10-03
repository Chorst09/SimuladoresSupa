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

    // Aqui você pode integrar com um serviço de email como Resend, SendGrid, etc.
    // Por enquanto, vamos apenas logar e retornar sucesso
    console.log('📧 Email de aprovação seria enviado para:', {
      admins: admins.map(admin => admin.email),
      newUser: { email: userEmail, name: userName }
    });

    // Simular envio de email
    const emailContent = {
      to: admins.map(admin => admin.email),
      subject: 'Nova solicitação de acesso - Simuladores Double TI',
      html: `
        <h2>Nova Solicitação de Acesso</h2>
        <p>Um novo usuário solicitou acesso ao sistema:</p>
        <ul>
          <li><strong>Email:</strong> ${userEmail}</li>
          <li><strong>Nome:</strong> ${userName || 'Não informado'}</li>
        </ul>
        <p>Para aprovar este usuário, acesse o painel administrativo em:</p>
        <a href="${process.env.NEXTAUTH_URL || 'https://seu-dominio.vercel.app'}/admin">
          Gerenciar Usuários
        </a>
        <p>Você pode definir o nível de acesso como:</p>
        <ul>
          <li><strong>admin:</strong> Acesso total ao sistema</li>
          <li><strong>director:</strong> Acesso a relatórios e gestão</li>
          <li><strong>seller:</strong> Acesso às calculadoras</li>
          <li><strong>user:</strong> Acesso básico</li>
        </ul>
      `
    };

    // TODO: Implementar envio real de email aqui
    // Exemplo com Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send(emailContent);

    return NextResponse.json({
      message: 'Email de aprovação enviado com sucesso',
      admins: admins.length
    });

  } catch (error) {
    console.error('Erro ao enviar email de aprovação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}