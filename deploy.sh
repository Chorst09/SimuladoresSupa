#!/bin/bash

# ==========================================
# DEPLOY SCRIPT UNIFICADO
# Sistema de Simuladores - PostgreSQL
# ==========================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir ajuda
show_help() {
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${BLUE}DEPLOY SCRIPT - Sistema de Simuladores${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo ""
    echo -e "${GREEN}Uso:${NC} ./deploy.sh [COMANDO] [OPÇÕES]"
    echo ""
    echo -e "${GREEN}COMANDOS:${NC}"
    echo -e "  ${YELLOW}clean${NC}         - Limpar containers, volumes e imagens (local)"
    echo -e "  ${YELLOW}clean-server${NC}  - Limpar Docker no servidor (executar NO servidor)"
    echo -e "  ${YELLOW}install${NC}       - Instalar dependências e configurar ambiente"
    echo -e "  ${YELLOW}build${NC}         - Fazer build das imagens Docker"
    echo -e "  ${YELLOW}dev${NC}           - Iniciar ambiente de desenvolvimento"
    echo -e "  ${YELLOW}prod${NC}          - Iniciar ambiente de produção"
    echo -e "  ${YELLOW}deploy-remote${NC} - Deploy para servidor remoto"
    echo -e "  ${YELLOW}install-on-server${NC} - Instalar no servidor (executar NO servidor)"
    echo -e "  ${YELLOW}backup${NC}        - Fazer backup do banco de dados"
    echo -e "  ${YELLOW}restore${NC}       - Restaurar backup do banco de dados"
    echo -e "  ${YELLOW}logs${NC}          - Visualizar logs dos containers"
    echo -e "  ${YELLOW}status${NC}        - Verificar status dos serviços"
    echo -e "  ${YELLOW}stop${NC}          - Parar todos os serviços"
    echo ""
    echo -e "${GREEN}OPÇÕES:${NC}"
    echo -e "  ${YELLOW}--admin${NC}      - Incluir PgAdmin nos serviços"
    echo -e "  ${YELLOW}--nginx${NC}      - Incluir Nginx (apenas produção)"
    echo -e "  ${YELLOW}--no-cache${NC}   - Build sem cache"
    echo -e "  ${YELLOW}--force${NC}      - Forçar operação sem confirmação"
    echo -e "  ${YELLOW}--file <path>${NC} - Especificar arquivo de backup (restore)"
    echo ""
    echo -e "${GREEN}EXEMPLOS:${NC}"
    echo -e "  ./deploy.sh install"
    echo -e "  ./deploy.sh dev --admin"
    echo -e "  ./deploy.sh prod"
    echo -e "  ./deploy.sh build --no-cache"
    echo -e "  ./deploy.sh deploy-remote root@servidor.com image"
    echo -e "  ./deploy.sh deploy-remote root@servidor.com source"
    echo -e "  ${YELLOW}sudo ./deploy.sh clean-server --soft${NC}  (no servidor)"
    echo -e "  ${YELLOW}sudo ./deploy.sh clean-server --hard${NC}  (no servidor)"
    echo -e "  ${YELLOW}sudo ./deploy.sh install-on-server${NC}  (no servidor)"
    echo -e "  ./deploy.sh backup dev"
    echo -e "  ./deploy.sh restore --file backup.sql dev"
    echo -e "  ./deploy.sh clean --force"
    echo ""
}

# Função para log colorido
log() {
    local level=$1
    shift
    case $level in
        "INFO")  echo -e "${GREEN}[INFO]${NC} $*" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} $*" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $*" ;;
        "DEBUG") echo -e "${BLUE}[DEBUG]${NC} $*" ;;
    esac
}

# Função para verificar dependências
check_dependencies() {
    log "INFO" "Verificando dependências..."
    
    # Verificar se Podman está disponível (preferência)
    if command -v podman &> /dev/null; then
        CONTAINER_ENGINE="podman"
        COMPOSE_CMD="podman-compose"
        
        # Verificar se podman-compose está disponível
        if ! command -v podman-compose &> /dev/null; then
            log "WARN" "podman-compose não encontrado, tentando docker compose com podman"
            COMPOSE_CMD="docker compose"
            # Configurar docker compose para usar podman
            export DOCKER_HOST="unix:///run/user/$(id -u)/podman/podman.sock"
        fi
        
        log "INFO" "Usando Podman como container engine"
    elif command -v docker &> /dev/null; then
        CONTAINER_ENGINE="docker"
        COMPOSE_CMD="docker compose"
        
        # Verificar se docker compose está disponível
        if ! docker compose version &> /dev/null; then
            log "ERROR" "Docker Compose não está instalado!"
            log "INFO" "Instale com: sudo apt install docker-compose-plugin"
            exit 1
        fi
        
        log "INFO" "Usando Docker como container engine"
    else
        log "ERROR" "Nem Docker nem Podman estão instalados!"
        log "INFO" "Instale um dos dois: docker ou podman"
        exit 1
    fi
    
    log "INFO" "Container engine: $CONTAINER_ENGINE"
    log "INFO" "Compose command: $COMPOSE_CMD"
}

# Função para detectar ambiente
detect_environment() {
    if [ -f ".env.production" ] && [ "$ENVIRONMENT" = "prod" ]; then
        ENV_FILE=".env.production"
        COMPOSE_FILE="docker-compose.prod.yml"
        DB_CONTAINER="simuladores_db_prod"
        APP_CONTAINER="simuladores_app_prod"
    else
        ENV_FILE=".env.development"
        COMPOSE_FILE="docker-compose.dev.yml"
        DB_CONTAINER="simuladores_db_dev"
        APP_CONTAINER="simuladores_app_dev"
        ENVIRONMENT="dev"
    fi
    
    log "INFO" "Ambiente: $ENVIRONMENT"
    log "INFO" "Arquivo env: $ENV_FILE"
    log "INFO" "Compose: $COMPOSE_FILE"
}

# Função para carregar variáveis de ambiente
load_env() {
    if [ -f "$ENV_FILE" ]; then
        # Carregar variáveis do arquivo .env
        set -a  # Exportar automaticamente todas as variáveis
        source "$ENV_FILE"
        set +a  # Desabilitar exportação automática
        log "INFO" "Variáveis carregadas de $ENV_FILE"
    else
        log "WARN" "Arquivo $ENV_FILE não encontrado"
    fi
}

# Função para configurar profiles
setup_profiles() {
    PROFILES=""
    if [ "$INCLUDE_ADMIN" = "true" ]; then
        PROFILES="$PROFILES --profile admin"
        log "INFO" "PgAdmin incluído"
    fi
    if [ "$INCLUDE_NGINX" = "true" ] && [ "$ENVIRONMENT" = "prod" ]; then
        PROFILES="$PROFILES --profile nginx"
        log "INFO" "Nginx incluído"
    fi
}

# Comando: clean
cmd_clean() {
    log "INFO" "Limpando ambiente Docker..."
    
    if [ "$FORCE" != "true" ]; then
        echo -e "${YELLOW}⚠️  Isso irá remover containers, volumes e imagens. Continuar? (y/N):${NC}"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            log "INFO" "Operação cancelada"
            exit 0
        fi
    fi
    
    # Parar todos os containers
    $COMPOSE_CMD -f docker-compose.dev.yml down -v 2>/dev/null || true
    $COMPOSE_CMD -f docker-compose.prod.yml down -v 2>/dev/null || true
    
    # Remover imagens do projeto
    $CONTAINER_ENGINE images | grep simuladores | awk '{print $3}' | xargs -r $CONTAINER_ENGINE rmi -f
    
    # Limpar sistema
    $CONTAINER_ENGINE system prune -f
    
    log "INFO" "Limpeza concluída"
}

