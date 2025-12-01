# Sistema de Simuladores e Calculadoras TI

Sistema completo de calculadoras e simuladores para precificação de serviços de TI, com gestão de propostas comerciais e sistema de comissões.

## 📋 Índice

- [Funcionalidades](#-funcionalidades-principais)
- [Tecnologias](#️-tecnologias)
- [Instalação](#-instalação-e-configuração)
- [Configuração](#-configuração-do-ambiente)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Docker](#-docker)
- [Banco de Dados](#️-banco-de-dados)
- [Deploy](#-deploy-e-configuração)
- [Deploy Produção](#-deploy-em-produção)
- [Deploy Não-Root](#-deploy-com-usuário-não-root)
- [Guia Rápido](#-guia-rápido-de-deploy)
- [Perfis de Usuário](#-perfis-de-usuário)
- [Troubleshooting](#-troubleshooting)

## 🚀 Funcionalidades Principais

### Calculadoras
- **Máquinas Virtuais (VM)** - Precificação de infraestrutura virtualizada
- **Internet Fibra** - Cálculos para conectividade fibra óptica
- **Internet Rádio** - Precificação de links de rádio
- **PABX/SIP** - Simulador de telefonia IP
- **Internet MAN** - Calculadora para redes metropolitanas
- **Dupla (Fibra + Rádio)** - Redundância de conectividade

### Gestão Comercial
- **Propostas Comerciais** - Geração e gestão de propostas com versionamento
  - Criação de propostas a partir das calculadoras
  - Atualização de propostas existentes
  - Criação de novas versões (mantém histórico)
  - Visualização profissional com layout personalizado
  - Exportação para PDF com todas as informações
  - Sistema de descontos integrado (Vendedor 5% + Diretoria até 100%)
  - Controle de status (Rascunho, Enviada, Aprovada, etc.)
  - Filtros por gerente de contas e busca textual
- **Sistema de Comissões** - Cálculo automático de comissões por prazo contratual
  - Comissões diferenciadas por período (12, 24, 36, 48, 60 meses)
  - Suporte a vendedores diretos e canais (Indicador, Influenciador)
  - Tabelas editáveis de comissão
  - Cálculo automático de payback
- **DRE (Demonstrativo de Resultado)** - Análise financeira detalhada
  - Projeção de receitas e custos
  - Análise de margem e lucratividade
  - Comparação entre diferentes prazos contratuais
- **Gestão de Oportunidades** - CRM integrado com pipeline de vendas
- **Análise de Editais** - Ferramenta para análise de licitações
- **Filtro por Gerente de Contas** - Segmentação de propostas por responsável

### Administração
- **Gestão de Usuários** - Controle de acesso por perfis
- **Relatórios** - Dashboard com métricas e KPIs
- **Configurações** - Parâmetros do sistema

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Banco de Dados**: PostgreSQL com Prisma ORM 7.0
- **Autenticação**: Sistema próprio com JWT
- **Containerização**: Docker/Podman + Compose
- **Testes**: Jest, Testing Library

### Compatibilidade de Containers

O projeto suporta tanto **Docker** quanto **Podman**:

- **Podman** (preferência): Detectado automaticamente se disponível
- **Docker**: Fallback se Podman não estiver instalado
- **Detecção automática**: O script `deploy.sh` escolhe automaticamente

## 📦 Tutorial Completo de Instalação e Deploy

### 🖥️ Parte 1: Instalação em Ambiente de Desenvolvimento (PC Local)

#### Pré-requisitos
- Node.js 20+
- Docker ou Podman (detecção automática)
- Git
- Editor de código (VS Code, etc.)

#### Passo 1: Clonar o Repositório

```bash
# Clonar o projeto
git clone <repositorio>
cd simuladores
```

#### Passo 2: Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env.development

# Editar o arquivo .env.development
nano .env.development
```

**Configuração mínima para desenvolvimento:**

```env
# Aplicação
NODE_ENV=development
PORT=3000
NEXTAUTH_URL=http://localhost:3000

# Banco de Dados
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/simuladores_db
DATABASE_HOST=db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=simuladores_db
DATABASE_EXTERNAL_PORT=5432

# Segurança (gerar com: openssl rand -base64 32)
NEXTAUTH_SECRET=sua_chave_secreta_aqui
JWT_SECRET=sua_chave_jwt_aqui

# Email (opcional para desenvolvimento)
RESEND_API_KEY=re_sua_chave_resend

# Debug
DEBUG=true
LOG_LEVEL=debug
ENABLE_DEBUG_ROUTES=true
ENABLE_TEST_DATA=true
```

#### Passo 3: Iniciar Ambiente de Desenvolvimento

```bash
# Opção 1: Usar Docker (recomendado)
./deploy.sh dev

# Opção 2: Usar Docker com PgAdmin
./deploy.sh dev --admin

# Opção 3: Desenvolvimento local (sem Docker)
npm install
npm run dev
```

#### Passo 4: Acessar a Aplicação

```
Aplicação: http://localhost:3000
PgAdmin (se iniciado): http://localhost:8080
```

**Credenciais padrão (criadas pelo seed):**
- Email: `admin@sistema.com`
- Senha: `admin123`

#### Passo 5: Trabalhar no Desenvolvimento

```bash
# Ver logs em tempo real
./deploy.sh logs

# Parar containers
./deploy.sh stop

# Reiniciar containers
./deploy.sh restart

# Fazer backup do banco
./deploy.sh backup dev

# Restaurar backup
./deploy.sh restore dev backup_file.sql
```

#### Estrutura de Desenvolvimento

```
simuladores/
├── src/
│   ├── app/              # Next.js App Router (páginas e API)
│   ├── components/       # Componentes React
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilitários e configurações
│   └── styles/          # Estilos globais
├── prisma/
│   ├── schema.prisma    # Schema do banco de dados
│   └── seed.ts          # Dados iniciais
├── .env.development     # Variáveis de ambiente (dev)
├── .env.production      # Variáveis de ambiente (prod)
├── deploy.sh            # Script de deploy unificado
└── docker-compose.yml   # Configuração Docker
```

---

### 🚀 Parte 2: Deploy em Servidor Remoto

#### Informações do Servidor

```
Servidor: 10.10.50.246
Usuário: double
Senha SSH: D0ubl3T3l3c0m
Senha Sudo: D0ubl3T3l3c0m
Pasta do Projeto: ~/simuladores
```

⚠️ **IMPORTANTE:** O servidor já possui outras aplicações rodando:
- Porta 3000 está em uso
- Porta 5432 está em uso
- Use portas alternativas configuradas em `.env.production`

#### Passo 1: Preparar Ambiente de Produção Local

```bash
# 1. Configurar variáveis de produção
cp .env.example .env.production
nano .env.production
```

**Configuração para produção (exemplo):**

```env
# Aplicação
NODE_ENV=production
APP_PORT=3009                    # ⚠️ Porta alternativa (3000 em uso)
NEXTAUTH_URL=http://10.10.50.246:3009

# Banco de Dados
DATABASE_URL=postgresql://postgres:senha_forte@db:5432/simuladores_db
DATABASE_HOST=db
DATABASE_USER=postgres
DATABASE_PASSWORD=senha_forte_aqui
DATABASE_NAME=simuladores_db
DATABASE_EXTERNAL_PORT=5433      # ⚠️ Porta alternativa (5432 em uso)

# Segurança (GERAR NOVAS CHAVES!)
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Email
RESEND_API_KEY=re_sua_chave_resend_producao

# Debug (desabilitar em produção)
DEBUG=false
LOG_LEVEL=info
ENABLE_DEBUG_ROUTES=false
ENABLE_TEST_DATA=false

# PgAdmin
PGADMIN_PORT=8080
```

#### Passo 2: Construir Imagem Docker

```bash
# Construir imagem de produção
docker build -t simuladores-app:latest .

# Ou usar o script de deploy
./deploy.sh build
```

#### Passo 3: Salvar Imagem para Transferência

```bash
# Salvar imagem em arquivo
docker save simuladores-app:latest | gzip > simuladores-app.tar.gz

# Verificar tamanho do arquivo
ls -lh simuladores-app.tar.gz
```

#### Passo 4: Transferir Arquivos para o Servidor

```bash
# Transferir imagem Docker
scp simuladores-app.tar.gz double@10.10.50.246:~/

# Transferir arquivos de configuração
scp .env.production double@10.10.50.246:~/simuladores/.env.production
scp docker-compose.yml double@10.10.50.246:~/simuladores/
scp docker-compose.prod.yml double@10.10.50.246:~/simuladores/
scp deploy.sh double@10.10.50.246:~/simuladores/

# Senha quando solicitado: D0ubl3T3l3c0m
```

**Ou usar o script automatizado:**

```bash
# Deploy remoto automatizado
./deploy.sh deploy-remote double@10.10.50.246 simuladores-app.tar.gz
```

#### Passo 5: Conectar ao Servidor via SSH

```bash
# Conectar ao servidor
ssh double@10.10.50.246
# Senha: D0ubl3T3l3c0m

# Verificar conexão
whoami
# Deve retornar: double

pwd
# Deve retornar: /home/double
```

#### Passo 6: Preparar Ambiente no Servidor

```bash
# Criar pasta do projeto (se não existir)
mkdir -p ~/simuladores
cd ~/simuladores

# Verificar se a imagem foi transferida
ls -lh ~/simuladores-app.tar.gz

# Carregar imagem Docker
docker load < ~/simuladores-app.tar.gz
# Ou se usar Podman:
podman load < ~/simuladores-app.tar.gz

# Verificar imagem carregada
docker images | grep simuladores
# Ou:
podman images | grep simuladores
```

#### Passo 7: Executar Instalação no Servidor

```bash
# Entrar na pasta do projeto
cd ~/simuladores

# Dar permissão de execução ao script
chmod +x deploy.sh

# Executar instalação
./deploy.sh install-on-server

# O script irá:
# 1. Verificar se Docker/Podman está instalado
# 2. Criar volumes para dados persistentes
# 3. Iniciar containers (app, db, nginx)
# 4. Executar migrations do banco
# 5. Executar seed (dados iniciais)
# 6. Verificar saúde dos containers
```

**Se precisar de sudo:**

```bash
# Executar com sudo (senha: D0ubl3T3l3c0m)
sudo ./deploy.sh install-on-server
```

#### Passo 8: Verificar Instalação

```bash
# Verificar containers rodando
docker ps
# Ou:
podman ps

# Verificar logs da aplicação
docker logs simuladores-app
# Ou:
podman logs simuladores-app

# Verificar logs do banco
docker logs simuladores-db

# Testar conexão
curl http://localhost:3009
# Deve retornar HTML da aplicação
```

#### Passo 9: Acessar Aplicação

```
URL: http://10.10.50.246:3009

Credenciais padrão:
- Email: admin@sistema.com
- Senha: admin123
```

---

### 🔧 Comandos Úteis no Servidor

#### Gerenciar Aplicação

```bash
# Ver logs em tempo real
./deploy.sh logs

# Parar aplicação
./deploy.sh stop

# Reiniciar aplicação
./deploy.sh restart

# Ver status dos containers
./deploy.sh status
```

#### Backup e Restore

```bash
# Fazer backup do banco de dados
./deploy.sh backup prod

# Restaurar backup
./deploy.sh restore prod backup_2024-11-28.sql

# Listar backups
ls -lh backups/
```

#### Atualizar Aplicação

```bash
# 1. No PC local: construir nova imagem
docker build -t simuladores-app:latest .
docker save simuladores-app:latest | gzip > simuladores-app.tar.gz

# 2. Transferir para servidor
scp simuladores-app.tar.gz double@10.10.50.246:~/

# 3. No servidor: carregar e reiniciar
cd ~/simuladores
docker load < ~/simuladores-app.tar.gz
./deploy.sh restart
```

---

### 🐛 Troubleshooting

#### Problema: Porta já em uso

```bash
# Verificar portas em uso
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :5432

# Solução: Alterar portas em .env.production
APP_PORT=3009
DATABASE_EXTERNAL_PORT=5433
```

#### Problema: Permissão negada

```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Relogar para aplicar mudanças
exit
ssh double@10.10.50.246
```

#### Problema: Container não inicia

```bash
# Ver logs detalhados
docker logs simuladores-app --tail 100

# Verificar configuração
docker inspect simuladores-app

# Reiniciar do zero
./deploy.sh stop
./deploy.sh clean
./deploy.sh install-on-server
```

#### Problema: Banco de dados não conecta

```bash
# Verificar se o banco está rodando
docker ps | grep simuladores-db

# Testar conexão direta
docker exec -it simuladores-db psql -U postgres -d simuladores_db

# Verificar variáveis de ambiente
docker exec simuladores-app env | grep DATABASE
```

---

### 📋 Checklist de Deploy

**Antes do Deploy:**
- [ ] Código testado localmente
- [ ] `.env.production` configurado com portas corretas
- [ ] Chaves de segurança geradas (NEXTAUTH_SECRET, JWT_SECRET)
- [ ] Backup do banco de dados atual (se houver)
- [ ] Imagem Docker construída e testada

**Durante o Deploy:**
- [ ] Imagem transferida para o servidor
- [ ] SSH conectado ao servidor
- [ ] `./deploy.sh install-on-server` executado com sucesso
- [ ] Containers iniciados corretamente
- [ ] Migrations executadas
- [ ] Seed executado (dados iniciais)

**Após o Deploy:**
- [ ] Aplicação acessível via navegador
- [ ] Login funcionando
- [ ] Calculadoras funcionando
- [ ] Propostas sendo criadas/editadas
- [ ] Backup automático configurado
- [ ] Logs sendo monitorados

---

## 📦 Instalação e Configuração (Resumo)

### Pré-requisitos
- Node.js 20+
- Docker e Docker Compose
- Git

### Instalação Rápida

```bash
# 1. Clonar o repositório
git clone <repositorio>
cd simuladores

# 2. Configurar ambiente
cp .env.example .env.development
# Editar .env.development com suas configurações

# 3. Executar com Docker
./deploy.sh dev

# 4. Acessar aplicação
# http://localhost:3000
```

### Configuração Manual

```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco PostgreSQL
docker compose up -d db

# 3. Executar aplicação
npm run dev
```

## 💼 Sistema de Propostas e Descontos

### Fluxo de Trabalho com Propostas

1. **Criar Proposta**
   - Preencher dados do cliente e gerente de contas
   - Adicionar produtos usando as calculadoras
   - Aplicar descontos (se autorizado)
   - Salvar proposta (gera ID único: `Prop_IF_001_v1`)

2. **Atualizar Proposta**
   - Modificar produtos, preços ou descontos
   - Clicar em "Atualizar Proposta" (mantém mesmo ID)
   - Alterações são salvas na mesma proposta

3. **Criar Nova Versão**
   - Modificar proposta existente
   - Clicar em "Salvar como Nova Versão"
   - Cria novo registro com ID incrementado (`Prop_IF_001_v2`)
   - Mantém histórico completo de versões

### Sistema de Descontos

#### Desconto Vendedor (5%)
- **Quem pode aplicar:** Vendedores, Gerentes, Diretores, Admins
- **Valor fixo:** 5% sobre o valor mensal
- **Aplicação:** Checkbox "Aplicar Desconto Vendedor"
- **Cálculo:** Aplicado antes do desconto da diretoria

#### Desconto Diretoria (0-100%)
- **Quem pode aplicar:** Apenas Diretores e Admins
- **Valor variável:** De 0% até 100%
- **Aplicação:** Campo numérico "Desconto Diretor (%)"
- **Cálculo:** Aplicado após o desconto do vendedor

#### Cálculo de Descontos (Ordem de Aplicação)

```
Valor Base Mensal: R$ 1.000,00

1. Desconto Vendedor (5%):
   R$ 1.000,00 × 0.95 = R$ 950,00

2. Desconto Diretoria (10%):
   R$ 950,00 × 0.90 = R$ 855,00

Valor Final: R$ 855,00
Desconto Total: R$ 145,00 (14,5%)
```

### Visualização de Propostas

#### Proposta Comercial (Layout Profissional)
- **Página 1:** Capa com logo, cliente, produto e descontos
- **Página 2:** Detalhes técnicos, produtos, valores e resumo financeiro
- **Exportação PDF:** Documento completo com todas as páginas
- **Impressão:** Layout otimizado para impressão

#### Informações Exibidas
- ✅ Dados do cliente e projeto
- ✅ Gerente de contas responsável
- ✅ Lista de produtos com descrição detalhada
- ✅ Valores de setup e mensalidade
- ✅ Descontos aplicados (detalhados)
- ✅ Resumo financeiro com totais
- ✅ ID da proposta e versão
- ✅ Data de criação e validade

### IDs de Propostas

Cada tipo de calculadora gera IDs únicos:

| Calculadora | Formato do ID | Exemplo |
|-------------|---------------|---------|
| PABX/SIP | `Prop_PABX_001_v1` | `Prop_PABX_023_v2` |
| Máquinas Virtuais | `Prop_MV_001_v1` | `Prop_MV_015_v1` |
| Internet Fibra | `Prop_IF_001_v1` | `Prop_IF_042_v3` |
| Internet Rádio | `Prop_IR_001_v1` | `Prop_IR_008_v1` |
| Double Fibra/Rádio | `Prop_DFR_001_v1` | `Prop_DFR_012_v2` |
| Internet MAN | `Prop_IM_001_v1` | `Prop_IM_005_v1` |

### Armazenamento de Descontos

Os descontos são salvos no campo `metadata` da proposta:

```json
{
  "metadata": {
    "baseTotalMonthly": 1000.00,
    "applySalespersonDiscount": true,
    "appliedDirectorDiscountPercentage": 10,
    "changes": "Ajuste de preço conforme negociação"
  }
}
```

Isso garante que:
- ✅ Descontos são preservados entre atualizações
- ✅ Histórico de alterações é mantido
- ✅ Valores originais podem ser recuperados
- ✅ Auditoria completa de modificações

## 🔧 Configuração do Ambiente

### 🎯 Primeiro Deploy - O Que é Criado Automaticamente

No primeiro deploy, o sistema executa automaticamente:

1. **Migração do Banco de Dados** (`prisma db push`)
   - Cria todas as tabelas necessárias
   - Configura relacionamentos e índices

2. **Seed de Dados Iniciais** (`npm run db:seed`)
   - Usuários de teste
   - Tabelas de comissão
   - Produtos básicos
   - Configurações do sistema
   - Cliente e oportunidade de exemplo
   - Parceiros de exemplo

### 👤 Usuários de Teste (Criados Automaticamente)

| Perfil | Email | Senha | Permissões |
|--------|-------|-------|------------|
| **Admin** | `admin@sistema.com` | `admin123` | Acesso total ao sistema |
| **Diretor** | `diretor@sistema.com` | `diretor123` | Gestão comercial e relatórios |
| **Gerente** | `gerente@sistema.com` | `gerente123` | Gestão de equipe e propostas |
| **Vendedor** | `vendedor@sistema.com` | `vendedor123` | Criação de propostas |
| **Usuário** | `usuario@sistema.com` | `usuario123` | Acesso básico |

⚠️ **IMPORTANTE:** Altere estas credenciais em produção!

### 📊 Dados Iniciais Criados

- **Tabelas de Comissão:** Configuradas com valores padrão
- **Produtos:** 15+ produtos básicos (PABX, Fibra, Rádio, VMs)
- **Cliente Exemplo:** "Empresa Exemplo Ltda"
- **Oportunidade Exemplo:** "OPP-2024-001"
- **Parceiros:** 3 parceiros de exemplo
- **Configurações:** Sistema pré-configurado

## 📋 Variáveis de Ambiente

### Arquivos de Ambiente

| Arquivo | Uso | Quando é Carregado |
|---------|-----|-------------------|
| **`.env.development`** | ✅ Desenvolvimento | `./deploy.sh dev` |
| **`.env.production`** | ✅ Produção | `./deploy.sh prod` |
| **`.env.example`** | 📝 Template | Referência para criar novos |

### Variáveis Obrigatórias

```env
# Application
NODE_ENV=development
PORT=3000
NEXTAUTH_URL=http://localhost:3000

# Service Ports (configuráveis)
APP_PORT=3000              # Porta da aplicação
PGADMIN_PORT=8080          # Porta do PgAdmin
DATABASE_EXTERNAL_PORT=5432 # Porta externa do PostgreSQL

# Database
DATABASE_URL=postgresql://postgres:postgres_password@db:5432/simuladores_db
DATABASE_HOST=db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=simuladores_db

# PgAdmin Credentials
PGADMIN_DEFAULT_EMAIL=admin@your-domain.com
PGADMIN_DEFAULT_PASSWORD=your_pgadmin_password

# Security
NEXTAUTH_SECRET=your_secret_key_here
JWT_SECRET=your_jwt_secret_here

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Debug & Features
DEBUG=true
LOG_LEVEL=debug
ENABLE_DEBUG_ROUTES=true
ENABLE_TEST_DATA=true
```

### Gerar Senhas Fortes (Produção)

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# JWT_SECRET  
openssl rand -base64 32

# DATABASE_PASSWORD
openssl rand -base64 24

# PGADMIN_DEFAULT_PASSWORD
openssl rand -base64 16
```

### Tabela Completa de Variáveis

| Variável | Obrigatória | Desenvolvimento | Produção | Descrição |
|----------|-------------|-----------------|----------|-----------|
| `NODE_ENV` | ✅ | `development` | `production` | Ambiente de execução |
| `PORT` | ✅ | `3000` | `3000` | Porta interna |
| `NEXTAUTH_URL` | ✅ | `http://localhost:3000` | `https://dominio.com` | URL base |
| `APP_PORT` | ✅ | `3000` | `3000` | Porta externa |
| `DATABASE_URL` | ✅ | String conexão | String conexão | URL Prisma |
| `DATABASE_PASSWORD` | ✅ | `dev_password_123` | **SENHA FORTE** | Senha DB |
| `NEXTAUTH_SECRET` | ✅ | `dev_secret...` | **GERAR** | Secret NextAuth |
| `JWT_SECRET` | ✅ | `dev_jwt...` | **GERAR** | Secret JWT |
| `RESEND_API_KEY` | ✅ | `re_dev...` | `re_prod...` | API Resend |
| `DEBUG` | ✅ | `true` | `false` | Debug mode |

## 🐳 Docker

### Serviços Disponíveis

```bash
# Aplicação + Banco
./deploy.sh dev

# Com PgAdmin (administração)
./deploy.sh dev --admin

# Produção
./deploy.sh prod
```

### Acessos

- **Aplicação**: http://localhost:${APP_PORT}
- **PgAdmin**: http://localhost:${PGADMIN_PORT}
- **PostgreSQL**: localhost:${DATABASE_EXTERNAL_PORT}

### Comandos Úteis

```bash
# Ver logs
./deploy.sh logs

# Ver status
./deploy.sh status

# Backup do banco
./deploy.sh backup dev

# Restaurar backup
./deploy.sh restore --file backup.sql dev

# Parar tudo
./deploy.sh stop

# Limpeza completa
./deploy.sh clean --force
```

## 🗄️ Banco de Dados

### Estrutura Principal

- **auth.users** - Usuários do sistema
- **profiles** - Perfis e permissões
- **proposals** - Propostas comerciais
- **clientes** - Cadastro de clientes
- **oportunidades** - Gestão de oportunidades
- **commission_*** - Tabelas de comissões

### Comandos do Banco

```bash
# Deploy completo do zero
./scripts/deploy-fresh.sh

# Comandos individuais
npm run db:push     # Criar/atualizar estrutura
npm run db:seed     # Popular dados iniciais
npm run db:studio   # Abrir Prisma Studio
```

## 🚀 Deploy e Configuração

### Script Unificado de Deploy

```bash
# Ver ajuda completa
./deploy.sh --help

# Setup inicial (cria arquivos .env)
./deploy.sh install

# Desenvolvimento
./deploy.sh dev                    # Básico
./deploy.sh dev --admin            # Com PgAdmin

# Produção
./deploy.sh prod                   # Básico
./deploy.sh prod --nginx           # Com Nginx
./deploy.sh prod --admin           # Com PgAdmin

# Backup e restore
./deploy.sh backup dev             # Backup desenvolvimento
./deploy.sh backup prod            # Backup produção
./deploy.sh restore --file backup.sql dev

# Utilitários
./deploy.sh build --no-cache       # Build sem cache
./deploy.sh clean --force          # Limpeza completa
./deploy.sh logs                   # Ver logs
./deploy.sh status                 # Status dos serviços
```

## 🚀 Deploy em Produção

### ⚡ Deploy Rápido (3 Comandos)

```bash
# 1. Instalar sshpass (uma vez)
sudo apt install sshpass

# 2. Configurar .env.production (senhas e secrets)
nano .env.production
# Alterar: NEXTAUTH_URL, senhas, secrets, etc.

# 3. Deploy! (vai perguntar portas interativamente)
# Como root:
./deploy.sh deploy-remote root@seu-servidor.com image

# Como usuário comum (recomendado - usa sudo automaticamente):
./deploy.sh deploy-remote usuario@seu-servidor.com image

# Durante o deploy, o script vai:
# - Perguntar senha do servidor
# - Verificar portas em uso no servidor
# - Perguntar se deseja alterar portas
# - Fazer build e enviar imagens
# - Instalar no servidor
```

> **💡 Novo:** Agora suporta usuários não-root automaticamente! Veja [Deploy Não-Root](#-deploy-com-usuário-não-root)

### 📋 Checklist Antes do Deploy

- [ ] `sshpass` instalado
- [ ] `.env.production` configurado (sem CHANGE_THIS)
- [ ] Servidor acessível
- [ ] SSH funcionando
- [ ] Portas serão configuradas durante o deploy (interativo)

### 🖥️ Requisitos do Servidor

**Mínimo:**
- CPU: 2 cores
- RAM: 4GB
- Disco: 20GB
- SO: Linux (Ubuntu 20.04+, Debian 11+)
- Docker: 20.10+

**Recomendado:**
- CPU: 4 cores
- RAM: 8GB
- Disco: 50GB SSD

### Instalar Docker no Servidor

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl enable docker
sudo systemctl start docker

# Instalar Docker Compose Plugin (recomendado)
sudo apt update
sudo apt install docker-compose-plugin

# Verificar
docker --version
docker compose version
```

### 🔥 Firewall e Portas

```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 3009/tcp  # Aplicação (ajuste conforme APP_PORT configurado)
sudo ufw enable

# Verificar portas em uso no servidor
ss -tuln | grep LISTEN
# ou
netstat -tuln | grep LISTEN

# Verificar se a porta está acessível externamente
curl http://IP-DO-SERVIDOR:3009/api/health
```

### 🔐 Configuração do .env.production

```bash
# Application
NODE_ENV=production
NEXTAUTH_URL=https://seu-dominio.com  # ← Alterar!

# Database
DATABASE_PASSWORD=SENHA_FORTE  # ← Gerar senha forte!

# Security - GERAR COM: openssl rand -base64 32
NEXTAUTH_SECRET=GERAR_AQUI  # ← Gerar!
JWT_SECRET=GERAR_AQUI  # ← Gerar!

# Email
RESEND_API_KEY=re_sua_chave_aqui  # ← Configurar!

# Debug
DEBUG=false
ENABLE_DEBUG_ROUTES=false
ENABLE_TEST_DATA=false
```

### 📊 Comandos Úteis Pós-Deploy

```bash
# Ver status no servidor
ssh root@servidor 'docker ps'

# Ver logs
ssh root@servidor 'docker logs -f simuladores_app_prod'

# Reiniciar aplicação
ssh root@servidor 'docker restart simuladores_app_prod'

# Fazer backup
ssh root@servidor 'cd /root/simuladores && ./deploy.sh backup prod'

# Health check
curl http://IP-DO-SERVIDOR:3000/api/health
```

### 🔄 Atualizar Aplicação

```bash
# Rebuild completo
./deploy.sh deploy-remote root@servidor.com image

# Ou no servidor
ssh root@servidor
cd /root/simuladores
./deploy.sh stop
./deploy.sh clean --force
# (enviar novas imagens)
docker load -i simuladores-app.tar
./deploy.sh prod
```

### 💾 Backup e Restore

```bash
# Fazer backup
ssh root@servidor 'cd /root/simuladores && ./deploy.sh backup prod'

# Baixar backup
scp root@servidor:/root/simuladores/backups/backup_prod_*.sql ./

# Restaurar backup
./deploy.sh restore --file backup_prod_20231118_120000.sql prod
```

### 🔒 Checklist de Segurança

- [ ] Todas as senhas alteradas no .env.production
- [ ] NEXTAUTH_SECRET e JWT_SECRET gerados (32+ chars)
- [ ] DATABASE_PASSWORD forte (24+ chars)
- [ ] DEBUG=false
- [ ] ENABLE_DEBUG_ROUTES=false
- [ ] ENABLE_TEST_DATA=false
- [ ] Firewall configurado
- [ ] SSH com chave (não senha)
- [ ] Backup automático configurado

## 🔐 Deploy com Usuário Não-Root

O script agora suporta **automaticamente** deploy com usuários não-root, usando `sudo` quando necessário.

### 🎯 Vantagens

- ✅ **Mais seguro** - Não expõe credenciais root
- ✅ **Automático** - Detecta e usa sudo automaticamente
- ✅ **Flexível** - Funciona com qualquer usuário
- ✅ **Sem configuração** - Nenhuma mudança necessária

### 🚀 Como Usar

```bash
# Deploy com usuário comum (recomendado)
./deploy.sh deploy-remote usuario@servidor.com image

# Deploy com root (funciona também)
./deploy.sh deploy-remote root@servidor.com image
```

### 📁 Diferenças

| Aspecto | Root | Usuário Comum |
|---------|------|---------------|
| **Diretório** | `/root/simuladores` | `/home/usuario/simuladores` |
| **Comandos** | Direto | Com `sudo` |
| **Segurança** | ⚠️ Menos seguro | ✅ Mais seguro |

### 🔧 Preparar Servidor

```bash
# 1. Criar usuário (se necessário)
sudo adduser deploy

# 2. Adicionar permissões
sudo usermod -aG sudo deploy
sudo usermod -aG docker deploy

# 3. Testar permissões (recomendado)
chmod +x test-server-permissions.sh
./test-server-permissions.sh usuario@servidor
```


## 🚀 Guia Rápido de Deploy

### Tempo Estimado

- **Primeira vez:** ~15 minutos
  - Build: 3 min
  - Upload: 5-10 min
  - Instalação: 2 min

- **Próximas vezes:** ~10 minutos

### Após o Deploy

```bash
# 1. Verificar se está rodando
curl http://IP-SERVIDOR:3000/api/health

# 2. Acessar no navegador
http://IP-SERVIDOR:3000

# 3. Fazer login
# Email: admin@sistema.com
# Senha: admin123
# (ou use qualquer um dos usuários de teste listados acima)

# 4. Fazer backup
ssh root@servidor 'cd /root/simuladores && ./deploy.sh backup prod'
```

## 🔄 Atualização de Calculadores

### Sistema de IDs Padronizado

Os IDs das propostas seguem um padrão específico:
- PABX/SIP: `Prop_Pabx_Sip_001_v1`
- Máquinas Virtuais: `Prop_MV_001_v1`
- Internet Fibra: `Prop_Inter_Fibra_001_v1`
- Internet Rádio: `Prop_Inter_Radio_001_v1`
- Double Fibra/Rádio: `Prop_Inter_Double_001_v1`
- Internet MAN Fibra: `Prop_Inter_Man_001_v1`
- Internet MAN Rádio: `Prop_InterMan_Radio_001_v1`

### Como Atualizar um Calculador

```typescript
// 1. Adicionar import no topo do arquivo
import { generateNextProposalId } from '@/lib/proposal-id-generator';

// 2. Gerar o base_id antes de salvar
const baseId = generateNextProposalId(proposals, 'TIPO_AQUI', proposalVersion);

const proposalToSave = {
    base_id: baseId,  // <-- Adicionar esta linha
    title: `Proposta...`,
    // ... resto dos campos
};
```

## 👥 Perfis de Usuário

### Tipos de Acesso

- **Admin** - Acesso total ao sistema
- **Diretor** - Gestão comercial e relatórios
- **Gerente** - Gestão de equipe e propostas
- **Vendedor** - Calculadoras e propostas próprias
- **User** - Acesso básico às calculadoras

### Permissões por Módulo

| Módulo | Admin | Diretor | Gerente | Vendedor | User |
|--------|-------|---------|---------|----------|------|
| Calculadoras | ✅ | ✅ | ✅ | ✅ | ✅ |
| Propostas | ✅ | ✅ | ✅ | ✅ | ❌ |
| Comissões | ✅ | ✅ | ❌ | ❌ | ❌ |
| Usuários | ✅ | ❌ | ❌ | ❌ | ❌ |
| Relatórios | ✅ | ✅ | ✅ | ❌ | ❌ |

## 🔍 Troubleshooting

### Problemas Comuns

**Aplicação não conecta no banco:**
```bash
# Verificar se PostgreSQL está rodando
./deploy.sh status
./deploy.sh logs

# Testar conexão diretamente
docker exec simuladores_db_dev pg_isready -U postgres -d simuladores_dev
```

**Porta já em uso:**
```bash
# Alterar portas no arquivo .env
APP_PORT=3001
DATABASE_EXTERNAL_PORT=5433

# Ou parar serviços conflitantes
./deploy.sh stop
```

**Dados não aparecem:**
```bash
# Verificar se migration executou
./deploy.sh logs

# Verificar tabelas criadas
docker exec -it simuladores_db_dev psql -U postgres -d simuladores_dev -c "\dt"
```

**Erro: "sshpass não está instalado"**
```bash
sudo apt install sshpass
```

**Erro: "Senha incorreta ou conexão falhou"**
```bash
# Teste manual
ssh root@servidor

# Se funcionar, tente o deploy novamente
```

**Erro: "Variáveis não configuradas"**
```bash
# Verificar .env.production
grep CHANGE_THIS .env.production

# Se encontrar, edite e remova todos
nano .env.production
```

### Health Check

```bash
# Verificar status completo
./deploy.sh status

# Health check manual
curl http://localhost:3009/api/health
```

## 📁 Estrutura do Projeto

```
├── src/
│   ├── app/                 # Pages (App Router)
│   ├── components/          # Componentes React
│   │   ├── calculators/     # Calculadoras
│   │   ├── proposals/       # Gestão de propostas
│   │   └── dashboard/       # Dashboard
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilitários e configurações
│   └── styles/             # Estilos globais
├── prisma/                 # Prisma ORM
│   ├── schema.prisma       # Schema do banco
│   └── seed.ts             # Seed de dados
├── scripts/                # Scripts utilitários
│   ├── deploy.sh           # Script unificado de deploy
│   └── check-env.js        # Verificar variáveis de ambiente
└── docker-compose.*.yml    # Configurações Docker
```

## ✅ Melhorias Recentes

### Sistema de Descontos (Nov 2024)
- ✅ **Descontos aplicados corretamente**: Vendedor (5%) e Diretor (variável) agora debitam do total mensal
- ✅ **Exibição de descontos**: Resumo financeiro mostra descontos aplicados em todas as calculadoras
- ✅ **Descontos apenas no mensal**: Setup não recebe desconto (conforme regra de negócio)
- ✅ **Label indicativo**: Total Mensal mostra "(com desconto)" quando aplicável

### Permissionamento e Usuários
- ✅ **Permissões corrigidas**: Admin, Director e User com acessos corretos
- ✅ **Salvamento de perfil**: Edição de usuários funciona corretamente
- ✅ **Roles padronizados**: Uso consistente de 'admin', 'director', 'user'
- ✅ **Gestão de usuários**: Criar, editar e excluir funcionando

### Sistema de Propostas
- ✅ **Correção de IDs duplicados**: Sistema verifica e gera IDs únicos automaticamente
- ✅ **Filtro por gerente de contas**: Filtrar propostas por gerente com botão "Aplicar Filtro"
- ✅ **Coluna Produto**: Substituída coluna "Distribuidor" por "Produto" com nomes amigáveis
- ✅ **Campo account_manager**: Salvo corretamente no banco de dados
- ✅ **Exibição de dados**: Cliente, gerente e data exibidos corretamente

### Deploy e Infraestrutura
- ✅ **Configuração de portas**: Deploy pergunta portas interativamente
- ✅ **Link .env**: Criado automaticamente no servidor (.env → .env.production)
- ✅ **Acesso HTTP direto**: Sem dependência de Nginx/SSL
- ✅ **Proxy reverso opcional**: Documentação para Apache se necessário

### API e Banco de Dados
- ✅ **API otimizada**: Retorna todos os campos necessários
- ✅ **Transformação camelCase**: Conversão automática de snake_case para camelCase
- ✅ **Busca sem paginação**: Parâmetro `all=true` para buscar todas as propostas
- ✅ **Retry automático**: Tentativa com ID alternativo em caso de duplicata

### Documentação
- ✅ **README consolidado**: Toda documentação em um único arquivo
- ✅ **Guias de deploy**: Instruções completas para produção
- ✅ **Script de verificação**: `npm run check-env` para validar configuração

## 💻 Boas Práticas de Desenvolvimento

### Trabalhando com Propostas

#### Criar Nova Proposta
```typescript
// 1. Preencher dados do cliente e gerente
// 2. Adicionar produtos usando calculadoras
// 3. Aplicar descontos (se autorizado)
// 4. Clicar em "Salvar Proposta"
// Resultado: Nova proposta com ID único (ex: Prop_IF_001_v1)
```

#### Atualizar Proposta Existente
```typescript
// 1. Modificar produtos, preços ou descontos
// 2. Clicar em "Atualizar Proposta"
// Resultado: Mesma proposta atualizada (mantém ID)
// ⚠️ IMPORTANTE: Não cria nova versão, apenas atualiza
```

#### Criar Nova Versão
```typescript
// 1. Modificar proposta existente
// 2. Clicar em "Salvar como Nova Versão"
// Resultado: Nova proposta com ID incrementado (ex: Prop_IF_001_v2)
// ✅ Mantém histórico completo de versões
```

### Sistema de Descontos

#### Aplicação de Descontos
```typescript
// Ordem de aplicação (IMPORTANTE):
// 1. Desconto Vendedor (5%) - aplicado primeiro
// 2. Desconto Diretoria (0-100%) - aplicado depois

// Exemplo de cálculo:
const baseValue = 1000.00;
const withSalesperson = baseValue * 0.95;        // R$ 950,00
const withDirector = withSalesperson * 0.90;     // R$ 855,00 (10% diretor)
```

#### Armazenamento de Descontos
```typescript
// Sempre salvar no metadata da proposta:
metadata: {
  baseTotalMonthly: 1000.00,                    // Valor original
  applySalespersonDiscount: true,               // Desconto vendedor ativo
  appliedDirectorDiscountPercentage: 10,        // Percentual diretor
  changes: "Descrição das alterações"           // Histórico
}
```

### Estrutura de Código

#### Calculadoras
- Cada calculadora é um componente independente
- Usa hooks customizados para lógica de negócio
- Salva propostas via API `/api/proposals`
- Mantém estado local com React hooks

#### API Routes
- Seguem padrão REST (GET, POST, PUT, DELETE)
- Retornam sempre `{ success: boolean, data?: any, error?: string }`
- Suportam camelCase e snake_case nos campos
- Logs detalhados para debug

#### Banco de Dados
- Usa Prisma ORM com dual schema (auth, public)
- Sempre usar `prisma db push` (não migrations)
- Seed deve ser atualizado com novos dados
- Metadata em JSONB para flexibilidade

### Convenções de Código

#### Nomenclatura
```typescript
// Componentes: PascalCase
InternetFibraCalculator.tsx

// Funções: camelCase
const calculatePayback = () => {}

// Constantes: UPPER_SNAKE_CASE
const MAX_PAYBACK_MONTHS = 14;

// Tipos/Interfaces: PascalCase
interface ProposalData {}
```

#### Comentários
```typescript
// ✅ BOM: Comentários explicativos
/**
 * Calcula o payback considerando descontos aplicados.
 * 
 * @param installationFee - Taxa de instalação
 * @param monthlyRevenue - Receita mensal
 * @returns Número de meses para payback
 */

// ❌ RUIM: Comentários óbvios
// Incrementa contador
counter++;
```

#### Logs
```typescript
// ✅ BOM: Logs informativos com emojis
console.log('📝 Criando nova versão da proposta:', proposalId);
console.log('✅ Proposta salva com sucesso:', result);
console.error('❌ Erro ao salvar proposta:', error);

// ❌ RUIM: Logs genéricos
console.log('salvando');
console.log('erro');
```

### Testes (Quando Solicitado)

```bash
# Executar testes
npm test

# Testes com coverage
npm run test:coverage

# Testes específicos
npm test -- InternetFibraCalculator
```

⚠️ **IMPORTANTE:** Não criar testes automaticamente. Apenas quando explicitamente solicitado pelo usuário.

### Documentação

#### README.md
- **Única fonte de verdade** para documentação
- Não criar arquivos separados (CHANGELOG.md, CONTRIBUTING.md, etc.)
- Atualizar sempre que adicionar features

#### Código
- Comentários em português (idioma do projeto)
- Documentar lógica complexa de negócio
- Explicar decisões não óbvias

### Deploy

#### Script Unificado
- **deploy.sh** é o único script de deploy
- Não criar scripts separados (build.sh, backup.sh, etc.)
- Adicionar funcionalidades ao deploy.sh se necessário

#### Ambientes
```bash
# Desenvolvimento - Iteração rápida
./deploy.sh dev

# Testes - Ambiente isolado
./deploy.sh test

# Produção - Deploy final
./deploy.sh deploy-remote user@server image
```

### Segurança

#### Senhas e Secrets
```bash
# ✅ BOM: Gerar senhas fortes
openssl rand -base64 32

# ❌ RUIM: Senhas fracas
password123
admin
```

#### Variáveis de Ambiente
```bash
# ✅ BOM: Usar variáveis de ambiente
const secret = process.env.JWT_SECRET;

# ❌ RUIM: Hardcoded
const secret = "my-secret-key";
```

### Performance

#### Otimizações
- Usar `useMemo` para cálculos pesados
- Usar `useCallback` para funções em props
- Usar `memo` para componentes que não mudam frequentemente
- Debounce em inputs de busca

#### Banco de Dados
- Usar índices em campos de busca frequente
- Limitar resultados com paginação
- Usar `select` para buscar apenas campos necessários

## 📄 Licença

Este projeto é propriedade privada. Todos os direitos reservados.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato com a equipe de desenvolvimento.

---

**Sistema desenvolvido para otimização de processos comerciais e precificação de serviços de TI.**


## 🌐 Acesso HTTP e HTTPS (Opcional)

### Acesso Direto (Padrão)

Por padrão, a aplicação é acessível diretamente via HTTP na porta configurada:

```bash
# Exemplo com porta 3009
http://IP-DO-SERVIDOR:3009
http://simulador-dre.doubletelecom.com.br:3009
```

### Proxy Reverso com Apache (Opcional)

Se você quiser acesso sem porta (HTTP na 80 e HTTPS na 443), configure um proxy reverso:

#### Instalar Apache

```bash
sudo apt update
sudo apt install apache2
sudo a2enmod proxy proxy_http ssl rewrite headers
```

#### Configurar Site

```bash
# Criar configuração
sudo nano /etc/apache2/sites-available/simulador-dre.conf
```

```apache
<VirtualHost *:80>
    ServerName simulador-dre.doubletelecom.com.br
    
    # Proxy para aplicação
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3009/
    ProxyPassReverse / http://127.0.0.1:3009/
    
    # Headers
    RequestHeader set X-Forwarded-Proto "http"
    RequestHeader set X-Forwarded-Port "80"
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/simulador-dre-error.log
    CustomLog ${APACHE_LOG_DIR}/simulador-dre-access.log combined
</VirtualHost>

# HTTPS (se tiver certificado SSL)
<VirtualHost *:443>
    ServerName simulador-dre.doubletelecom.com.br
    
    # SSL (ajuste os caminhos dos certificados)
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/simulador-dre.crt
    SSLCertificateKeyFile /etc/ssl/private/simulador-dre.key
    
    # Proxy para aplicação
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3009/
    ProxyPassReverse / http://127.0.0.1:3009/
    
    # Headers
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/simulador-dre-ssl-error.log
    CustomLog ${APACHE_LOG_DIR}/simulador-dre-ssl-access.log combined
</VirtualHost>
```

#### Ativar Site

```bash
# Ativar configuração
sudo a2ensite simulador-dre.conf

# Testar configuração
sudo apache2ctl configtest

# Recarregar Apache
sudo systemctl reload apache2

# Verificar status
sudo systemctl status apache2
```

#### Certificado SSL com Let's Encrypt (Opcional)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-apache

# Obter certificado
sudo certbot --apache -d simulador-dre.doubletelecom.com.br

# Renovação automática já está configurada
```

### Alternativa: Cloudflare

Se não quiser gerenciar SSL localmente, use Cloudflare:

1. Adicione seu domínio no Cloudflare
2. Configure DNS para apontar para seu servidor
3. Ative "Proxy" (nuvem laranja)
4. Cloudflare fornece SSL automaticamente
5. Configure "SSL/TLS" como "Flexible" ou "Full"

## 🔥 Deploy Limpo no Servidor

### Quando Usar

Use este procedimento quando precisar:
- Reconstruir tudo do zero
- Aplicar correções críticas
- Resolver problemas de banco de dados
- Limpar ambiente completamente

### ⚠️ IMPORTANTE

Este processo **apaga todos os dados**. Faça backup antes!

### Passo a Passo

#### 1. Backup e Limpeza no Servidor

```bash
# Conectar no servidor
ssh double@10.10.50.246

# Navegar até o diretório
cd simuladores

# Fazer backup
sudo ./deploy.sh backup prod

# Copiar backup para local seguro
cp backups/backup_prod_*.sql ~/backup_antes_deploy_limpo.sql

# Limpeza COMPLETA (apaga tudo)
sudo ./deploy.sh clean-server --hard
# Confirme digitando: DELETE

# Verificar limpeza
docker ps -a
docker images
docker volume ls

# Sair
exit
```

#### 2. Build e Deploy (Máquina Local)

```bash
# Verificar .env.production
cat .env.production | grep -E "NEXTAUTH_URL|DATABASE_PASSWORD"

# Build das imagens (2-3 min)
ENVIRONMENT=prod ./deploy.sh build --no-cache

# Deploy remoto (5-10 min)
./deploy.sh deploy-remote double@10.10.50.246 image
```

#### 3. Instalação no Servidor

```bash
# Conectar novamente
ssh double@10.10.50.246
cd simuladores

# Instalar (cria banco, usuários, etc)
sudo ./deploy.sh install-on-server
# Responda: y para carregar imagens, y para parar containers

# Verificar
docker ps
curl http://localhost:3009/api/health

# Ver logs
docker logs simuladores_app_prod --tail=50
```

#### 4. Verificar Acesso

```bash
# Verificar porta configurada
grep APP_PORT .env.production

# Testar acesso direto
curl http://localhost:3009/api/health

# Verificar firewall
sudo ufw status
```

#### 5. Teste Final

```bash
# Abrir navegador (ajuste a porta conforme configurado)
firefox http://IP-DO-SERVIDOR:3009

# Ou se tiver DNS configurado:
firefox http://simulador-dre.doubletelecom.com.br:3009

# Login: admin@sistema.com / admin123

# Testar:
# - Criar usuário
# - Editar usuário
# - Recarregar página (F5)
# - Verificar se alterações persistiram
```

### Troubleshooting Deploy Limpo

**Imagens não encontradas:**
```bash
docker images | grep simuladores
# Se vazio, refazer deploy remoto
```

**Container não inicia:**
```bash
docker logs simuladores_app_prod
docker exec simuladores_app_prod env | grep DATABASE_URL
```

**Banco não conecta:**
```bash
docker exec simuladores_db_prod pg_isready -U postgres
```

**Usuários não salvam:**
```bash
# Ver logs
docker logs simuladores_app_prod --tail=100 | grep -i "user\|profile"

# Verificar tabelas
docker exec simuladores_db_prod psql -U postgres -d simuladores_prod -c "\dt public.*"
```

### Comandos Úteis Pós-Deploy

```bash
# Logs em tempo real
ssh double@10.10.50.246 'docker logs -f simuladores_app_prod'

# Reiniciar
ssh double@10.10.50.246 'docker restart simuladores_app_prod'

# Backup
ssh double@10.10.50.246 'cd simuladores && sudo ./deploy.sh backup prod'

# Status
ssh double@10.10.50.246 'docker ps'
```
