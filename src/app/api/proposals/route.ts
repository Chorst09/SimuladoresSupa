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
    const {
      title,
      client,
      type,
      value,
      total_setup,
      total_monthly,
      contract_period,
      expiry_date,
      products,
      items_data,
      client_data,
      metadata,
      base_id // Aceitar base_id do cliente se fornecido
    } = body

    // Se base_id não foi fornecido, gerar um genérico
    let finalBaseId = base_id
    if (!finalBaseId) {
      const timestamp = Date.now().toString(36)
      const random = Math.random().toString(36).substring(2, 8)
      finalBaseId = `PROP-${timestamp}-${random}`.toUpperCase()
    }

    const proposal = await prisma.proposal.create({
      data: {
        base_id: finalBaseId,
        title,
        client: client || {},
        type: type || 'standard',
        status: 'Rascunho',
        value: value || 0,
        total_setup: total_setup || 0,
        total_monthly: total_monthly || 0,
        contract_period: contract_period || 12,
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        products: products || [],
        items_data: items_data || [],
        client_data: client_data || null,
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

    return NextResponse.json({
      success: true,
      data: proposal
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar proposta:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}