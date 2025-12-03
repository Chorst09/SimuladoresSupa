import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// PATCH - Atualizar oportunidade de parceiro
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();

    // Buscar a oportunidade existente
    const oportunidadeExistente = await prisma.oportunidadeParceiro.findUnique({
      where: { id },
    });

    if (!oportunidadeExistente) {
      return NextResponse.json(
        { error: 'Oportunidade não encontrada' },
        { status: 404 }
      );
    }

    // Controle de permissões:
    // - Usuário: pode editar apenas suas próprias oportunidades
    // - Administrador e Diretor: podem editar todas
    const userRole = currentUser.role.toLowerCase();
    const isAdminOrDirector = userRole === 'administrador' || userRole === 'diretor';
    const isOwner = oportunidadeExistente.created_by === currentUser.id;

    if (!isAdminOrDirector && !isOwner) {
      return NextResponse.json(
        { error: 'Sem permissão para editar esta oportunidade' },
        { status: 403 }
      );
    }

    // Preparar dados para atualização
    const dataToUpdate: any = {};
    
    if (body.nome_fabricante) dataToUpdate.nome_fabricante = body.nome_fabricante;
    if (body.numero_oportunidade_ext) dataToUpdate.numero_oportunidade_ext = body.numero_oportunidade_ext;
    if (body.cliente_nome) dataToUpdate.cliente_nome = body.cliente_nome;
    if (body.contato_nome) dataToUpdate.contato_nome = body.contato_nome;
    if (body.contato_email) dataToUpdate.contato_email = body.contato_email;
    if (body.contato_telefone !== undefined) dataToUpdate.contato_telefone = body.contato_telefone;
    if (body.produto_descricao) dataToUpdate.produto_descricao = body.produto_descricao;
    if (body.valor !== undefined) dataToUpdate.valor = body.valor;
    if (body.status) dataToUpdate.status = body.status;
    if (body.gerente_contas !== undefined) dataToUpdate.gerente_contas = body.gerente_contas;
    if (body.data_expiracao) dataToUpdate.data_expiracao = new Date(body.data_expiracao);
    if (body.observacoes !== undefined) dataToUpdate.observacoes = body.observacoes;

    // Se o status mudou, criar registro no histórico
    if (body.status && body.status !== oportunidadeExistente.status) {
      await prisma.oportunidadeParceiroHistorico.create({
        data: {
          oportunidade_parceiro_id: id,
          status_anterior: oportunidadeExistente.status,
          status_novo: body.status,
          observacoes: body.observacoes_historico || `Status alterado de ${oportunidadeExistente.status} para ${body.status}`,
          usuario_id: currentUser.id,
        },
      });
    }

    // Atualizar a oportunidade
    const oportunidadeAtualizada = await prisma.oportunidadeParceiro.update({
      where: { id },
      data: dataToUpdate,
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
    });

    return NextResponse.json(oportunidadeAtualizada);
  } catch (error: any) {
    console.error('Erro ao atualizar oportunidade:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Número de oportunidade já existe' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: `Erro ao atualizar oportunidade: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE - Excluir oportunidade de parceiro
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Buscar a oportunidade existente
    const oportunidadeExistente = await prisma.oportunidadeParceiro.findUnique({
      where: { id },
    });

    if (!oportunidadeExistente) {
      return NextResponse.json(
        { error: 'Oportunidade não encontrada' },
        { status: 404 }
      );
    }

    // Controle de permissões:
    // - Usuário: pode excluir apenas suas próprias oportunidades
    // - Administrador e Diretor: podem excluir todas
    const userRole = currentUser.role.toLowerCase();
    const isAdminOrDirector = userRole === 'administrador' || userRole === 'diretor';
    const isOwner = oportunidadeExistente.created_by === currentUser.id;

    if (!isAdminOrDirector && !isOwner) {
      return NextResponse.json(
        { error: 'Sem permissão para excluir esta oportunidade' },
        { status: 403 }
      );
    }

    // Excluir a oportunidade (o histórico será excluído em cascata)
    await prisma.oportunidadeParceiro.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Oportunidade excluída com sucesso' });
  } catch (error: any) {
    console.error('Erro ao excluir oportunidade:', error);
    return NextResponse.json(
      { error: `Erro ao excluir oportunidade: ${error.message}` },
      { status: 500 }
    );
  }
}
