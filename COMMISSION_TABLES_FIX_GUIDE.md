# Guia de Correção - Tabelas de Comissões Não Carregam

## 🚨 Problema Identificado
As tabelas de comissões não estão carregando do Supabase nas calculadoras.

## 🔍 Diagnóstico Implementado

### 1. Componentes de Debug Adicionados
- ✅ **SupabaseConnectionTest** - Testa conexão e verifica tabelas
- ✅ **CommissionDebug** - Mostra status dos dados carregados
- ✅ **Logs detalhados** no hook useCommissions

### 2. Como Diagnosticar

#### Passo 1: Abrir a Calculadora
1. Acesse qualquer calculadora (ex: Internet MAN)
2. Clique na aba **"Comissões"**
3. Você verá 3 painéis de debug:
   - **Teste de Conexão Supabase** (no topo)
   - **Debug - Comissões** (no meio)
   - **Tabelas de Comissões** (embaixo)

#### Passo 2: Verificar Console
1. Abra DevTools (F12)
2. Vá para aba **Console**
3. Procure logs que começam com:
   - `🔍 [SupabaseTest]`
   - `🔄 [useCommissions]`

## 🛠️ Possíveis Problemas e Soluções

### Problema 1: Tabelas Não Existem
**Sintomas:**
- Teste de conexão mostra "ERRO" para as tabelas
- Console mostra erros como "relation does not exist"

**Solução:**
1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Execute o script `SUPABASE_TABLES_SETUP.sql`

### Problema 2: Permissões (RLS)
**Sintomas:**
- Tabelas existem mas retornam dados vazios
- Console mostra erros de permissão

**Solução:**
1. No Supabase, vá para **Authentication > Policies**
2. Verifique se as políticas estão configuradas
3. Execute a seção de permissões do script `SUPABASE_TABLES_SETUP.sql`

### Problema 3: Usuário Não Autenticado
**Sintomas:**
- Logs mostram "Usuário não autenticado"
- Usando dados de fallback

**Solução:**
1. Faça login no sistema
2. Verifique se o token de autenticação é válido

### Problema 4: Sessão Expirada
**Sintomas:**
- Logs mostram "Sessão não encontrada"
- Conexão OK mas sem dados

**Solução:**
1. Faça logout e login novamente
2. Verifique se as credenciais estão corretas

## 📋 Script de Configuração do Supabase

Execute este SQL no **Supabase SQL Editor**:

```sql
-- Ver arquivo: SUPABASE_TABLES_SETUP.sql
```

Este script:
- ✅ Verifica se as tabelas existem
- ✅ Cria as tabelas se não existirem
- ✅ Insere dados iniciais
- ✅ Configura permissões (RLS)
- ✅ Mostra resultado final

## 🔧 Dados de Fallback

Mesmo se o Supabase falhar, o sistema deve usar dados de fallback:

### Canal/Vendedor
- 12m: 0.60% | 24m: 1.20% | 36m+: 2.00%

### Vendedor
- 12m: 1.2% | 24m: 2.4% | 36m+: 3.6%

### Diretor
- Todos os prazos: 0%

### Canal Influenciador (6 faixas)
- Até R$ 500: 1.50% - 2.50%
- R$ 500-1000: 2.51% - 4.00%
- R$ 1000-1500: 4.01% - 5.00%
- R$ 1500-3000: 5.01% - 6.00%
- R$ 3000-5000: 6.01% - 7.00%
- Acima R$ 5000: 7.01% - 8.00%

### Canal Indicador (6 faixas)
- Até R$ 500: 0.50% - 0.83%
- R$ 500-1000: 0.84% - 1.33%
- R$ 1000-1500: 1.34% - 1.67%
- R$ 1500-3000: 1.67% - 2.00%
- R$ 3000-5000: 2.00% - 2.50%
- Acima R$ 5000: 2.34% - 3.00%

## 📊 Verificação Final

Após executar o script, você deve ver:

### No Teste de Conexão:
- ✅ Status: "Conectado"
- ✅ Todas as tabelas: "OK (X registros)"

### No Debug de Comissões:
- ✅ Status: "Carregado"
- ✅ Todos os dados: "Carregado"

### Nas Tabelas:
- ✅ Tabelas visíveis com dados

## 🚀 Próximos Passos

1. **Execute o script SQL** no Supabase
2. **Teste a calculadora** no navegador
3. **Verifique os logs** no console
4. **Confirme os dados** nas tabelas
5. **Remova os componentes de debug** após correção

## 📞 Se o Problema Persistir

1. Verifique as **variáveis de ambiente** do Supabase
2. Confirme a **URL e chave** do projeto
3. Teste a **conectividade** diretamente no Supabase
4. Verifique os **logs do servidor** Supabase