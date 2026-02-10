const { PrismaClient } = require('@prisma/client')

// Configuração para local
const prismaLocal = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:ZBLC7ZF9WY5ZFrIYSQ2wnxd40vDzbFkv@localhost:5433/simuladores_prod"
    }
  }
})

async function updateLocal() {
  console.log('🔧 Atualizando Comissão Diretor LOCAL para 1.50%...')
  
  try {
    const result = await prismaLocal.commissionChannelDirector.updateMany({
      data: {
        months_12: 1.50,
        months_24: 1.50,
        months_36: 1.50,
        months_48: 1.50,
        months_60: 1.50
      }
    })
    
    console.log(`✅ LOCAL: ${result.count} registro(s) atualizado(s)`)
    
    // Verificar
    const updated = await prismaLocal.commissionChannelDirector.findFirst()
    console.log('📊 LOCAL - Valores atualizados:', {
      months_12: updated.months_12,
      months_24: updated.months_24,
      months_36: updated.months_36,
      months_48: updated.months_48,
      months_60: updated.months_60
    })
  } catch (error) {
    console.error('❌ Erro LOCAL:', error.message)
  } finally {
    await prismaLocal.$disconnect()
  }
}

updateLocal()