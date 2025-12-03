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
      password_changed: user.password_changed !== null,
      account_status: user.account_status || 'approved' // default para usuários antigos
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, role } = body;

    console.log('👤 Criando usuário pelo admin:', email);

    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Importar authService
    const { authService } = await import('@/lib/database');
    const bcrypt = await import('bcryptjs');

    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário com status aprovado e senha temporária
    const user = await authService.createUser({
      email,
      encrypted_password: hashedPassword,
      full_name,
      role,
      created_by_admin: true
    });

    console.log('✅ Usuário criado com sucesso:', user.id);

    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        email: email,
        full_name: full_name,
        role: role
      }
    });

  } catch (error: any) {
    console.error('❌ Erro ao criar usuário:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Email já está em uso' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao criar usuário'
      },
      { status: 500 }
    );
  }
}
