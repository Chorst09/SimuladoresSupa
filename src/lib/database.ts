import { Pool, PoolClient } from 'pg';
import { prisma } from './prisma';

// Configuração do pool de conexões PostgreSQL (mantido para compatibilidade)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/simuladores_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Função para executar queries (mantida para compatibilidade)
export async function query(text: string, params?: any[]): Promise<any> {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// =====================================================
// FUNÇÕES PRISMA PARA SUBSTITUIR QUERIES DIRETAS
// =====================================================

// Funções de autenticação usando Prisma
export const authService = {
  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: { profile: true, user_compat: true }
    });
  },

  async createUser(userData: {
    email: string;
    encrypted_password: string;
    full_name: string;
    role: string;
  }) {
    return await prisma.$transaction(async (tx: any) => {
      // Criar usuário
      const user = await tx.user.create({
        data: {
          email: userData.email,
          encrypted_password: userData.encrypted_password,
          email_confirmed_at: new Date(),
          role: 'authenticated'
        }
      });

      // Criar perfil
      await tx.profile.create({
        data: {
          id: user.id,
          full_name: userData.full_name,
          email: userData.email,
          role: userData.role
        }
      });

      // Criar entrada de compatibilidade
      await tx.userCompat.create({
        data: {
          id: user.id,
          email: userData.email,
          role: userData.role
        }
      });

      return user;
    });
  }
};

// Funções de CRM usando Prisma
export const crmService = {
  async getClientes(status?: string) {
    return await prisma.cliente.findMany({
      where: status ? { status } : undefined,
      orderBy: { nome_razao_social: 'asc' }
    });
  },

  async getFornecedores(status?: string) {
    return await prisma.fornecedor.findMany({
      where: status ? { status } : undefined,
      orderBy: { nome_razao_social: 'asc' }
    });
  },

  async getOportunidades(filters?: {
    fase?: string;
    cliente_id?: string;
    responsavel_id?: string;
  }) {
    return await prisma.oportunidade.findMany({
      where: filters,
      include: {
        cliente: true,
        responsavel: { include: { profile: true } },
        fornecedores: { include: { fornecedor: true } },
        atividades: true
      },
      orderBy: { created_at: 'desc' }
    });
  },

  async createOportunidade(data: any) {
    const { fornecedores, ...oportunidadeData } = data;

    return await prisma.$transaction(async (tx: any) => {
      // Criar oportunidade
      const oportunidade = await tx.oportunidade.create({
        data: oportunidadeData,
        include: {
          cliente: true,
          responsavel: { include: { profile: true } }
        }
      });

      // Criar associações com fornecedores se houver
      if (fornecedores && fornecedores.length > 0) {
        await tx.oportunidadeFornecedor.createMany({
          data: fornecedores.map((fornecedorId: string) => ({
            oportunidade_id: oportunidade.id,
            fornecedor_id: fornecedorId
          }))
        });
      }

      return oportunidade;
    });
  },

  async createCliente(data: any) {
    return await prisma.cliente.create({
      data
    });
  },

  async createFornecedor(data: any) {
    return await prisma.fornecedor.create({
      data
    });
  }
};

// Funções de comissões usando Prisma
export const commissionService = {
  async getChannelSeller() {
    return await prisma.commissionChannelSeller.findFirst();
  },

  async getChannelDirector() {
    return await prisma.commissionChannelDirector.findFirst();
  },

  async getSeller() {
    return await prisma.commissionSeller.findFirst();
  },

  async getChannelInfluencer() {
    return await prisma.commissionChannelInfluencer.findMany({
      orderBy: { revenue_min: 'asc' }
    });
  },

  async getChannelIndicator() {
    return await prisma.commissionChannelIndicator.findMany({
      orderBy: { revenue_min: 'asc' }
    });
  },

  async updateCommissionTable(table: string, id: string, data: any) {
    switch (table) {
      case 'channel_seller':
        return await prisma.commissionChannelSeller.update({
          where: { id },
          data
        });
      case 'channel_director':
        return await prisma.commissionChannelDirector.update({
          where: { id },
          data
        });
      case 'seller':
        return await prisma.commissionSeller.update({
          where: { id },
          data
        });
      case 'channel_influencer':
        return await prisma.commissionChannelInfluencer.update({
          where: { id },
          data
        });
      case 'channel_indicator':
        return await prisma.commissionChannelIndicator.update({
          where: { id },
          data
        });
      default:
        throw new Error('Tabela de comissão inválida');
    }
  }
};

// Funções de propostas usando Prisma
export const proposalService = {
  async getProposals(filters?: {
    status?: string;
    type?: string;
    created_by?: string;
  }) {
    return await prisma.proposal.findMany({
      where: filters,
      include: {
        creator: { include: { profile: true } }
      },
      orderBy: { created_at: 'desc' }
    });
  },

  async createProposal(data: any) {
    return await prisma.proposal.create({
      data,
      include: {
        creator: { include: { profile: true } }
      }
    });
  },

  async updateProposal(id: string, data: any) {
    return await prisma.proposal.update({
      where: { id },
      data,
      include: {
        creator: { include: { profile: true } }
      }
    });
  }
};

// Função para contatos
export const contactService = {
  async createContact(data: {
    name: string;
    email: string;
    message: string;
  }) {
    return await prisma.contact.create({
      data
    });
  },

  async getContacts() {
    return await prisma.contact.findMany({
      orderBy: { created_at: 'desc' }
    });
  }
};

// Exportar Prisma
export { prisma };

// Função para executar transações
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Função para verificar a conexão
export async function checkConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW()');
    return !!result;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Função para fechar o pool (útil para testes)
export async function closePool(): Promise<void> {
  await pool.end();
}

// Pool exportado como named export para compatibilidade
export { pool };