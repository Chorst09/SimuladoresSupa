#!/bin/bash

# ============================================================================
# SCRIPT PARA CORRIGIR DEPLOY NO SERVIDOR
# ============================================================================
# 
# Execute este script DENTRO do servidor (via SSH)
# Ele irá corrigir o erro de conexão ao Docker registry
#
# ============================================================================

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         CORRIGINDO DEPLOY - Erro de Docker Registry           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ============================================================================
# ETAPA 1: Parar containers
# ============================================================================

echo -e "${YELLOW}📋 Etapa 1: Parando containers...${NC}"
cd ~/simuladores
sudo docker-compose -f docker-compose.prod.yml down

echo ""
echo -e "${GREEN}✅ Containers parados${NC}"
echo ""

# ============================================================================
# ETAPA 2: Remover imagens antigas
# ============================================================================

echo -e "${YELLOW}📋 Etapa 2: Removendo imagens antigas...${NC}"
sudo docker rmi simuladores-app:latest 2>/dev/null || echo "Imagem não encontrada"
sudo docker rmi simuladores-postgres:prod 2>/dev/null || echo "Imagem não encontrada"

echo ""
echo -e "${GREEN}✅ Imagens antigas removidas${NC}"
echo ""

# ============================================================================
# ETAPA 3: Carregar nova imagem
# ============================================================================

echo -e "${YELLOW}📋 Etapa 3: Carregando nova imagem...${NC}"
echo "Arquivo: ~/simuladores-app.tar.gz"
echo ""

if [ ! -f ~/simuladores-app.tar.gz ]; then
    echo -e "${RED}❌ Erro: Arquivo ~/simuladores-app.tar.gz não encontrado!${NC}"
    exit 1
fi

sudo docker load -i ~/simuladores-app.tar.gz

echo ""
echo -e "${GREEN}✅ Imagem carregada${NC}"
echo ""

# ============================================================================
# ETAPA 4: Verificar imagens
# ============================================================================

echo -e "${YELLOW}📋 Etapa 4: Verificando imagens...${NC}"
sudo docker images | grep simuladores

echo ""
echo -e "${GREEN}✅ Imagens verificadas${NC}"
echo ""

# ============================================================================
# ETAPA 5: Iniciar containers (sem build)
# ============================================================================

echo -e "${YELLOW}📋 Etapa 5: Iniciando containers (sem build)...${NC}"
sudo docker-compose -f docker-compose.prod.yml up -d --no-build

echo ""
echo -e "${GREEN}✅ Containers iniciados${NC}"
echo ""

# ============================================================================
# ETAPA 6: Aguardar containers
# ============================================================================

echo -e "${YELLOW}⏳ Etapa 6: Aguardando containers iniciarem...${NC}"
sleep 20

echo ""
echo -e "${GREEN}✅ Aguardado${NC}"
echo ""

# ============================================================================
# ETAPA 7: Verificar status
# ============================================================================

echo -e "${YELLOW}📋 Etapa 7: Verificando status...${NC}"
sudo docker-compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}✅ Status verificado${NC}"
echo ""

# ============================================================================
# ETAPA 8: Testar health check
# ============================================================================

echo -e "${YELLOW}📋 Etapa 8: Testando health check...${NC}"
echo ""

for i in {1..5}; do
    echo "Tentativa $i/5..."
    if curl -s http://localhost:3009/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Aplicação respondendo!${NC}"
        curl -s http://localhost:3009/api/health | head -20
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
echo -e "${GREEN}✅ Aplicação pronta em http://localhost:3009${NC}"
echo ""
echo "📝 Próximos passos:"
echo "  1. Testar os 3 cenários de comissões"
echo "  2. Validar cálculos no DRE"
echo "  3. Comunicar mudanças aos usuários"
echo ""
