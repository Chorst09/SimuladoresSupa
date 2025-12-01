#!/bin/bash

# ==========================================
# DEPLOY GUI - Interface Gráfica
# Sistema de Simuladores - PostgreSQL
# ==========================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Verificar se dialog está instalado
if ! command -v dialog &> /dev/null; then
    echo -e "${YELLOW}Instalando dialog...${NC}"
    if command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y dialog
    elif command -v yum &> /dev/null; then
        sudo yum install -y dialog
    else
        echo -e "${RED}Não foi possível instalar dialog automaticamente${NC}"
        echo "Instale manualmente: sudo apt install dialog"
        exit 1
    fi
fi

# Arquivo temporário para respostas
TEMP_FILE=$(mktemp)
trap "rm -f $TEMP_FILE" EXIT

# Função para mostrar banner
show_banner() {
    dialog --title "Deploy System" --msgbox "\n\
╔═══════════════════════════════════════╗\n\
║   SISTEMA DE DEPLOY - SIMULADORES    ║\n\
║        PostgreSQL + Next.js          ║\n\
╚═══════════════════════════════════════╝\n\n\
Bem-vindo ao assistente de deploy!\n\n\
Use as setas para navegar\n\
ENTER para selecionar\n\
ESC para cancelar" 15 50
}

# Menu principal
main_menu() {
    while true; do
        dialog --clear --title "Sistema de Deploy - Simuladores" \
            --menu "Escolha uma opção:" 22 65 13 \
            1 "🏗️  Build - Construir imagens Docker" \
            2 "🚀 Deploy Remoto - Enviar para servidor" \
            3 "💻 Ambiente Local - Dev/Prod" \
            4 "🧹 Limpeza - Clean containers/images" \
            5 "📊 Status - Ver status dos serviços" \
            6 "📝 Logs - Visualizar logs" \
            7 "💾 Backup/Restore - Banco de dados" \
            8 "⚙️  Configurações - Ver/Editar .env" \
            9 "🔧 Portas - Configurar portas da aplicação" \
            10 "❓ Ajuda - Documentação" \
            0 "🚪 Sair" 2>$TEMP_FILE
        
        choice=$?
        if [ $choice -ne 0 ]; then
            clear
            exit 0
        fi
        
        option=$(cat $TEMP_FILE)
        
        case $option in
            1) build_menu ;;
            2) deploy_remote_menu ;;
            3) local_environment_menu ;;
            4) cleanup_menu ;;
            5) status_menu ;;
            6) logs_menu ;;
            7) backup_menu ;;
            8) config_menu ;;
            9) port_config_menu ;;
            10) help_menu ;;
            0) 
                clear
                echo -e "${GREEN}Até logo!${NC}"
                exit 0
                ;;
        esac
    done
}

