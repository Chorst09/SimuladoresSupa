#!/bin/bash

# ============================================================================
# SCRIPT DE DEPLOY MANUAL - EXECUTA COMANDOS NO SERVIDOR
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SERVER_IP="10.10.50.246"
SERVER_USER="double"
SERVER_PASS="<SENHA_DO_SERVIDOR>"
SUDO_PASS="<SENHA_DO_SERVIDOR>"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              DEPLOY MANUAL - ETAPA 2 NO SERVIDOR              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Criar script remoto que será executado no servidor
REMOTE_SCRIPT=$(cat <<'REMOTE_EOF'
#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd ~/simuladores

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              INSTALANDO NO SERVIDOR                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ETAPA 1: Parar tudo
echo -e "${YELLOW}📋 Etapa 1: Parando containers...${NC}"
sudo docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
echo -e "${GREEN}✅ Containers parados${NC}"
echo ""

# ETAPA 2: Remover volumes antigos
echo -e "${YELLOW}📋 Etapa 2: Removendo volumes antigos...${NC}"
sudo docker volume rm simuladores_postgres_prod_data 2>/dev/null || echo "Volume não encontrado"
echo -e "${GREEN}✅ Volumes removidos${NC}"
echo ""

# ETAPA 3: Limpar imagens
echo -e "${YELLOW}📋 Etapa 3: Limpando imagens antigas...${NC}"
sudo docker system prune -a -f
echo -e "${GREEN}✅ Imagens limpas${NC}"
echo ""

# ETAPA 4: Carregar nova imagem
echo -e "${YELLOW}📋 Etapa 4: Carregando nova imagem...${NC}"

if [ ! -f ~/simuladores-app.tar.gz ]; then
    echo -e "${RED}❌ Erro: Arquivo ~/simuladores-app.tar.gz não encontrado!${NC}"
    exit 1
fi

sudo docker load -i ~/simuladores-app.tar.gz

echo ""
echo -e "${GREEN}✅ Imagem carregada${NC}"
echo ""

# ETAPA 5: Verificar imagens
echo -e "${YELLOW}📋 Etapa 5: Verificando imagens...${NC}"
sudo docker images | grep simuladores
echo ""

# ETAPA 6: Iniciar containers
echo -e "${YELLOW}📋 Etapa 6: Iniciando containers (SEM BUILD)...${NC}"
sudo docker-compose -f docker-compose.prod.yml up -d --no-build
echo -e "${GREEN}✅ Containers iniciados${NC}"
echo ""

# ETAPA 7: Aguardar
echo -e "${YELLOW}⏳ Etapa 7: Aguardando containers iniciarem (60 segundos)...${NC}"
sleep 60
echo -e "${GREEN}✅ Aguardado${NC}"
echo ""

# ETAPA 8: Verificar status
echo -e "${YELLOW}📋 Etapa 8: Verificando status...${NC}"
sudo docker-compose -f docker-compose.prod.yml ps
echo ""

# ETAPA 9: Ver logs
echo -e "${YELLOW}📋 Etapa 9: Logs da aplicação (últimas 30 linhas)...${NC}"
sudo docker-compose -f docker-compose.prod.yml logs --tail=30 app
echo ""

# ETAPA 10: Testar health check
echo -e "${YELLOW}📋 Etapa 10: Testando health check...${NC}"
echo ""

for i in {1..10}; do
    echo "Tentativa $i/10..."
    if curl -s http://localhost:3009/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Aplicação respondendo!${NC}"
        curl -s http://localhost:3009/api/health
        break
    else
        echo "Aguardando..."
        sleep 5
    fi
done

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   DEPLOY CONCLUÍDO!                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ Aplicação pronta em http://localhost:3009${NC}"
echo ""
echo "📝 Próximos passos:"
echo "  1. Acessar http://10.10.50.246:3009"
echo "  2. Fazer login (admin@sistema.com / admin123)"
echo "  3. Testar os 3 cenários de comissões"
echo "  4. Validar cálculos no DRE"
echo ""

REMOTE_EOF
)

# Executar script remoto via SSH
echo -e "${YELLOW}🔗 Conectando ao servidor e executando deploy...${NC}"
echo ""

ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" bash -s <<< "$REMOTE_SCRIPT"

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  ✅ DEPLOY CONCLUÍDO COM SUCESSO!                             ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "🎉 Aplicação está pronta em: http://10.10.50.246:3009"
    echo ""
else
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  ❌ ERRO DURANTE O DEPLOY                                     ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    exit 1
fi
