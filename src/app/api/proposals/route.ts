import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const all = searchParams.get('all') === 'true' // Novo parâmetro para buscar todas
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

    // Buscar propostas com ou sem paginação
    const [proposalsRaw, total] = await Promise.all([
      prisma.proposal.findMany({
        where,
        skip: all ? undefined : skip,
        take: all ? undefined : limit,
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
          version: true,
          client: true,
          client_data: true,
          account_manager: true,
          products: true,
          items_data: true,
          metadata: true,
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

    // Transformar para camelCase para compatibilidade com frontend
    const proposals = proposalsRaw.map(p => ({
      ...p,
      baseId: p.base_id,
      totalSetup: p.total_setup,
      totalMonthly: p.total_monthly,
      contractPeriod: p.contract_period,
      expiryDate: p.expiry_date,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      clientData: p.client_data,
      accountManager: p.account_manager,
      itemsData: p.items_data
    }))

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
  let body: any
  
  try {
    body = await request.json()
    
    // Aceitar tanto snake_case quanto camelCase
    const {
      title,
      client,
      account_manager,
      accountManager,
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
      status,
      version
    } = body

    // Gerar base_id único
    let finalBaseId = base_id || baseId
    
    // Se não foi fornecido um base_id, gerar um único
    if (!finalBaseId) {
      finalBaseId = `PROP-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase()
    }
    
    console.log('🆔 Tentando salvar proposta com base_id:', finalBaseId)

    // Verificar se já existe uma proposta com este base_id
    const existingProposal = await prisma.proposal.findUnique({
      where: { base_id: finalBaseId }
    })

    if (existingProposal) {
      console.log('⚠️ base_id já existe, gerando um novo com sufixo único')
      // Se já existe, adicionar um sufixo único
      const timestamp = Date.now().toString(36)
      const random = Math.random().toString(36).substring(2, 6)
      finalBaseId = `${finalBaseId}_${timestamp}${random}`.toUpperCase()
      console.log('🆔 Novo base_id gerado:', finalBaseId)
    }

    const proposal = await prisma.proposal.create({
      data: {
        base_id: finalBaseId,
        title,
        client: client || {},
        account_manager: account_manager || accountManager || null,
        type: type || 'standard',
        status: status || 'Rascunho',
        value: value || 0,
        total_setup: total_setup || totalSetup || 0,
        total_monthly: total_monthly || totalMonthly || 0,
        contract_period: contract_period || contractPeriod || 12,
        date: date ? new Date(date) : new Date(),
        expiry_date: expiry_date || expiryDate ? new Date(expiry_date || expiryDate) : null,
        version: version || 1,
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
    
    // Se ainda assim houver erro de duplicata, tentar uma última vez com ID completamente aleatório
    if (error.code === 'P2002' && error.meta?.target?.includes('base_id')) {
      console.log('🔄 Tentando novamente com ID completamente aleatório')
      try {
        const randomBaseId = `PROP-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 12)}`.toUpperCase()
        
        const proposal = await prisma.proposal.create({
          data: {
            base_id: randomBaseId,
            title: body.title,
            client: body.client || {},
            account_manager: body.account_manager || body.accountManager || null,
            type: body.type || 'standard',
            status: body.status || 'Rascunho',
            value: body.value || 0,
            total_setup: body.total_setup || body.totalSetup || 0,
            total_monthly: body.total_monthly || body.totalMonthly || 0,
            contract_period: body.contract_period || body.contractPeriod || 12,
            date: body.date ? new Date(body.date) : new Date(),
            expiry_date: body.expiry_date || body.expiryDate ? new Date(body.expiry_date || body.expiryDate) : null,
            version: body.version || 1,
            products: body.products || [],
            items_data: body.items_data || body.itemsData || [],
            client_data: body.client_data || body.clientData || null,
            metadata: body.metadata || {}
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
        
        console.log('✅ Proposta salva com ID alternativo:', randomBaseId)
        
        return NextResponse.json({
          success: true,
          data: proposal
        }, { status: 201 })
      } catch (retryError: any) {
        console.error('❌ Erro na segunda tentativa:', retryError)
        return NextResponse.json(
          { 
            success: false, 
            error: 'Erro ao salvar proposta após múltiplas tentativas',
            details: retryError.message 
          },
          { status: 500 }
        )
      }
    }
    
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