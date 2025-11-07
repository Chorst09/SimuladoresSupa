# Sistema de Simuladores e Calculadoras TI

Sistema completo de calculadoras e simuladores para precificação de serviços de TI, com gestão de propostas comerciais e sistema de comissões.

## 🚀 Funcionalidades Principais

### Calculadoras
- **Máquinas Virtuais (VM)** - Precificação de infraestrutura virtualizada
- **Internet Fibra** - Cálculos para conectividade fibra óptica
- **Internet Rádio** - Precificação de links de rádio
- **PABX/SIP** - Simulador de telefonia IP
- **Internet MAN** - Calculadora para redes metropolitanas
- **Dupla (Fibra + Rádio)** - Redundância de conectividade

### Gestão Comercial
- **Propostas Comerciais** - Geração e gestão de propostas
- **Sistema de Comissões** - Cálculo automático de comissões
- **DRE (Demonstrativo de Resultado)** - Análise financeira
- **Gestão de Oportunidades** - CRM integrado
- **Análise de Editais** - Ferramenta para licitações

### Administração
- **Gestão de Usuários** - Controle de acesso por perfis
- **Relatórios** - Dashboard com métricas e KPIs
- **Configurações** - Parâmetros do sistema

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: Sistema próprio com JWT
- **Containerização**: Docker/Podman + Compose
- **Testes**: Jest, Testing Library

### Compatibilidade de Containers

O projeto suporta tanto **Docker** quanto **Podman**:

- **Podman** (preferência): Detectado automaticamente se disponível
- **Docker**: Fallback se Podman não estiver instalado
- **Detecção automática**: O script `deploy.sh` escolhe automaticamente

## 📦 Instalação e Configuração

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
cp .env.example .env
# Editar .env com suas configurações

# 3. Executar com Docker
docker-compose up -d

# 4. Acessar aplicação
# http://localhost:3000
```

### Configuração Manual

```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco PostgreSQL
docker-compose up -d db

# 3. Executar aplicação
npm run dev
```

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente (.env)

```env
# Application
NODE_ENV=development
PORT=3000
NEXTAUTH_URL=http://localhost:3000

# Service Ports (configuráveis)
APP_PORT=3000              # Porta da aplicação
PGADMIN_PORT=8080          # Porta do PgAdmin
DATABASE_EXTERNAL_PORT=5432 # Porta externa do PostgreSQL
NGINX_HTTP_PORT=80         # Porta HTTP do Nginx (produção)
NGINX_HTTPS_PORT=443       # Porta HTTPS do Nginx (produção)

# Database
DATABASE_URL=postgresql://postgres:postgres_password@localhost:5432/simuladores_db
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
```

### Configuração de Portas

Para alterar as portas dos serviços, edite as variáveis no arquivo `.env`:

```bash
# Exemplo: Usar porta 3001 para aplicação
APP_PORT=3001

# Exemplo: Usar porta 8081 para PgAdmin  
PGADMIN_PORT=8081

# Exemplo: Usar porta 5433 para PostgreSQL
DATABASE_EXTERNAL_PORT=5433
```

### Usuário Admin Padrão

```
Email: admin@sistema.com
Senha: admin123
```

⚠️ **Altere estas credenciais em produção!**

## 🐳 Docker

### Serviços Disponíveis

```bash
# Aplicação + Banco
docker-compose up -d

# Apenas banco (desenvolvimento local)
docker-compose up -d db

# Com PgAdmin (administração)
docker-compose --profile admin up -d
```

### Acessos

- **Aplicação**: http://localhost:${APP_PORT} (configurável via .env)
- **PgAdmin**: http://localhost:${PGADMIN_PORT} (configurável via .env)
- **PostgreSQL**: localhost:${DATABASE_EXTERNAL_PORT} (configurável via .env)

**Credenciais são definidas nos arquivos .env**

### Comandos Úteis

```bash
# Ver logs
docker-compose logs -f app

# Backup do banco
docker-compose exec db pg_dump -U postgres simuladores_db > backup.sql

# Restaurar backup
docker-compose exec -T db psql -U postgres simuladores_db < backup.sql

# Parar tudo
docker-compose down

# Rebuild
docker-compose build app && docker-compose up -d app
```

## 🗄️ Banco de Dados

### Estrutura Principal

- **auth.users** - Usuários do sistema
- **profiles** - Perfis e permissões
- **proposals** - Propostas comerciais
- **clientes** - Cadastro de clientes
- **oportunidades** - Gestão de oportunidades
- **commission_*** - Tabelas de comissões

### Banco de Dados PostgreSQL

O sistema usa PostgreSQL com Prisma ORM. O banco é criado automaticamente do zero:

```bash
# Deploy completo do zero (desenvolvimento)
./scripts/deploy-fresh.sh