# Menu de Build
build_menu() {
    # Passo 1: Escolher ambiente
    dialog --clear --title "Build de Imagens - Passo 1/2" \
        --radiolist "Escolha o ambiente:" 15 60 4 \
        1 "Desenvolvimento (dev)" off \
        2 "Produção (prod)" on \
        3 "Ambos (dev + prod)" off 2>$TEMP_FILE
    
    choice=$?
    if [ $choice -ne 0 ]; then return; fi
    
    env_option=$(cat $TEMP_FILE)
    
    # Passo 2: Opções de build
    dialog --clear --title "Build de Imagens - Passo 2/2" \
        --checklist "Opções de build:" 12 60 3 \
        1 "Sem cache (--no-cache)" off \
        2 "Forçar rebuild completo" off 2>$TEMP_FILE
    
    choice=$?
    if [ $choice -ne 0 ]; then return; fi
    
    options=$(cat $TEMP_FILE)
    
    # Montar comando
    build_flags=""
    if echo "$options" | grep -q "1"; then
        build_flags="$build_flags --no-cache"
    fi
    if echo "$options" | grep -q "2"; then
        build_flags="$build_flags --force"
    fi
    
    # Resumo e confirmação
    case $env_option in
        1) env_text="Desenvolvimento" ;;
        2) env_text="Produção" ;;
        3) env_text="Dev + Prod" ;;
    esac
    
    dialog --title "Confirmar Build" --yesno "\
Ambiente: $env_text\n\
Opções: ${build_flags:-padrão}\n\n\
Tempo estimado: 2-5 minutos\n\n\
Iniciar build?" 12 50
    
    if [ $? -ne 0 ]; then return; fi
    
    # Executar
    case $env_option in
        1)
            execute_with_progress "ENVIRONMENT=dev ./deploy.sh build $build_flags" "Fazendo build de desenvolvimento..."
            ;;
        2)
            execute_with_progress "ENVIRONMENT=prod ./deploy.sh build $build_flags" "Fazendo build de produção..."
            ;;
        3)
            execute_with_progress "ENVIRONMENT=dev ./deploy.sh build $build_flags && ENVIRONMENT=prod ./deploy.sh build $build_flags" "Fazendo build de dev e prod..."
            ;;
    esac
}

# Menu de Deploy Remoto
deploy_remote_menu() {
    # Passo 1: Servidor
    dialog --title "Deploy Remoto - Passo 1/6" \
        --inputbox "Digite o servidor (ex: user@host):" 10 60 "double@10.10.50.246" 2>$TEMP_FILE
    if [ $? -ne 0 ]; then return; fi
    server=$(cat $TEMP_FILE)
    
    if [ -z "$server" ]; then
        dialog --title "Erro" --msgbox "Servidor não pode ser vazio!" 7 40
        return
    fi
    
    # Passo 2: Senha
    dialog --title "Deploy Remoto - Passo 2/6" \
        --passwordbox "Digite a senha do servidor:" 10 60 2>$TEMP_FILE
    if [ $? -ne 0 ]; then return; fi
    server_password=$(cat $TEMP_FILE)
    
    if [ -z "$server_password" ]; then
        dialog --title "Erro" --msgbox "Senha não pode ser vazia!" 7 40
        return
    fi
    
    # Passo 3: Configuração de Portas
    # Ler portas atuais do .env.production
    current_app_port=$(grep "^APP_PORT=" .env.production 2>/dev/null | cut -d'=' -f2)
    current_db_port=$(grep "^DATABASE_EXTERNAL_PORT=" .env.production 2>/dev/null | cut -d'=' -f2)
    current_app_port=${current_app_port:-3009}
    current_db_port=${current_db_port:-5433}
    
    dialog --title "Deploy Remoto - Passo 3/6" \
        --yesno "Portas configuradas:\n\n\
Aplicação: $current_app_port\n\
PostgreSQL: $current_db_port\n\n\
Deseja alterar as portas?" 12 50
    
    if [ $? -eq 0 ]; then
        # Perguntar nova porta da aplicação
        dialog --title "Configurar Porta da Aplicação" \
            --inputbox "Digite a porta da aplicação:" 10 50 "$current_app_port" 2>$TEMP_FILE
        if [ $? -eq 0 ]; then
            new_app_port=$(cat $TEMP_FILE)
            if [[ "$new_app_port" =~ ^[0-9]+$ ]] && [ "$new_app_port" -ge 1024 ] && [ "$new_app_port" -le 65535 ]; then
                current_app_port=$new_app_port
            fi
        fi
        
        # Perguntar nova porta do PostgreSQL
        dialog --title "Configurar Porta do PostgreSQL" \
            --inputbox "Digite a porta do PostgreSQL:" 10 50 "$current_db_port" 2>$TEMP_FILE
        if [ $? -eq 0 ]; then
            new_db_port=$(cat $TEMP_FILE)
            if [[ "$new_db_port" =~ ^[0-9]+$ ]] && [ "$new_db_port" -ge 1024 ] && [ "$new_db_port" -le 65535 ]; then
                current_db_port=$new_db_port
            fi
        fi
        
        # Atualizar .env.production
        sed -i "s/^APP_PORT=.*/APP_PORT=$current_app_port/" .env.production
        sed -i "s/^DATABASE_EXTERNAL_PORT=.*/DATABASE_EXTERNAL_PORT=$current_db_port/" .env.production
        sed -i "s/^PORT=.*/PORT=$current_app_port/" .env.production
    fi
    
    # Passo 4: Método
    dialog --clear --title "Deploy Remoto - Passo 4/6" \
        --radiolist "Escolha o método:" 12 60 2 \
        1 "📦 Image - Enviar imagens Docker (recomendado)" on \
        2 "📄 Source - Enviar código fonte" off 2>$TEMP_FILE
    
    choice=$?
    if [ $choice -ne 0 ]; then return; fi
    
    method_option=$(cat $TEMP_FILE)
    case $method_option in
        1) method="image" ;;
        2) method="source" ;;
    esac
    
    # Passo 5: Opções
    dialog --clear --title "Deploy Remoto - Passo 5/6" \
        --checklist "Opções de deploy:" 15 70 4 \
        1 "Fazer build antes de enviar" on \
        2 "Exportar imagens (apenas image)" on \
        3 "Limpar servidor antes (--soft)" off \
        4 "Forçar operação (sem confirmações)" off 2>$TEMP_FILE
    
    choice=$?
    if [ $choice -ne 0 ]; then return; fi
    
    options=$(cat $TEMP_FILE)
    
    # Processar opções
    do_build="sim"
    do_export="sim"
    clean_server="não"
    force_flag=""
    
    if ! echo "$options" | grep -q "1"; then do_build="não"; fi
    if ! echo "$options" | grep -q "2"; then do_export="não"; fi
    if echo "$options" | grep -q "3"; then clean_server="sim"; fi
    if echo "$options" | grep -q "4"; then force_flag="--force"; fi
    
    # Passo 6: Resumo e confirmação
    dialog --title "Deploy Remoto - Passo 6/6 - CONFIRMAÇÃO" --yesno "\
╔═══════════════════════════════════════╗
║       RESUMO DO DEPLOY               ║
╚═══════════════════════════════════════╝

