#!/bin/bash

SERVER="double@10.10.50.246"

echo "🔍 Verificando status no servidor..."
echo ""

ssh $SERVER << 'ENDSSH'
echo "📊 Containers rodando:"
docker ps --filter "name=simuladores" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📝 Últimas 20 linhas do log da aplicação:"
docker logs simuladores_app_prod --tail 20 2>/dev/null || echo "Container não encontrado"

echo ""
echo "🏥 Teste de conectividade:"
curl -I http://localhost:3009 2>&1 | head -5 || echo "❌ Não está respondendo"

echo ""
echo "🔥 Portas abertas:"
sudo netstat -tlnp | grep 3009 || echo "Porta 3009 não está escutando"
ENDSSH
