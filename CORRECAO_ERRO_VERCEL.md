# 🔧 Correção do Erro de Deploy no Vercel

## ❌ Erro Identificado:
```
A variável de ambiente "NEXT_PUBLIC_SUPABASE_URL" faz referência ao segredo "next_public_supabase_url", que não existe.
```

## ✅ Solução Implementada:

### 1. Arquivo `vercel.json` Corrigido:
- ❌ **Removido:** Seção `env` com referências a segredos inexistentes
- ✅ **Mantido:** Configurações essenciais de build

### 2. Como Configurar as Variáveis de Ambiente no Vercel:

#### **Passo 1: Acessar o Dashboard do Vercel**
1. Vá para https://vercel.com/dashboard
2. Selecione seu projeto
3. Clique em "Settings"
4. Vá para "Environment Variables"

#### **Passo 2: Adicionar as Variáveis Necessárias**

**Variáveis Obrigatórias:**
```
NEXT_PUBLIC_SUPABASE_URL = https://wfuhtdekdgovfbgnlyie.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGVrZGdvdmZiZ25seWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2MDI0NzQsImV4cCI6MjA0NzE3ODQ3NH0.ri-A6V4H9bO5iutxshV1bfxOi0oVYh_uWbUc
```

**Variáveis Opcionais (se necessárias):**
```
SUPABASE_SERVICE_ROLE_KEY = sua_chave_service_role
RESEND_API_KEY = sua_chave_resend
NEXTAUTH_SECRET = seu_secret_aleatorio
NEXTAUTH_URL = https://seu-dominio.vercel.app
```

#### **Passo 3: Configurar Ambientes**
- **Environment:** Production, Preview, Development
- **Tipo:** Plain Text (não Secret)

### 3. Após Configurar as Variáveis:

#### **Opção A: Redeploy Automático**
1. Faça um novo commit (pode ser vazio)
2. Push para o repositório
3. Vercel fará redeploy automaticamente

#### **Opção B: Redeploy Manual**
1. No dashboard do Vercel
2. Vá para "Deployments"
3. Clique nos 3 pontos da última build
4. Selecione "Redeploy"

## 🚀 Comandos para Forçar Redeploy:

```bash
# Commit vazio para trigger redeploy
git commit --allow-empty -m "fix: corrigir configuração Vercel - remover referências a segredos inexistentes"
git push origin main
```

## ✅ Verificação Pós-Deploy:

Após o deploy bem-sucedido, verifique:
1. ✅ Site carrega sem erros
2. ✅ Autenticação Supabase funciona
3. ✅ Calculadoras funcionam
4. ✅ PABX Premium calcula corretamente

## 🔍 Troubleshooting:

### Se ainda houver erro:
1. **Verificar logs do Vercel** na aba "Functions"
2. **Confirmar variáveis** estão corretas
3. **Testar build local:**
   ```bash
   npm run build
   npm run start
   ```

### Variáveis de Ambiente Locais (.env.local):
```env
NEXT_PUBLIC_SUPABASE_URL=https://wfuhtdekdgovfbgnlyie.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmdWh0ZGVrZGdvdmZiZ25seWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2MDI0NzQsImV4cCI6MjA0NzE3ODQ3NH0.ri-A6V4H9bO5iutxshV1bfxOi0oVYh_uWbUc
```

---

**Status:** ✅ CORREÇÃO APLICADA
**Próximo passo:** Configurar variáveis no dashboard Vercel e fazer redeploy