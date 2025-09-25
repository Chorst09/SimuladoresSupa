# Guia de Configuração das Tabelas de Comissões no Supabase

## Passo a Passo para Configurar as Tabelas Editáveis

### 1. Verificar Estado Atual
Execute primeiro este script para verificar se as tabelas já existem:

```sql
-- Copie e cole este conteúdo no Supabase SQL Editor
```

**Arquivo:** `supabase-check-commission-tables.sql`

### 2. Criar Schema das Tabelas
Se as tabelas não existirem, execute este script:

```sql
-- Copie e cole este conteúdo no Supabase SQL Editor
```

**Arquivo:** `supabase-commissions-schema-safe.sql`

### 3. Inserir Dados Iniciais
Após criar o schema, execute este script para inserir os dados:

```sql
-- Copie e cole este conteúdo no Supabase SQL Editor
```

**Arquivo:** `supabase-commissions-data-safe.sql`

## Ordem de Execução

1. **PRIMEIRO:** Execute `supabase-check-commission-tables.sql`
2. **SEGUNDO:** Execute `supabase-commissions-schema-safe.sql`
3. **TERCEIRO:** Execute `supabase-commissions-data-safe.sql`

## O que Cada Script Faz

### supabase-check-commission-tables.sql
- ✅ Verifica se as tabelas existem
- ✅ Mostra a estrutura das tabelas
- ✅ Conta quantos registros existem
- ✅ Mostra dados de exemplo

### supabase-commissions-schema-safe.sql
- ✅ Cria as 5 tabelas de comissões
- ✅ Configura Row Level Security (RLS)
- ✅ Cria políticas de segurança
- ✅ Configura triggers para updated_at
- ✅ Só cria se não existir (seguro para re-executar)

### supabase-commissions-data-safe.sql
- ✅ Insere dados iniciais nas tabelas
- ✅ Limpa dados existentes antes de inserir
- ✅ Usa os valores padrão das comissões
- ✅ Inclui verificação final dos dados

## Tabelas Criadas

1. **commission_channel_director** - Comissões do Diretor
2. **commission_channel_seller** - Comissões do Canal/Vendedor  
3. **commission_seller** - Comissões do Vendedor
4. **commission_channel_influencer** - Comissões do Canal Influenciador
5. **commission_channel_indicator** - Comissões do Canal Indicador

## Estrutura das Tabelas

### Tabelas Simples (Director, Channel Seller, Seller)
- `id` (UUID, Primary Key)
- `months_12` (DECIMAL)
- `months_24` (DECIMAL)
- `months_36` (DECIMAL)
- `months_48` (DECIMAL)
- `months_60` (DECIMAL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `updated_by` (UUID, Foreign Key)

### Tabelas com Faixas de Receita (Influencer, Indicator)
- `id` (UUID, Primary Key)
- `revenue_range` (TEXT)
- `revenue_min` (DECIMAL)
- `revenue_max` (DECIMAL)
- `months_12` (DECIMAL)
- `months_24` (DECIMAL)
- `months_36` (DECIMAL)
- `months_48` (DECIMAL)
- `months_60` (DECIMAL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `updated_by` (UUID, Foreign Key)

## Segurança

- ✅ **RLS Habilitado** em todas as tabelas
- ✅ **Leitura:** Todos os usuários autenticados
- ✅ **Escrita:** Apenas administradores
- ✅ **Auditoria:** Campos created_at, updated_at, updated_by

## Após Executar os Scripts

1. Faça login na aplicação como administrador
2. Acesse "Administração" → "Tabelas de Comissões"
3. Ative o switch "Editar"
4. Clique em qualquer valor para editá-lo
5. As alterações serão salvas automaticamente

## Troubleshooting

### Se as tabelas não aparecerem:
1. Verifique se você executou os scripts na ordem correta
2. Verifique se não há erros no console do Supabase
3. Confirme que seu usuário tem role 'admin'

### Se a edição não funcionar:
1. Verifique se você está logado como admin
2. Verifique se o RLS está configurado corretamente
3. Verifique se as políticas de segurança foram criadas

### Se houver erros de permissão:
1. Verifique se seu usuário está na tabela 'users' com role 'admin'
2. Verifique se as políticas RLS estão corretas
3. Confirme que a autenticação está funcionando

## Comandos Úteis para Debug

```sql
-- Verificar usuários admin
SELECT id, email, role FROM users WHERE role = 'admin';

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename LIKE 'commission_%';

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'commission_%';
```