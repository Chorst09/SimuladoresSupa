import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Verificar se DATABASE_URL está configurada
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não está configurada!');
  throw new Error('DATABASE_URL não está configurada');
}

console.log('🔗 Conectando ao banco de dados...');
console.log('📍 Environment:', process.env.NODE_ENV);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error', 'warn'],
    errorFormat: 'pretty',
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Testar conexão
prisma.$connect()
  .then(() => {
    console.log('✅ Prisma conectado ao banco de dados');
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
  });

export default prisma