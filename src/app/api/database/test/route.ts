import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Teste simples de conexão com o banco
    await prisma.$connect();
    
    // Teste de query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    return NextResponse.json({
      success: true,
      message: 'Conexão com PostgreSQL estabelecida',
      database: 'PostgreSQL via Prisma',
      timestamp: new Date().toISOString(),
      testResult: result
    });
  } catch (error: any) {
    console.error('Erro no teste do banco:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        database: 'PostgreSQL via Prisma',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}