import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, userName } = await request.json();

    // Log estruturado que aparecerá nos logs do Vercel
    console.log('🚨🚨🚨 NOVA SOLICITAÇÃO DE ACESSO 🚨🚨🚨');
    console.log('='.repeat(50));
    console.log(`📧 EMAIL: ${userEmail}`);
    console.log(`👤 NOME: ${userName || 'Não informado'}`);
    console.log(`⏰ DATA: ${new Date().toLocaleString('pt-BR')}`);
    console.log(`🔗 AÇÃO: https://simuladores-supa-v2.vercel.app/?admin=user-management`);
    console.log('='.repeat(50));
    console.log('🚨🚨🚨 APROVAÇÃO NECESSÁRIA 🚨🚨🚨');

    // Também criar um alerta visual nos logs
    const alertMessage = `
    ╔════════════════════════════════════════════════════════════════╗
    ║                    🚨 NOVA SOLICITAÇÃO DE ACESSO 🚨            ║
    ║                                                                ║
    ║  Email: ${userEmail.padEnd(45)} ║
    ║  Nome:  ${(userName || 'Não informado').padEnd(45)} ║
    ║  Data:  ${new Date().toLocaleString('pt-BR').padEnd(45)} ║
    ║                                                                ║
    ║  👉 ACESSE: https://simuladores-supa-v2.vercel.app            ║
    ║     Vá em Administração > Gerenciar Usuários                  ║
    ║                                                                ║
    ╚════════════════════════════════════════════════════════════════╝
    `;
    
    console.log(alertMessage);

    return NextResponse.json({
      success: true,
      message: 'Notificação registrada nos logs do Vercel',
      instructions: 'Verifique os logs do Vercel para ver a notificação'
    });

  } catch (error) {
    console.error('❌ Erro na notificação:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}