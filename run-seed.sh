#!/bin/bash

echo "🌱 Executando seed do banco de dados..."
docker exec simuladores_app_prod node_modules/.bin/prisma db seed

echo ""
echo "✅ Seed concluído!"
echo ""
echo "👤 Usuários disponíveis:"
echo "   Admin:    admin@sistema.com / admin123"
echo "   Diretor:  diretor@sistema.com / diretor123"
echo "   Gerente:  gerente@sistema.com / gerente123"
echo "   Vendedor: vendedor@sistema.com / vendedor123"
echo "   Usuário:  usuario@sistema.com / usuario123"
