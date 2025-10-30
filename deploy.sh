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
    echo -e "  ${YELLOW}clean${NC}     - Limpar containers, volumes e imagens"
    echo -e "  ${YELLOW}install${NC}   - Instalar dependências e configurar ambiente"
    echo -e "  ${YELLOW}build${NC}     - Fazer build das imagens Docker"
    echo -e "  ${YELLOW}dev${NC}      - Iniciar ambiente de desenvolvimento"
    echo -e "  ${YELLOW}prod${NC}     - Iniciar ambiente de produção"
    echo -e "  ${YELLOW}backup${NC}   - Fazer backup do banco de dados"
    echo -e "  ${YELLOW}restore${NC}  - Restaurar backup do banco de dados"
    echo -e "  ${YELLOW}logs${NC}     - Visualizar logs dos containers"
    echo -e "  ${YELLOW}status${NC}   - Verificar status dos serviços"
    echo -e "  ${YELLOW}stop${NC}     - Parar todos os serviços"
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
    echo -e "  ./deploy.sh prod --nginx"
    echo -e "  ./deploy.sh build --no-cache"
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
            log "WARN" "podman-compose não encontrado, tentando docker-compose com podman"
            COMPOSE_CMD="docker-compose"
            # Configurar docker-compose para usar podman
            export DOCKER_HOST="unix:///run/user/$(id -u)/podman/podman.sock"
        fi
        
        log "INFO" "Usando Podman como container engine"
    elif command -v docker &> /dev/null; then
        CONTAINER_ENGINE="docker"
        COMPOSE_CMD="docker-compose"
        
        if ! command -v docker-compose &> /dev/null; then
            log "ERROR" "Docker Compose não está instalado!"
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
    sleep 15
    
    # Verificar status
    $COMPOSE_CMD -f "$COMPOSE_FILE" ps
    
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
    sleep 30
    
    # Verificar status
    $COMPOSE_CMD -f "$COMPOSE_FILE" ps
    
    # Verificar health check
    sleep 10
    if curl -f http://localhost:${APP_PORT:-3000}/api/health > /dev/null 2>&1; then
        log "INFO" "Health check OK"
    else
        log "WARN" "Health check falhou"
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

# Processar argumentos
COMMAND=""
ENVIRONMENT="dev"
INCLUDE_ADMIN="false"
INCLUDE_NGINX="false"
NO_CACHE="false"
FORCE="false"
BACKUP_FILE_PATH=""

while [[ $# -gt 0 ]]; do
    case $1 in
        clean|install|build|dev|prod|backup|restore|logs|status|stop)
            COMMAND="$1"
            shift
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
    clean)     cmd_clean ;;
    install)   cmd_install ;;
    build)     cmd_build ;;
    dev)       cmd_dev ;;
    prod)      cmd_prod ;;
    backup)    cmd_backup "$ENVIRONMENT" ;;
    restore)   cmd_restore "$ENVIRONMENT" ;;
    logs)      cmd_logs ;;
    status)    cmd_status ;;
    stop)      cmd_stop ;;
    *)
        log "ERROR" "Comando não implementado: $COMMAND"
        exit 1
        ;;
esac