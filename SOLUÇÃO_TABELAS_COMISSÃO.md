# 🔧 Solução: Tabelas de Comissão Não Carregando

## 🎯 **Problema Identificado**
As tabelas de comissão não estão carregando em nenhuma calculadora, mesmo usando o Supabase.

## 🔍 **Diagnóstico Criado**
Criei ferramentas de diagnóstico para identificar o problema:

### **1. Componente de Debug**
- **Arquivo:** `src/components/debug/CommissionTablesDebug.tsx`
- **Página de Teste:** `src/app/debug-commissions/page.tsx`
- **URL:** `http://localhost:3000/debug-commissions`

### **2. Scripts SQL de Verificação**
- **Verificação:** `supabase-check-commission-tables.sql`
- **Configuração:** `SUPABASE_TABLES_SETUP.sql`

## 🚀 **Passos para Resolver**

### **Passo 1: Executar Diagnóstico**
1. Acesse: `http://localhost:3000/debug-commissions`
2. Execute o diagnóstico para ver:
   - Status da conexão Supabase
   - Existência das tabelas
   - Dados carregados pelo hook
   - Erros específicos

### **Passo 2: Verificar/Criar Tabelas no Supabase**

**OPÇÃO A - Teste Básico (Recomendado):**
1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Execute o script `supabase-teste-basico.sql` (sem RLS)

**OPÇÃO B - Configuração Completa:**
1. Execute o script `supabase-setup-simples.sql` por etapas
2. Execute cada seção separadamente (ETAPA 1, 2, 3, 4, 5)

**OPÇÃO C - Script Original Corrigido:**
1. Execute o script `SUPABASE_TABLES_SETUP.sql` (corrigido)

### **Passo 3: Verificar Permissões (RLS)**
As tabelas precisam ter **Row Level Security** configurado:

```sql
-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'commission_%';

-- Se necessário, habilitar RLS
ALTER TABLE public.commission_channel_seller ENABLE ROW LEVEL SECURITY;
-- (repetir para todas as tabelas)
```

### **Passo 4: Verificar Políticas de Acesso**
```sql
-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename LIKE 'commission_%';
```

## 🔧 **Possíveis Causas e Soluções**

### **Causa 1: Tabelas Não Existem**
**Solução:** Execute `SUPABASE_TABLES_SETUP.sql`

### **Causa 2: Permissões RLS Incorretas**
**Solução:** 
```sql
-- Criar política para leitura
CREATE POLICY "Allow read for authenticated users" ON public.commission_channel_seller
    FOR SELECT USING (auth.role() = 'authenticated');
```

### **Causa 3: Usuário Não Autenticado**
**Solução:** O hook usa dados de fallback quando não há autenticação, mas verifique se o usuário está logado.

### **Causa 4: Erro na Conexão Supabase**
**Solução:** Verificar variáveis de ambiente:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📊 **Dados de Fallback**
O sistema tem dados de fallback que devem aparecer mesmo sem Supabase:

### **Canal/Vendedor:**
- 12 meses: 0.60%
- 24 meses: 1.20%
- 36+ meses: 2.00%

### **Vendedor:**
- 12 meses: 1.2%
- 24 meses: 2.4%
- 36+ meses: 3.6%

### **Parceiro Influenciador/Indicador:**
- 6 faixas de receita com percentuais variados

## 🎯 **Próximos Passos**

1. **Execute o diagnóstico** na página `/debug-commissions`
2. **Identifique o problema específico** (tabelas, permissões, conexão)
3. **Execute a solução correspondente**
4. **Teste nas calculadoras** para confirmar funcionamento

## 📝 **Logs Úteis**
O hook `useCommissions` gera logs no console:
- Warnings para erros de tabela (usando fallback)
- Erros gerais de conexão
- Status de carregamento

**Verifique o console do navegador** para mais detalhes sobre o problema específico.