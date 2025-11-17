# Sistema de Simuladores e Calculadoras TI

Sistema completo de calculadoras e simuladores para precificação de serviços de TI, com gestão de propostas comerciais e sistema de comissões.

## � Índicoe

- [Funcionalidades](#-funcionalidades-principais)
- [Tecnologias](#️-tecnologias)
- [Instalação](#-instalação-e-configuração)
- [Configuração](#-configuração-do-ambiente)
- [Docker](#-docker)
- [Banco de Dados](#️-banco-de-dados)
- [Deploy](#-deploy-e-configuração)
- [Deploy Vercel](#-deploy-no-vercel)
- [Migração Docker para Produção](#-migração-docker-para-produção)
- [Atualização de Calculadores](#-atualização-de-calculadores)
- [Perfis de Usuário](#-perfis-de-usuário)
- [Testes](#-testes)
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
- **Propostas Comerciais** - Geração e gestão de propostas
- **Sistema de Comissões** - Cálculo automático de comissões
- **DRE (Demonstrativo de Resultado)** - Análise financeira
- **Gestão de Oportunidades** - CRM integrado
- **Análise de Editais** - Ferramenta para licitações
- **Filtro por Gerente de Contas** - Filtrar propostas por gerente

### Administração
- **Gestão de Usuários** - Controle de acesso por perfis
- **Relatórios** - Dashboard com métricas e KPIs
- **Configurações** - Parâmetros do sistema

## �️I Tecnologias

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

## 🌐 Deploy no Vercel

### Opções de Banco de Dados para Produção

#### Opção 1: Vercel Postgres (Recomendado - Mais Simples)
✅ Integração nativa com Vercel  
✅ Configuração automática  
✅ Plano gratuito disponível

**Como configurar:**
1. Acesse seu projeto no Vercel
2. Vá em **Storage** > **Create Database**
3. Escolha **Postgres**
4. Clique em **Continue** e depois **Create**
5. As variáveis de ambiente serão configuradas automaticamente!

#### Opção 2: Supabase (Mais Recursos)
✅ Plano gratuito: 500 MB de armazenamento  
✅ Interface de administração  
✅ Backups automáticos

**Como configurar:**
1. Crie uma conta em: https://supabase.com
2. Crie um novo projeto
3. Vá em **Settings** > **Database**
4. Copie a **Connection string** (Transaction Mode - porta 6543)

#### Opção 3: Neon (Serverless)
✅ Serverless (escala automaticamente)  
✅ Plano gratuito: 512 MB

**Como configurar:**
1. Crie uma conta em: https://neon.tech
2. Crie um novo projeto
3. Copie a connection string

### Configurar Variáveis de Ambiente no Vercel

1. Acesse: https://vercel.com/seu-usuario/seu-projeto/settings/environment-variables

2. Adicione as variáveis:

```env
DATABASE_URL=sua-connection-string-aqui
NEXTAUTH_SECRET=sua-secret-key-aleatoria
NEXTAUTH_URL=https://seu-projeto.vercel.app
NODE_ENV=production
```

### Migrar Schema para Produção

```bash
# 1. Criar arquivo .env.production
echo 'DATABASE_URL="sua-connection-string-aqui"' > .env.production

# 2. Sincronizar schema
npx dotenv -e .env.production -- npx prisma db push

# 3. Gerar Prisma Client
npx prisma generate
```

### Fazer Redeploy no Vercel

1. Vá em **Deployments**
2. Clique em **Redeploy** no último deployment
3. **Desmarque** "Use existing Build Cache"
4. Clique em **Redeploy**

### Troubleshooting Vercel

**Erro: "Can't reach database server"**
- ✅ Verifique se `DATABASE_URL` está configurada no Vercel
- ✅ Verifique se a connection string está correta
- ✅ Adicione `?sslmode=require` no final da URL

**Erro: "Too many connections"**
- ✅ Use connection pooling (porta 6543 no Supabase)
- ✅ Adicione `?pgbouncer=true` na connection string

## 🐳 Migração Docker para Produção

### Situação
- **Desenvolvimento:** PostgreSQL rodando no Docker (localhost:5432)
- **Produção:** Vercel precisa de banco hospedado na nuvem

### Solução Rápida

1. **Criar banco no Vercel:**
   - Acesse: https://vercel.com/dashboard
   - Selecione seu projeto
   - Vá em **Storage** > **Create Database**
   - Escolha **Postgres** > **Continue** > **Create**
   - ✅ Variáveis configuradas automaticamente!

2. **Migrar schema:**
   ```bash
   # Criar .env.production com a connection string do Vercel
   echo 'DATABASE_URL="sua-connection-string-vercel"' > .env.production
   
   # Migrar schema
   npx dotenv -e .env.production -- npx prisma db push
   ```

3. **Redeploy no Vercel:**
   - Vá em **Deployments**
   - Clique em **Redeploy**
   - Desmarque "Use existing Build Cache"
   - Clique em **Redeploy**

### Exportar/Importar Dados do Docker

```bash
# 1. Exportar dados do Docker
docker exec simuladores_db pg_dump -U postgres -d simuladores_db --clean --if-exists > backup.sql

# 2. Importar para produção
psql "sua-connection-string-producao" < backup.sql
```

### Comandos Úteis

```bash
# Testar conexão com banco de produção
npx dotenv -e .env.production -- npx prisma db pull

# Ver dados no Prisma Studio
npx dotenv -e .env.production -- npx prisma studio

# Backup do banco de produção
pg_dump "sua-connection-string" > backup-producao.sql
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

### Tipos Disponíveis

```typescript
type ProposalType = 
  | 'PABX'           // Prop_Pabx_Sip_001_v1
  | 'VM'             // Prop_MV_001_v1
  | 'FIBER'          // Prop_Inter_Fibra_001_v1
  | 'RADIO'          // Prop_Inter_Radio_001_v1
  | 'DOUBLE'         // Prop_Inter_Double_001_v1
  | 'INTERNET_MAN_FIBRA'  // Prop_Inter_Man_001_v1
  | 'MANRADIO';      // Prop_InterMan_Radio_001_v1
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
docker exec -it simuladores_db_dev psql -U postgres -d simuladores_dev -c "\dt"
```

**Erro de base_id duplicado:**
- ✅ Sistema agora verifica IDs únicos automaticamente
- ✅ Busca todas as propostas para evitar duplicatas
- ✅ Retry automático com ID alternativo

**Filtro por gerente não funciona:**
- ✅ Certifique-se de que o campo `accountManager` está sendo salvo
- ✅ Clique em "Aplicar Filtro" após selecionar o gerente
- ✅ Verifique os logs do console para debug

### Health Check

```bash
# Verificar status completo
./deploy.sh status

# Health check manual
curl http://localhost:3000/api/health
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
├── database/
│   └── init/               # Scripts PostgreSQL
│       ├── 01-migration.sql    # Migração completa
│       └── 02-seeds.sql        # Dados iniciais
├── scripts/                # Scripts utilitários
│   ├── deploy.sh           # Script unificado de deploy
│   ├── check-env.js        # Verificar variáveis de ambiente
│   └── setup-database.sh   # Configurar banco
└── prisma/                 # Prisma ORM
    ├── schema.prisma       # Schema do banco
    └── seed.ts             # Seed de dados
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade privada. Todos os direitos reservados.

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o sistema, entre em contato com a equipe de desenvolvimento.

---

## ✅ Melhorias Recentes

### Sistema de Propostas
- ✅ **Correção de IDs duplicados**: Sistema verifica e gera IDs únicos automaticamente
- ✅ **Filtro por gerente de contas**: Filtrar propostas por gerente com botão "Aplicar Filtro"
- ✅ **Coluna Produto**: Substituída coluna "Distribuidor" por "Produto" com nomes amigáveis
- ✅ **Campo account_manager**: Salvo corretamente no banco de dados
- ✅ **Exibição de dados**: Cliente, gerente e data exibidos corretamente

### API e Banco de Dados
- ✅ **API otimizada**: Retorna todos os campos necessários (client, account_manager, version)
- ✅ **Transformação camelCase**: Conversão automática de snake_case para camelCase
- ✅ **Busca sem paginação**: Parâmetro `all=true` para buscar todas as propostas
- ✅ **Retry automático**: Tentativa com ID alternativo em caso de duplicata

### Documentação
- ✅ **README consolidado**: Toda documentação em um único arquivo
- ✅ **Guias de deploy**: Instruções completas para Vercel e produção
- ✅ **Script de verificação**: `npm run check-env` para validar configuração

**Sistema desenvolvido para otimização de processos comerciais e precificação de serviços de TI.**
