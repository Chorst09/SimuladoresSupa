# 🔐 Políticas de Autenticação e Autorização - Supabase

## 📋 Resumo das Permissões

### 🔴 **Administrador** (`admin`)
- ✅ **Acesso TOTAL** a todas as funcionalidades
- ✅ Pode ver e editar **tabelas de preços**
- ✅ Pode ver e editar **tabelas de comissões**
- ✅ Pode ver **DRE completo**
- ✅ Pode ver **todas as propostas** de todos os usuários
- ✅ Pode **gerenciar usuários** e alterar roles
- ✅ Pode **criar, editar e excluir** qualquer conteúdo

### 🟡 **Diretor** (`director`)
- ✅ Pode ver **todas as propostas** de todos os usuários
- ❌ **NÃO** pode ver tabelas de preços
- ❌ **NÃO** pode ver tabelas de comissões
- ❌ **NÃO** pode ver DRE
- ✅ Pode criar e editar propostas
- ❌ **NÃO** pode gerenciar usuários

### 🟢 **Usuário** (`user`)
- ✅ Pode ver **apenas suas próprias propostas**
- ❌ **NÃO** pode ver tabelas de preços
- ❌ **NÃO** pode ver tabelas de comissões
- ❌ **NÃO** pode ver DRE
- ✅ Pode criar e editar suas próprias propostas
- ❌ **NÃO** pode gerenciar usuários

## 🚀 Como Implementar

### 1. **Execute o Script SQL**
```sql
-- Execute o arquivo supabase_commission_tables.sql no SQL Editor do Supabase
-- Este script cria:
-- - Tabelas de comissão com RLS
-- - Tabela user_profiles
-- - Tabela proposals
-- - Todas as políticas de segurança
-- - Triggers automáticos
```

### 2. **Configure o Primeiro Administrador**
```sql
-- Altere o email no script SQL (linha 295):
WHERE email = 'SEU_EMAIL_ADMIN@dominio.com'

-- Ou execute manualmente:
INSERT INTO user_profiles (id, email, role, full_name)
SELECT 
    id,
    email,
    'admin',
    'Seu Nome'
FROM auth.users 
WHERE email = 'seu_email@dominio.com'
ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();
```

### 3. **Use os Hooks no Frontend**

#### Hook de Perfil do Usuário
```tsx
import { useUserProfile } from '@/hooks/use-user-profile';

function MeuComponente() {
  const { 
    profile, 
    isAdmin, 
    isDirector, 
    isUser,
    canAccessCommissions,
    canAccessPricing,
    canAccessDRE,
    canViewAllProposals 
  } = useUserProfile();

  if (isAdmin) {
    return <AdminInterface />;
  }

  if (isDirector) {
    return <DirectorInterface />;
  }

  return <UserInterface />;
}
```

#### Hook de Permissões
```tsx
import { usePermissions } from '@/hooks/use-user-profile';

function ComponenteComPermissoes() {
  const { checkPermission } = usePermissions();

  return (
    <div>
      {checkPermission('commissions') && (
        <TabelaComissoes />
      )}
      
      {checkPermission('pricing') && (
        <TabelaPrecos />
      )}
      
      {checkPermission('dre') && (
        <ComponenteDRE />
      )}
      
      {checkPermission('all_proposals') ? (
        <TodasPropostas />
      ) : (
        <MinhasPropostas />
      )}
    </div>
  );
}
```

### 4. **Proteção de Componentes**

#### Componente de Tabelas de Comissão
```tsx
import { usePermissions } from '@/hooks/use-user-profile';

function TabelaComissoes() {
  const { canAccessCommissions } = usePermissions();

  if (!canAccessCommissions) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Acesso negado. Apenas administradores podem ver as tabelas de comissão.
        </AlertDescription>
      </Alert>
    );
  }

  return <TabelaComissoesContent />;
}
```

#### Componente de DRE
```tsx
function ComponenteDRE() {
  const { canAccessDRE } = usePermissions();

  if (!canAccessDRE) {
    return <AcessoNegado message="Apenas administradores podem ver o DRE" />;
  }

  return <DREContent />;
}
```

### 5. **Gerenciamento de Usuários**

#### Alterar Role de Usuário (apenas admin)
```tsx
import { useUserProfile } from '@/hooks/use-user-profile';

function GerenciarUsuarios() {
  const { updateRole, isAdmin } = useUserProfile();

  const alterarRole = async (userId: string, novoRole: 'admin' | 'director' | 'user') => {
    if (!isAdmin) {
      alert('Apenas administradores podem alterar roles');
      return;
    }

    const sucesso = await updateRole(userId, novoRole);
    if (sucesso) {
      alert('Role alterado com sucesso!');
    }
  };

  // ... resto do componente
}
```

## 🛡️ Segurança no Banco de Dados

### Políticas RLS Implementadas

#### Tabelas de Comissão
```sql
-- Apenas administradores têm acesso
CREATE POLICY "Admin full access" ON commission_channel_seller
    FOR ALL USING (get_user_role() = 'admin');
```

#### Propostas
```sql
-- Admin: acesso total
CREATE POLICY "Admin full access proposals" ON proposals
    FOR ALL USING (get_user_role() = 'admin');

-- Diretor: pode ver todas, mas não editar comissões/preços
CREATE POLICY "Director view all proposals" ON proposals
    FOR SELECT USING (get_user_role() = 'director');

-- User: apenas suas próprias
CREATE POLICY "Users own proposals" ON proposals
    FOR ALL USING (
        get_user_role() = 'user' AND 
        (created_by = auth.uid() OR updated_by = auth.uid())
    );
```

#### Perfis de Usuário
```sql
-- Usuários podem ver/editar próprio perfil
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Admin pode gerenciar todos os perfis
CREATE POLICY "Admin full access profiles" ON user_profiles
    FOR ALL USING (get_user_role() = 'admin');
```

## 🔧 Manutenção

### Verificar Roles dos Usuários
```sql
SELECT 
    up.email,
    up.role,
    up.full_name,
    up.created_at
FROM user_profiles up
ORDER BY up.role, up.email;
```

### Alterar Role Manualmente
```sql
UPDATE user_profiles 
SET role = 'admin', updated_at = NOW()
WHERE email = 'usuario@dominio.com';
```

### Ver Propostas por Usuário
```sql
SELECT 
    p.title,
    p.type,
    p.total_monthly,
    up.email as created_by_email,
    up.role as user_role
FROM proposals p
JOIN user_profiles up ON p.created_by = up.id
ORDER BY p.created_at DESC;
```

## 🚨 Troubleshooting

### Problema: Usuário não consegue ver comissões
**Solução**: Verificar se o role é 'admin'
```sql
SELECT role FROM user_profiles WHERE email = 'usuario@dominio.com';
```

### Problema: Diretor vendo DRE
**Solução**: Verificar implementação do componente - deve usar `canAccessDRE`

### Problema: Usuário vendo propostas de outros
**Solução**: Verificar se as políticas RLS estão ativas
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('proposals', 'user_profiles');
```

## ✅ Checklist de Implementação

- [ ] Script SQL executado no Supabase
- [ ] Primeiro admin configurado
- [ ] Hook `useUserProfile` importado nos componentes
- [ ] Componentes protegidos com verificação de permissões
- [ ] Tabelas de comissão protegidas (apenas admin)
- [ ] DRE protegido (apenas admin)
- [ ] Propostas filtradas por role
- [ ] Interface de gerenciamento de usuários (apenas admin)

---

**🎯 Resultado**: Sistema completamente seguro com 3 níveis de acesso bem definidos e políticas de banco robustas!