🌐 Servidor: $server
🔧 Porta App: $current_app_port
🗄️  Porta DB: $current_db_port
📦 Método: $method
🏗️  Build: $do_build
📤 Export: $do_export
🧹 Limpar servidor: $clean_server

⏱️  Tempo estimado: 5-15 minutos

⚠️  ATENÇÃO: Deploy em PRODUÇÃO!

Confirma o deploy?" 22 50
    
    if [ $? -ne 0 ]; then return; fi
    
    # Executar deploy
    (
        echo "0" ; echo "### Iniciando deploy remoto..."
        sleep 1
        
        if [ "$clean_server" = "sim" ]; then
            echo "10" ; echo "### Limpando servidor remoto..."
            # Aqui você pode adicionar comando SSH para limpar
            sleep 2
        fi
        
        echo "20" ; echo "### Executando deploy..."
        ./deploy.sh deploy-remote $server $method $force_flag 2>&1 | while read line; do
            echo "XXX"
            echo "50"
            echo "### $line"
            echo "XXX"
        done
        
        echo "100" ; echo "### Deploy concluído!"
        sleep 2
    ) | dialog --title "Executando Deploy" --gauge "Preparando..." 10 70 0
    
    dialog --title "Sucesso" --msgbox "\
✅ Deploy concluído com sucesso!\n\n\
Próximos passos:\n\
1. Conecte no servidor: ssh $server\n\
2. Execute: cd simuladores && sudo ./deploy.sh install-on-server\n\
3. Acesse: http://IP:$current_app_port\n\n\
Login padrão:\n\
  admin@sistema.com / admin123" 16 60
}

