# Migração do Docker Local para Produção no Vercel

## Situação Atual
- ✅ **Desenvolvimento:** PostgreSQL rodando no Docker (localhost:5432)
- ❌ **Produção:** Vercel tentando conectar ao localhost (não funciona)

## Solução: Criar Banco de Dados em Produção

### Passo 1: Escolher e Criar Banco de Dados em Produção

#### Opção Recomendada: Vercel Postgres

**Vantagens:**
- Integração nativa com Vercel
- Configuração automática de variáveis de ambiente
- Plano gratuito: 256 MB de armazenamento, 60 horas de computação

**Como criar:**
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá em **Storage** > **Create Database**
4. Escolha **Postgres**
5. Clique em **Continue** e depois **Create**
6. ✅ Pronto! As variáveis de ambiente já estão configuradas

#### Alternativa: Supabase (Mais Recursos)

**Vantagens:**
- Plano gratuito: 500 MB de armazenamento, 2 GB de transferência
- Interface de administração completa
- Backups automáticos
- APIs REST e Realtime incluídas

**Como criar:**
1. Acesse: https://supabase.com
2. Clique em **Start your project**
3. Crie um novo projeto
4. Anote a senha do banco de dados
5. Vá em **Settings** > **Database**
6. Copie a **Connection string** (Transaction Mode)
7. Configure no Vercel (veja Passo 2)

### Passo 2: Configurar Variáveis de Ambiente no Vercel

Se você **NÃO** usou Vercel Postgres, configure manualmente:

1. Acesse: https://vercel.com/seu-usuario/seu-projeto/settings/environment-variables

2. Adicione as variáveis:

```
DATABASE_URL
```
Valor: Sua connection string de produção

```
NEXTAUTH_SECRET
```
Valor: String aleatória segura (gere com: `openssl rand -base64 32`)

```
NEXTAUTH_URL
```
Valor: `https://seu-projeto.vercel.app`

```
NODE_ENV
```
Valor: `production`

### Passo 3: Migrar o Schema do Banco de Dados

Você precisa criar as tabelas no banco de produção. Escolha uma opção:

#### Opção A: Usando Prisma Migrate (Recomendado)

```bash
# 1. Criar arquivo .env.production com a connection string de produção
echo 'DATABASE_URL="sua-connection-string-aqui"' > .env.production

# 2. Executar migrations
npx dotenv -e .env.production -- npx prisma migrate deploy

# 3. Verificar se funcionou
npx dotenv -e .env.production -- npx prisma db pull
```

#### Opção B: Usando Prisma Push (Mais Rápido)

```bash
# 1. Criar arquivo .env.production
echo 'DATABASE_URL="sua-connection-string-aqui"' > .env.production

# 2. Sincronizar schema
npx dotenv -e .env.production -- npx prisma db push

# 3. Gerar Prisma Client
npx prisma generate
```

#### Opção C: Exportar e Importar Dados do Docker

Se você já tem dados importantes no Docker:

```bash
# 1. Exportar dados do Docker
docker exec simuladores_db pg_dump -U postgres -d simuladores_db --clean --if-exists > backup.sql

# 2. Importar para produção
# Para Vercel Postgres:
psql "sua-connection-string-vercel" < backup.sql

# Para Supabase:
psql "sua-connection-string-supabase" < backup.sql

# Para outros provedores:
psql "sua-connection-string" < backup.sql
```

### Passo 4: Popular Banco de Dados (Opcional)

Se você tem um seed script:

```bash
# Usando .env.production
npx dotenv -e .env.production -- npx prisma db seed
```

### Passo 5: Fazer Redeploy no Vercel

1. Vá em **Deployments**
2. Clique em **Redeploy** no último deployment
3. **Desmarque** "Use existing Build Cache"
4. Clique em **Redeploy**

### Passo 6: Testar

1. Acesse seu site no Vercel
2. Tente fazer login
3. Verifique os logs em **Functions** ou **Logs**

## Comandos Úteis

### Verificar Conexão com Banco de Produção

```bash
# Testar conexão
npx dotenv -e .env.production -- npx prisma db pull

# Ver dados no Prisma Studio
npx dotenv -e .env.production -- npx prisma studio
```

### Backup do Banco de Produção

```bash
# Exportar banco de produção
pg_dump "sua-connection-string" > backup-producao.sql

# Importar de volta se necessário
psql "sua-connection-string" < backup-producao.sql
```

### Sincronizar Docker com Produção

```bash
# Exportar de produção
pg_dump "sua-connection-string-producao" > sync.sql

# Importar para Docker
docker exec -i simuladores_db psql -U postgres -d simuladores_db < sync.sql
```

## Estrutura de Arquivos .env

### .env (Desenvolvimento - Docker)
```env
DATABASE_URL=postgresql://postgres:dev_password_123@localhost:5432/simuladores_dev
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev_secret_key_32_characters_min_12345
NODE_ENV=development
```

### .env.production (Produção - Temporário para migrations)
```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
NEXTAUTH_URL=https://seu-projeto.vercel.app
NEXTAUTH_SECRET=production_secret_key_diferente_do_dev
NODE_ENV=production
```

**⚠️ IMPORTANTE:** Nunca commite `.env.production` no Git!

Adicione ao `.gitignore`:
```
.env.production
.env.local
.env*.local
```

## Troubleshooting

### Erro: "Can't reach database server"
- ✅ Verifique se a connection string está correta
- ✅ Verifique se o banco de dados está ativo
- ✅ Verifique se as variáveis de ambiente estão configuradas no Vercel

### Erro: "SSL connection required"
- ✅ Adicione `?sslmode=require` no final da connection string

### Erro: "Too many connections"
- ✅ Use connection pooling (porta 6543 no Supabase)
- ✅ Adicione `?pgbouncer=true` na connection string

### Erro: "Prepared statement already exists"
- ✅ Use Transaction Mode em vez de Session Mode
- ✅ Adicione `?pgbouncer=true` na connection string

## Checklist de Migração

- [ ] Banco de dados em produção criado
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Schema migrado para produção (Prisma migrate ou push)
- [ ] Dados importados (se necessário)
- [ ] Redeploy feito no Vercel
- [ ] Login testado
- [ ] Logs verificados

## Custos Estimados

### Vercel Postgres (Plano Gratuito)
- ✅ 256 MB de armazenamento
- ✅ 60 horas de computação/mês
- ✅ Suficiente para projetos pequenos/médios

### Supabase (Plano Gratuito)
- ✅ 500 MB de armazenamento
- ✅ 2 GB de transferência
- ✅ Backups automáticos
- ✅ Suficiente para a maioria dos projetos

### Neon (Plano Gratuito)
- ✅ 512 MB de armazenamento
- ✅ Serverless (escala automaticamente)
- ✅ Ótimo para projetos com tráfego variável

## Próximos Passos

Após a migração bem-sucedida:

1. Configure backups automáticos
2. Configure monitoramento de performance
3. Configure alertas de erro
4. Documente a connection string em um gerenciador de senhas
5. Configure CI/CD para migrations automáticas

## Suporte

Se precisar de ajuda:
- Vercel: https://vercel.com/docs/storage/vercel-postgres
- Supabase: https://supabase.com/docs/guides/database
- Prisma: https://www.prisma.io/docs/guides/deployment
