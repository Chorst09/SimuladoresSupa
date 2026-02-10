#!/bin/bash

echo "🔍 Testando aplicação..."
echo ""

echo "📊 Status dos containers:"
docker ps --filter "name=simuladores" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "🏥 Health check interno (porta 3000):"
docker exec simuladores_app_prod curl -f http://localhost:3000/ 2>&1 | head -3 || echo "❌ Falhou"
echo ""

echo "🌐 Acesso externo (porta 3009):"
curl -f -I http://localhost:3009 2>&1 | head -5 || echo "❌ Falhou"
echo ""

echo "📝 Últimas 10 linhas do log:"
docker logs simuladores_app_prod --tail 10
