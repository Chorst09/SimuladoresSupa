#!/bin/bash

set -e

SERVER="double@10.10.50.246"
SERVER_DIR="~/simuladores"

echo "🚀 Deploy para Servidor de Produção"
echo "===================================="
echo "Servidor: $SERVER"
echo ""

# Verificar se a imagem existe localmente
if ! docker images | grep -q "simuladores-app.*latest"; then
    echo "❌ Imagem simuladores-app:latest não encontrada!"
    echo "Execute primeiro: docker-compose -f docker-compose.prod.yml build"
    exit 1
fi

echo "📦 Passo 1: Exportando imagem Docker..."
docker save simuladores-app:latest | gzip > simuladores-app.tar.gz
echo "   ✅ Imagem exportada ($(du -h simuladores-app.tar.gz | cut -f1))"

echo ""
echo "📤 Passo 2: Transferindo arquivos para servidor..."
echo "   Enviando imagem..."
scp simuladores-app.tar.gz $SERVER:~/ || {
    echo "❌ Erro ao transferir imagem"
    exit 1
}

echo "   Enviando arquivos de configuração..."
scp .env.production $SERVER:$SERVER_DIR/ 2>/dev/null || true
scp docker-compose.prod.yml $SERVER:$SERVER_DIR/ 2>/dev/null || true
scp docker-compose.server.yml $SERVER:$SERVER_DIR/ 2>/dev/null || true
scp deploy.sh $SERVER:$SERVER_DIR/ 2>/dev/null || true

echo ""
echo "✅ Arquivos transferidos!"
echo ""
echo "🔧 Passo 3: Instalando no servidor..."
echo ""

ssh -t $SERVER << 'ENDSSH'
cd ~/simuladores

echo "📥 Carregando imagem Docker..."
gunzip -c ~/simuladores-app.tar.gz | docker load

echo ""
echo "🔄 Reiniciando containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production down 2>/dev/null || true
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

echo ""
echo "⏳ Aguardando aplicação iniciar (30 segundos)..."
sleep 30

echo ""
echo "📊 Status dos containers:"
docker ps --filter "name=simuladores"

echo ""
echo "🏥 Testando aplicação..."
if curl -f -s http://localhost:3009 > /dev/null 2>&1; then
    echo "✅ Aplicação está respondendo!"
else
    echo "⚠️  Aplicação ainda não está respondendo"
    echo "   Verifique os logs: docker logs simuladores_app_prod"
fi

echo ""
echo "🧹 Limpando arquivo temporário..."
rm -f ~/simuladores-app.tar.gz

ENDSSH

echo ""
echo "🧹 Limpando arquivo local..."
rm -f simuladores-app.tar.gz

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "🌐 Acesse: http://10.10.50.246:3009"
echo "🌐 Ou: http://simulador-dre.doubletelecom.com.br:3009"
echo ""
echo "📝 Comandos úteis no servidor:"
echo "   Ver logs:    ssh $SERVER 'docker logs -f simuladores_app_prod'"
echo "   Reiniciar:   ssh $SERVER 'cd $SERVER_DIR && docker-compose -f docker-compose.prod.yml restart'"
echo "   Status:      ssh $SERVER 'docker ps'"
echo ""
