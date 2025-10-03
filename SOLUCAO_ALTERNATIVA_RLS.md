# 🔧 Solução Alternativa - Erro no Script RLS

## ❌ Problema:
O script anterior deu erro no Supabase. Vamos usar uma abordagem mais simples.

## ✅ Solução Alternativa (MAIS SIMPLES):

### **Opção 1: Script Simples**
Execute o arquivo `disable-rls-temporarily.sql` no SQL Editor:

```sql
-- Desabilitar RLS temporariamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Testar acesso
SELECT COUNT(*) FROM profiles;

-- Criar admin
INSERT INTO profiles (id, email, role, full_name, created_at)
VALUES (
    gen_random_uuid(),
    'admin@empresa.com',
    'admin',
    'Administrador',
    NOW()
) ON CONFLICT (email) DO UPDATE SET role = 'admin';
```

### **Opção 2: Executar Comandos Individuais**
Se ainda der erro, execute um comando por vez:

#### **Passo 1:**
```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

#### **Passo 2:**
```sql
SELECT COUNT(*) FROM profiles;
```

#### **Passo 3:**
```sql
INSERT INTO profiles (id, email, role, full_name)
VALUES (
    gen_random_uuid(),
    'admin@empresa.com',
    'admin',
    'Administrador'
);
```

### **Opção 3: Via Interface Supabase**
1. Vá para **Database** → **Tables** → **profiles**
2. Clique em **Settings** (engrenagem)
3. Desmarque **"Enable RLS"**
4. Clique em **Save**

## 🎯 **Após Executar Qualquer Opção:**

1. **Volte ao site do Vercel**
2. **Execute o diagnóstico novamente**
3. **Tente criar o administrador**

## 📋 **Se Ainda Houver Problema:**

### **Verificar se a tabela existe:**
```sql
SELECT * FROM information_schema.tables WHERE table_name = 'profiles';
```

### **Criar tabela se não existir:**
```sql
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Inserir admin manualmente:**
```sql
INSERT INTO profiles (email, role, full_name)
VALUES ('admin@empresa.com', 'admin', 'Administrador')
ON CONFLICT (email) DO UPDATE SET role = 'admin';
```

## 🎉 **Resultado Esperado:**

Após executar qualquer uma das opções:
- ✅ Diagnóstico mostra todos os testes passando
- ✅ Criação de administrador funciona
- ✅ Sistema operacional

## 🔒 **Reabilitar Segurança Depois:**

Após o sistema funcionar, você pode reabilitar RLS:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

**Tente a Opção 1 primeiro (script simples). Se não funcionar, execute os comandos individuais da Opção 2.** 🚀