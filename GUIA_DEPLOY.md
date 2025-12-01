# 🚀 Guia Rápido de Deploy - Sistema de Simuladores

## 📍 Informações do Servidor

```
Servidor: 10.10.50.246
Usuário: double
Senha SSH: D0ubl3T3l3c0m
Senha Sudo: D0ubl3T3l3c0m
Pasta: ~/simuladores
```

⚠️ **Portas em uso no servidor:** 3000, 5432  
✅ **Usar portas alternativas:** 3009 (app), 5433 (db)

---

## 🖥️ Desenvolvimento Local (PC)

### Início Rápido

```bash
# Clonar e configurar
git clone <repositorio>
cd simuladores
cp .env.example .env.development

# Iniciar desenvolvimento
./deploy.sh dev

# Acessar: http://localhost:3000
```

### Comandos Úteis

```bash
./deploy.sh dev          # Iniciar desenvolvimento
./deploy.sh dev --admin  # Com PgAdmin
./deploy.sh logs         # Ver logs
./deploy.sh stop         # Parar
./deploy.sh restart      # Reiniciar
./deploy.sh backup dev   # Backup
```

---

## 🚀 Deploy Produção (Servidor Remoto)

### Método 1: Deploy Automatizado (Recomendado)

**Etapa 1 - No PC Local:**
```bash
# Transferir tudo de uma vez
./deploy.sh deploy-remote double@10.10.50.246 simuladores-app.tar.gz
# Senha quando solicitado: D0ubl3T3l3c0m
```

**Etapa 2 - No Servidor:**
```bash
# Conectar ao servidor
ssh double@10.10.50.246
# Senha: D0ubl3T3l3c0m

# Entrar na pasta e instalar
cd ~/simuladores
sudo ./deploy.sh install-on-server
# Senha sudo: D0ubl3T3l3c0m
# Responder 'y' quando perguntado
```

### Método 2: Deploy Manual (Passo a Passo)

#### 1️⃣ Preparar no PC Local

```bash
# Configurar produção
cp .env.example .env.production
nano .env.production

# Ajustar portas:
# APP_PORT=3009
# DATABASE_EXTERNAL_PORT=5433

# Construir imagem
docker build -t simuladores-app:latest .

# Salvar imagem
docker save simuladores-app:latest | gzip > simuladores-app.tar.gz
```

#### 2️⃣ Transferir para Servidor

```bash
# Transferir imagem
scp simuladores-app.tar.gz double@10.10.50.246:~/
# Senha: D0ubl3T3l3c0m

# Transferir configurações
scp .env.production double@10.10.50.246:~/simuladores/
scp docker-compose.yml double@10.10.50.246:~/simuladores/
scp docker-compose.prod.yml double@10.10.50.246:~/simuladores/
scp deploy.sh double@10.10.50.246:~/simuladores/
```

#### 3️⃣ Instalar no Servidor

```bash
# Conectar via SSH
ssh double@10.10.50.246
# Senha: D0ubl3T3l3c0m

# Entrar na pasta do projeto
cd ~/simuladores

# Dar permissão de execução ao script
chmod +x deploy.sh

# Executar instalação (SEMPRE com sudo)
sudo ./deploy.sh install-on-server
# Senha sudo: D0ubl3T3l3c0m

# O script irá automaticamente:
# - Carregar a imagem Docker de ~/simuladores-app.tar.gz
# - Criar volumes necessários
# - Iniciar containers
# - Executar migrations e seed
```

#### 4️⃣ Verificar Instalação

```bash
# Ver status dos containers
sudo ./deploy.sh status

# Ver logs
sudo ./deploy.sh logs

# Testar
curl http://localhost:3009
```

#### 5️⃣ Acessar Aplicação

```
URL: http://10.10.50.246:3009

Login padrão:
- Email: admin@sistema.com
- Senha: admin123
```

---

## 🔄 Atualizar Aplicação

### No PC Local

```bash
# 1. Fazer alterações no código
# 2. Testar localmente
./deploy.sh dev

# 3. Construir nova imagem
docker build -t simuladores-app:latest .
docker save simuladores-app:latest | gzip > simuladores-app.tar.gz

# 4. Transferir
scp simuladores-app.tar.gz double@10.10.50.246:~/
```

### No Servidor

```bash
# Conectar
ssh double@10.10.50.246

# Fazer backup
cd ~/simuladores
sudo ./deploy.sh backup prod

# Parar aplicação
sudo ./deploy.sh stop

# Reinstalar com nova imagem
sudo ./deploy.sh install-on-server

# Verificar logs
sudo ./deploy.sh logs
```

---

## 💾 Backup e Restore

### Fazer Backup

```bash
# No servidor
ssh double@10.10.50.246
cd ~/simuladores

# Backup manual
sudo ./deploy.sh backup prod

# Backups ficam em: ~/simuladores/backups/
```

### Restaurar Backup

```bash
# No servidor
cd ~/simuladores
sudo ./deploy.sh restore prod backups/backup_2024-11-28.sql
```

