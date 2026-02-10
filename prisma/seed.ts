import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'node:fs'

function resolveDatabaseUrl() {
  const directUrl = process.env.DATABASE_URL

  const host = process.env.DATABASE_HOST
  const port = process.env.DATABASE_PORT
  const user = process.env.DATABASE_USER
  const password = process.env.DATABASE_PASSWORD
  const name = process.env.DATABASE_NAME

  const isContainerRuntime = fs.existsSync('/.dockerenv') || fs.existsSync('/run/.containerenv')
  const looksLikeLocalhost =
    !directUrl || directUrl.includes('@localhost:') || directUrl.includes('@127.0.0.1:')

  if (isContainerRuntime && looksLikeLocalhost && host && port && user && password && name) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${name}`
  }

  return directUrl
}

const resolvedDatabaseUrl = resolveDatabaseUrl()

const prisma = new PrismaClient(
  resolvedDatabaseUrl ? { datasources: { db: { url: resolvedDatabaseUrl } } } : undefined
)

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // 1. Criar usuário admin padrão
  const adminEmail = 'admin@sistema.com'
  const adminPassword = await bcrypt.hash('admin123', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      encrypted_password: adminPassword,
      email_confirmed_at: new Date(),
      is_super_admin: true,
      role: 'admin',
      account_status: 'approved',
      password_changed: new Date(),
      raw_app_meta_data: { provider: 'email' },
      raw_user_meta_data: { full_name: 'Administrador' },
      profile: {
        create: {
          full_name: 'Administrador',
          email: adminEmail,
          role: 'admin'
        }
      },
      user_compat: {
        create: {
          email: adminEmail,
          role: 'admin'
        }
      }
    }
  })

  console.log('✅ Usuário admin criado:', adminUser.email)

  // Criar usuários de exemplo com diferentes roles
  const exampleUsers = [
    {
      email: 'diretor@sistema.com',
      password: 'diretor123',
      role: 'diretor',
      full_name: 'João Diretor'
    },
    {
      email: 'gerente@sistema.com',
      password: 'gerente123',
      role: 'gerente',
      full_name: 'Maria Gerente'
    },
    {
      email: 'vendedor@sistema.com',
      password: 'vendedor123',
      role: 'vendedor',
      full_name: 'Carlos Vendedor'
    },
    {
      email: 'usuario@sistema.com',
      password: 'usuario123',
      role: 'user',
      full_name: 'Ana Usuário'
    }
  ]

  for (const userData of exampleUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        encrypted_password: hashedPassword,
        email_confirmed_at: new Date(),
        role: userData.role,
        account_status: 'approved',
        password_changed: new Date(),
        raw_app_meta_data: { provider: 'email' },
        raw_user_meta_data: { full_name: userData.full_name },
        profile: {
          create: {
            full_name: userData.full_name,
            email: userData.email,
            role: userData.role
          }
        },
        user_compat: {
          create: {
            email: userData.email,
            role: userData.role
          }
        }
      }
    })

    console.log('✅ Usuário criado:', user.email)
  }

  // 2. Inicializar tabelas de comissão com valores padrão
  await prisma.commissionChannelSeller.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      months_12: 0.60,
      months_24: 1.20,
      months_36: 2.00,
      months_48: 2.00,
      months_60: 2.00
    }
  })

  await prisma.commissionChannelDirector.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      months_12: 0,
      months_24: 0,
      months_36: 0,
      months_48: 0,
      months_60: 0
    }
  })

  await prisma.commissionSeller.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      months_12: 1.2,
      months_24: 2.4,
      months_36: 3.6,
      months_48: 3.6,
      months_60: 3.6
    }
  })

  // Comissões por faixa de receita - Influencer
  const influencerRanges = [
    { range: '0-5000', min: 0, max: 5000, rates: [0.5, 1.0, 1.5, 1.5, 1.5] },
    { range: '5001-15000', min: 5001, max: 15000, rates: [1.0, 2.0, 3.0, 3.0, 3.0] },
    { range: '15001-50000', min: 15001, max: 50000, rates: [1.5, 3.0, 4.5, 4.5, 4.5] },
    { range: '50001+', min: 50001, max: 999999, rates: [2.0, 4.0, 6.0, 6.0, 6.0] }
  ]

  for (const range of influencerRanges) {
    const existing = await prisma.commissionChannelInfluencer.findFirst({
      where: { revenue_range: range.range }
    });

    if (!existing) {
      await prisma.commissionChannelInfluencer.create({
        data: {
          revenue_range: range.range,
          revenue_min: range.min,
          revenue_max: range.max,
          months_12: range.rates[0],
          months_24: range.rates[1],
          months_36: range.rates[2],
          months_48: range.rates[3],
          months_60: range.rates[4]
        }
      });
    }
  }

  // Comissões por faixa de receita - Indicator
  const indicatorRanges = [
    { range: '0-2500', min: 0, max: 2500, rates: [0.25, 0.5, 0.75, 0.75, 0.75] },
    { range: '2501-7500', min: 2501, max: 7500, rates: [0.5, 1.0, 1.5, 1.5, 1.5] },
    { range: '7501-25000', min: 7501, max: 25000, rates: [0.75, 1.5, 2.25, 2.25, 2.25] },
    { range: '25001+', min: 25001, max: 999999, rates: [1.0, 2.0, 3.0, 3.0, 3.0] }
  ]

  for (const range of indicatorRanges) {
    const existing = await prisma.commissionChannelIndicator.findFirst({
      where: { revenue_range: range.range }
    });

    if (!existing) {
      await prisma.commissionChannelIndicator.create({
        data: {
          revenue_range: range.range,
          revenue_min: range.min,
          revenue_max: range.max,
          months_12: range.rates[0],
          months_24: range.rates[1],
          months_36: range.rates[2],
          months_48: range.rates[3],
          months_60: range.rates[4]
        }
      });
    }
  }

  console.log('✅ Tabelas de comissão inicializadas')

  // 3. Criar produtos básicos para as calculadoras
  const products = [
    // PABX
    { name: 'PABX IP Básico', category: 'pabx', subcategory: 'basico', unit_price: 150.00, setup_price: 300.00 },
    { name: 'PABX IP Avançado', category: 'pabx', subcategory: 'avancado', unit_price: 250.00, setup_price: 500.00 },
    { name: 'Ramal IP', category: 'pabx', subcategory: 'ramal', unit_price: 50.00, setup_price: 0.00 },

    // Internet Fibra
    { name: 'Internet Fibra 100MB', category: 'fibra', subcategory: '100mb', unit_price: 89.90, setup_price: 150.00 },
    { name: 'Internet Fibra 200MB', category: 'fibra', subcategory: '200mb', unit_price: 129.90, setup_price: 150.00 },
    { name: 'Internet Fibra 500MB', category: 'fibra', subcategory: '500mb', unit_price: 199.90, setup_price: 200.00 },
    { name: 'Internet Fibra 1GB', category: 'fibra', subcategory: '1gb', unit_price: 299.90, setup_price: 300.00 },

    // Internet Rádio
    { name: 'Internet Rádio 50MB', category: 'radio', subcategory: '50mb', unit_price: 79.90, setup_price: 200.00 },
    { name: 'Internet Rádio 100MB', category: 'radio', subcategory: '100mb', unit_price: 119.90, setup_price: 250.00 },

    // Máquinas Virtuais
    { name: 'VM Básica (2vCPU, 4GB RAM)', category: 'vm', subcategory: 'basica', unit_price: 150.00, setup_price: 0.00 },
    { name: 'VM Intermediária (4vCPU, 8GB RAM)', category: 'vm', subcategory: 'intermediaria', unit_price: 300.00, setup_price: 0.00 },
    { name: 'VM Avançada (8vCPU, 16GB RAM)', category: 'vm', subcategory: 'avancada', unit_price: 600.00, setup_price: 0.00 },

    // Serviços
    { name: 'Suporte Técnico', category: 'servicos', subcategory: 'suporte', unit_price: 200.00, setup_price: 0.00 },
    { name: 'Instalação e Configuração', category: 'servicos', subcategory: 'instalacao', unit_price: 0.00, setup_price: 500.00 },
    { name: 'Treinamento', category: 'servicos', subcategory: 'treinamento', unit_price: 300.00, setup_price: 0.00 }
  ]

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name }
    });

    if (!existing) {
      await prisma.product.create({
        data: product
      });
    }
  }

  console.log('✅ Produtos básicos criados')

  // 4. Configurações do sistema
  const systemConfigs = [
    {
      config_key: 'company_name',
      config_value: { value: 'Simuladores Telecom' },
      description: 'Nome da empresa'
    },
    {
      config_key: 'default_contract_period',
      config_value: { value: 12 },
      description: 'Período padrão de contrato em meses'
    },
    {
      config_key: 'email_notifications',
      config_value: { enabled: true, from: 'noreply@sistema.com' },
      description: 'Configurações de notificações por email'
    },
    {
      config_key: 'proposal_expiry_days',
      config_value: { value: 30 },
      description: 'Dias para expiração de propostas'
    }
  ]

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { config_key: config.config_key },
      update: {},
      create: config
    })
  }

  console.log('✅ Configurações do sistema criadas')

  // 5. Cliente de exemplo
  const exampleClient = await prisma.cliente.upsert({
    where: { cnpj_cpf: '12.345.678/0001-90' },
    update: {},
    create: {
      nome_razao_social: 'Empresa Exemplo Ltda',
      cnpj_cpf: '12.345.678/0001-90',
      nome_contato: 'João Silva',
      email_contato: 'joao@exemplo.com',
      telefone: '(11) 99999-9999',
      endereco_completo: 'Rua Exemplo, 123 - São Paulo/SP',
      status: 'ativo',
      created_by: adminUser.id
    }
  })

  console.log('✅ Cliente de exemplo criado:', exampleClient.nome_razao_social)

  // Criar oportunidade de exemplo
  const exampleOportunidade = await prisma.oportunidade.upsert({
    where: { numero_oportunidade: 'OPP-2024-001' },
    update: {},
    create: {
      numero_oportunidade: 'OPP-2024-001',
      titulo: 'Implementação PABX IP - Empresa Exemplo',
      cliente_id: exampleClient.id,
      valor_estimado: 15000.00,
      fase: 'prospeccao',
      data_fechamento_prevista: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      data_vencimento: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
      responsavel_id: adminUser.id,
      probabilidade_fechamento: 70,
      descricao: 'Implementação de sistema PABX IP com 50 ramais para a Empresa Exemplo',
      created_by: adminUser.id
    }
  })

  console.log('✅ Oportunidade de exemplo criada:', exampleOportunidade.numero_oportunidade)

  // 6. Criar team padrão
  const defaultTeam = await prisma.team.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      name: 'Equipe Comercial',
      description: 'Equipe comercial principal',
      manager_id: adminUser.id,
      is_active: true
    }
  })

  console.log('✅ Team padrão criado:', defaultTeam.name)

  // 7. Criar parceiros de exemplo
  const partners = [
    {
      name: 'Distribuidor Principal',
      email: 'distribuidor@exemplo.com',
      phone: '(11) 98888-8888',
      company: 'Distribuidor Ltda',
      partner_type: 'distributor',
      commission_rate: 5.0
    },
    {
      name: 'Canal Parceiro',
      email: 'canal@exemplo.com',
      phone: '(11) 97777-7777',
      company: 'Canal Parceiro Ltda',
      partner_type: 'channel',
      commission_rate: 3.0
    },
    {
      name: 'Revendedor Regional',
      email: 'revendedor@exemplo.com',
      phone: '(11) 96666-6666',
      company: 'Revendedor Regional Ltda',
      partner_type: 'reseller',
      commission_rate: 4.0
    }
  ]

  for (const partner of partners) {
    const existing = await prisma.partner.findFirst({
      where: { email: partner.email }
    });

    if (!existing) {
      await prisma.partner.create({
        data: partner
      });
    }
  }

  console.log('✅ Parceiros de exemplo criados')

  // 8. Criar configurações de produto para calculadoras
  const productConfigs = [
    {
      product_type: 'pabx',
      config_name: 'default_pricing',
      config_data: {
        base_cost: 100.00,
        margin_percentage: 40,
        setup_multiplier: 2.0,
        monthly_multiplier: 1.0
      }
    },
    {
      product_type: 'fibra',
      config_name: 'default_pricing',
      config_data: {
        base_cost_per_mb: 0.50,
        margin_percentage: 35,
        setup_base: 150.00,
        installation_cost: 200.00
      }
    },
    {
      product_type: 'radio',
      config_name: 'default_pricing',
      config_data: {
        base_cost_per_mb: 0.80,
        margin_percentage: 30,
        setup_base: 200.00,
        equipment_cost: 300.00
      }
    },
    {
      product_type: 'vm',
      config_name: 'default_pricing',
      config_data: {
        cpu_cost_per_core: 50.00,
        ram_cost_per_gb: 25.00,
        storage_cost_per_gb: 2.00,
        margin_percentage: 45
      }
    }
  ]

  for (const config of productConfigs) {
    const existing = await prisma.productConfig.findFirst({
      where: {
        product_type: config.product_type,
        config_name: config.config_name
      }
    });

    if (!existing) {
      await prisma.productConfig.create({
        data: {
          ...config,
          created_by: adminUser.id
        }
      });
    }
  }

  console.log('✅ Configurações de produto criadas')

  // 5. Criar oportunidades de parceiro de exemplo
  const oportunidadesExemplo = [
    {
      nome_fabricante: 'Dell',
      numero_oportunidade_ext: 'DELL-2024-001',
      cliente_nome: 'Empresa ABC Ltda',
      contato_nome: 'João Silva',
      contato_email: 'joao.silva@empresaabc.com',
      contato_telefone: '(11) 98765-4321',
      produto_descricao: 'Servidor PowerEdge R750 (2x); Switches Dell Networking (4x)',
      valor: 85000.00,
      status: 'aguardando_aprovacao',
      gerente_contas: 'Maria Santos',
      data_expiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      observacoes: 'Cliente interessado em upgrade de infraestrutura',
      acompanhamentos: [
        {
          data: new Date().toISOString().split('T')[0],
          descricao: 'Primeira reunião realizada. Cliente demonstrou interesse.'
        }
      ],
      created_by: adminUser.id
    },
    {
      nome_fabricante: 'Lenovo',
      numero_oportunidade_ext: 'LENOVO-2024-002',
      cliente_nome: 'Tech Solutions SA',
      contato_nome: 'Ana Costa',
      contato_email: 'ana.costa@techsolutions.com',
      contato_telefone: '(21) 99876-5432',
      produto_descricao: 'ThinkSystem SR650 (1x); Storage (1x)',
      valor: 45000.00,
      status: 'aprovado',
      gerente_contas: 'Carlos Oliveira',
      data_expiracao: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 dias
      observacoes: 'Proposta aprovada, aguardando assinatura do contrato',
      acompanhamentos: [
        {
          data: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          descricao: 'Proposta enviada ao cliente'
        },
        {
          data: new Date().toISOString().split('T')[0],
          descricao: 'Cliente aprovou a proposta'
        }
      ],
      created_by: adminUser.id
    },
    {
      nome_fabricante: 'HP',
      numero_oportunidade_ext: 'HP-2024-003',
      cliente_nome: 'Indústria XYZ',
      contato_nome: 'Pedro Almeida',
      contato_email: 'pedro@industriaxyz.com',
      produto_descricao: 'ProLiant DL380 Gen10 (3x)',
      valor: 120000.00,
      status: 'aguardando_aprovacao',
      gerente_contas: 'Fernanda Lima',
      data_expiracao: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
      observacoes: 'Grande oportunidade - cliente quer expandir datacenter',
      acompanhamentos: [],
      created_by: adminUser.id
    }
  ]

  for (const oportunidade of oportunidadesExemplo) {
    const existing = await prisma.oportunidadeParceiro.findFirst({
      where: { numero_oportunidade_ext: oportunidade.numero_oportunidade_ext }
    });

    if (!existing) {
      await prisma.oportunidadeParceiro.create({
        data: oportunidade
      });
    }
  }

  console.log('✅ Oportunidades de parceiro de exemplo criadas')

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
