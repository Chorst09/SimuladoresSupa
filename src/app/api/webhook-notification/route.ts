import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName } = await request.json();

    // Webhook do Discord (você pode criar um webhook no seu servidor Discord)
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (discordWebhookUrl) {
      try {
        const discordMessage = {
          content: `🚨 **Nova Solicitação de Acesso - Simuladores Double TI**`,
          embeds: [{
            title: "Novo Usuário Aguardando Aprovação",
            color: 0x2563eb,
            fields: [
              {
                name: "📧 Email",
                value: userEmail,
                inline: true
              },
              {
                name: "👤 Nome",
                value: userName || 'Não informado',
                inline: true
              },
              {
                name: "⏰ Data/Hora",
                value: new Date().toLocaleString('pt-BR'),
                inline: false
              },
              {
                name: "🔗 Ação Necessária",
                value: "[Gerenciar Usuários](https://simuladores-supa-v2.vercel.app/?admin=user-management)",
                inline: false
              }
            ],
            footer: {
              text: "Sistema Simuladores Double TI"
            }
          }]
        };

        const discordResponse = await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(discordMessage),
        });

        if (discordResponse.ok) {
          console.log('✅ Notificação enviada via Discord');
          return NextResponse.json({
            success: true,
            message: 'Notificação enviada via Discord'
          });
        }
      } catch (discordError) {
        console.error('❌ Erro no Discord:', discordError);
      }
    }

    // Fallback: Log detalhado
    console.log('📧 NOTIFICAÇÃO DE NOVO USUÁRIO:', {
      email: userEmail,
      nome: userName,
      timestamp: new Date().toISOString(),
      action: 'Acesse https://simuladores-supa-v2.vercel.app/?admin=user-management para aprovar'
    });

    return NextResponse.json({
      success: true,
      message: 'Notificação registrada nos logs'
    });

  } catch (error) {
    console.error('❌ Erro na notificação:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}