import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, verifyPassword, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword, isFirstLogin } = body;

    // Verificar se o usuário está autenticado
    const token = request.cookies.get('auth-token')?.value;
    const user = await getCurrentUser(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Se não é primeiro login, verificar senha atual
    if (!isFirstLogin && currentPassword) {
      const userWithPassword = await prisma.user.findUnique({
        where: { id: user.id },
        select: { encrypted_password: true }
      });

      if (!userWithPassword?.encrypted_password) {
        return NextResponse.json(
          { success: false, error: 'Senha atual não encontrada' },
          { status: 400 }
        );
      }

      const isValidPassword = await verifyPassword(currentPassword, userWithPassword.encrypted_password);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: 'Senha atual incorreta' },
          { status: 400 }
        );
      }
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(newPassword);

    // Atualizar senha no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        encrypted_password: hashedPassword,
        password_changed: new Date()
      }
    });

    // Se for primeiro login, marcar no perfil
    if (isFirstLogin) {
      await prisma.profile.update({
        where: { id: user.id },
        data: {
          updated_at: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}