#!/bin/bash

# ============================================
# DEPLOY FINAL - SIMULADORES APP
# ============================================
# Este script faz o deploy completo da aplicação
# para o servidor de produção com os valores
# de comissão do diretor já atualizados.
# ============================================

set -e

SERVER_IP="10.10.50.246"
SERVER_USER="double"
SERVER_PASSWORD="<SENHA_DO_SERVIDOR>"
SUDO_PASSWORD="<SENHA_DO_SERVIDOR>"
IMAGE_FILE="simuladores-app-prod.tar.gz"
REMOTE_PATH="~/simuladores"

echo "🚀 DEPLOY FINAL - SIMULADORES APP"
echo "=================================="
echo ""
echo "📍 Servidor: $SERVER_IP"
echo "👤 Usuário: $SERVER_USER"
echo "📦 Imagem: $IMAGE_FILE"
echo ""

# Verificar se a imagem existe
if [ ! -f "$IMAGE_FILE" ]; then
    echo "❌ Erro: Arquivo $IMAGE_FILE não encontrado!"
    echo "Execute primeiro: docker save simuladores-app:latest | gzip > $IMAGE_FILE"
    exit 1
fi

echo "✅ Imagem encontrada: $(ls -lh $IMAGE_FILE | awk '{print $5}')"
echo ""

# Verificar conectividade
echo "🔍 Verificando conectividade com o servidor..."
if ! ping -c 1 $SERVER_IP &> /dev/null; then
    echo "❌ Servidor $SERVER_IP está OFFLINE!"
    echo "⏳ Aguarde o servidor voltar online e tente novamente."
    exit 1
fi

echo "✅ Servidor está ONLINE"
echo ""

# Transferir imagem
echo "📤 Transferindo imagem Docker para o servidor..."
echo "   (Este processo pode levar alguns minutos...)"
echo ""

sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no "$IMAGE_FILE" "$SERVER_USER@$SERVER_IP:~/"

if [ $? -eq 0 ]; then
    echo "✅ Imagem transferida com sucesso!"
else
    echo "❌ Erro ao transferir imagem!"
    exit 1
fi

echo ""
echo "🔄 Instalando aplicação no servidor..."
echo ""

# Executar instalação no servidor
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'REMOTE_SCRIPT'
#!/bin/bash

set -e

echo "📍 Conectado ao servidor"
echo ""

# Entrar na pasta do projeto
cd ~/simuladores

echo "🛑 Parando containers antigos..."
sudo -S ./deploy.sh stop 2>/dev/null || true

echo ""
echo "🗑️  Limpando containers antigos..."
sudo -S ./deploy.sh clean 2>/dev/null || true

echo ""
echo "📦 Carregando nova imagem Docker..."
sudo docker load -i ~/simuladores-app-prod.tar.gz

echo ""
echo "🚀 Iniciando containers com nova imagem..."
sudo -S ./deploy.sh install-on-server

echo ""
echo "⏳ Aguardando containers iniciarem..."
sleep 10

echo ""
echo "✅ Verificando status dos containers..."
sudo -S ./deploy.sh status

echo ""
echo "🎉 Deploy concluído com sucesso!"
echo ""
echo "📍 Acesse a aplicação em: http://10.10.50.246:3009"
echo "👤 Login: admin@sistema.com"
echo "🔑 Senha: admin123"

REMOTE_SCRIPT

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Instalação concluída com sucesso!"
    echo ""
    echo "📋 Próximos passos:"
    echo "   1. Acesse http://10.10.50.246:3009"
    echo "   2. Faça login com admin@sistema.com / admin123"
    echo "   3. Verifique as tabelas de comissão"
    echo "   4. Teste as calculadoras"
    echo ""
    echo "📊 Valores de Comissão Diretor (já inseridos):"
    echo "   - 12 meses: 0,60%"
    echo "   - 24 meses: 1,20%"
    echo "   - 36 meses: 2,00%"
    echo "   - 48 meses: 2,00%"
    echo "   - 60 meses: 2,00%"
else
    echo ""
    echo "❌ Erro durante a instalação!"
    echo "Conecte ao servidor manualmente para verificar:"
    echo "   ssh double@10.10.50.246"
    echo "   cd ~/simuladores"
    echo "   sudo ./deploy.sh logs"
    exit 1
fi
