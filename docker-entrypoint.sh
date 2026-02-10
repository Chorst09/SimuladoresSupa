#!/bin/sh
set -e

echo "🔧 Inicializando banco de dados..."

# Executar migrations/push aceitando perda de dados da tabela pocs
node_modules/.bin/prisma db push --skip-generate --accept-data-loss

# Verificar se já existem usuários no banco
USER_COUNT=$(node_modules/.bin/prisma db execute --stdin <<EOF || echo "0"
SELECT COUNT(*) as count FROM auth.users;
EOF
)

# Se não houver usuários, executar seed
if [ -z "$USER_COUNT" ] || [ "$USER_COUNT" = "0" ]; then
    echo "🌱 Executando seed (primeira inicialização)..."
    node_modules/.bin/tsx prisma/seed.ts || echo "⚠️  Seed falhou, mas continuando..."
else
    echo "✅ Banco já possui dados, pulando seed"
fi

echo "🚀 Iniciando aplicação..."
exec node server.js
