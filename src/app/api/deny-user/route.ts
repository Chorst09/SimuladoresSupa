import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token é obrigatório' }, { status: 400 });
    }

    // Decodificar token para obter email e timestamp
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userEmail, timestamp] = decoded.split(':');

    if (!userEmail || !timestamp) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
    }

    // Verificar se o token não expirou (24 horas)
    const tokenAge = Date.now() - parseInt(timestamp);
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas em ms
    
    if (tokenAge > maxAge) {
      return NextResponse.json({ error: 'Token expirado' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar o usuário pelo email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Verificar se o usuário ainda está pendente
    if (user.role !== 'pending') {
      return NextResponse.json({ error: 'Usuário já foi processado' }, { status: 400 });
    }

    // Remover o usuário da base de dados
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('email', userEmail);

    if (deleteError) {
      console.error('Erro ao remover usuário:', deleteError);
      return NextResponse.json({ error: 'Erro ao negar usuário' }, { status: 500 });
    }

    // Enviar email de notificação para o usuário
    try {
      const denialResponse = await fetch(`${request.nextUrl.origin}/api/send-user-denial-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: userEmail,
          userName: user.full_name || userEmail
        }),
      });

      if (!denialResponse.ok) {
        console.error('Erro ao enviar email de negação');
      }
    } catch (emailError) {
      console.error('Erro ao enviar email de negação:', emailError);
    }

    // Retornar página de sucesso
    const successHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Acesso Negado - Simuladores Double TI</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #f9fafb; }
          .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .warning { color: #dc2626; text-align: center; }
          .info { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="warning">
            <h1>🚫 Acesso Negado</h1>
          </div>
          <div class="info">
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Nome:</strong> ${user.full_name || 'Não informado'}</p>
            <p><strong>Data da Negação:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          <p>O acesso foi negado e o usuário foi removido do sistema. Uma notificação foi enviada por email.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${request.nextUrl.origin}/admin/users" class="button">🔧 Gerenciar Outros Usuários</a>
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(successHtml, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error('Erro ao negar usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}