# Comando: clean-server (executar NO servidor)
cmd_clean_server() {
    # Verificar se está rodando como root ou com sudo
    if [ "$(id -u)" != "0" ]; then
        log "ERROR" "Este comando precisa ser executado com sudo"
        log "INFO" "Execute: sudo ./deploy.sh clean-server [--soft|--hard]"
        exit 1
    fi
    
    local cleanup_type="${1:---soft}"
    
    echo ""
    echo -e "${BLUE}=========================================="
    echo "🧹 Limpeza do Docker - Simuladores"
    echo -e "==========================================${NC}"
    echo ""
    
    case "$cleanup_type" in
        --soft)
            echo -e "${YELLOW}Modo: LIMPEZA SUAVE${NC}"
            echo "  ✅ Remove containers"
            echo "  ✅ Remove imagens"
            echo "  ✅ Mantém volumes (dados preservados)"
            REMOVE_VOLUMES=false
            ;;
        --hard)
            echo -e "${RED}Modo: LIMPEZA COMPLETA${NC}"
            echo "  ⚠️  Remove containers"
            echo "  ⚠️  Remove imagens"
            echo "  ⚠️  Remove volumes (APAGA TODOS OS DADOS!)"
            REMOVE_VOLUMES=true
            ;;
        *)
            log "ERROR" "Opção inválida: $cleanup_type"
            log "INFO" "Use: sudo ./deploy.sh clean-server [--soft|--hard]"
            exit 1
            ;;
    esac
    
    echo ""
    if [ "$FORCE" != "true" ]; then
        read -p "Confirma a limpeza? (y/N): " -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "INFO" "Operação cancelada"
            exit 0
        fi
    fi
    
    echo ""
    log "INFO" "🛑 Parando containers do simuladores..."
    docker compose -f docker-compose.server.yml down 2>/dev/null || true
    docker stop simuladores_app_prod simuladores_db_prod 2>/dev/null || true
    
    echo ""
    log "INFO" "🗑️  Removendo containers do simuladores..."
    docker rm -f simuladores_app_prod simuladores_db_prod 2>/dev/null || true
    
    echo ""
    log "INFO" "🗑️  Removendo imagens do simuladores..."
    docker images --format "{{.ID}} {{.Repository}}" | grep simuladores | awk '{print $1}' | xargs -r docker rmi -f
    
    echo ""
    log "INFO" "🗑️  Removendo imagens sem tag..."
    docker images --format "{{.ID}} {{.Repository}}" | grep '<none>' | awk '{print $1}' | xargs -r docker rmi -f 2>/dev/null || true
    
    if [ "$REMOVE_VOLUMES" = true ]; then
        echo ""
        echo -e "${RED}⚠️  REMOVENDO VOLUMES (DADOS SERÃO PERDIDOS!)${NC}"
        read -p "Tem certeza? Digite 'DELETE' para confirmar: " confirm
        
        if [ "$confirm" = "DELETE" ]; then
            docker volume rm simuladores_postgres_prod_data 2>/dev/null || echo "  Volume não encontrado"
            docker network rm simuladores_network_prod 2>/dev/null || echo "  Rede não encontrada"
            echo -e "${RED}✅ Volumes removidos!${NC}"
        else
            log "INFO" "Remoção de volumes cancelada"
        fi
    fi
    
    echo ""
    echo -e "${BLUE}=========================================="
    echo "📊 Status Atual"
    echo -e "==========================================${NC}"
    
    echo ""
    echo "Containers:"
    docker ps -a --filter "name=simuladores" --format "table {{.Names}}\t{{.Status}}" || echo "  Nenhum container encontrado ✅"
    
    echo ""
    echo "Imagens:"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep -E "REPOSITORY|simuladores" || echo "  Nenhuma imagem encontrada ✅"
    
    echo ""
    echo "Volumes:"
    docker volume ls --filter "name=simuladores" --format "table {{.Name}}\t{{.Driver}}" || echo "  Nenhum volume encontrado"
    
    echo ""
    echo -e "${GREEN}=========================================="
    echo "✅ Limpeza Concluída!"
    echo -e "==========================================${NC}"
    echo ""
    
    if [ "$REMOVE_VOLUMES" = true ]; then
        echo "⚠️  Volumes foram removidos - dados perdidos!"
        echo ""
        echo "Próximos passos:"
        echo "1. Execute o deploy remoto da sua máquina local"
        echo "2. Ou envie novos arquivos .tar.gz e execute:"
        echo "   sudo ./deploy.sh install-on-server"
    else
        echo "✅ Volumes preservados - dados intactos!"
        echo ""
        echo "Próximos passos:"
        echo "1. Execute o deploy remoto da sua máquina local"
        echo "2. Ou execute: sudo ./deploy.sh install-on-server"
    fi
    echo ""
}

