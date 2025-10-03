# Database Schema - Sistema de Gestão de Oportunidades

Este diretório contém todos os arquivos necessários para configurar o banco de dados do Sistema de Gestão de Oportunidades.

## Estrutura dos Arquivos

- `schema.sql` - Estrutura principal das tabelas, índices e triggers
- `rls_policies.sql` - Políticas de Row Level Security para controle de acesso
- `functions.sql` - Funções auxiliares para KPIs, auditoria e notificações
- `seeds.sql` - Dados iniciais de exemplo (opcional)
- `migrate.sql` - Script principal de migração

## Como Executar a Migração

### 1. Via Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para "SQL Editor"
4. Execute os arquivos na seguinte ordem:

```sql
-- 1. Primeiro, execute o schema principal
-- Cole e execute o conteúdo de schema.sql

-- 2. Em seguida, execute as funções
-- Cole e execute o conteúdo de functions.sql

-- 3. Configure as políticas RLS
-- Cole e execute o conteúdo de rls_policies.sql

-- 4. (Opcional) Insira dados de exemplo
-- Cole e execute o conteúdo de seeds.sql
```

### 2. Via CLI do Supabase

```bash
# Se você tem o CLI do Supabase instalado
supabase db reset
supabase db push
```

## Estrutura do Banco de Dados

### Tabelas Principais

1. **profiles** - Perfis de usuário (estende auth.users)
2. **clientes** - Cadastro de clientes
3. **fornecedores** - Cadastro de fornecedores
4. **oportunidades** - Oportunidades de negócio
5. **oportunidade_fornecedores** - Relacionamento N:N entre oportunidades e fornecedores
6. **atividades** - Histórico de atividades das oportunidades
7. **notificacoes** - Sistema de notificações

### Controle de Acesso (RLS)

O sistema implementa controle de acesso baseado em roles:

- **Vendedor**: Acesso apenas às suas próprias oportunidades
- **Gerente**: Acesso às oportunidades de sua equipe
- **Diretor**: Acesso a todas as oportunidades

### Funções Auxiliares

- `get_dashboard_kpis()` - Calcula KPIs do dashboard
- `get_funil_vendas()` - Retorna dados do funil de vendas
- `check_vencimentos()` - Verifica e cria notificações de vencimento
- `log_fase_change()` - Registra mudanças de fase automaticamente

## Configuração Pós-Migração

### 1. Criar Perfis de Usuário

Após criar usuários no Supabase Auth, você deve inserir os perfis correspondentes:

```sql
INSERT INTO profiles (id, full_name, email, role, team_id) VALUES
('uuid-do-usuario', 'Nome Completo', 'email@empresa.com', 'vendedor', 'uuid-da-equipe');
```

### 2. Configurar Cron Job para Notificações

Para automatizar as verificações de vencimento, configure um cron job:

```sql
-- Execute diariamente às 9h para verificar vencimentos
SELECT cron.schedule('check-vencimentos', '0 9 * * *', 'SELECT check_vencimentos();');
```

### 3. Inserir Dados Iniciais

Execute o arquivo `seeds.sql` para inserir dados de exemplo (opcional).

## Verificação da Instalação

Execute esta query para verificar se todas as tabelas foram criadas:

```sql
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'clientes', 'fornecedores', 'oportunidades', 'oportunidade_fornecedores', 'atividades', 'notificacoes')
ORDER BY tablename;
```

## Troubleshooting

### Erro de Permissões

Se encontrar erros de permissão, certifique-se de que:
1. O usuário tem permissões de administrador no projeto Supabase
2. As políticas RLS estão configuradas corretamente
3. Os usuários têm perfis criados na tabela `profiles`

### Problemas com RLS

Para debugar problemas de RLS:
1. Verifique se o usuário está autenticado (`auth.uid()` retorna um valor)
2. Confirme se o perfil do usuário existe na tabela `profiles`
3. Teste as funções auxiliares (`get_user_role()`, `get_user_team_id()`)

### Performance

Se encontrar problemas de performance:
1. Verifique se todos os índices foram criados
2. Analise os planos de execução das queries
3. Considere adicionar índices específicos para suas consultas mais frequentes