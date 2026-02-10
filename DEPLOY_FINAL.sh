#!/bin/bash

# ============================================================================
# SCRIPT DE DEPLOY FINAL - Seguindo GUIA_DEPLOY.md
# ============================================================================
# 
# Este script completa o deploy em produção
# Execute este script para fazer o deploy final
#
# ============================================================================

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         DEPLOY FINAL - Correção de Comissões                  ║"
echo "║                                                                ║"
echo "║  Servidor: 10.10.50.246                                       ║"
echo "║  Usuário: double                                              ║"
echo "║  Porta: 3009                                                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# ETAPA 1: Transferir image para servidor
# ============================================================================

echo -e "${YELLOW}📤 ETAPA 1: Transferindo image para servidor...${NC}"
echo ""

if [ ! -f "simuladores-app.tar.gz" ]; then
    echo -e "${RED}❌ Erro: Arquivo simuladores-app.tar.gz não encontrado!${NC}"
    echo "Execute primeiro: docker save simuladores-app:latest | gzip > simuladores-app.tar.gz"
    exit 1
fi

echo "Arquivo: simuladores-app.tar.gz ($(du -h simuladores-app.tar.gz | cut -f1))"
echo ""
echo "Transferindo para servidor..."
echo ""

scp -P 22 simuladores-app.tar.gz double@10.10.50.246:~/

echo ""
echo -e "${GREEN}✅ Image transferida com sucesso!${NC}"
echo ""

# ============================================================================
# ETAPA 2: Conectar ao servidor e fazer deploy
# ============================================================================

echo -e "${YELLOW}🚀 ETAPA 2: Conectando ao servidor e fazendo deploy...${NC}"
echo ""
echo "Você será conectado ao servidor via SSH"
echo "Depois execute os comandos abaixo:"
echo ""
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "cd ~/simuladores"
echo "sudo ./deploy.sh install-on-server"
echo ""
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "Pressione ENTER para conectar ao servidor..."
read

ssh double@10.10.50.246

# ============================================================================
# ETAPA 3: Verificar deploy
# ============================================================================

echo ""
echo -e "${YELLOW}🔍 ETAPA 3: Verificando deploy...${NC}"
echo ""

echo "Testando conexão com servidor..."
if curl -s http://10.10.50.246:3009/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Aplicação respondendo em http://10.10.50.246:3009${NC}"
else
    echo -e "${YELLOW}⏳ Aguardando aplicação iniciar...${NC}"
    sleep 10
    if curl -s http://10.10.50.246:3009/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Aplicação respondendo em http://10.10.50.246:3009${NC}"
    else
        echo -e "${RED}❌ Aplicação não está respondendo${NC}"
        echo "Verifique os logs no servidor: sudo ./deploy.sh logs"
    fi
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   DEPLOY CONCLUÍDO!                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📝 Mudanças implementadas:"
echo "  ✅ Comissões calculadas apenas sobre diferença de valor"
echo "  ✅ Se diferença for negativa, comissão = R$ 0,00"
echo "  ✅ Checkbox duplicado removido em InternetRadioCalculator"
echo "  ✅ Null checks adicionados em todas as calculadoras"
echo ""
echo "🌐 Acesse: http://10.10.50.246:3009"
echo ""
echo "📋 Próximos passos:"
echo "  1. Testar os 3 cenários de comissões"
echo "  2. Validar cálculos no DRE"
echo "  3. Comunicar mudanças aos usuários"
echo ""
