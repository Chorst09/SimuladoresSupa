# Configuração do Vercel - Variáveis de Ambiente

## Problema
O erro `Can't reach database server at localhost:5432` indica que o Prisma está tentando se conectar ao banco de dados local (Docker) em vez do banco de produção.

## Contexto
- **Desenvolvimento Local:** PostgreSQL rodando no Docker (localhost:5432)
- **Produção (Vercel):** Precisa de um banco de dados PostgreSQL hospedado na nuvem

## Opções de Banco de Dados para Produção

### Opção 1: Vercel Postgres (Recomendado - Mais Simples)
✅ Integração nativa com Vercel
✅ Configuração automática
✅ Plano gratuito disponível

**Como configurar:**
1. Acesse seu projeto no Vercel
2. Vá em **Storage** > **Create Database**
3. Escolha **Postgres**
4. Clique em **Continue** e depois **Create**
5. As variáveis de ambiente serão configuradas automaticamente!

### Opção 2: Supabase (Recomendado - Mais Recursos)
✅ Plano gratuito generoso
✅ Interface de administração
✅ Backups automáticos
✅ APIs REST e Realtime

**Como configurar:**
1. Crie uma conta em: https://supabase.com
2. Crie um novo projeto
3. Vá em **Settings** > **Database**
4. Copie a **Connection string** (Transaction Mode - porta 6543)

### Opção 3: Neon (Serverless PostgreSQL)
✅ Serverless (escala automaticamente)
✅ Plano gratuito
✅ Ótima performance

**Como configurar:**
1. Crie uma conta em: https://neon.tech
2. Crie um novo projeto
3. Copie a connection string

### Opção 4: Railway
✅ Fácil de usar
✅ Plano gratuito
✅ Suporte a Docker

**Como configurar:**
1. Crie uma conta em: https://railway.app
2. Crie um novo projeto PostgreSQL
3. Copie a connection string

### Opção 5: Render
✅ Plano gratuito
✅ Fácil configuração

**Como configurar:**
1. Crie uma conta em: https://render.com
2. Crie um novo PostgreSQL database
3. Copie a connection string

## Solução

### 1. Configurar Variáveis de Ambiente no Vercel

Acesse o painel do Vercel e configure as seguintes variáveis de ambiente:

#### Passo a passo:
1. Acesse: https://vercel.com/seu-usuario/seu-projeto/settings/environment-variables
2. Adicione as seguintes variáveis:

#### Variáveis Obrigatórias:

```
DATABASE_URL
```
**Valor:** Connection string do seu banco de dados em produção

**Exemplos:**

**Vercel Postgres:**
```
postgres://default:[PASSWORD]@[HOST]-pooler.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require
```

**Supabase:**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Neon:**
```
postgresql://[USER]:[PASSWORD]@[HOST].neon.tech/[DATABASE]?sslmode=require
```

**Railway:**
```
postgresql://postgres:[PASSWORD]@[HOST].railway.app:5432/railway
```

**Render:**
```
postgresql://[USER]:[PASSWORD]@[HOST].render.com/[DATABASE]
```

```
DIRECT_URL
```
**Valor:** Connection string direta (opcional, apenas se usar Supabase com pooling)
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

```
NEXTAUTH_SECRET
```
**Valor:** String aleatória segura (pode gerar com: `openssl rand -base64 32`)

```
NEXTAUTH_URL
```
**Valor:** URL do seu projeto no Vercel
```
https://seu-projeto.vercel.app
```

```
NODE_ENV
```
**Valor:** `production`

### 2. Migrar o Banco de Dados para Produção

Após criar o banco de dados em produção, você precisa criar as tabelas:

#### Opção A: Usando Prisma Migrate (Recomendado)

```bash
# 1. Configure a DATABASE_URL de produção localmente (temporariamente)
export DATABASE_URL="sua-connection-string-de-producao"

# 2. Execute as migrations
npx prisma migrate deploy

# 3. (Opcional) Popular com dados iniciais
npx prisma db seed
```

#### Opção B: Usando Prisma Push (Mais Rápido)

```bash
# 1. Configure a DATABASE_URL de produção localmente (temporariamente)
export DATABASE_URL="sua-connection-string-de-producao"

# 2. Sincronize o schema
npx prisma db push

# 3. (Opcional) Popular com dados iniciais
npx prisma db seed
```

#### Opção C: Exportar/Importar do Docker

```bash
# 1. Exportar dados do Docker
docker exec simuladores_db pg_dump -U postgres simuladores_db > backup.sql

# 2. Importar para produção (exemplo com psql)
psql "sua-connection-string-de-producao" < backup.sql
```

### 3. Atualizar o Schema do Prisma (Opcional)

Se você quiser usar connection pooling, atualize o `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  schemas  = ["auth", "public"]
}
```

### 4. Regenerar o Prisma Client no Vercel

Após configurar as variáveis de ambiente:

1. Vá em **Deployments**
2. Clique em **Redeploy** no último deployment
3. Marque a opção **Use existing Build Cache** como **OFF**
4. Clique em **Redeploy**

### 5. Verificar os Logs

Após o redeploy:
1. Acesse a aba **Functions** ou **Logs**
2. Tente fazer login novamente
3. Verifique se há erros nos logs

## Comandos Úteis Localmente

Para testar a conexão com o banco de produção localmente:

```bash
# Testar conexão
npx prisma db pull

# Gerar Prisma Client
npx prisma generate

# Ver dados do banco
npx prisma studio
```

## Troubleshooting

### Erro: "Can't reach database server"
- ✅ Verifique se `DATABASE_URL` está configurada no Vercel
- ✅ Verifique se a connection string está correta
- ✅ Verifique se o IP do Vercel está na whitelist do Supabase (geralmente não é necessário)

### Erro: "Prepared statement already exists"
- ✅ Use Transaction Mode (porta 6543) em vez de Session Mode
- ✅ Configure `pgbouncer=true` na connection string

### Erro: "Too many connections"
- ✅ Use connection pooling do Supabase
- ✅ Configure `connection_limit=1` na connection string

## Exemplo de .env.production (NÃO COMMITAR)

```env
# Database
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-anon-key"
SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"

# NextAuth
NEXTAUTH_SECRET="sua-secret-key-aleatoria"
NEXTAUTH_URL="https://seu-projeto.vercel.app"

# Environment
NODE_ENV="production"
```

## Checklist Final

- [ ] Todas as variáveis de ambiente configuradas no Vercel
- [ ] Connection string usando Transaction Mode (porta 6543)
- [ ] Redeploy feito sem cache
- [ ] Logs verificados
- [ ] Login testado

## Suporte

Se o problema persistir:
1. Verifique os logs do Vercel
2. Verifique os logs do Supabase (Database > Logs)
3. Teste a connection string localmente com `psql` ou Prisma Studio
