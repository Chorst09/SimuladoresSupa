import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Buscando usuários...');

    // Buscar todos os usuários com seus perfis
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        user_compat: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`✅ ${users.length} usuários encontrados`);

    // Mapear para o formato esperado
    const mappedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      full_name: user.profile?.full_name || user.email,
      role: user.profile?.role || user.user_compat?.role || 'user',
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
      password_changed: user.password_changed !== null
    }));

    return NextResponse.json({
      success: true,
      users: mappedUsers
    });

  } catch (error: any) {
    console.error('❌ Erro ao buscar usuários:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao buscar usuários'
      },
      { status: 500 }
    );
  }
}
