#!/bin/bash

echo "🔍 Verificando status da aplicação no servidor..."
echo ""

ssh double@10.10.50.246 << 'EOF'
cd ~/simuladores

echo "📦 Status dos containers:"
sudo docker ps -a | grep simuladores || echo "Nenhum container encontrado"
echo ""

echo "🔌 Verificando porta 3009:"
sudo ss -tulpn | grep :3009 || echo "Porta 3009 não está em uso"
echo ""

echo "🏥 Testando acesso local:"
curl -s -I http://localhost:3009 | head -n 1 || echo "Aplicação não responde"
echo ""

echo "📊 Logs recentes (últimas 20 linhas):"
sudo docker logs --tail 20 simuladores_app_prod 2>&1 || echo "Container não encontrado"

EOF
