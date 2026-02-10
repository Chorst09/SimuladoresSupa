#!/bin/bash

SERVER="double@10.10.50.246"

echo "🚀 Deploy AMD64 para Servidor"
echo "=============================="
echo ""

ssh -t $SERVER << 'ENDSSH'
cd ~/simuladores

echo "📥 Carregando imagem AMD64..."
gunzip -c ~/simuladores-app-amd64.tar.gz | docker load

echo ""
echo "🛑 Parando containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production down

echo ""
echo "🚀 Iniciando containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

echo ""
echo "⏳ Aguardando 45 segundos..."
sleep 45

echo ""
echo "📊 Status dos containers:"
docker ps --filter "name=simuladores"

echo ""
echo "📝 Logs da aplicação:"
docker logs simuladores_app_prod --tail 30

echo ""
echo "🏥 Testando aplicação..."
if curl -f -s http://localhost:3009 > /dev/null 2>&1; then
    echo "✅ Aplicação está respondendo!"
else
    echo "⚠️  Aplicação ainda não está respondendo"
fi

echo ""
echo "🧹 Limpando arquivo temporário..."
rm -f ~/simuladores-app-amd64.tar.gz

ENDSSH

echo ""
echo "🧹 Limpando arquivo local..."
rm -f simuladores-app-amd64.tar.gz

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "🌐 Teste: curl http://10.10.50.246:3009"