# Ou apenas configurar o banco
./scripts/setup-database.sh

# Comandos individuais
npm run db:push     # Criar/atualizar estrutura
npm run db:seed     # Popular dados iniciais
npm run db:studio   # Abrir Prisma Studio
```

**✅ MIGRAÇÃO COMPLETA:**
- ✅ **Supabase REMOVIDO** - 100% PostgreSQL + Prisma
- ✅ **Schema consolidado** - `prisma/schema.prisma`
- ✅ **Dados iniciais** - `prisma/seed.ts`
- ✅ **Deploy automatizado** - Scripts prontos

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

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Coverage
npm run test:coverage

# Testes específicos
npm run test:commission
```

## 📁 Estrutura do Projeto

```
├── src/
│   ├── app/                 # Pages (App Router)
│   ├── components/          # Componentes React
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilitários e configurações
│   └── styles/             # Estilos globais
├── database/
│   └── init/               # Scripts PostgreSQL (apenas 2 arquivos)
│       ├── 01-migration.sql    # Migração completa
│       └── 02-seeds.sql        # Dados iniciais
├── scripts/                # Scripts utilitários
├── docs/legacy/            # Documentação histórica
└── backup/                 # Backups e arquivos antigos
    └── database-old/       # Arquivos SQL antigos
```

## 🚀 Deploy e Configuração

### Script Unificado de Deploy

O projeto inclui um script `deploy.sh` que centraliza todas as operações:

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

### Configuração de Ambientes

#### 1. Setup Inicial
```bash
# Executar apenas uma vez
./deploy.sh install
```

Isso cria:
- `.env.development` - Configurações de desenvolvimento
- `.env.production` - Configurações de produção (ALTERE AS SENHAS!)
- Diretórios necessários (backups, logs, nginx/ssl)

#### 2. Desenvolvimento
```bash
# Editar .env.development se necessário
./deploy.sh dev --admin
```

**Acessos:**
- Aplicação: http://localhost:${APP_PORT} (padrão: 3000)
- PgAdmin: http://localhost:${PGADMIN_PORT} (padrão: 8080)
- PostgreSQL: localhost:${DATABASE_EXTERNAL_PORT} (padrão: 5432)

**Credenciais PgAdmin (desenvolvimento):**
- Email: ${PGADMIN_DEFAULT_EMAIL} (padrão: dev@simuladores.local)
- Senha: ${PGADMIN_DEFAULT_PASSWORD} (padrão: dev123)

#### 3. Produção
```bash
# IMPORTANTE: Editar .env.production ANTES do deploy
# Alterar TODAS as senhas e chaves secretas!
./deploy.sh prod --nginx
```

**Verificações de Segurança:**
- ⚠️ **OBRIGATÓRIO**: Alterar `DATABASE_PASSWORD`
- ⚠️ **OBRIGATÓRIO**: Alterar `NEXTAUTH_SECRET` (32+ caracteres)
- ⚠️ **OBRIGATÓRIO**: Alterar `JWT_SECRET` (32+ caracteres)
- ⚠️ **OBRIGATÓRIO**: Alterar `PGADMIN_DEFAULT_PASSWORD`
- ⚠️ **OBRIGATÓRIO**: Configurar `NEXTAUTH_URL` com domínio real

### Migração e Seed do Banco

O banco é configurado automaticamente durante o primeiro start com apenas 2 arquivos:

```bash
database/init/
├── 01-migration.sql     # Migração completa (schema, tabelas, funções, índices)
└── 02-seeds.sql         # Dados iniciais (usuário admin, comissões, exemplos)
```

**Estrutura Simplificada:**
- ✅ **Apenas 2 arquivos SQL**: Migração completa + Seeds
- ✅ **Sem poluição**: Arquivos antigos movidos para `backup/database-old/`
- ✅ **Execução automática**: PostgreSQL executa na ordem correta

**Usuário Admin Padrão:**
- Email: `admin@sistema.com`
- Senha: `admin123`

### Backup Automático

```bash
# Backup manual
./deploy.sh backup dev     # ou prod

# Backup automático (adicionar ao cron)
0 2 * * * /path/to/project/deploy.sh backup prod
```

Backups são salvos em `backups/` e mantidos por 7 dias.

## 🔍 Troubleshooting

### Problemas Comuns

