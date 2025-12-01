import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                full_name: true,
                role: true
              }
            }
          }
        }
      }
    })

    if (!proposal) {
      return NextResponse.json(
        { success: false, error: 'Proposta não encontrada' },
        { status: 404 }
      )
    }

    // Garantir que products seja um array (parse se for string)
    let products = proposal.products
    if (typeof products === 'string') {
      try {
        products = JSON.parse(products)
      } catch (e) {
        products = []
      }
    }
    
    // Extrair descontos do metadata
    const metadata = proposal.metadata as any || {}
    
    // Transformar para camelCase
    const proposalData = {
      ...proposal,
      baseId: proposal.base_id,
      totalSetup: proposal.total_setup,
      totalMonthly: proposal.total_monthly,
      contractPeriod: proposal.contract_period,
      expiryDate: proposal.expiry_date,
      createdAt: proposal.created_at,
      updatedAt: proposal.updated_at,
      clientData: proposal.client_data,
      accountManager: proposal.account_manager,
      itemsData: proposal.items_data,
      products: Array.isArray(products) ? products : [],
      // Incluir descontos do metadata
      applySalespersonDiscount: metadata.applySalespersonDiscount || false,
      appliedDirectorDiscountPercentage: metadata.appliedDirectorDiscountPercentage || 0,
      baseTotalMonthly: metadata.baseTotalMonthly || proposal.total_monthly,
      changes: metadata.changes || null
    }

    return NextResponse.json({
      success: true,
      data: proposalData
    })
  } catch (error) {
    console.error('Erro ao buscar proposta:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/proposals/[id]
 * 
 * Atualiza uma proposta existente no banco de dados.
 * 
 * IMPORTANTE: Esta rota ATUALIZA a proposta existente (não cria nova versão).
 * Para criar nova versão, use POST /api/proposals com novo base_id.
 * 
 * Funcionalidades:
 * - Atualiza dados da proposta (cliente, produtos, valores)
 * - Preserva descontos no campo metadata
 * - Mantém histórico de alterações
 * - Suporta tanto camelCase quanto snake_case nos campos
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    console.log('📝 Atualizando proposta:', id)

    // Verificar se a proposta existe
    const existingProposal = await prisma.proposal.findUnique({
      where: { id }
    })

    if (!existingProposal) {
      return NextResponse.json(
        { success: false, error: 'Proposta não encontrada' },
        { status: 404 }
      )
    }

    // Preparar dados para atualização (suporta camelCase e snake_case)
    const dataToUpdate: any = {}

    if (body.title !== undefined) dataToUpdate.title = body.title
    if (body.client !== undefined) dataToUpdate.client = body.client
    if (body.accountManager !== undefined || body.account_manager !== undefined) {
      dataToUpdate.account_manager = body.accountManager || body.account_manager
    }
    if (body.type !== undefined) dataToUpdate.type = body.type
    if (body.status !== undefined) dataToUpdate.status = body.status
    if (body.value !== undefined) dataToUpdate.value = body.value
    if (body.totalSetup !== undefined || body.total_setup !== undefined) {
      dataToUpdate.total_setup = body.totalSetup || body.total_setup
    }
    if (body.totalMonthly !== undefined || body.total_monthly !== undefined) {
      dataToUpdate.total_monthly = body.totalMonthly || body.total_monthly
    }
    if (body.contractPeriod !== undefined || body.contract_period !== undefined) {
      dataToUpdate.contract_period = body.contractPeriod || body.contract_period
    }
    if (body.date !== undefined) dataToUpdate.date = new Date(body.date)
    if (body.expiryDate !== undefined || body.expiry_date !== undefined) {
      const expiryValue = body.expiryDate || body.expiry_date
      dataToUpdate.expiry_date = expiryValue ? new Date(expiryValue) : null
    }
    if (body.version !== undefined) dataToUpdate.version = body.version
    if (body.products !== undefined) dataToUpdate.products = body.products
    if (body.itemsData !== undefined || body.items_data !== undefined) {
      dataToUpdate.items_data = body.itemsData || body.items_data
    }
    if (body.clientData !== undefined || body.client_data !== undefined) {
      dataToUpdate.client_data = body.clientData || body.client_data
    }
    
    /**
     * Atualizar metadata com descontos
     * 
     * O campo metadata armazena informações adicionais da proposta:
     * - baseTotalMonthly: Valor mensal original (sem descontos)
     * - applySalespersonDiscount: Se desconto vendedor (5%) está aplicado
     * - appliedDirectorDiscountPercentage: Percentual do desconto diretoria (0-100%)
     * - changes: Descrição das alterações feitas na proposta
     * 
     * Isso permite:
     * - Recuperar valores originais para auditoria
     * - Manter histórico de descontos aplicados
     * - Calcular descontos corretamente na visualização
     */
    if (body.metadata !== undefined || body.applySalespersonDiscount !== undefined || body.appliedDirectorDiscountPercentage !== undefined) {
      const currentMetadata = existingProposal.metadata as any || {}
      dataToUpdate.metadata = {
        ...currentMetadata,
        ...(body.metadata || {}),
        applySalespersonDiscount: body.applySalespersonDiscount !== undefined ? body.applySalespersonDiscount : currentMetadata.applySalespersonDiscount,
        appliedDirectorDiscountPercentage: body.appliedDirectorDiscountPercentage !== undefined ? body.appliedDirectorDiscountPercentage : currentMetadata.appliedDirectorDiscountPercentage,
        baseTotalMonthly: body.baseTotalMonthly !== undefined ? body.baseTotalMonthly : currentMetadata.baseTotalMonthly,
        changes: body.changes !== undefined ? body.changes : currentMetadata.changes
      }
    }

    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: dataToUpdate,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                full_name: true,
                role: true
              }
            }
          }
        }
      }
    })

    console.log('✅ Proposta atualizada:', updatedProposal.id)

    // Extrair descontos do metadata para retornar
    const metadata = updatedProposal.metadata as any || {}
    const proposalWithDiscounts = {
      ...updatedProposal,
      applySalespersonDiscount: metadata.applySalespersonDiscount || false,
      appliedDirectorDiscountPercentage: metadata.appliedDirectorDiscountPercentage || 0,
      baseTotalMonthly: metadata.baseTotalMonthly || updatedProposal.total_monthly,
      changes: metadata.changes || null
    }

    return NextResponse.json({
      success: true,
      data: proposalWithDiscounts
    })
  } catch (error: any) {
    console.error('❌ Erro ao atualizar proposta:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    console.log('🗑️ Excluindo proposta:', id)

    // Verificar se a proposta existe
    const existingProposal = await prisma.proposal.findUnique({
      where: { id }
    })

    if (!existingProposal) {
      return NextResponse.json(
        { success: false, error: 'Proposta não encontrada' },
        { status: 404 }
      )
    }

    // Excluir a proposta
    await prisma.proposal.delete({
      where: { id }
    })

    console.log('✅ Proposta excluída:', id)

    return NextResponse.json({
      success: true,
      message: 'Proposta excluída com sucesso'
    })
  } catch (error: any) {
    console.error('❌ Erro ao excluir proposta:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