# Menu de Ambiente Local
local_environment_menu() {
    dialog --clear --title "Ambiente Local" \
        --menu "Escolha uma ação:" 15 60 5 \
        1 "🚀 Iniciar Desenvolvimento (dev)" \
        2 "🏭 Iniciar Produção (prod)" \
        3 "🛑 Parar todos os serviços" \
        4 "🔄 Reiniciar serviços" \
        0 "← Voltar" 2>$TEMP_FILE
    
    choice=$?
    if [ $choice -ne 0 ]; then return; fi
    
    option=$(cat $TEMP_FILE)
    
    case $option in
        1) 
            # Opções para dev
            dialog --clear --title "Desenvolvimento - Opções" \
                --checklist "Serviços adicionais:" 12 60 2 \
                1 "PgAdmin (porta 8080)" on \
                2 "Modo debug" off 2>$TEMP_FILE
            
            opts=$(cat $TEMP_FILE)
            flags=""
            if echo "$opts" | grep -q "1"; then flags="$flags --admin"; fi
            
            execute_with_progress "./deploy.sh dev $flags" "Iniciando ambiente de desenvolvimento..."
            
            dialog --title "Desenvolvimento Iniciado" --msgbox "\
✅ Ambiente iniciado com sucesso!\n\n\
🌐 Aplicação: http://localhost:3000\n\
🗄️  PostgreSQL: localhost:5432\n\
$(echo "$opts" | grep -q "1" && echo "📊 PgAdmin: http://localhost:8080")\n\n\
Usuário padrão:\n\
  admin@sistema.com / admin123" 15 50
            ;;
        2) 
            # Opções para prod
            dialog --clear --title "Produção - Opções" \
                --checklist "Serviços adicionais:" 15 60 3 \
                1 "PgAdmin (porta 8080)" off \
                2 "Nginx (portas 80/443)" off 2>$TEMP_FILE
            
            opts=$(cat $TEMP_FILE)
            flags=""
            if echo "$opts" | grep -q "1"; then flags="$flags --admin"; fi
            if echo "$opts" | grep -q "2"; then flags="$flags --nginx"; fi
            
            dialog --title "Confirmar" --yesno "\
⚠️  Iniciar ambiente de PRODUÇÃO?\n\n\
Isso irá:\n\
- Parar containers existentes\n\
- Fazer build de produção\n\
- Iniciar serviços\n\n\
Continuar?" 13 50
            
            if [ $? -eq 0 ]; then
                execute_with_progress "./deploy.sh prod $flags" "Iniciando ambiente de produção..."
                
                dialog --title "Produção Iniciada" --msgbox "\
✅ Ambiente iniciado com sucesso!\n\n\
🌐 Aplicação: http://localhost:3009\n\
🗄️  PostgreSQL: localhost:5433\n\
$(echo "$opts" | grep -q "1" && echo "📊 PgAdmin: http://localhost:8089")\n\n\
Usuário padrão:\n\
  admin@sistema.com / admin123" 15 50
            fi
            ;;
        3) 
            dialog --title "Confirmar" --yesno "Parar todos os serviços?" 7 40
            if [ $? -eq 0 ]; then
                execute_with_progress "./deploy.sh stop" "Parando serviços..."
            fi
            ;;
        4) 
            dialog --title "Reiniciar" --radiolist "Qual ambiente?" 12 50 2 \
                1 "Desenvolvimento" on \
                2 "Produção" off 2>$TEMP_FILE
            
            if [ $? -ne 0 ]; then return; fi
            
            env_choice=$(cat $TEMP_FILE)
            case $env_choice in
                1) execute_with_progress "docker compose -f docker-compose.dev.yml restart" "Reiniciando desenvolvimento..." ;;
                2) execute_with_progress "docker compose -f docker-compose.prod.yml restart" "Reiniciando produção..." ;;
            esac
            ;;
        0) return ;;
    esac
}

