#!/bin/bash

# Script para aplicar as migrações de Oportunidades de Parceiros
# Uso: ./scripts/migrate-oportunidades-parceiro.sh

echo "🚀 Iniciando migração de Oportunidades de Parceiros..."

# Verificar se o Prisma está instalado
if ! command -v npx &> /dev/null; then
    echo "❌ Erro: npx não encontrado. Instale o Node.js e npm primeiro."
    exit 1
fi

# Opção 1: Usar Prisma DB Push (recomendado para desenvolvimento)
echo ""
echo "📦 Aplicando schema do Prisma..."
npx prisma db push

if [ $? -eq 0 ]; then
    echo "✅ Schema aplicado com sucesso!"
else
    echo "❌ Erro ao aplicar schema. Tentando método alternativo..."
    
    # Opção 2: Aplicar SQL diretamente (se db push falhar)
    if [ -f "prisma/migrations/add_oportunidades_parceiro.sql" ]; then
        echo ""
        echo "📝 Aplicando SQL manualmente..."
        echo "Por favor, execute o seguinte comando com suas credenciais:"
        echo ""
        echo "psql -U seu_usuario -d seu_banco -f prisma/migrations/add_oportunidades_parceiro.sql"
        echo ""
    fi
    exit 1
fi

# Gerar Prisma Client
echo ""
echo "🔧 Gerando Prisma Client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma Client gerado com sucesso!"
else
    echo "❌ Erro ao gerar Prisma Client."
    exit 1
fi

echo ""
echo "✨ Migração concluída com sucesso!"
echo ""
echo "📍 Próximos passos:"
echo "1. Acesse /gestao-oportunidades/parceiros"
echo "2. Faça login com usuário admin ou director"
echo "3. Comece a gerenciar oportunidades de parceiros!"
echo ""
