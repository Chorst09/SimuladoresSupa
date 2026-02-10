#!/bin/bash

# ============================================================================
# SCRIPT DE DEPLOY FINAL - SIMULADORES
# ============================================================================
# 
# Este script executa o deploy completo em 2 etapas:
# 1. Preparar e transferir arquivos (executar no PC local)
# 2. Instalar no servidor (executar via SSH)
#
# ============================================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configurações
SERVER_IP="10.10.50.246"
SERVER_USER="double"
SERVER_PATH="~/simuladores"
DOCKER_IMAGE="simuladores-app.tar.gz"

# ============================================================================
# FUNÇÃO: Exibir menu
# ============================================================================

show_menu() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║           DEPLOY FINAL - SISTEMA DE SIMULADORES               ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Escolha uma opção:"
    echo ""
    echo "  1) Etapa 1: Preparar e transferir arquivos (PC LOCAL)"
    echo "  2) Etapa 2: Instalar no servidor (VIA SSH)"
    echo "  3) Executar ambas as etapas (RECOMENDADO)"
    echo "  4) Apenas verificar status"
    echo "  5) Sair"
    echo ""
}

# ============================================================================
# FUNÇÃO: Etapa 1 - Preparar e transferir
# ============================================================================

etapa_1_preparar() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  ETAPA 1: PREPARAR E TRANSFERIR ARQUIVOS (PC LOCAL)           ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Verificar se a imagem Docker existe
    if [ ! -f "$DOCKER_IMAGE" ]; then
        echo -e "${YELLOW}⚠️  Arquivo $DOCKER_IMAGE não encontrado!${NC}"
        echo ""
        echo "Construindo imagem Docker..."
        echo ""
        
        # Verificar se Docker está rodando
        if ! docker ps > /dev/null 2>&1; then
            echo -e "${RED}❌ Docker não está rodando!${NC}"
            echo "Por favor, inicie o Docker e tente novamente."
            exit 1
        fi
        
        # Construir imagem
        echo -e "${YELLOW}📦 Construindo imagem Docker (--platform linux/amd64)...${NC}"
        docker build --platform linux/amd64 -t simuladores-app:latest .
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Erro ao construir imagem Docker!${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}✅ Imagem construída com sucesso${NC}"
        echo ""
        
        # Salvar imagem
        echo -e "${YELLOW}💾 Salvando imagem em $DOCKER_IMAGE...${NC}"
        docker save simuladores-app:latest | gzip > "$DOCKER_IMAGE"
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Erro ao salvar imagem!${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}✅ Imagem salva com sucesso${NC}"
    else
        echo -e "${GREEN}✅ Arquivo $DOCKER_IMAGE encontrado${NC}"
    fi
    
    # Verificar tamanho
    SIZE=$(du -h "$DOCKER_IMAGE" | cut -f1)
    echo "   Tamanho: $SIZE"
    echo ""
    
    # Transferir para servidor
    echo -e "${YELLOW}📤 Transferindo $DOCKER_IMAGE para servidor...${NC}"
    echo "   Servidor: $SERVER_IP"
    echo "   Usuário: $SERVER_USER"
    echo ""
    
    scp "$DOCKER_IMAGE" "$SERVER_USER@$SERVER_IP:~/"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro ao transferir arquivo!${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Arquivo transferido com sucesso${NC}"
    echo ""
    
    # Transferir docker-compose.prod.yml
    echo -e "${YELLOW}📤 Transferindo docker-compose.prod.yml...${NC}"
    scp docker-compose.prod.yml "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro ao transferir docker-compose.prod.yml!${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ docker-compose.prod.yml transferido${NC}"
    echo ""
    
    # Transferir .env.production
    if [ -f ".env.production" ]; then
        echo -e "${YELLOW}📤 Transferindo .env.production...${NC}"
        scp .env.production "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Erro ao transferir .env.production!${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}✅ .env.production transferido${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.production não encontrado - usando existente no servidor${NC}"
    fi
    
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  ✅ ETAPA 1 CONCLUÍDA COM SUCESSO                             ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Próximo passo: Executar ETAPA 2 no servidor"
    echo ""
}

# ============================================================================
# FUNÇÃO: Etapa 2 - Instalar no servidor
# ============================================================================

etapa_2_instalar() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  ETAPA 2: INSTALAR NO SERVIDOR (VIA SSH)                      ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    
    echo -e "${YELLOW}🔗 Conectando ao servidor...${NC}"
    echo "   Servidor: $SERVER_IP"
    echo "   Usuário: $SERVER_USER"
    echo ""
    
    # Criar script remoto
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
    
    # Executar script remoto
    ssh "$SERVER_USER@$SERVER_IP" bash -s <<< "$REMOTE_SCRIPT"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Erro durante instalação no servidor!${NC}"
        exit 1
    fi
    
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║  ✅ ETAPA 2 CONCLUÍDA COM SUCESSO                             ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
}

# ============================================================================
# FUNÇÃO: Verificar status
# ============================================================================

verificar_status() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║              VERIFICANDO STATUS                               ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    
    echo -e "${YELLOW}🔍 Verificando conectividade com servidor...${NC}"
    
    if ping -c 1 "$SERVER_IP" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Servidor online${NC}"
    else
        echo -e "${RED}❌ Servidor offline${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${YELLOW}🔍 Verificando aplicação...${NC}"
    
    if curl -s "http://$SERVER_IP:3009/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Aplicação respondendo${NC}"
        echo "   URL: http://$SERVER_IP:3009"
    else
        echo -e "${RED}❌ Aplicação não respondendo${NC}"
        echo "   URL: http://$SERVER_IP:3009"
    fi
    
    echo ""
}

# ============================================================================
# MAIN
# ============================================================================

while true; do
    show_menu
    read -p "Opção: " opcao
    
    case $opcao in
        1)
            etapa_1_preparar
            ;;
        2)
            etapa_2_instalar
            ;;
        3)
            etapa_1_preparar
            echo ""
            read -p "Pressione ENTER para continuar com ETAPA 2..."
            etapa_2_instalar
            ;;
        4)
            verificar_status
            ;;
        5)
            echo ""
            echo "Saindo..."
            exit 0
            ;;
        *)
            echo -e "${RED}Opção inválida!${NC}"
            ;;
    esac
done