**Aplicação não conecta no banco:**
```bash
# Verificar se PostgreSQL está rodando
./deploy.sh status
./deploy.sh logs

# Testar conexão diretamente
podman exec simuladores_db_dev pg_isready -U postgres -d simuladores_dev
# ou com docker:
docker exec simuladores_db_dev pg_isready -U postgres -d simuladores_dev
```

**Porta já em uso:**
```bash
# Alterar portas no arquivo .env
APP_PORT=3001              # Aplicação na porta 3001
PGADMIN_PORT=8081          # PgAdmin na porta 8081
DATABASE_EXTERNAL_PORT=5433 # PostgreSQL na porta 5433

# Ou parar serviços conflitantes
./deploy.sh stop
```

**Dados não aparecem:**
```bash
# Verificar se migration executou
./deploy.sh logs
# Verificar tabelas criadas
podman exec -it simuladores_db_dev psql -U postgres -d simuladores_dev -c "\dt"
```

**Problemas com Podman:**
```bash
# Se Podman não funcionar, forçar uso do Docker
export CONTAINER_ENGINE=docker
./deploy.sh dev

# Verificar se socket do Podman está ativo
systemctl --user status podman.socket
```

### Health Check

```bash
# Verificar status completo
./deploy.sh status

# Health check manual
curl http://localhost:3000/api/health
```

## 📚 Documentação Adicional

- **Documentação Legacy**: `docs/legacy/` - Documentação histórica consolidada
- **Scripts Legacy**: `scripts/legacy/` - Scripts antigos e utilitários
- **Backup SQL**: `backup/sql-files-removed/` - Arquivos SQL antigos

> **Nota**: Toda documentação foi consolidada neste README.md único para evitar poluição de arquivos .md espalhados pelo projeto.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade privada. Todos os direitos reservados.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema, consulte a documentação em `docs/legacy/` ou entre em contato com a equipe de desenvolvimento.

---

## ✅ Melhorias Implementadas

### Consolidação de Documentação
- ✅ **README.md único**: Toda documentação consolidada em um arquivo
- ✅ **Documentação legacy**: Arquivos antigos movidos para `docs/legacy/`
- ✅ **Sem poluição**: Eliminados arquivos .md espalhados pelo projeto

### Configuração de Ambientes
- ✅ **Variáveis .env**: Configuração correta para desenvolvimento e produção
- ✅ **Migração automática**: Scripts SQL executados automaticamente na inicialização
- ✅ **Seed de dados**: Usuário admin e dados iniciais criados automaticamente
- ✅ **Verificações de segurança**: Validação de senhas em produção

### Banco de Dados Simplificado
- ✅ **Apenas 2 arquivos SQL**: Migração completa + Seeds consolidados
- ✅ **Sem poluição**: Múltiplos arquivos .sql movidos para backup
- ✅ **Estrutura limpa**: `database/init/` com apenas o essencial
- ✅ **Backup preservado**: Arquivos antigos em `backup/database-old/`

### Compatibilidade de Containers
- ✅ **Suporte Podman**: Detecção automática e preferência por Podman
- ✅ **Fallback Docker**: Compatibilidade mantida com Docker
- ✅ **Script unificado**: Um comando para todas as operações

### Deploy Automatizado
- ✅ **Deploy script**: `./deploy.sh` centraliza todas as operações
- ✅ **Ambientes separados**: Configurações distintas para dev/prod
- ✅ **Backup automático**: Sistema de backup integrado
- ✅ **Health checks**: Monitoramento de saúde dos serviços

---

## 🎯 Resumo das Melhorias

### ✅ Documentação Consolidada
- **README.md único** na raiz do projeto
- **Documentação legacy** movida para `docs/legacy/`
- **Sem arquivos .md espalhados** poluindo o código

### ✅ Banco de Dados Simplificado  
- **Apenas 2 arquivos SQL**: `01-migration.sql` + `02-seeds.sql`
- **15+ arquivos antigos** movidos para `backup/database-old/`
- **Estrutura limpa** em `database/init/`

### ✅ Deploy Automatizado
- **Script unificado** `./deploy.sh` para todas as operações
- **Suporte Podman/Docker** com detecção automática
- **Configuração por ambiente** (.env.development / .env.production)

### ✅ Configuração Correta
- **Variáveis de ambiente** carregadas corretamente
- **Migração automática** na inicialização do container
- **Seed automático** com usuário admin e dados iniciais

### ✅ Portas Configuráveis
- **Todas as portas** definidas via variáveis .env
- **Flexibilidade total** para evitar conflitos
- **Configuração por ambiente** (dev/prod independentes)

**Sistema desenvolvido para otimização de processos comerciais e precificação de serviços de TI.**
