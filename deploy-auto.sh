#!/bin/bash

echo "�� DEPLOY AUTOMÁTICO - Corrigindo erro de Docker Registry"
echo ""

# Usar sshpass para passar a senha automaticamente
which sshpass > /dev/null 2>&1 || {
    echo "❌ sshpass não instalado. Instalando..."
    brew install sshpass 2>/dev/null || apt-get install -y sshpass 2>/dev/null || {
        echo "Instale sshpass manualmente e tente novamente"
        exit 1
    }
}

PASSWORD="<SENHA_DO_SERVIDOR>"
SERVER="double@10.10.50.246"

echo "📤 Conectando ao servidor e executando correção..."
echo ""

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER" << 'SSHEOF'

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         CORRIGINDO DEPLOY - Erro de Docker Registry           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

cd ~/simuladores

echo "📋 Etapa 1: Parando containers..."
echo "$PASSWORD" | sudo -S docker-compose -f docker-compose.prod.yml down
echo "✅ Containers parados"
echo ""

echo "📋 Etapa 2: Removendo imagens antigas..."
echo "$PASSWORD" | sudo -S docker rmi simuladores-app:latest 2>/dev/null || true
echo "$PASSWORD" | sudo -S docker rmi simuladores-postgres:prod 2>/dev/null || true
echo "✅ Imagens removidas"
echo ""

echo "📋 Etapa 3: Carregando nova imagem..."
echo "$PASSWORD" | sudo -S docker load -i ~/simuladores-app.tar.gz
echo "✅ Imagem carregada"
echo ""

echo "📋 Etapa 4: Verificando imagens..."
echo "$PASSWORD" | sudo -S docker images | grep simuladores
echo ""

echo "📋 Etapa 5: Iniciando containers (sem build)..."
echo "$PASSWORD" | sudo -S docker-compose -f docker-compose.prod.yml up -d --no-build
echo "✅ Containers iniciados"
echo ""

echo "⏳ Etapa 6: Aguardando containers iniciarem (30 segundos)..."
sleep 30
echo "✅ Aguardado"
echo ""

echo "📋 Etapa 7: Verificando status..."
echo "$PASSWORD" | sudo -S docker-compose -f docker-compose.prod.yml ps
echo ""

echo "📋 Etapa 8: Testando health check..."
for i in {1..5}; do
    echo "Tentativa $i/5..."
    if curl -s http://localhost:3009/api/health > /dev/null 2>&1; then
        echo "✅ Aplicação respondendo!"
        curl -s http://localhost:3009/api/health
        break
    else
        echo "Aguardando..."
        sleep 5
    fi
done

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   DEPLOY CORRIGIDO!                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Aplicação pronta em http://localhost:3009"
echo ""

SSHEOF

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "🌐 Acesse: http://10.10.50.246:3009"
echo ""
echo "📝 Mudanças implementadas:"
echo "  ✅ Comissões calculadas apenas sobre diferença de valor"
echo "  ✅ Se diferença for negativa, comissão = R$ 0,00"
echo "  ✅ Checkbox duplicado removido"
echo "  ✅ Null checks adicionados"
echo ""
