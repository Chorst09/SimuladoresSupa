#!/bin/bash

# Script para adicionar coluna acompanhamentos na tabela oportunidades_parceiro

echo "🔧 Adicionando coluna acompanhamentos..."

# Executar a migration SQL
psql $DATABASE_URL -c "ALTER TABLE public.oportunidades_parceiro ADD COLUMN IF NOT EXISTS acompanhamentos JSONB NOT NULL DEFAULT '[]';"

if [ $? -eq 0 ]; then
    echo "✅ Coluna acompanhamentos adicionada com sucesso!"
else
    echo "❌ Erro ao adicionar coluna acompanhamentos"
    exit 1
fi

echo "🎉 Migration concluída!"