# Comando: install
cmd_install() {
    log "INFO" "Configurando ambiente..."
    
    # Criar arquivos de ambiente se não existirem
    if [ ! -f ".env.development" ]; then
        log "INFO" "Criando .env.development"
        cp .env.example .env.development
    fi
    
    if [ ! -f ".env.production" ]; then
        log "INFO" "Criando .env.production"
        cp .env.example .env.production
        log "WARN" "Configure as variáveis em .env.production antes do deploy!"
    fi
    
    # Criar diretórios necessários
    mkdir -p backups nginx/ssl logs
    
    # Dar permissões aos scripts
    chmod +x deploy.sh scripts/*.sh 2>/dev/null || true
    
    log "INFO" "Instalação concluída"
    log "INFO" "Configure os arquivos .env antes de continuar"
}

# Comando: build
cmd_build() {
    log "INFO" "Fazendo build das imagens..."
    
    detect_environment
    
    BUILD_ARGS=""
    if [ "$NO_CACHE" = "true" ]; then
        BUILD_ARGS="--no-cache"
        log "INFO" "Build sem cache"
    fi
    
    $COMPOSE_CMD -f "$COMPOSE_FILE" build $BUILD_ARGS
    
    log "INFO" "Build concluído"
}

# Comando: dev
cmd_dev() {
    log "INFO" "Iniciando ambiente de desenvolvimento..."
    
    ENVIRONMENT="dev"
    detect_environment
    load_env
    setup_profiles
    
    # Verificar se .env.development existe
    if [ ! -f ".env.development" ]; then
        log "ERROR" "Arquivo .env.development não encontrado!"
        log "INFO" "Execute: ./deploy.sh install"
        exit 1
    fi
    
    # Parar containers existentes
    $COMPOSE_CMD -f "$COMPOSE_FILE" down
    
    # Iniciar serviços
    $COMPOSE_CMD -f "$COMPOSE_FILE" $PROFILES up -d
    
    # Aguardar serviços
    log "INFO" "Aguardando serviços ficarem prontos..."
    log "INFO" "Inicializando banco de dados (pode levar até 60 segundos)..."
    sleep 30
    
    # Verificar status
    $COMPOSE_CMD -f "$COMPOSE_FILE" ps
    
    # Aguardar aplicação ficar saudável
    log "INFO" "Aguardando aplicação ficar saudável..."
    max_attempts=30
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:${APP_PORT:-3000}/api/health > /dev/null 2>&1; then
            log "INFO" "✅ Aplicação está saudável!"
            break
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        log "WARN" "Aplicação não respondeu ao health check. Verifique os logs:"
        log "INFO" "  $COMPOSE_CMD -f $COMPOSE_FILE logs app"
    fi
    
    log "INFO" "Ambiente de desenvolvimento iniciado!"
    log "INFO" "Aplicação: http://localhost:${APP_PORT:-3000}"
    if [ "$INCLUDE_ADMIN" = "true" ]; then
        log "INFO" "PgAdmin: http://localhost:${PGADMIN_PORT:-8080}"
        log "INFO" "PgAdmin Login: ${PGADMIN_DEFAULT_EMAIL:-dev@simuladores.local} / ${PGADMIN_DEFAULT_PASSWORD:-dev123}"
    fi
    log "INFO" "PostgreSQL: localhost:${DATABASE_EXTERNAL_PORT:-5432}"
}

# Comando: prod
cmd_prod() {
    log "INFO" "Iniciando ambiente de produção..."
    
    ENVIRONMENT="prod"
    detect_environment
    load_env
    setup_profiles
    
    # Verificar se .env.production existe
    if [ ! -f ".env.production" ]; then
        log "ERROR" "Arquivo .env.production não encontrado!"
        log "INFO" "Execute: ./deploy.sh install"
        exit 1
    fi
    
    # Verificar variáveis críticas
    if [[ "$NEXTAUTH_SECRET" == *"CHANGE_THIS"* ]] || [[ "$DATABASE_PASSWORD" == *"CHANGE_THIS"* ]]; then
        log "ERROR" "Variáveis de segurança não configuradas!"
        log "ERROR" "Configure todas as variáveis em .env.production"
        exit 1
    fi
    
    # Confirmar deploy em produção
    if [ "$FORCE" != "true" ]; then
        echo -e "${YELLOW}⚠️  Confirma deploy em PRODUÇÃO? (y/N):${NC}"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            log "INFO" "Deploy cancelado"
            exit 0
        fi
    fi
    
    # Parar containers existentes
    $COMPOSE_CMD -f "$COMPOSE_FILE" down
    
    # Build das imagens
    log "INFO" "Fazendo build para produção..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" build --no-cache
    
    # Iniciar serviços
    $COMPOSE_CMD -f "$COMPOSE_FILE" $PROFILES up -d
    
    # Aguardar serviços
    log "INFO" "Aguardando serviços ficarem prontos..."
    log "INFO" "Inicializando banco de dados (pode levar até 90 segundos)..."
    sleep 45
    
    # Verificar status
    $COMPOSE_CMD -f "$COMPOSE_FILE" ps
    
    # Verificar health check
    log "INFO" "Verificando health check..."
    max_attempts=30
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:${APP_PORT:-3000}/api/health > /dev/null 2>&1; then
            log "INFO" "✅ Health check OK"
            break
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        log "ERROR" "Health check falhou! Verifique os logs:"
        log "INFO" "  $COMPOSE_CMD -f $COMPOSE_FILE logs app"
        exit 1
    fi
    
    log "INFO" "Ambiente de produção iniciado!"
    log "INFO" "Aplicação: ${NEXTAUTH_URL}"
    if [ "$INCLUDE_ADMIN" = "true" ]; then
        log "INFO" "PgAdmin: http://localhost:${PGADMIN_PORT:-8080}"
        log "INFO" "PgAdmin Login: ${PGADMIN_DEFAULT_EMAIL} / [senha configurada]"
    fi
    if [ "$INCLUDE_NGINX" = "true" ]; then
        log "INFO" "Nginx HTTP: http://localhost:${NGINX_HTTP_PORT:-80}"
        log "INFO" "Nginx HTTPS: https://localhost:${NGINX_HTTPS_PORT:-443}"
    fi
}

# Comando: backup
cmd_backup() {
    local env=${1:-dev}
    
    log "INFO" "Fazendo backup do banco ($env)..."
    
    ENVIRONMENT="$env"
    detect_environment
    load_env
    
    # Criar diretório de backup
    mkdir -p backups
    
    # Gerar nome do arquivo
    DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="backups/backup_${env}_${DATE}.sql"
    
    # Verificar se container está rodando
    if ! $CONTAINER_ENGINE ps | grep -q "$DB_CONTAINER"; then
        log "ERROR" "Container $DB_CONTAINER não está rodando!"
        exit 1
    fi
    
    # Fazer backup
    $CONTAINER_ENGINE exec "$DB_CONTAINER" pg_dump -U "${DATABASE_USER:-postgres}" "${DATABASE_NAME}" > "$BACKUP_FILE"
    
    if [ -f "$BACKUP_FILE" ]; then
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log "INFO" "Backup criado: $BACKUP_FILE ($BACKUP_SIZE)"
        
        # Limpar backups antigos (manter 7 dias)
        find backups/ -name "backup_${env}_*.sql" -mtime +7 -delete 2>/dev/null || true
    else
        log "ERROR" "Falha ao criar backup!"
        exit 1
    fi
}

# Comando: restore
cmd_restore() {
    local env=${1:-dev}
    
    if [ -z "$BACKUP_FILE_PATH" ]; then
        log "ERROR" "Arquivo de backup não especificado!"
        log "INFO" "Use: ./deploy.sh restore --file backup.sql [env]"
        exit 1
    fi
    
    if [ ! -f "$BACKUP_FILE_PATH" ]; then
        log "ERROR" "Arquivo não encontrado: $BACKUP_FILE_PATH"
        exit 1
    fi
    
    log "INFO" "Restaurando backup ($env): $BACKUP_FILE_PATH"
    
    ENVIRONMENT="$env"
    detect_environment
    load_env
    
    # Confirmar restauração
    if [ "$FORCE" != "true" ]; then
        echo -e "${YELLOW}⚠️  Isso irá SOBRESCREVER os dados atuais! Continuar? (y/N):${NC}"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            log "INFO" "Restauração cancelada"
            exit 0
        fi
    fi
    
    # Verificar se container está rodando
    if ! $CONTAINER_ENGINE ps | grep -q "$DB_CONTAINER"; then
        log "ERROR" "Container $DB_CONTAINER não está rodando!"
        exit 1
    fi
    
    # Fazer backup de segurança
    SAFETY_BACKUP="backups/safety_backup_$(date +%Y%m%d_%H%M%S).sql"
    $CONTAINER_ENGINE exec "$DB_CONTAINER" pg_dump -U "${DATABASE_USER:-postgres}" "${DATABASE_NAME}" > "$SAFETY_BACKUP"
    log "INFO" "Backup de segurança: $SAFETY_BACKUP"
    
    # Parar aplicação
    $COMPOSE_CMD -f "$COMPOSE_FILE" stop app 2>/dev/null || true
    
    # Restaurar
    $CONTAINER_ENGINE exec -i "$DB_CONTAINER" psql -U "${DATABASE_USER:-postgres}" -d "${DATABASE_NAME}" < "$BACKUP_FILE_PATH"
    
    # Reiniciar aplicação
    $COMPOSE_CMD -f "$COMPOSE_FILE" start app
    
    log "INFO" "Restauração concluída"
}

# Comando: logs
cmd_logs() {
    detect_environment
    
    log "INFO" "Visualizando logs ($ENVIRONMENT)..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" logs -f
}

# Comando: status
cmd_status() {
    log "INFO" "Status dos serviços..."
    
    echo -e "\n${BLUE}=== DESENVOLVIMENTO ===${NC}"
    if [ -f "docker-compose.dev.yml" ]; then
        ENV_FILE=".env.development"
        load_env
        $COMPOSE_CMD -f docker-compose.dev.yml ps
    fi
    
    echo -e "\n${BLUE}=== PRODUÇÃO ===${NC}"
    if [ -f "docker-compose.prod.yml" ]; then
        ENV_FILE=".env.production"
        load_env
        $COMPOSE_CMD -f docker-compose.prod.yml ps
    fi
    
    echo -e "\n${BLUE}=== HEALTH CHECKS ===${NC}"
    # Tentar health check com a porta configurada
    APP_PORT_CHECK=${APP_PORT:-3000}
    curl -f http://localhost:$APP_PORT_CHECK/api/health 2>/dev/null && echo "✅ Aplicação OK (porta $APP_PORT_CHECK)" || echo "❌ Aplicação não responde (porta $APP_PORT_CHECK)"
}

# Comando: stop
cmd_stop() {
    log "INFO" "Parando todos os serviços..."
    
    $COMPOSE_CMD -f docker-compose.dev.yml down 2>/dev/null || true
    $COMPOSE_CMD -f docker-compose.prod.yml down 2>/dev/null || true
    
    log "INFO" "Serviços parados"
}

# Comando: install-on-server (executar NO servidor)
cmd_install_on_server() {
    # Verificar se está rodando como root ou com sudo
    if [ "$(id -u)" != "0" ]; then
        log "ERROR" "Este comando precisa ser executado com sudo"
        log "INFO" "Execute: sudo ./deploy.sh install-on-server"
        exit 1
    fi
    
    # ==========================================
    # FASE 1: COLETAR TODAS AS RESPOSTAS
    # ==========================================
    echo ""
    echo -e "${BLUE}=========================================="
    echo "📋 CONFIGURAÇÃO DA INSTALAÇÃO"
    echo -e "==========================================${NC}"
    echo ""
    
    # Verificar se os arquivos de imagem existem (primeira instalação)
    LOAD_IMAGES=false
    if [ -f "simuladores-app.tar.gz" ] && [ -f "simuladores-postgres.tar.gz" ]; then
        echo -e "${YELLOW}1. Arquivos de imagem encontrados. Carregar imagens? (y/N):${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            LOAD_IMAGES=true
        fi
    fi
    
    # Perguntar sobre parar containers
    STOP_CONTAINERS=true
    if [ "$FORCE" != "true" ]; then
        echo -e "${YELLOW}2. Parar containers antigos? (Y/n):${NC}"
        read -r response
        if [[ "$response" =~ ^[Nn]$ ]]; then
            STOP_CONTAINERS=false
        fi
    fi
    
    # ==========================================
    # FASE 2: EXECUTAR OPERAÇÕES
    # ==========================================
    echo ""
    echo -e "${BLUE}=========================================="
    echo "🚀 INICIANDO INSTALAÇÃO"
    echo -e "==========================================${NC}"
    echo "Instalação iniciada em: $(date)"
    echo ""
    
    if [ "$LOAD_IMAGES" = true ]; then
        log "INFO" "[1/5] Carregando imagens Docker (2-3 minutos)..."
        echo ""
        echo "   [1/2] Carregando aplicação..."
        gunzip -c simuladores-app.tar.gz | docker load
        echo "   ✅ Aplicação carregada"
        echo ""
        echo "   [2/2] Carregando PostgreSQL..."
        gunzip -c simuladores-postgres.tar.gz | docker load
        echo "   ✅ PostgreSQL carregado"
        
        echo ""
        echo "🧹 Limpando arquivos temporários..."
        rm -f simuladores-app.tar.gz simuladores-postgres.tar.gz
    else
        log "INFO" "[1/5] Verificando imagens Docker já carregadas..."
        
        # Verificar se as imagens existem no Docker
        if ! docker images | grep -q "simuladores-app.*prod"; then
            log "ERROR" "Imagem simuladores-app:prod não encontrada!"
            log "INFO" "Execute o deploy-remote primeiro para enviar as imagens"
            exit 1
        fi
        
        if ! docker images | grep -q "simuladores-postgres.*prod"; then
            log "ERROR" "Imagem simuladores-postgres:prod não encontrada!"
            log "INFO" "Execute o deploy-remote primeiro para enviar as imagens"
            exit 1
        fi
        
        echo "   ✅ Imagens encontradas no Docker"
    fi
    
    echo ""
    if [ "$STOP_CONTAINERS" = true ]; then
        log "INFO" "[2/5] Parando containers antigos..."
        docker compose -f docker-compose.server.yml down 2>/dev/null || echo "   Nenhum container para parar"
    else
        log "INFO" "[2/5] Mantendo containers em execução"
    fi
    
    echo ""
    log "INFO" "[3/5] Criando volumes e rede..."
    docker volume create simuladores_postgres_prod_data 2>/dev/null || echo "   Volume já existe"
    
    # Remover rede antiga se existir com labels incorretos
    docker network rm simuladores_network_prod 2>/dev/null || true
    docker network create simuladores_network_prod 2>/dev/null || echo "   Rede já existe"
    
    echo ""
    log "INFO" "[4/5] Iniciando containers..."
    echo "   O sistema irá automaticamente:"
    echo "   - Criar o schema do banco de dados"
    echo "   - Popular dados iniciais (usuários, produtos, etc.)"
    echo "   - Iniciar a aplicação"
    
    # Criar link simbólico .env -> .env.production
    log "INFO" "Criando link simbólico .env -> .env.production..."
    ln -sf .env.production .env
    echo "   ✅ Link criado"
    
    # Carregar variáveis de ambiente
    if [ -f ".env.production" ]; then
        set -a
        source .env.production
        set +a
        echo "   ✅ Variáveis de ambiente carregadas"
    else
        echo "   ❌ Arquivo .env.production não encontrado!"
        exit 1
    fi
    
    # Iniciar todos os containers
    docker compose -f docker-compose.server.yml up -d
    
    echo ""
    log "INFO" "[5/5] Aguardando inicialização (60 segundos)..."
    echo "   Durante este tempo o sistema está:"
    echo "   - Aguardando PostgreSQL ficar pronto"
    echo "   - Executando migrações do banco (prisma db push)"
    echo "   - Criando usuários de teste (prisma db seed)"
    echo "   - Iniciando a aplicação Next.js"
    
    for i in {1..6}; do
        echo "   $(($i * 10))s..."
        sleep 10
    done
    
    echo ""
    echo -e "${BLUE}=========================================="
    echo "✅ Status dos Containers"
    echo -e "==========================================${NC}"
    docker ps --filter "name=simuladores"
    
    echo ""
    echo -e "${BLUE}=========================================="
    echo "🏥 Health Check"
    echo -e "==========================================${NC}"
    if curl -f -s http://localhost:3009/api/health > /dev/null 2>&1; then
        echo "✅ Aplicação está saudável!"
        echo "🌐 Acesse: http://$(hostname -I | awk '{print $1}'):3009"
    else
        echo "⚠️  Aplicação ainda não está respondendo"
        echo "   Aguarde mais alguns minutos e verifique:"
        echo "   curl http://localhost:3009/api/health"
    fi
    
    echo ""
    echo -e "${BLUE}=========================================="
    echo "🌐 CONFIGURANDO ACESSO HTTP"
    echo -e "==========================================${NC}"
    
    # Ler porta configurada
    APP_PORT=$(grep "^APP_PORT=" .env.production | cut -d'=' -f2)
    APP_PORT=${APP_PORT:-3009}
    
    echo "📊 Configuração de Rede:"
    echo "   Porta da aplicação: $APP_PORT"
    echo "   Acesso direto: http://$(hostname -I | awk '{print $1}'):$APP_PORT"
    echo ""
    
    # Verificar se firewall está ativo
    if command -v ufw &> /dev/null && ufw status | grep -q "Status: active"; then
        echo "🔥 Configurando firewall (UFW)..."
        ufw allow $APP_PORT/tcp comment "Simulador DRE" 2>/dev/null || true
        echo "   ✅ Porta $APP_PORT liberada no firewall"
    elif command -v firewall-cmd &> /dev/null; then
        echo "🔥 Configurando firewall (firewalld)..."
        firewall-cmd --permanent --add-port=$APP_PORT/tcp 2>/dev/null || true
        firewall-cmd --reload 2>/dev/null || true
        echo "   ✅ Porta $APP_PORT liberada no firewall"
    else
        echo "⚠️  Firewall não detectado ou inativo"
        echo "   Se necessário, libere a porta $APP_PORT manualmente"
    fi
    
    echo ""
    echo -e "${BLUE}=========================================="
    echo "✅ INSTALAÇÃO CONCLUÍDA!"
    echo -e "==========================================${NC}"
    echo ""
    echo "🌐 URLs de Acesso:"
    echo "   HTTP:  http://$(hostname -I | awk '{print $1}'):$APP_PORT"
    echo "   HTTP:  http://simulador-dre.doubletelecom.com.br:$APP_PORT"
    echo ""
    echo "👤 Usuários criados automaticamente:"
    echo "   Admin:    admin@sistema.com / admin123"
    echo "   Diretor:  diretor@sistema.com / diretor123"
    echo "   Gerente:  gerente@sistema.com / gerente123"
    echo "   Vendedor: vendedor@sistema.com / vendedor123"
    echo "   Usuário:  usuario@sistema.com / usuario123"
    echo ""
    echo "⚠️  IMPORTANTE:"
    echo "   1. Altere estas senhas em produção!"
    echo "   2. Configure o DNS para apontar para este servidor"
    echo "   3. Se precisar de HTTPS, configure um proxy reverso (Nginx/Apache)"
    echo "      ou use um serviço como Cloudflare"
    echo ""
    echo "📝 Comandos úteis:"
    echo "   Ver logs:    docker logs -f simuladores_app_prod"
    echo "   Parar:       docker compose -f docker-compose.server.yml down"
    echo "   Reiniciar:   docker compose -f docker-compose.server.yml restart"
    echo "   Status:      docker ps"
    echo "   Health:      curl http://localhost:$APP_PORT/api/health"
    echo ""
}

# Comando: deploy-remote
cmd_deploy_remote() {
    local server=$1
    local method=$2
    
    # Extrair usuário do servidor
    local remote_user=$(echo "$server" | cut -d@ -f1)
    local remote_host=$(echo "$server" | cut -d@ -f2)
    
    # Definir diretório remoto baseado no usuário
    if [ "$remote_user" = "root" ]; then
        local remote_dir="/root/simuladores"
        local use_sudo=""
    else
        local remote_dir="/home/$remote_user/simuladores"
        local use_sudo="sudo"
    fi
    
    if [ -z "$server" ] || [ -z "$method" ]; then
        log "ERROR" "Uso: ./deploy.sh deploy-remote [USUARIO@SERVIDOR] [image|source]"
        log "INFO" "Exemplos:"
        log "INFO" "  ./deploy.sh deploy-remote root@192.168.1.100 image"
        log "INFO" "  ./deploy.sh deploy-remote usuario@servidor.com source"
        exit 1
    fi
    
    log "INFO" "Deploy remoto para: $server"
    log "INFO" "Usuário: $remote_user"
    log "INFO" "Diretório: $remote_dir"
    log "INFO" "Método: $method"
    if [ -n "$use_sudo" ]; then
        log "INFO" "Usando sudo para comandos privilegiados"
    fi
    
    # Verificar .env.production
    if [ ! -f ".env.production" ]; then
        log "ERROR" ".env.production não encontrado!"
        log "INFO" "Crie o arquivo com as configurações de produção"
        exit 1
    fi
    
    # Verificar se senhas foram alteradas
    if grep -q "CHANGE_THIS" .env.production; then
        log "ERROR" "Variáveis não configuradas em .env.production!"
        log "ERROR" "Altere todas as senhas e secrets antes de fazer deploy"
        exit 1
    fi
    
    # Verificar se sshpass está instalado
    if ! command -v sshpass &> /dev/null; then
        log "ERROR" "sshpass não está instalado!"
        log "INFO" "Instale com: sudo apt install sshpass"
        exit 1
    fi
    
    # ==========================================
    # FASE 1: COLETAR TODAS AS RESPOSTAS
    # ==========================================
    echo ""
    echo -e "${BLUE}=========================================="
    echo "📋 CONFIGURAÇÃO DO DEPLOY"
    echo -e "==========================================${NC}"
    echo ""
    
    # Pedir senha
    echo -e "${YELLOW}Digite a senha do servidor $server:${NC}"
    read -s SERVER_PASSWORD
    echo ""
    
    if [ -z "$SERVER_PASSWORD" ]; then
        log "ERROR" "Senha não pode ser vazia!"
        exit 1
    fi
    
    # Testar senha
    log "INFO" "Testando conexão com $server (timeout: 10s)..."
    
    # Tentar conexão
    if sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$server" 'echo OK' > /dev/null 2>&1; then
        log "INFO" "✅ Conexão estabelecida com sucesso!"
    else
        log "ERROR" "Falha ao conectar no servidor!"
        log "ERROR" "Verifique: senha, conectividade, SSH habilitado"
        exit 1
    fi
    
    # ==========================================
    # CONFIGURAR PORTAS
    # ==========================================
    echo ""
    echo -e "${BLUE}=========================================="
    echo "🔧 CONFIGURAÇÃO DE PORTAS"
    echo -e "==========================================${NC}"
    echo ""
    
    # Ler portas atuais do .env.production
    CURRENT_APP_PORT=$(grep "^APP_PORT=" .env.production | cut -d'=' -f2)
    CURRENT_DB_PORT=$(grep "^DATABASE_EXTERNAL_PORT=" .env.production | cut -d'=' -f2)
    
    echo "📊 Portas configuradas em .env.production:"
    echo "   Aplicação: ${CURRENT_APP_PORT:-3009}"
    echo "   PostgreSQL: ${CURRENT_DB_PORT:-5433}"
    echo ""
    
    # Verificar portas em uso no servidor remoto
    log "INFO" "Verificando portas em uso no servidor..."
    REMOTE_PORTS=$(sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$server" 'ss -tuln 2>/dev/null || netstat -tuln 2>/dev/null' | grep LISTEN || true)
    
    if echo "$REMOTE_PORTS" | grep -q ":3000 "; then
        echo "   ⚠️  Porta 3000 está em uso no servidor"
    fi
    if echo "$REMOTE_PORTS" | grep -q ":5432 "; then
        echo "   ⚠️  Porta 5432 está em uso no servidor"
    fi
    if [ -n "$CURRENT_APP_PORT" ] && echo "$REMOTE_PORTS" | grep -q ":$CURRENT_APP_PORT "; then
        echo "   ⚠️  Porta $CURRENT_APP_PORT está em uso no servidor"
    fi
    
    echo ""
    read -p "Deseja alterar as portas? (y/N): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Perguntar nova porta da aplicação
        while true; do
            read -p "🌐 Nova porta da aplicação [${CURRENT_APP_PORT:-3009}]: " NEW_APP_PORT
            NEW_APP_PORT=${NEW_APP_PORT:-${CURRENT_APP_PORT:-3009}}
            
            if ! [[ "$NEW_APP_PORT" =~ ^[0-9]+$ ]] || [ "$NEW_APP_PORT" -lt 1024 ] || [ "$NEW_APP_PORT" -gt 65535 ]; then
                log "ERROR" "Porta inválida! Use um número entre 1024 e 65535"
                continue
            fi
            
            break
        done
        
        # Perguntar nova porta do PostgreSQL
        while true; do
            read -p "🗄️  Nova porta do PostgreSQL [${CURRENT_DB_PORT:-5433}]: " NEW_DB_PORT
            NEW_DB_PORT=${NEW_DB_PORT:-${CURRENT_DB_PORT:-5433}}
            
            if ! [[ "$NEW_DB_PORT" =~ ^[0-9]+$ ]] || [ "$NEW_DB_PORT" -lt 1024 ] || [ "$NEW_DB_PORT" -gt 65535 ]; then
                log "ERROR" "Porta inválida! Use um número entre 1024 e 65535"
                continue
            fi
            
            break
        done
        
        # Atualizar .env.production
        log "INFO" "Atualizando .env.production..."
        sed -i "s/^APP_PORT=.*/APP_PORT=$NEW_APP_PORT/" .env.production
        sed -i "s/^DATABASE_EXTERNAL_PORT=.*/DATABASE_EXTERNAL_PORT=$NEW_DB_PORT/" .env.production
        sed -i "s/^PORT=.*/PORT=$NEW_APP_PORT/" .env.production
        
        echo "   ✅ APP_PORT=$NEW_APP_PORT"
        echo "   ✅ DATABASE_EXTERNAL_PORT=$NEW_DB_PORT"
    else
        log "INFO" "Mantendo portas atuais"
    fi
    
    # ==========================================
    # CONTINUAR COM DEPLOY
    # ==========================================
    echo ""
    if false; then
        log "ERROR" "Falha ao conectar no servidor!"
        log "INFO" "Possíveis causas:"
        log "INFO" "  1. Senha incorreta"
        log "INFO" "  2. Servidor não acessível"
        log "INFO" "  3. Firewall bloqueando SSH"
        echo ""
        log "INFO" "Teste manual: ssh $server"
        exit 1
    fi
    
    # MÉTODO: IMAGENS DOCKER
    if [ "$method" = "image" ]; then
        echo ""
        echo -e "${BLUE}Método: Enviar imagens Docker${NC}"
        echo ""
        
        # Perguntar sobre build
        DO_BUILD=true
        if [ "$FORCE" != "true" ]; then
            echo -e "${YELLOW}1. Fazer build das imagens? (Y/n):${NC}"
            read -r response
            if [[ "$response" =~ ^[Nn]$ ]]; then
                DO_BUILD=false
            fi
        fi
        
        # Perguntar sobre exportar
        DO_EXPORT=true
        if [ "$FORCE" != "true" ]; then
            echo -e "${YELLOW}2. Exportar e comprimir imagens? (Y/n):${NC}"
            read -r response
            if [[ "$response" =~ ^[Nn]$ ]]; then
                DO_EXPORT=false
            fi
        fi
        
        # Confirmar deploy
        CONFIRM_DEPLOY=true
        if [ "$FORCE" != "true" ]; then
            echo ""
            echo -e "${YELLOW}⚠️  Confirma deploy em PRODUÇÃO para $server? (y/N):${NC}"
            read -r response
            if [[ ! "$response" =~ ^[Yy]$ ]]; then
                log "INFO" "Deploy cancelado"
                exit 0
            fi
        fi
        
        # ==========================================
        # FASE 2: EXECUTAR OPERAÇÕES
        # ==========================================
        echo ""
        echo -e "${BLUE}=========================================="
        echo "🚀 INICIANDO DEPLOY"
        echo -e "==========================================${NC}"
        echo ""
        
        if [ "$DO_BUILD" = true ]; then
            log "INFO" "[1/5] Fazendo build das imagens de PRODUÇÃO..."
            ENVIRONMENT="prod"
            detect_environment
            load_env
            
            # Build das imagens de produção
            $COMPOSE_CMD -f docker-compose.prod.yml build --no-cache
            log "INFO" "✅ Build concluído"
        else
            log "INFO" "[1/5] Pulando build - usando imagens existentes"
        fi
        
        echo ""
        if [ "$DO_EXPORT" = true ]; then
            log "INFO" "[2/5] Exportando e comprimindo imagens..."
            
            # Remover arquivos antigos se existirem
            rm -f simuladores-app.tar simuladores-app.tar.gz simuladores-postgres.tar simuladores-postgres.tar.gz
            
            # Exportar e comprimir em paralelo
            $CONTAINER_ENGINE save simuladores-app:prod | gzip > simuladores-app.tar.gz &
            APP_PID=$!
            
            $CONTAINER_ENGINE save simuladores-postgres:prod | gzip > simuladores-postgres.tar.gz &
            DB_PID=$!
            
            # Aguardar conclusão
            wait $APP_PID
            wait $DB_PID
            
            log "INFO" "✅ Imagens exportadas:"
            ls -lh simuladores-*.tar.gz
            log "INFO" "Tamanho total: ~$(du -sh simuladores-*.tar.gz | tail -1 | awk '{print $1}')"
        else
            log "INFO" "[2/5] Pulando exportação - usando arquivos existentes"
        fi
        
        echo ""
        # Verificar se arquivos existem
        if [ ! -f "simuladores-app.tar.gz" ] || [ ! -f "simuladores-postgres.tar.gz" ]; then
            log "ERROR" "Arquivos de imagem não encontrados!"
            log "INFO" "Execute o build e exportação primeiro"
            exit 1
        fi
        
        # Verificar espaço no servidor
        log "INFO" "[3/5] Verificando espaço disponível no servidor..."
        REMOTE_SPACE=$(sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $server "df -BG $remote_dir 2>/dev/null | tail -1 | awk '{print \$4}' | sed 's/G//'")
        
        if [ -n "$REMOTE_SPACE" ]; then
            log "INFO" "Espaço disponível: ${REMOTE_SPACE}GB"
            
            if [ "$REMOTE_SPACE" -lt 10 ]; then
                log "WARN" "Pouco espaço disponível no servidor: ${REMOTE_SPACE}GB"
                log "INFO" "Limpando Docker no servidor..."
                
                # Limpar Docker no servidor
                sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $server "\
                    if [ \"\$(id -u)\" != \"0\" ]; then \
                        sudo docker system prune -af --volumes; \
                    else \
                        docker system prune -af --volumes; \
                    fi" || log "WARN" "Não foi possível limpar Docker automaticamente"
                
                # Verificar espaço novamente
                REMOTE_SPACE=$(sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $server "df -BG $remote_dir 2>/dev/null | tail -1 | awk '{print \$4}' | sed 's/G//'")
                log "INFO" "Espaço após limpeza: ${REMOTE_SPACE}GB"
                
                if [ "$REMOTE_SPACE" -lt 5 ]; then
                    log "ERROR" "Espaço insuficiente mesmo após limpeza!"
                    log "INFO" "Libere espaço manualmente no servidor"
                    exit 1
                fi
            fi
        fi
        
        # Criar script de instalação remota
        log "INFO" "Criando script de instalação..."
        cat > install-remote.sh << 'EOFSCRIPT'
#!/bin/bash
set -e

# Ler senha do stdin
read -r SUDO_PASSWORD

# Log file
LOG_FILE="install.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2>&1

echo "==================================="
echo "Instalação Simuladores - $(date)"
echo "==================================="

# Função para executar com sudo
run_sudo() {
    if [ "$(id -u)" = "0" ]; then
        "$@"
    else
        echo "$SUDO_PASSWORD" | sudo -S "$@"
    fi
}

echo "🚀 Instalando Simuladores no servidor..."
cd "$(dirname "$0")"

echo "📦 Descomprimindo e carregando imagens Docker..."
echo "   Isso pode levar alguns minutos..."

# Descomprimir e carregar em pipeline (economiza espaço)
echo "   Carregando imagem da aplicação..."
gunzip -c simuladores-app.tar.gz | run_sudo docker load

echo "   Carregando imagem do PostgreSQL..."
gunzip -c simuladores-postgres.tar.gz | run_sudo docker load

# Remover arquivos comprimidos para economizar espaço
rm -f simuladores-app.tar.gz simuladores-postgres.tar.gz

# Verificar imagens carregadas
run_sudo docker images | grep simuladores || true

echo "🛑 Parando containers antigos..."
run_sudo docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

echo "� Criando voclumes e rede..."
run_sudo docker volume create simuladores_postgres_prod_data 2>/dev/null || true
run_sudo docker network create simuladores_network_prod 2>/dev/null || true

echo "🚀 Iniciando containers..."
# Carregar variáveis do .env.production e iniciar
set -a
source .env.production
set +a
run_sudo docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Aguardando inicialização (90 segundos)..."
sleep 90

run_sudo docker ps | grep simuladores || true

echo "🏥 Verificando health check..."
curl -f http://localhost:3009/api/health || echo "⚠️  Health check falhou"

echo "✅ Deploy concluído!"
echo "📝 Log salvo em: $LOG_FILE"
EOFSCRIPT
        
        chmod +x install-remote.sh
        
        echo ""
        # Enviar arquivos
        log "INFO" "[4/5] Enviando arquivos para o servidor..."
        log "INFO" "Isso pode levar vários minutos dependendo da conexão..."
        
        sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $server "mkdir -p $remote_dir"
        
        # Verificar se rsync está disponível (mais eficiente)
        if command -v rsync &> /dev/null; then
            log "INFO" "Usando rsync para transferência mais eficiente..."
            
            export RSYNC_PASSWORD="$SERVER_PASSWORD"
            
            log "INFO" "Enviando imagem da aplicação (maior arquivo)..."
            sshpass -p "$SERVER_PASSWORD" rsync -avz --progress -e "ssh -o StrictHostKeyChecking=no" \
                simuladores-app.tar.gz $server:$remote_dir/ || {
                log "ERROR" "Falha ao enviar simuladores-app.tar.gz"
                log "INFO" "Possíveis causas:"
                log "INFO" "  - Espaço insuficiente no servidor"
                log "INFO" "  - Conexão interrompida"
                log "INFO" "  - Timeout de rede"
                exit 1
            }
            
            log "INFO" "Enviando imagem do PostgreSQL..."
            sshpass -p "$SERVER_PASSWORD" rsync -avz --progress -e "ssh -o StrictHostKeyChecking=no" \
                simuladores-postgres.tar.gz $server:$remote_dir/
            
            log "INFO" "Enviando arquivos de configuração..."
            sshpass -p "$SERVER_PASSWORD" rsync -avz -e "ssh -o StrictHostKeyChecking=no" \
                .env.production docker-compose.prod.yml docker-compose.server.yml deploy.sh nginx/ $server:$remote_dir/
        else
            log "INFO" "Usando scp para transferência..."
            log "INFO" "Dica: Instale rsync para transferências mais rápidas e com retomada"
            
            # Enviar com compressão
            log "INFO" "Enviando imagem da aplicação (maior arquivo)..."
            sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no -o Compression=yes \
                simuladores-app.tar.gz $server:$remote_dir/ || {
                log "ERROR" "Falha ao enviar simuladores-app.tar.gz"
                log "INFO" "Possíveis causas:"
                log "INFO" "  - Espaço insuficiente no servidor"
                log "INFO" "  - Conexão interrompida"
                log "INFO" "  - Timeout de rede"
                exit 1
            }
            
            log "INFO" "Enviando imagem do PostgreSQL..."
            sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no -o Compression=yes \
                simuladores-postgres.tar.gz $server:$remote_dir/
            
            log "INFO" "Enviando arquivos de configuração..."
            sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no \
                .env.production docker-compose.prod.yml docker-compose.server.yml deploy.sh $server:$remote_dir/
            sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no -r \
                nginx/ $server:$remote_dir/
        fi
        
        echo ""
        log "INFO" "[5/5] ✅ Arquivos enviados com sucesso!"
        echo ""
        echo -e "${BLUE}=========================================="
        echo "✅ DEPLOY CONCLUÍDO"
        echo -e "==========================================${NC}"
        echo ""
        log "INFO" "PRÓXIMO PASSO: Execute no servidor"
        echo ""
        log "INFO" "1. Conecte no servidor:"
        log "INFO" "   ssh $server"
        log "INFO" ""
        log "INFO" "2. Execute o script de instalação:"
        log "INFO" "   cd $remote_dir"
        log "INFO" "   sudo ./deploy.sh install-on-server"
        log "INFO" ""
        log "INFO" "3. Aguarde a instalação (2-3 minutos)"
        log "INFO" ""
        log "INFO" "4. Verifique o status:"
        log "INFO" "   sudo docker ps"
        log "INFO" "   curl http://localhost:3009/api/health"
        log "INFO" ""
        log "INFO" "=========================================="
        
        # Verificar health check
        log "INFO" "Verificando health check..."
        sleep 5
        
        REMOTE_HOST=$(echo $server | cut -d@ -f2)
        if curl -f -s http://$REMOTE_HOST:3009/api/health > /dev/null 2>&1; then
            log "INFO" "✅ Health check OK!"
        else
            log "WARN" "Health check não respondeu ainda"
            log "INFO" "Aguarde alguns minutos e verifique:"
            log "INFO" "  curl http://$REMOTE_HOST:3000/api/health"
        fi
        
        # Limpar
        log "INFO" "Limpando arquivos temporários..."
        rm -f simuladores-app.tar.gz simuladores-postgres.tar.gz install-remote.sh
        
        log "INFO" "✅ Deploy concluído com sucesso!"
        log "INFO" "Acesse: http://$REMOTE_HOST:3000"
        
    # MÉTODO: CÓDIGO FONTE
    elif [ "$method" = "source" ]; then
        log "INFO" "Método: Enviar código fonte"
        
        # Aguardar um momento para garantir que nenhum arquivo está sendo modificado
        log "INFO" "Preparando arquivos..."
        sleep 2
        
        # Remover tar antigo se existir
        rm -f simuladores.tar.gz
        
        # Compactar
        log "INFO" "Compactando código fonte..."
        
        # Usar método robusto: criar tar em /tmp primeiro
        TEMP_TAR="/tmp/simuladores_$(date +%s).tar.gz"
        
        tar -czf "$TEMP_TAR" \
            --exclude=node_modules \
            --exclude=.next \
            --exclude=.git \
            --exclude=.kiro \
            --exclude=.vscode \
            --exclude=.idea \
            --exclude=backups \
            --exclude=logs \
            --exclude='*.tar' \
            --exclude='*.tar.gz' \
            --exclude='*.log' \
            --exclude='.env.local' \
            --exclude='.env.development.local' \
            --exclude='.env.production.local' \
            --exclude='install-remote.sh' \
            --warning=no-file-changed \
            --warning=no-file-removed \
            . 2>&1 | grep -v "arquivo alterado" | grep -v "file changed" | grep -v "file removed" || true
        
        # Mover para diretório atual
        if [ -f "$TEMP_TAR" ]; then
            mv "$TEMP_TAR" simuladores.tar.gz
            log "INFO" "Arquivo criado com sucesso"
        else
            log "ERROR" "Falha ao criar arquivo tar.gz"
            exit 1
        fi
        
        # Verificar se arquivo foi criado
        if [ ! -f "simuladores.tar.gz" ]; then
            log "ERROR" "Falha ao criar arquivo tar.gz"
            exit 1
        fi
        
        log "INFO" "Arquivo criado:"
        ls -lh simuladores.tar.gz
        
        # Criar script de instalação
        cat > install-remote.sh << EOFSCRIPT
#!/bin/bash
set -e

# Log file
LOG_FILE="$remote_dir/install.log"
exec 1> >(tee -a "\$LOG_FILE")
exec 2>&1

echo "==================================="
echo "Instalação Simuladores - \$(date)"
echo "==================================="

# Detectar se precisa usar sudo
USE_SUDO=""
if [ "\$(id -u)" != "0" ]; then
    USE_SUDO="sudo"
    echo "🔐 Usando sudo para comandos privilegiados"
fi

echo "🚀 Instalando Simuladores no servidor..."
mkdir -p $remote_dir
cd $remote_dir

echo "📦 Extraindo arquivos..."
tar -xzf simuladores.tar.gz || {
    echo "❌ Erro ao extrair arquivos"
    exit 1
}

chmod +x deploy.sh

echo "🔨 Fazendo build (pode levar 5-10 minutos)..."
if \$USE_SUDO ./deploy.sh build; then
    echo "✅ Build concluído"
else
    echo "❌ Erro no build"
    exit 1
fi

echo "🚀 Iniciando produção..."
if \$USE_SUDO ./deploy.sh prod --force; then
    echo "✅ Produção iniciada"
else
    echo "❌ Erro ao iniciar produção"
    exit 1
fi

echo "✅ Deploy concluído com sucesso!"
echo "📝 Log salvo em: \$LOG_FILE"
EOFSCRIPT
        
        chmod +x install-remote.sh
        
        # Enviar
        log "INFO" "Enviando arquivos para o servidor..."
        sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $server "mkdir -p $remote_dir"
        
        # Usar rsync se disponível, senão scp
        if command -v rsync &> /dev/null; then
            log "INFO" "Usando rsync..."
            sshpass -p "$SERVER_PASSWORD" rsync -avz --progress -e "ssh -o StrictHostKeyChecking=no" \
                simuladores.tar.gz install-remote.sh $server:$remote_dir/
        else
            log "INFO" "Usando scp..."
            sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no -o Compression=yes \
                simuladores.tar.gz install-remote.sh $server:$remote_dir/
        fi
        
        # Executar
        log "INFO" "Executando instalação no servidor..."
        log "INFO" "Isso pode levar 10-15 minutos (build + inicialização)..."
        
        # Executar passando a senha para o sudo via stdin
        if sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $server "cd $remote_dir && chmod +x install-remote.sh && echo '$SERVER_PASSWORD' | ./install-remote.sh"; then
            log "INFO" "✅ Instalação concluída com sucesso!"
        else
            log "ERROR" "Falha na instalação remota"
            log "INFO" "Verifique os logs no servidor:"
            log "INFO" "  ssh $server 'cd $remote_dir && cat install.log'"
            exit 1
        fi
        
        # Verificar health check
        log "INFO" "Verificando health check..."
        sleep 5
        
        REMOTE_HOST=$(echo $server | cut -d@ -f2)
        if curl -f -s http://$REMOTE_HOST:3000/api/health > /dev/null 2>&1; then
            log "INFO" "✅ Health check OK!"
        else
            log "WARN" "Health check não respondeu ainda"
            log "INFO" "Aguarde alguns minutos e verifique:"
            log "INFO" "  curl http://$REMOTE_HOST:3000/api/health"
        fi
        
        # Limpar
        log "INFO" "Limpando arquivos temporários..."
        rm -f simuladores.tar.gz install-remote.sh
        
        log "INFO" "✅ Deploy concluído com sucesso!"
        log "INFO" "Acesse: http://$REMOTE_HOST:3000"
        
    else
        log "ERROR" "Método inválido: $method"
        log "INFO" "Use: image ou source"
        exit 1
    fi
    
    # Informações finais
    echo ""
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${BLUE}PRÓXIMOS PASSOS${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo ""
    echo -e "1. Verificar logs:"
    echo -e "   ${YELLOW}ssh $server 'docker logs -f simuladores_app_prod'${NC}"
    echo ""
    echo -e "2. Verificar status:"
    echo -e "   ${YELLOW}ssh $server 'docker ps'${NC}"
    echo ""
    echo -e "3. Fazer backup:"
    echo -e "   ${YELLOW}ssh $server 'cd $remote_dir && ./deploy.sh backup prod'${NC}"
    echo ""
}

# Comando: cleanup-remote
cmd_cleanup_remote() {
    local server=$1
    local cleanup_type=${2:-soft}
    
    if [ -z "$server" ]; then
        log "ERROR" "Uso: ./deploy.sh cleanup-remote [USUARIO@SERVIDOR] [--soft|--hard|--images]"
        log "INFO" "Exemplos:"
        log "INFO" "  ./deploy.sh cleanup-remote double@10.10.50.246 --soft"
        log "INFO" "  ./deploy.sh cleanup-remote double@10.10.50.246 --images"
        log "INFO" "  ./deploy.sh cleanup-remote double@10.10.50.246 --hard"
        exit 1
    fi
    
    # Extrair usuário do servidor
    local remote_user=$(echo "$server" | cut -d@ -f1)
    local remote_host=$(echo "$server" | cut -d@ -f2)
    
    # Definir diretório remoto baseado no usuário
    if [ "$remote_user" = "root" ]; then
        local remote_dir="/root/simuladores"
    else
        local remote_dir="/home/$remote_user/simuladores"
    fi
    
    log "INFO" "Limpeza remota em: $server"
    log "INFO" "Tipo: $cleanup_type"
    
    # Verificar se sshpass está instalado
    if ! command -v sshpass &> /dev/null; then
        log "ERROR" "sshpass não está instalado!"
        log "INFO" "Instale com: sudo apt install sshpass"
        exit 1
    fi
    
    # Pedir senha
    echo ""
    echo -e "${YELLOW}Digite a senha do servidor $server:${NC}"
    
    # Desabilitar echo e ler senha (com trap para garantir restauração)
    trap 'stty echo' EXIT INT TERM
    stty -echo
    read -r SERVER_PASSWORD
    stty echo
    trap - EXIT INT TERM
    echo ""
    
    if [ -z "$SERVER_PASSWORD" ]; then
        log "ERROR" "Senha não pode ser vazia!"
        exit 1
    fi
    
    # Testar conexão
    log "INFO" "Testando conexão..."
    if ! sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$server" 'echo OK' > /dev/null 2>&1; then
        log "ERROR" "Falha ao conectar no servidor!"
        exit 1
    fi
    
    log "INFO" "✅ Conexão estabelecida"
    
    # Confirmar limpeza
    if [ "$FORCE" != "true" ]; then
        echo ""
        if [ "$cleanup_type" = "--hard" ]; then
            echo -e "${RED}⚠️  ATENÇÃO: Limpeza COMPLETA irá APAGAR TODOS OS DADOS!${NC}"
        else
            echo -e "${YELLOW}⚠️  Confirma limpeza no servidor $server?${NC}"
        fi
        echo -e "${YELLOW}Tipo: $cleanup_type${NC}"
        read -p "Continuar? (y/N): " -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            log "INFO" "Operação cancelada"
            exit 0
        fi
    fi
    
    echo ""
    echo -e "${BLUE}=========================================="
    echo "🧹 EXECUTANDO LIMPEZA REMOTA"
    echo -e "==========================================${NC}"
    echo ""
    
    # Enviar script de limpeza
    log "INFO" "[1/2] Enviando script de limpeza..."
    sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no cleanup-server.sh $server:$remote_dir/
    
    # Executar limpeza
    log "INFO" "[2/2] Executando limpeza no servidor..."
    
    # Criar comando de limpeza que passa a senha para o sudo
    CLEANUP_CMD="cd $remote_dir && chmod +x cleanup-server.sh && echo '$SERVER_PASSWORD' | sudo -S bash -c 'echo y | ./cleanup-server.sh $cleanup_type'"
    
    # Executar
    if sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $server "$CLEANUP_CMD"; then
        echo ""
        echo -e "${GREEN}=========================================="
        echo "✅ LIMPEZA CONCLUÍDA!"
        echo -e "==========================================${NC}"
        echo ""
        
        if [ "$cleanup_type" = "--hard" ]; then
            log "WARN" "Volumes foram removidos - dados perdidos!"
        else
            log "INFO" "Volumes preservados - dados intactos!"
        fi
        
        echo ""
        log "INFO" "Próximos passos:"
        log "INFO" "1. Fazer novo deploy:"
        log "INFO" "   ./deploy.sh deploy-remote $server image"
        log "INFO" ""
        log "INFO" "2. Ou instalar no servidor:"
        log "INFO" "   ssh $server"
        log "INFO" "   cd $remote_dir"
        log "INFO" "   sudo ./deploy.sh install-on-server"
    else
        log "ERROR" "Falha na limpeza remota"
        exit 1
    fi
}

# Processar argumentos
COMMAND=""
ENVIRONMENT="dev"
INCLUDE_ADMIN="false"
INCLUDE_NGINX="false"
NO_CACHE="false"
FORCE="false"
BACKUP_FILE_PATH=""
DEPLOY_SERVER=""
DEPLOY_METHOD=""

while [[ $# -gt 0 ]]; do
    case $1 in
        clean|install|build|dev|prod|backup|restore|logs|status|stop|install-on-server)
            COMMAND="$1"
            shift
            ;;
        deploy-remote)
            COMMAND="$1"
            shift
            # Capturar servidor e método
            if [[ $# -gt 0 ]] && [[ ! "$1" =~ ^-- ]]; then
                DEPLOY_SERVER="$1"
                shift
            fi
            if [[ $# -gt 0 ]] && [[ ! "$1" =~ ^-- ]]; then
                DEPLOY_METHOD="$1"
                shift
            fi
            ;;
        cleanup-remote)
            COMMAND="$1"
            shift
            # Capturar servidor e tipo de limpeza
            if [[ $# -gt 0 ]] && [[ ! "$1" =~ ^-- ]]; then
                DEPLOY_SERVER="$1"
                shift
            fi
            if [[ $# -gt 0 ]] && [[ "$1" =~ ^-- ]]; then
                CLEANUP_TYPE="$1"
                shift
            fi
            ;;
        --admin)
            INCLUDE_ADMIN="true"
            shift
            ;;
        --nginx)
            INCLUDE_NGINX="true"
            shift
            ;;
        --no-cache)
            NO_CACHE="true"
            shift
            ;;
        --force)
            FORCE="true"
            shift
            ;;
        --file)
            BACKUP_FILE_PATH="$2"
            shift 2
            ;;
        dev|prod)
            if [ "$COMMAND" = "backup" ] || [ "$COMMAND" = "restore" ]; then
                ENVIRONMENT="$1"
            fi
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            log "ERROR" "Argumento desconhecido: $1"
            show_help
            exit 1
            ;;
    esac
done

# Verificar se comando foi especificado
if [ -z "$COMMAND" ]; then
    log "ERROR" "Nenhum comando especificado!"
    show_help
    exit 1
fi

# Verificar dependências (exceto para help)
check_dependencies

# Executar comando
case $COMMAND in
    clean)          cmd_clean ;;
    clean-server)   cmd_clean_server "${2:---soft}" ;;
    install)        cmd_install ;;
    build)          cmd_build ;;
    dev)            cmd_dev ;;
    prod)           cmd_prod ;;
    deploy-remote)  cmd_deploy_remote "$DEPLOY_SERVER" "$DEPLOY_METHOD" ;;
    cleanup-remote) cmd_cleanup_remote "$DEPLOY_SERVER" "${CLEANUP_TYPE:---soft}" ;;
    install-on-server) cmd_install_on_server ;;
    backup)         cmd_backup "$ENVIRONMENT" ;;
    restore)        cmd_restore "$ENVIRONMENT" ;;
    logs)           cmd_logs ;;
    status)         cmd_status ;;
    stop)           cmd_stop ;;
    *)
        log "ERROR" "Comando não implementado: $COMMAND"
        exit 1
        ;;
esac