---

## 🐛 Problemas Comuns

### Porta já em uso

```bash
# Verificar portas
sudo netstat -tulpn | grep :3009

# Solução: Alterar em .env.production
APP_PORT=3010  # ou outra porta livre
```

### Container não inicia

```bash
# Ver logs detalhados
cd ~/simuladores
sudo ./deploy.sh logs

# Reiniciar do zero
sudo ./deploy.sh stop
sudo ./deploy.sh clean
sudo ./deploy.sh install-on-server
```

### Permissão negada

```bash
# Adicionar ao grupo docker
sudo usermod -aG docker double

# Relogar
exit
ssh double@10.10.50.246
```

### Banco não conecta

```bash
# Verificar status
cd ~/simuladores
sudo ./deploy.sh status

# Ver logs do banco
sudo ./deploy.sh logs

# Reiniciar containers
sudo ./deploy.sh restart
```

---

## 📋 Checklist Rápido

### Antes do Deploy
- [ ] Código testado localmente
- [ ] `.env.production` com portas corretas (3009, 5433)
- [ ] Chaves de segurança geradas
- [ ] Backup do banco atual

### Durante o Deploy
- [ ] Imagem transferida
- [ ] SSH conectado
- [ ] `./deploy.sh install-on-server` executado
- [ ] Containers rodando

### Após o Deploy
- [ ] Aplicação acessível (http://10.10.50.246:3009)
- [ ] Login funcionando
- [ ] Calculadoras funcionando
- [ ] Propostas criando/editando

---

## 🔗 Links Úteis

- **Aplicação:** http://10.10.50.246:3009
- **Documentação completa:** README.md

---

## 📞 Comandos Úteis no Servidor

**Sempre conectar primeiro via SSH:**
```bash
ssh double@10.10.50.246
# Senha: D0ubl3T3l3c0m
```

**Depois executar os comandos:**
```bash
# Entrar na pasta
cd ~/simuladores

# Ver logs em tempo real
sudo ./deploy.sh logs

# Ver status dos containers
sudo ./deploy.sh status

# Reiniciar aplicação
sudo ./deploy.sh restart

# Fazer backup
sudo ./deploy.sh backup prod

# Parar aplicação
sudo ./deploy.sh stop

# Iniciar aplicação
sudo ./deploy.sh start
```

**⚠️ Nota:** Comandos concatenados via SSH não funcionam porque o script 
pede confirmações interativas. Sempre conecte primeiro e execute depois.

---

## ⚡ Deploy Rápido (2 Etapas)

```bash
# Etapa 1: Transferir arquivos (no PC local)
./deploy.sh deploy-remote double@10.10.50.246 simuladores-app.tar.gz

# Etapa 2: Instalar no servidor (conectar via SSH)
ssh double@10.10.50.246
# Após conectar:
cd ~/simuladores
sudo ./deploy.sh install-on-server
```

**⚠️ IMPORTANTE:** Não é possível fazer em uma linha porque o script `install-on-server` 
pede confirmações interativas que precisam de resposta do usuário.

---

**Última atualização:** 28 de Novembro de 2024  
**Versão:** 1.0



## Conteúdo do .env.production

# ==========================================
# AMBIENTE DE PRODUÇÃO
# ⚠️ ALTERE TODAS AS SENHAS E SECRETS ANTES DE USAR!
# ==========================================

# Application
NODE_ENV=production
PORT=3009
NEXTAUTH_URL=http://simulador-dre.doubletelecom.com.br

# Service Ports
APP_PORT=3009
PGADMIN_PORT=8089
DATABASE_EXTERNAL_PORT=5433
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

# Deployment
NEXT_PUBLIC_APP_URL=http://simulador-dre.doubletelecom.com.br

# Webhooks (opcional)
DISCORD_WEBHOOK_URL=

# Database (PostgreSQL)
DATABASE_URL=postgresql://postgres:ZBLC7ZF9WY5ZFrIYSQ2wnxd40vDzbFkv@db:5432/simuladores_prod
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD="ZBLC7ZF9WY5ZFrIYSQ2wnxd40vDzbFkv"
DATABASE_NAME=simuladores_prod

# Security - ⚠️ GERAR SENHAS FORTES!
# Use: openssl rand -base64 32
NEXTAUTH_SECRET="de54AxcwY+bVEKA3LOJmJl4+xPEL3RI1PQXQUDdXu0w="
JWT_SECRET="VB/AbH2vH0QknkdosiXUzqio23EhpiZZMmQgWiEcVPw="

# Email Service (Resend)
RESEND_API_KEY="SZFtdd/BK/tZ+yLEKIRAag=="

# PgAdmin
PGADMIN_DEFAULT_EMAIL=admin@doubletelecom.com.br
PGADMIN_DEFAULT_PASSWORD="SZFtdd/BK/tZ+yLEKIRAag=="

# Debug Settings
DEBUG=false
LOG_LEVEL=error

# Features
ENABLE_DEBUG_ROUTES=false
ENABLE_TEST_DATA=false