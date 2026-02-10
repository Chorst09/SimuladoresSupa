#!/bin/bash

# Script para verificar status da aplicação em produção
# Uso: ./check-production.sh

echo "🔍 Verificando status da aplicação em produção..."
echo ""

SERVER="double@10.10.50.246"

echo "📡 Conectando ao servidor $SERVER..."
echo "ℹ️  Você precisará digitar a senha: <SENHA_DO_SERVIDOR>"
echo ""

# Executar comandos no servidor
ssh $SERVER << 'ENDSSH'
echo "✅ Conectado ao servidor!"
echo ""

echo "📦 Status dos containers Docker:"
cd ~/simuladores
docker ps -a | grep simuladores || echo "❌ Nenhum container encontrado"
echo ""

echo "🔌 Verificando porta 3009:"
netstat -tulpn 2>/dev/null | grep :3009 || ss -tulpn 2>/dev/null | grep :3009 || echo "❌ Porta 3009 não está em uso"
echo ""

echo "🏥 Testando health check:"
curl -s http://localhost:3009/api/health || echo "❌ Health check falhou"
echo ""

echo "🌐 Testando acesso local:"
curl -s -I http://localhost:3009 | head -n 1 || echo "❌ Aplicação não responde"
echo ""

echo "📂 Verificando se a pasta existe:"
ls -la ~/simuladores/ 2>/dev/null | head -n 5 || echo "❌ Pasta ~/simuladores não encontrada"
echo ""

ENDSSH

echo ""
echo "✅ Verificação concluída!"
echo ""
echo "💡 Para ver logs detalhados, conecte via SSH e execute:"
echo "   ssh double@10.10.50.246"
echo "   cd ~/simuladores"
echo "   sudo ./deploy.sh logs"
