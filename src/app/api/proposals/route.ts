import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (type) {
      where.type = type
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { base_id: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Buscar propostas com paginação
    const [proposals, total] = await Promise.all([
      prisma.proposal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          base_id: true,
          title: true,
          status: true,
          type: true,
          value: true,
          total_setup: true,
          total_monthly: true,
          contract_period: true,
          date: true,
          expiry_date: true,
          created_at: true,
          updated_at: true,
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
      }),
      prisma.proposal.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: {
        proposals,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })
  } catch (error) {
    console.error('Erro ao buscar propostas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Aceitar tanto snake_case quanto camelCase
    const {
      title,
      client,
      type,
      value,
      total_setup,
      totalSetup,
      total_monthly,
      totalMonthly,
      contract_period,
      contractPeriod,
      expiry_date,
      expiryDate,
      products,
      items_data,
      itemsData,
      client_data,
      clientData,
      metadata,
      base_id,
      baseId,
      date,
      status
    } = body

    // SEMPRE usar o base_id fornecido, ou gerar um genérico
    const finalBaseId = base_id || baseId || `PROP-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase()
    
    console.log('🆔 Salvando proposta com base_id:', finalBaseId)

    const proposal = await prisma.proposal.create({
      data: {
        base_id: finalBaseId,
        title,
        client: client || {},
        type: type || 'standard',
        status: status || 'Rascunho',
        value: value || 0,
        total_setup: total_setup || totalSetup || 0,
        total_monthly: total_monthly || totalMonthly || 0,
        contract_period: contract_period || contractPeriod || 12,
        date: date ? new Date(date) : new Date(),
        expiry_date: expiry_date || expiryDate ? new Date(expiry_date || expiryDate) : null,
        products: products || [],
        items_data: items_data || itemsData || [],
        client_data: client_data || clientData || null,
        metadata: metadata || {}
      },
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

    console.log('✅ Proposta salva no banco:', {
      id: proposal.id,
      base_id: proposal.base_id,
      title: proposal.title
    })

    return NextResponse.json({
      success: true,
      data: proposal
    }, { status: 201 })
  } catch (error: any) {
    console.error('❌ Erro ao criar proposta:', error)
    console.error('❌ Erro detalhado:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
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