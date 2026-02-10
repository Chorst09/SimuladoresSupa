#!/bin/bash

# ============================================
# COMANDOS PARA DEPLOY MANUAL EM PRODUÇÃO
# ============================================
# Execute estes comandos manualmente no servidor

echo "🚀 DEPLOY MANUAL - SIMULADORES APP"
echo "===================================="
echo ""

# Passo 1: Parar containers
echo "1️⃣  Parando containers..."
cd ~/simuladores
sudo docker compose -f docker-compose.prod.yml down

echo ""
echo "2️⃣  Removendo imagem antiga..."
sudo docker rmi simuladores-app:prod 2>/dev/null || true

echo ""
echo "3️⃣  Carregando nova imagem..."
sudo docker load -i ~/simuladores-app-prod.tar.gz

echo ""
echo "4️⃣  Iniciando containers com nova imagem..."
sudo docker compose -f docker-compose.prod.yml up -d

echo ""
echo "5️⃣  Aguardando containers iniciarem..."
sleep 15

echo ""
echo "6️⃣  Verificando status..."
sudo docker compose -f docker-compose.prod.yml ps

echo ""
echo "7️⃣  Testando aplicação..."
curl -s http://localhost:3009/api/commissions | jq '.channelDirector'

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "Acesse: http://10.10.50.246:3009"
echo "Login: admin@sistema.com / admin123"
