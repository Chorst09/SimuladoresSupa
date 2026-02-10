#!/bin/bash

echo "🔧 Corrigindo deploy no servidor..."
echo ""

# Conectar ao servidor e executar comandos
ssh double@10.10.50.246 << 'SSHEOF'

echo "📋 Etapa 1: Parando containers..."
cd ~/simuladores
sudo docker-compose -f docker-compose.prod.yml down

echo ""
echo "�� Etapa 2: Removendo imagens antigas..."
sudo docker rmi simuladores-app:latest 2>/dev/null || true
sudo docker rmi simuladores-postgres:prod 2>/dev/null || true

echo ""
echo "📋 Etapa 3: Carregando nova imagem..."
sudo docker load -i ~/simuladores-app.tar.gz

echo ""
echo "📋 Etapa 4: Verificando imagens..."
sudo docker images | grep simuladores

echo ""
echo "📋 Etapa 5: Iniciando containers (sem build)..."
sudo docker-compose -f docker-compose.prod.yml up -d --no-build

echo ""
echo "⏳ Aguardando containers iniciarem..."
sleep 15

echo ""
echo "📋 Etapa 6: Verificando status..."
sudo docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📋 Etapa 7: Testando health check..."
curl -s http://localhost:3009/api/health || echo "Aguardando aplicação iniciar..."

echo ""
echo "✅ Deploy corrigido!"

SSHEOF

echo ""
echo "🎉 Processo concluído!"
