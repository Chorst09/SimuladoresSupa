# 🔧 Correção do Erro SQL no Supabase

## ❌ **Erro Encontrado**
```
ERRO: 42601: erro de sintaxe em ou próximo de "NOT"
LINHA 141: CRIAR POLÍTICA SE NÃO EXISTIR "Permitir leitura para usuários autenticados"
```

## 🎯 **Causa do Problema**
O PostgreSQL (usado pelo Supabase) **não suporta** a sintaxe `CREATE POLICY IF NOT EXISTS`.

## ✅ **Solução Aplicada**

### **1. Script Corrigido**
- **Arquivo Original:** `SUPABASE_TABLES_SETUP.sql` (corrigido)
- **Script Simples:** `supabase-setup-simples.sql` (novo)
- **Script Básico:** `supabase-teste-basico.sql` (teste sem RLS)

### **2. Sintaxe Correta**
**❌ Antes (Incorreto):**
```sql
CREATE POLICY IF NOT EXISTS "Allow read for authenticated users" ON public.commission_channel_seller
    FOR SELECT USING (auth.role() = 'authenticated');
```

**✅ Depois (Correto):**
```sql
-- Remover política existente (se houver)
DROP POLICY IF EXISTS "Allow read for authenticated users" ON public.commission_channel_seller;

-- Criar nova política
CREATE POLICY "Allow read for authenticated users" ON public.commission_channel_seller
    FOR SELECT USING (auth.role() = 'authenticated');
```

## 🚀 **Scripts Disponíveis**

### **1. supabase-teste-basico.sql** ⭐ (Recomendado para teste)
- Cria apenas 2 tabelas básicas
- **SEM RLS** (sem permissões complexas)
- Ideal para testar se a conexão funciona

### **2. supabase-setup-simples.sql** (Configuração completa)
- Todas as 5 tabelas
- Dividido em etapas separadas
- Com RLS e permissões

### **3. SUPABASE_TABLES_SETUP.sql** (Script original corrigido)
- Script completo corrigido
- Sintaxe PostgreSQL válida

## 📋 **Próximos Passos**

1. **Execute primeiro:** `supabase-teste-basico.sql`
2. **Teste a página:** `http://localhost:3000/debug-commissions`
3. **Se funcionar:** Execute `supabase-setup-simples.sql` para configuração completa
4. **Verifique:** As tabelas devem aparecer nas calculadoras

## 🎯 **Resultado Esperado**
- ✅ Tabelas criadas sem erro
- ✅ Dados inseridos corretamente
- ✅ Hook `useCommissions` carrega dados do Supabase
- ✅ Tabelas aparecem nas calculadoras