import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Listar oportunidades de parceiros
export async function GET(request: NextRequest) {
  try {
    // Obter usuário autenticado
    const token = request.cookies.get('auth-token')?.value;
    const currentUser = await getCurrentUser(token);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const fabricante = searchParams.get('fabricante');
    const status = searchParams.get('status');
    const gerenteContas = searchParams.get('gerenteContas');

    const where: any = {};
    if (fabricante) where.nome_fabricante = fabricante;
    if (status) where.status = status;
    if (gerenteContas) where.gerente_contas = gerenteContas;

    // Controle de permissões:
    // - Usuário: vê apenas suas próprias oportunidades
    // - Administrador e Diretor: veem todas
    const userRole = currentUser.role.toLowerCase();
    if (userRole !== 'administrador' && userRole !== 'diretor') {
      // Usuário comum: filtrar por created_by
      where.created_by = currentUser.id;
    }

    const oportunidades = await prisma.oportunidadeParceiro.findMany({
      where,
      include: {
        creator: {
          select: {
            email: true,
            profile: {
              select: {
                full_name: true,
              },
            },
          },
        },
        historico: {
          orderBy: { created_at: 'desc' },
          take: 5,
          include: {
            usuario: {
              select: {
                email: true,
                profile: {
                  select: {
                    full_name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(oportunidades);
  } catch (error) {
    console.error('Erro ao buscar oportunidades:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar oportunidades' },
      { status: 500 }
    );
  }
}

// POST - Criar nova oportunidade de parceiro
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Dados recebidos:', body);
    
    const {
      nome_fabricante,
      numero_oportunidade_ext,
      cliente_nome,
      contato_nome,
      contato_email,
      contato_telefone,
      produto_descricao,
      valor,
      gerente_contas,
      data_expiracao,
      observacoes,
      created_by,
    } = body;

    // Validações
    if (!nome_fabricante || !numero_oportunidade_ext || !cliente_nome || 
        !contato_nome || !contato_email || !produto_descricao || !valor || !data_expiracao) {
      console.log('❌ Validação falhou - campos faltando');
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Preparar dados, removendo created_by se for null/undefined
    const dataToCreate: any = {
      nome_fabricante,
      numero_oportunidade_ext,
      cliente_nome,
      contato_nome,
      contato_email,
      produto_descricao,
      valor,
      data_expiracao: new Date(data_expiracao),
    };

    // Adicionar campos opcionais apenas se tiverem valor
    if (contato_telefone) dataToCreate.contato_telefone = contato_telefone;
    if (gerente_contas) dataToCreate.gerente_contas = gerente_contas;
    if (observacoes) dataToCreate.observacoes = observacoes;
    if (created_by) dataToCreate.created_by = created_by;

    console.log('💾 Tentando criar com dados:', dataToCreate);

    const oportunidade = await prisma.oportunidadeParceiro.create({
      data: dataToCreate,
      include: {
        creator: created_by ? {
          select: {
            email: true,
            profile: {
              select: {
                full_name: true,
              },
            },
          },
        } : false,
      },
    });

    console.log('✅ Oportunidade criada com sucesso:', oportunidade.id);
    return NextResponse.json(oportunidade, { status: 201 });
  } catch (error: any) {
    console.error('❌ Erro ao criar oportunidade:', error);
    console.error('Código do erro:', error.code);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Número de oportunidade já existe' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: `Erro ao criar oportunidade: ${error.message}` },
      { status: 500 }
    );
  }
}
