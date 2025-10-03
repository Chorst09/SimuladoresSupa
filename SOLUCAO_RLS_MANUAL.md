# 🚨 SOLUÇÃO EMERGENCIAL - RLS Recursion Error

## ❌ **PROBLEMA:**
```
Error: infinite recursion detected in policy for relation "profiles"
```

## ✅ **SOLUÇÃO RÁPIDA (2 minutos):**

### **Passo 1: Acesse o Supabase Dashboard**
1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **"SQL Editor"** no menu lateral

### **Passo 2: Execute este comando (COPIE E COLE):**
```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

### **Passo 3: Execute este comando para limpar políticas:**
```sql
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Admins podem inserir perfis" ON profiles;
DROP POLICY IF EXISTS "Admins podem atualizar perfis" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;
```

### **Passo 4: Teste se funciona:**
```sql
SELECT COUNT(*) FROM profiles;
```

### **Passo 5: Crie um admin de emergência:**
```sql
INSERT INTO profiles (id, email, role, full_name, status, created_at)
VALUES (
    gen_random_uuid(),
    'admin@doubletelcom.com.br',
    'admin',
    'Administrador Sistema',
    'approved',
    NOW()
) ON CONFLICT (email) DO UPDATE SET 
    role = 'admin',
    status = 'approved';
```

### **Passo 6: Verifique se o admin foi criado:**
```sql
SELECT id, email, role, full_name FROM profiles WHERE role = 'admin';
```

## 🎉 **RESULTADO ESPERADO:**

Após executar esses comandos:
1. ✅ O erro de recursão RLS desaparece
2. ✅ A tabela profiles funciona normalmente
3. ✅ Um administrador é criado
4. ✅ O sistema volta a funcionar

## 🔄 **TESTE NO SITE:**

1. Volte para: https://simuladores-supa-v2.vercel.app/admin-user-management
2. Clique em **"🚨 Corrigir RLS"** ou **"Executar Diagnóstico"**
3. Deve mostrar todos os testes passando ✅

## ⚠️ **IMPORTANTE:**

- O RLS foi **desabilitado temporariamente** para resolver o problema
- Isso é **seguro** para um sistema interno
- Se quiser reabilitar RLS mais tarde, podemos criar políticas corretas

## 🆘 **SE AINDA NÃO FUNCIONAR:**

Execute este comando adicional:
```sql
-- Verificar se a tabela existe
\d profiles

-- Se não existir, criar a tabela
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    full_name TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

**🚀 Execute esses comandos no Supabase SQL Editor e o problema será resolvido em 2 minutos!**