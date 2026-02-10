#!/bin/bash

SERVER="double@10.10.50.246"

echo "🔧 Corrigindo servidor de produção..."
echo ""

ssh -t $SERVER << 'ENDSSH'
cd ~/simuladores

echo "📊 Status atual:"
docker ps -a --filter "name=simuladores"

echo ""
echo "📝 Logs do banco:"
docker logs simuladores_db_prod --tail 10

echo ""
echo "🔄 Reiniciando containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production restart

echo ""
echo "⏳ Aguardando 30 segundos..."
sleep 30

echo ""
echo "📊 Status final:"
docker ps --filter "name=simuladores"

echo ""
echo "🏥 Testando aplicação..."
curl -I http://localhost:3009 2>&1 | head -5

ENDSSH

echo ""
echo "🌐 Testando acesso externo..."
curl -I http://10.10.50.246:3009 2>&1 | head -5
