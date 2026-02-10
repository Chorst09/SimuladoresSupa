#!/bin/bash
# Execute no servidor: ./verificar-servidor.sh

echo "🔍 Diagnóstico Completo do Servidor"
echo "===================================="
echo ""

echo "📊 1. Containers rodando:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📦 2. Imagens disponíveis:"
docker images | grep -E "REPOSITORY|simuladores|postgres"

echo ""
echo "🌐 3. Redes Docker:"
docker network ls | grep -E "NAME|simuladores"

echo ""
echo "💾 4. Volumes:"
docker volume ls | grep -E "DRIVER|simuladores"

echo ""
echo "📝 5. Logs da aplicação (últimas 15 linhas):"
docker logs simuladores_app_prod --tail 15 2>/dev/null || echo "Container não encontrado ou não iniciado"

echo ""
echo "📝 6. Logs do banco (últimas 10 linhas):"
docker logs simuladores_db_prod --tail 10 2>/dev/null || echo "Container não encontrado"

echo ""
echo "🏥 7. Teste de conectividade local:"
if curl -f -s http://localhost:3009 > /dev/null 2>&1; then
    echo "✅ Aplicação respondendo em localhost:3009"
else
    echo "❌ Aplicação NÃO está respondendo"
fi

echo ""
echo "🔥 8. Portas escutando:"
sudo netstat -tlnp 2>/dev/null | grep -E "3009|5432" || sudo ss -tlnp 2>/dev/null | grep -E "3009|5432" || echo "Nenhuma porta encontrada"

echo ""
echo "🛡️  9. Status do firewall:"
sudo ufw status 2>/dev/null | grep -E "Status|3009" || echo "UFW não disponível"

echo ""
echo "📁 10. Arquivos de configuração:"
ls -lh ~/simuladores/.env.production ~/simuladores/docker-compose.prod.yml 2>/dev/null || echo "Arquivos não encontrados"

echo ""
echo "===================================="
echo "Diagnóstico concluído!"
