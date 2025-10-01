# Troubleshooting - Tabelas de Comissões não Carregam

## Problema Identificado
A calculadora "Internet MAN" (DoubleFibraRadioCalculator) não está carregando as tabelas de comissões do Supabase.

## Diagnóstico Implementado

### 1. Logs de Debug Adicionados
Adicionei logs detalhados no hook `useCommissions` para identificar onde está o problema:

- ✅ Logs no início do fetchData
- ✅ Logs de status do usuário
- ✅ Logs de verificação da sessão Supabase
- ✅ Logs para cada consulta ao banco
- ✅ Logs de validação dos dados
- ✅ Logs de erro e fallback

### 2. Componente de Debug Criado
Criei um componente `CommissionDebug` que mostra o status atual das comissões em tempo real.

## Como Verificar o Problema

### 1. Abrir o Console do Navegador
1. Acesse a calculadora "Internet MAN" 
2. Abra o DevTools (F12)
3. Vá para a aba "Console"
4. Procure pelos logs que começam com:
   - `🔄 [useCommissions]`
   - `✅ [useCommissions]`
   - `❌ [useCommissions]`
   - `⚠️ [useCommissions]`

### 2. Verificar a Aba "Comissões"
1. Na calculadora, clique na aba "Comissões"
2. Você verá um painel de debug no topo mostrando o status
3. Abaixo deve aparecer as tabelas de comissões

### 3. Possíveis Cenários

#### Cenário A: Usuário não autenticado
**Logs esperados:**
```
⚠️ [useCommissions] Usuário não autenticado, usando dados de fallback
```
**Solução:** Fazer login no sistema

#### Cenário B: Sessão Supabase expirada
**Logs esperados:**
```
⚠️ [useCommissions] Sessão não encontrada, usando dados de fallback
```
**Solução:** Fazer logout e login novamente

#### Cenário C: Erro de conexão com Supabase
**Logs esperados:**
```
❌ [useCommissions] Erro ao verificar sessão: [erro]
```
**Solução:** Verificar configuração do Supabase

#### Cenário D: Tabelas não existem no Supabase
**Logs esperados:**
```
📊 [useCommissions] Canal/Vendedor resultado: { data: null, error: [erro] }
```
**Solução:** Executar os scripts de criação das tabelas

## Scripts de Verificação do Supabase

### 1. Verificar se as tabelas existem
Execute no Supabase SQL Editor:
```sql
-- Ver arquivo: supabase-check-commission-tables.sql
```

### 2. Criar as tabelas (se não existirem)
Execute no Supabase SQL Editor:
```sql
-- Ver arquivo: supabase-commissions-schema-safe.sql
```

### 3. Inserir dados iniciais (se as tabelas estiverem vazias)
Execute no Supabase SQL Editor:
```sql
-- Ver arquivo: supabase-commissions-data-safe.sql
```

## Dados de Fallback

Mesmo se o Supabase não estiver funcionando, o sistema deve usar dados de fallback. Se nem os dados de fallback aparecem, há um problema no código.

### Dados de Fallback Esperados:
- **Canal/Vendedor:** 0.60% (12m) até 2.00% (36m+)
- **Vendedor:** 1.2% (12m) até 3.6% (36m+)
- **Canal Influenciador:** 6 faixas de receita
- **Canal Indicador:** 6 faixas de receita
- **Diretor:** 0% (todos os prazos)

## Próximos Passos

1. **Verificar logs no console** - Identifica onde está falhando
2. **Verificar autenticação** - Usuário logado?
3. **Verificar Supabase** - Tabelas existem e têm dados?
4. **Verificar rede** - Conexão com Supabase funcionando?

## Remoção dos Logs de Debug

Após identificar e corrigir o problema, remover os logs de debug:

1. Remover logs do `src/hooks/use-commissions.ts`
2. Remover logs do `src/components/calculators/CommissionTablesUnified.tsx`
3. Remover o componente `src/components/debug/CommissionDebug.tsx`
4. Remover a importação e uso do CommissionDebug no DoubleFibraRadioCalculator

## Status Atual

✅ Logs de debug implementados
✅ Componente de debug criado
✅ Build funcionando
⏳ Aguardando verificação no navegador