# Menu de Limpeza
cleanup_menu() {
    # Passo 1: Escolher tipo
    dialog --clear --title "Limpeza - Passo 1/3" \
        --radiolist "Escolha o tipo de limpeza:" 15 70 3 \
        1 "🧹 Limpeza Local SUAVE (mantém volumes)" on \
        2 "🗑️  Limpeza Local COMPLETA (apaga tudo)" off \
        3 "🌐 Instruções para Servidor Remoto" off 2>$TEMP_FILE
    
    choice=$?
    if [ $choice -ne 0 ]; then return; fi
    
    option=$(cat $TEMP_FILE)
    
    case $option in
        1|2)
            # Passo 2: O que limpar
            dialog --clear --title "Limpeza - Passo 2/3" \
                --checklist "O que deseja limpar:" 15 60 5 \
                1 "Containers do simuladores" on \
                2 "Imagens Docker" on \
                3 "Volumes (DADOS DO BANCO)" $([ "$option" = "2" ] && echo "on" || echo "off") \
                4 "Redes Docker" on \
                5 "Cache do Docker" off 2>$TEMP_FILE
            
            if [ $? -ne 0 ]; then return; fi
            
            items=$(cat $TEMP_FILE)
            
            # Montar resumo
            summary="Será removido:\n\n"
            [ -n "$(echo "$items" | grep 1)" ] && summary="${summary}✓ Containers\n"
            [ -n "$(echo "$items" | grep 2)" ] && summary="${summary}✓ Imagens\n"
            [ -n "$(echo "$items" | grep 3)" ] && summary="${summary}⚠️  VOLUMES (DADOS!)\n"
            [ -n "$(echo "$items" | grep 4)" ] && summary="${summary}✓ Redes\n"
            [ -n "$(echo "$items" | grep 5)" ] && summary="${summary}✓ Cache\n"
            
            # Passo 3: Confirmação
            if echo "$items" | grep -q "3"; then
                # Confirmação extra para volumes
                dialog --title "⚠️  ATENÇÃO - DADOS SERÃO PERDIDOS" --yesno "\
$summary\n\
⚠️⚠️⚠️  VOLUMES INCLUÍDOS  ⚠️⚠️⚠️\n\n\
Todos os dados do banco serão\n\
PERMANENTEMENTE APAGADOS!\n\n\
Tem CERTEZA ABSOLUTA?" 18 50
                
                if [ $? -ne 0 ]; then return; fi
                
                dialog --title "Confirmação Final" --passwordbox "Digite 'DELETE' para confirmar:" 10 50 2>$TEMP_FILE
                confirm=$(cat $TEMP_FILE)
                if [ "$confirm" != "DELETE" ]; then
                    dialog --title "Cancelado" --msgbox "Limpeza cancelada." 7 40
                    return
                fi
            else
                dialog --title "Limpeza - Passo 3/3 - CONFIRMAÇÃO" --yesno "\
$summary\n\
Continuar com a limpeza?" 14 50
                
                if [ $? -ne 0 ]; then return; fi
            fi
            
            # Executar limpeza
            execute_with_progress "./deploy.sh clean --force" "Limpando ambiente..."
            
            dialog --title "Limpeza Concluída" --msgbox "\
✅ Limpeza concluída!\n\n\
Espaço liberado no Docker.\n\n\
Próximos passos:\n\
- Fazer novo build\n\
- Ou fazer deploy remoto" 12 50
            ;;
        3)
            # Instruções para servidor
            dialog --title "Limpeza no Servidor Remoto" --msgbox "\
╔═══════════════════════════════════════╗
║   LIMPEZA NO SERVIDOR REMOTO         ║
╚═══════════════════════════════════════╝

1️⃣  Conecte no servidor:
   ssh user@servidor

2️⃣  Navegue até o diretório:
   cd simuladores

