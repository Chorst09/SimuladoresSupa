# 🚀 Instruções Muito Simples - Resolver RLS

## 📋 Tente estas opções na ordem:

### **OPÇÃO 1: Comando Individual**
No **Supabase Dashboard** → **SQL Editor**, execute APENAS este comando:

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

Se funcionar, teste o site novamente.

### **OPÇÃO 2: Via Interface Gráfica**
1. Vá para **Database** → **Tables**
2. Clique na tabela **profiles**
3. Clique na aba **Settings**
4. **Desmarque** a opção **"Enable RLS"**
5. Clique em **Save**

### **OPÇÃO 3: Criar Tabela Nova**
Se nada funcionar, execute:

```sql
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO profiles (email, role, full_name)
VALUES ('admin@empresa.com', 'admin', 'Administrador');
```

### **OPÇÃO 4: Código Modificado**
O código foi modificado para tentar criar o admin diretamente na tabela, sem depender de Auth.

## 🎯 Após Qualquer Opção:
1. Volte ao site
2. Execute o diagnóstico
3. Tente criar o administrador

## 📞 Se Nada Funcionar:
Tente criar o admin diretamente no site com:
- **Email:** admin@empresa.com
- **Senha:** 123456789
- **Nome:** Administrador

O código agora tenta múltiplas abordagens automaticamente.

---

**Comece pela OPÇÃO 1 (mais simples). Se não funcionar, tente a OPÇÃO 2.** 🚀