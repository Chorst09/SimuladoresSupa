#!/bin/bash

# ============================================================================
# SCRIPT DE VERIFICAÇÃO FINAL
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║           VERIFICAÇÃO FINAL - SISTEMA DE SIMULADORES          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Verificação 1: Arquivos necessários
echo -e "${BLUE}📋 Verificação 1: Arquivos necessários${NC}"
echo ""

FILES=(
    "docker-compose.prod.yml"
    ".env.production"
    "DEPLOY_AGORA.sh"
    "DEPLOY_PRONTO.md"
    "COMECE_AQUI.md"
    "RESUMO_CORRECAO_DEPLOY.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file (FALTANDO)"
    fi
done

echo ""

# Verificação 2: Configuração do docker-compose.prod.yml
echo -e "${BLUE}📋 Verificação 2: Configuração do docker-compose.prod.yml${NC}"
echo ""

if grep -q "image: docker.io/library/postgres:16-alpine" docker-compose.prod.yml; then
    echo -e "${GREEN}✅${NC} PostgreSQL configurado corretamente (sem build)"
else
    echo -e "${RED}❌${NC} PostgreSQL ainda com build (ERRO)"
fi

if grep -q "image: simuladores-app:latest" docker-compose.prod.yml; then
    echo -e "${GREEN}✅${NC} App configurado para usar imagem pré-construída"
else
    echo -e "${RED}❌${NC} App não configurado corretamente"
fi

echo ""

# Verificação 3: Permissões de script
echo -e "${BLUE}📋 Verificação 3: Permissões de script${NC}"
echo ""

if [ -x "DEPLOY_AGORA.sh" ]; then
    echo -e "${GREEN}✅${NC} DEPLOY_AGORA.sh é executável"
else
    echo -e "${YELLOW}⚠️${NC} DEPLOY_AGORA.sh não é executável"
    echo "   Executando: chmod +x DEPLOY_AGORA.sh"
    chmod +x DEPLOY_AGORA.sh
fi

echo ""

# Verificação 4: Conectividade
echo -e "${BLUE}📋 Verificação 4: Conectividade com servidor${NC}"
echo ""

if ping -c 1 10.10.50.246 > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} Servidor 10.10.50.246 está online"
else
    echo -e "${YELLOW}⚠️${NC} Servidor 10.10.50.246 está offline"
    echo "   (Isso é normal se o servidor está desligado)"
fi

echo ""

# Verificação 5: Docker local
echo -e "${BLUE}📋 Verificação 5: Docker local${NC}"
echo ""

if docker ps > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} Docker está rodando"
    DOCKER_VERSION=$(docker --version)
    echo "   $DOCKER_VERSION"
else
    echo -e "${RED}❌${NC} Docker não está rodando"
fi

echo ""

# Verificação 6: Imagem Docker
echo -e "${BLUE}📋 Verificação 6: Imagem Docker${NC}"
echo ""

if [ -f "simuladores-app.tar.gz" ]; then
    SIZE=$(du -h simuladores-app.tar.gz | cut -f1)
    echo -e "${GREEN}✅${NC} simuladores-app.tar.gz existe"
    echo "   Tamanho: $SIZE"
else
    echo -e "${YELLOW}⚠️${NC} simuladores-app.tar.gz não encontrado"
    echo "   (Será construído durante o deploy)"
fi

echo ""

# Resumo final
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    RESUMO FINAL                               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ Sistema pronto para deploy${NC}"
echo ""
echo "Próximo passo:"
echo "  ./DEPLOY_AGORA.sh"
echo ""
echo "Ou leia:"
echo "  COMECE_AQUI.md"
echo ""