3️⃣  Execute a limpeza:

   🧹 SUAVE (mantém dados):
   sudo ./deploy.sh clean-server --soft

   🗑️  COMPLETA (apaga tudo):
   sudo ./deploy.sh clean-server --hard

4️⃣  Após limpar, faça novo deploy:
   Da sua máquina local execute:
   ./deploy.sh deploy-remote user@servidor image

⚠️  IMPORTANTE:
   --hard apaga TODOS os dados do banco!
   Faça backup antes se necessário." 28 60
            ;;
        0) return ;;
    esac
}

# Menu de Status
status_menu() {
    clear
    echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         STATUS DOS SERVIÇOS          ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
    echo ""
    ./deploy.sh status
    echo ""
    echo -e "${YELLOW}Pressione ENTER para voltar...${NC}"
    read
}

# Menu de Logs
logs_menu() {
    dialog --clear --title "Logs" \
        --menu "Escolha o container:" 15 60 5 \
        1 "📱 Aplicação (app)" \
        2 "🗄️  Banco de Dados (db)" \
        3 "🌐 Nginx" \
        4 "📊 Todos" \
        0 "← Voltar" 2>$TEMP_FILE
    
    choice=$?
    if [ $choice -ne 0 ]; then return; fi
    
    option=$(cat $TEMP_FILE)
    
    clear
    case $option in
        1) docker logs -f --tail=100 simuladores_app_prod 2>/dev/null || docker logs -f --tail=100 simuladores_app_dev ;;
        2) docker logs -f --tail=100 simuladores_db_prod 2>/dev/null || docker logs -f --tail=100 simuladores_db_dev ;;
        3) docker logs -f --tail=100 simuladores_nginx_prod 2>/dev/null || echo "Nginx não está rodando" ;;
        4) ./deploy.sh logs ;;
        0) return ;;
    esac
}

