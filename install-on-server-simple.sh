#!/bin/bash
# Execute este script NO SERVIDOR: sudo ./install-on-server-simple.sh

set -e

echo "🚀 Instalação Simplificada no Servidor"
echo "======================================"
echo ""

# Verificar se está rodando como root
if [ "$(id -u)" != "0" ]; then
    echo "❌ Execute com sudo: sudo ./install-on-server-simple.sh"
    exit 1
fi

cd ~/simuladores || cd /home/double/simuladores

echo "📥 Passo 1: Carregando imagem Docker..."
if [ -f ~/simuladores-app.tar.gz ]; then
    gunzip -c ~/simuladores-app.tar.gz | docker load
    echo "✅ Imagem carregada"
elif [ -f /home/double/simuladores-app.tar.gz ]; then
    gunzip -c /home/double/simuladores-app.tar.gz | docker load
    echo "✅ Imagem carregada"
else
    echo "❌ Arquivo simuladores-app.tar.gz não encontrado!"
    exit 1
fi

echo ""
echo "🌐 Passo 2: Configurando rede Docker..."
docker network rm simuladores_network_prod 2>/dev/null || true
docker network create simuladores_network_prod
echo "✅ Rede criada"

echo ""
echo "🛑 Passo 3: Parando containers antigos..."
docker-compose -f docker-compose.prod.yml --env-file .env.production down 2>/dev/null || true
echo "✅ Containers parados"

echo ""
echo "🚀 Passo 4: Iniciando containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
echo "✅ Containers iniciados"

echo ""
echo "⏳ Passo 5: Aguardando inicialização (45 segundos)..."
sleep 45

echo ""
echo "📊 Status dos containers:"
docker ps --filter "name=simuladores"

echo ""
echo "🌱 Passo 6: Executando seed (criando usuários)..."
docker exec simuladores_app_prod sh -c "cd /app && node_modules/.bin/tsx prisma/seed.ts" 2>/dev/null || echo "⚠️  Seed pode já ter sido executado"

echo ""
echo "🔥 Passo 7: Configurando firewall..."
ufw allow 3009/tcp comment "Simulador DRE" 2>/dev/null || true
echo "✅ Porta 3009 liberada"

echo ""
echo "🏥 Passo 8: Testando aplicação..."
if curl -f -s http://localhost:3009 > /dev/null 2>&1; then
    echo "✅ Aplicação está respondendo!"
else
    echo "⚠️  Aplicação ainda não está respondendo"
    echo "   Aguarde mais alguns segundos e teste:"
    echo "   curl http://localhost:3009"
fi

echo ""
echo "🧹 Passo 9: Limpando arquivos temporários..."
rm -f ~/simuladores-app.tar.gz /home/double/simuladores-app.tar.gz

echo ""
echo "✅ INSTALAÇÃO CONCLUÍDA!"
echo ""
echo "🌐 URLs de Acesso:"
echo "   http://10.10.50.246:3009"
echo "   http://simulador-dre.doubletelecom.com.br:3009"
echo ""
echo "👤 Usuários:"
echo "   admin@sistema.com / admin123"
echo "   diretor@sistema.com / diretor123"
echo "   gerente@sistema.com / gerente123"
echo ""
echo "📝 Comandos úteis:"
echo "   Ver logs:    docker logs -f simuladores_app_prod"
echo "   Reiniciar:   docker-compose -f docker-compose.prod.yml restart"
echo "   Status:      docker ps"
echo ""
