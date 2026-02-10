#!/bin/bash

# Script de Deploy - Correção de Comissões para Clientes Existentes
# Data: 2026-01-21

echo "🚀 Iniciando deploy da correção de comissões..."
echo ""

# Variáveis
SERVER_IP="10.10.50.246"
SERVER_PORT="3009"
DOCKER_IMAGE="simuladores-app:latest"

echo "📦 Etapa 1: Verificando Docker image..."
docker images | grep simuladores-app

echo ""
echo "📤 Etapa 2: Salvando Docker image para transferência..."
docker save $DOCKER_IMAGE -o simuladores-app-latest.tar
echo "✅ Image salva: simuladores-app-latest.tar"

echo ""
echo "🔄 Etapa 3: Transferindo image para servidor..."
scp -P 22 simuladores-app-latest.tar root@$SERVER_IP:/tmp/
echo "✅ Image transferida"

echo ""
echo "🔧 Etapa 4: Carregando image no servidor e reiniciando containers..."
ssh root@$SERVER_IP << 'EOF'
  echo "Parando containers antigos..."
  docker-compose -f /root/docker-compose.prod.yml down
  
  echo "Carregando nova image..."
  docker load -i /tmp/simuladores-app-latest.tar
  
  echo "Iniciando containers..."
  docker-compose -f /root/docker-compose.prod.yml up -d
  
  echo "Aguardando aplicação iniciar..."
  sleep 5
  
  echo "Verificando status..."
  docker-compose -f /root/docker-compose.prod.yml ps
  
  echo "Testando health check..."
  curl -s http://localhost:3009/api/health | head -20
EOF

echo ""
echo "✅ Deploy concluído!"
echo "🌐 Acesse: http://$SERVER_IP:$SERVER_PORT"
echo ""
echo "📝 Mudanças implementadas:"
echo "  - Comissões calculadas apenas sobre diferença de valor para clientes existentes"
echo "  - Se diferença for negativa, comissão = R$ 0,00"
echo "  - Checkbox duplicado removido em InternetRadioCalculator"
echo "  - Null checks adicionados em todas as calculadoras"