# Menu de Backup
backup_menu() {
    dialog --clear --title "Backup/Restore" \
        --menu "Escolha uma ação:" 12 60 3 \
        1 "💾 Fazer Backup" \
        2 "📥 Restaurar Backup" \
        0 "← Voltar" 2>$TEMP_FILE
    
    choice=$?
    if [ $choice -ne 0 ]; then return; fi
    
    option=$(cat $TEMP_FILE)
    
    case $option in
        1)
            dialog --title "Backup" --menu "Qual ambiente?" 12 50 3 \
                1 "Desenvolvimento" \
                2 "Produção" \
                0 "Cancelar" 2>$TEMP_FILE
            env_choice=$(cat $TEMP_FILE)
            case $env_choice in
                1) execute_command "./deploy.sh backup dev" ;;
                2) execute_command "./deploy.sh backup prod" ;;
            esac
            ;;
        2)
            # Listar backups disponíveis
            if [ -d "backups" ] && [ "$(ls -A backups/*.sql 2>/dev/null)" ]; then
                backup_list=$(ls -1t backups/*.sql 2>/dev/null | head -10)
                menu_items=()
                i=1
                while IFS= read -r backup; do
                    menu_items+=("$i" "$(basename $backup)")
                    ((i++))
                done <<< "$backup_list"
                
                dialog --title "Restaurar Backup" --menu "Escolha o backup:" 20 70 10 "${menu_items[@]}" 2>$TEMP_FILE
                if [ $? -eq 0 ]; then
                    selected=$(cat $TEMP_FILE)
                    backup_file=$(echo "$backup_list" | sed -n "${selected}p")
                    
                    dialog --title "Confirmar" --yesno "Restaurar backup:\n$backup_file\n\nIsso irá SOBRESCREVER os dados atuais!" 10 60
                    if [ $? -eq 0 ]; then
                        execute_command "./deploy.sh restore --file $backup_file prod"
                    fi
                fi
            else
                dialog --title "Sem Backups" --msgbox "Nenhum backup encontrado em ./backups/" 7 50
            fi
            ;;
        0) return ;;
    esac
}

# Menu de Configuração de Portas
port_config_menu() {
    # Ler portas atuais
    current_app_port=$(grep "^APP_PORT=" .env.production 2>/dev/null | cut -d'=' -f2)
    current_db_port=$(grep "^DATABASE_EXTERNAL_PORT=" .env.production 2>/dev/null | cut -d'=' -f2)
    current_app_port=${current_app_port:-3009}
    current_db_port=${current_db_port:-5433}
    
    # Mostrar portas atuais
    dialog --title "Configuração de Portas" --yesno "\
Portas atuais:\n\n\
🌐 Aplicação: $current_app_port\n\
🗄️  PostgreSQL: $current_db_port\n\n\
Deseja alterar?" 12 50
    
    if [ $? -ne 0 ]; then return; fi
    
    # Perguntar nova porta da aplicação
    dialog --title "Porta da Aplicação" \
        --inputbox "Digite a porta da aplicação (1024-65535):" 10 50 "$current_app_port" 2>$TEMP_FILE
    if [ $? -ne 0 ]; then return; fi
    
    new_app_port=$(cat $TEMP_FILE)
    if ! [[ "$new_app_port" =~ ^[0-9]+$ ]] || [ "$new_app_port" -lt 1024 ] || [ "$new_app_port" -gt 65535 ]; then
        dialog --title "Erro" --msgbox "Porta inválida! Use um número entre 1024 e 65535" 8 50
        return
    fi
    
    # Perguntar nova porta do PostgreSQL
    dialog --title "Porta do PostgreSQL" \
        --inputbox "Digite a porta do PostgreSQL (1024-65535):" 10 50 "$current_db_port" 2>$TEMP_FILE
    if [ $? -ne 0 ]; then return; fi
    
    new_db_port=$(cat $TEMP_FILE)
    if ! [[ "$new_db_port" =~ ^[0-9]+$ ]] || [ "$new_db_port" -lt 1024 ] || [ "$new_db_port" -gt 65535 ]; then
        dialog --title "Erro" --msgbox "Porta inválida! Use um número entre 1024 e 65535" 8 50
        return
    fi
    
    # Atualizar .env.production
    sed -i "s/^APP_PORT=.*/APP_PORT=$new_app_port/" .env.production
    sed -i "s/^DATABASE_EXTERNAL_PORT=.*/DATABASE_EXTERNAL_PORT=$new_db_port/" .env.production
    sed -i "s/^PORT=.*/PORT=$new_app_port/" .env.production
    
    dialog --title "Sucesso" --msgbox "\
✅ Portas atualizadas!\n\n\
🌐 Aplicação: $new_app_port\n\
🗄️  PostgreSQL: $new_db_port\n\n\
As portas foram salvas em .env.production" 12 50
}

# Menu de Configurações
config_menu() {
    dialog --clear --title "Configurações" \
        --menu "Escolha uma ação:" 12 60 4 \
        1 "👁️  Ver .env.development" \
        2 "👁️  Ver .env.production" \
        3 "✏️  Editar .env.production" \
        0 "← Voltar" 2>$TEMP_FILE
    
    choice=$?
    if [ $choice -ne 0 ]; then return; fi
    
    option=$(cat $TEMP_FILE)
    
    case $option in
        1)
            if [ -f ".env.development" ]; then
                dialog --title ".env.development" --textbox .env.development 30 80
            else
                dialog --title "Erro" --msgbox "Arquivo .env.development não encontrado!" 7 50
            fi
            ;;
        2)
            if [ -f ".env.production" ]; then
                dialog --title ".env.production" --textbox .env.production 30 80
            else
                dialog --title "Erro" --msgbox "Arquivo .env.production não encontrado!" 7 50
            fi
            ;;
        3)
            if [ -f ".env.production" ]; then
                ${EDITOR:-nano} .env.production
                dialog --title "Sucesso" --msgbox "Arquivo editado!\n\nLembre-se de fazer deploy novamente para aplicar as mudanças." 9 50
            else
                dialog --title "Erro" --msgbox "Arquivo .env.production não encontrado!" 7 50
            fi
            ;;
        0) return ;;
    esac
}

