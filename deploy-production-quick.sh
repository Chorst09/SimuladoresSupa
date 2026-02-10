#!/bin/bash

echo "🚀 Deploy Rápido para Produção"
echo "=============================="
echo ""

# Senha do servidor
export SSHPASS="<SENHA_DO_SERVIDOR>"

echo "📥 Carregando imagem no servidor..."
ssh double@10.10.50.246 "cd ~/simuladores && gunzip -c ~/simuladores-app-amd64.tar.gz | docker load"

echo ""
echo "🛑 Parando containers..."
ssh double@10.10.50.246 "cd ~/simuladores && docker-compose -f docker-compose.prod.yml --env-file .env.production down"

echo ""
echo "🚀 Iniciando containers..."
ssh double@10.10.50.246 "cd ~/simuladores && docker-compose -f docker-compose.prod.yml --env-file .env.production up -d"

echo ""
echo "⏳ Aguardando 30 segundos..."
sleep 30

echo ""
echo "📊 Status dos containers:"
ssh double@10.10.50.246 "docker ps --filter 'name=simuladores'"

echo ""
echo "📝 Logs da aplicação:"
ssh double@10.10.50.246 "docker logs simuladores_app_prod --tail 30"

echo ""
echo "✅ Deploy concluído!"
echo "🌐 Teste: http://10.10.50.246:3009"
