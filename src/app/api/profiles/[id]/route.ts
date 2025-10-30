import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const profile = await prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        full_name: true,
        role: true,
        email: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!profile) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Perfil não encontrado' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Erro ao buscar profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const profile = await prisma.profile.update({
      where: { id },
      data: {
        role: body.role,
        full_name: body.full_name,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Erro ao atualizar profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}