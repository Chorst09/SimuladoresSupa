#!/bin/bash

echo "🔍 DIAGNÓSTICO DO SERVIDOR"
echo ""

PASSWORD="<SENHA_DO_SERVIDOR>"
SERVER="double@10.10.50.246"

echo "Conectando ao servidor para diagnóstico..."
echo ""

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER" << 'SSHEOF'

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              DIAGNÓSTICO DO DEPLOY                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

cd ~/simuladores

echo "📋 1. Status dos Containers"
echo "════════════════════════════════════════════════════════════════"
echo "$PASSWORD" | sudo -S docker-compose -f docker-compose.prod.yml ps
echo ""

echo "📋 2. Logs da Aplicação (últimas 50 linhas)"
echo "════════════════════════════════════════════════════════════════"
echo "$PASSWORD" | sudo -S docker-compose -f docker-compose.prod.yml logs --tail=50 app
echo ""

echo "�� 3. Logs do Banco de Dados (últimas 20 linhas)"
echo "════════════════════════════════════════════════════════════════"
echo "$PASSWORD" | sudo -S docker-compose -f docker-compose.prod.yml logs --tail=20 db
echo ""

echo "📋 4. Verificar Portas em Uso"
echo "════════════════════════════════════════════════════════════════"
echo "$PASSWORD" | sudo -S netstat -tulpn | grep -E ':(3009|3000|5432|5433)' || echo "Nenhuma porta encontrada"
echo ""

echo "📋 5. Verificar Imagens Docker"
echo "════════════════════════════════════════════════════════════════"
echo "$PASSWORD" | sudo -S docker images | grep simuladores
echo ""

echo "📋 6. Verificar Volumes"
echo "════════════════════════════════════════════════════════════════"
echo "$PASSWORD" | sudo -S docker volume ls | grep simuladores
echo ""

echo "📋 7. Testar Conectividade Local"
echo "════════════════════════════════════════════════════════════════"
curl -v http://localhost:3009/api/health 2>&1 | head -30
echo ""

echo "📋 8. Verificar Espaço em Disco"
echo "════════════════════════════════════════════════════════════════"
df -h | grep -E '(Filesystem|/$|/home)'
echo ""

echo "📋 9. Verificar Memória"
echo "════════════════════════════════════════════════════════════════"
free -h
echo ""

echo "📋 10. Verificar Variáveis de Ambiente"
echo "════════════════════════════════════════════════════════════════"
echo "APP_PORT: $(grep APP_PORT .env.production | cut -d= -f2)"
echo "PORT: $(grep '^PORT=' .env.production | cut -d= -f2)"
echo "DATABASE_URL: $(grep DATABASE_URL .env.production | cut -d= -f2 | head -c 50)..."
echo ""

SSHEOF