# Menu de Ajuda
help_menu() {
    dialog --title "Ajuda" --msgbox "\
╔═══════════════════════════════════════╗
║     GUIA RÁPIDO DE DEPLOY            ║
╚═══════════════════════════════════════╝

📋 FLUXO BÁSICO:
1. Build → Construir imagens
2. Deploy Remoto → Enviar para servidor
3. No servidor: install-on-server

🔧 DESENVOLVIMENTO LOCAL:
- Use 'Ambiente Local' → 'Dev'
- Acesse: http://localhost:3000

🚀 PRODUÇÃO:
- Configure .env.production
- Faça build de produção
- Deploy remoto para servidor

💾 BACKUP:
- Faça backups regulares
- Guarde em local seguro

📝 LOGS:
- Use menu 'Logs' para debug
- Logs salvos em ./logs/

🆘 PROBLEMAS:
- Verifique logs primeiro
- Status dos containers
- Health check da aplicação

📚 Documentação completa:
   ./deploy.sh --help" 30 50
}

# Função para executar comando e mostrar progresso
execute_command() {
    local cmd="$1"
    
    clear
    echo -e "${BLUE}╔═══════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         EXECUTANDO COMANDO           ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Comando:${NC} $cmd"
    echo ""
    echo -e "${YELLOW}Aguarde...${NC}"
    echo ""
    
    # Executar comando
    if eval "$cmd"; then
        echo ""
        echo -e "${GREEN}✅ Comando executado com sucesso!${NC}"
    else
        echo ""
        echo -e "${RED}❌ Erro ao executar comando!${NC}"
    fi
    
    echo ""
    echo -e "${YELLOW}Pressione ENTER para continuar...${NC}"
    read
}

# Função para executar com barra de progresso
execute_with_progress() {
    local cmd="$1"
    local title="${2:-Executando...}"
    local log_file=$(mktemp)
    
    # Executar comando em background e capturar saída
    (
        eval "$cmd" > "$log_file" 2>&1
        echo $? > "${log_file}.exit"
    ) &
    
    local pid=$!
    
    # Mostrar progresso
    (
        local progress=0
        while kill -0 $pid 2>/dev/null; do
            progress=$((progress + 5))
            if [ $progress -gt 90 ]; then
                progress=90
            fi
            
            # Pegar últimas linhas do log
            local last_line=$(tail -1 "$log_file" 2>/dev/null | cut -c1-60)
            
            echo "XXX"
            echo "$progress"
            echo "$title\n\n$last_line"
            echo "XXX"
            
            sleep 1
        done
        
        echo "XXX"
        echo "100"
        echo "Concluído!"
        echo "XXX"
        sleep 1
    ) | dialog --title "Progresso" --gauge "$title" 10 70 0
    
    # Verificar resultado
    wait $pid
    local exit_code=$(cat "${log_file}.exit" 2>/dev/null || echo "1")
    
    if [ "$exit_code" -eq 0 ]; then
        dialog --title "Sucesso" --msgbox "✅ Operação concluída com sucesso!\n\nVer log completo em: $log_file" 10 60
    else
        dialog --title "Erro" --textbox "$log_file" 20 70
    fi
    
    # Limpar
    rm -f "$log_file" "${log_file}.exit"
}

# Verificar se está no diretório correto
if [ ! -f "deploy.sh" ]; then
    dialog --title "Erro" --msgbox "Script deploy.sh não encontrado!\n\nExecute este script no diretório do projeto." 9 50
    clear
    exit 1
fi

# Iniciar
show_banner
main_menu
