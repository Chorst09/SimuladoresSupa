# Configuração do Vercel

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente no Vercel (Settings > Environment Variables):

### 1. Banco de Dados
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```
**Importante:** 
- Use um banco PostgreSQL hospedado (Supabase, Neon, Railway, etc.)
- Adicione `?sslmode=require` no final da URL para conexões seguras
- Exemplo: `postgresql://postgres:senha@db.exemplo.com:5432/simuladores?sslmode=require`

### 2. Autenticação
```
NEXTAUTH_SECRET=sua_chave_secreta_minimo_32_caracteres
JWT_SECRET=sua_chave_jwt_secreta_minimo_32_caracteres
NEXTAUTH_URL=https://seu-dominio.vercel.app
```

### 3. Email (Resend)
```
RESEND_API_KEY=re_sua_chave_resend
```

### 4. Configurações de Ambiente
```
NODE_ENV=production
PORT=3000
```

### 5. Features (Opcional)
```
DEBUG=false
LOG_LEVEL=info
ENABLE_DEBUG_ROUTES=false
ENABLE_TEST_DATA=false
```

## Passos para Deploy

1. **Configure o Banco de Dados:**
   - Crie um banco PostgreSQL em um serviço cloud (recomendado: Supabase ou Neon)
   - Copie a connection string
   - Adicione no Vercel como `DATABASE_URL`

2. **Execute as Migrations:**
   ```bash
   npx prisma db push
   ```

3. **Gere o Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Crie o Primeiro Admin:**
   - Após o deploy, acesse: `https://seu-dominio.vercel.app/api/admin/create-first-admin`
   - Ou use o endpoint via POST com email e senha

5. **Teste o Login:**
   - Acesse: `https://seu-dominio.vercel.app/login`
   - Use as credenciais do admin criado

## Troubleshooting

### Erro 401 no Login
- Verifique se `DATABASE_URL` está configurada corretamente
- Verifique se o banco de dados está acessível
- Verifique os logs do Vercel: `vercel logs`

### Erro de Conexão com Banco
- Certifique-se de que `?sslmode=require` está na URL
- Verifique se o IP do Vercel está permitido no firewall do banco
- Teste a conexão localmente primeiro

### Prisma Client não encontrado
- Execute `npx prisma generate` antes do deploy
- Adicione no `package.json`:
  ```json
  "scripts": {
    "postinstall": "prisma generate"
  }
  ```

## Comandos Úteis

```bash
# Ver logs do Vercel
vercel logs

# Deploy manual
vercel --prod

# Testar localmente com variáveis de produção
vercel env pull .env.local
npm run dev
```
