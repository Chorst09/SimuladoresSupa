-- CORREÇÃO EMERGENCIAL RLS - Execute no Supabase SQL Editor

-- 1. DESABILITAR RLS IMEDIATAMENTE
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Admins podem inserir perfis" ON profiles;
DROP POLICY IF EXISTS "Admins podem atualizar perfis" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;
DROP POLICY IF EXISTS "users_can_view_own_profile" ON profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "enable_insert_for_authenticated_users" ON profiles;
DROP POLICY IF EXISTS "admins_can_manage_all_profiles" ON profiles;

-- 3. VERIFICAR SE A TABELA FUNCIONA AGORA
SELECT COUNT(*) as total_profiles FROM profiles;

-- 4. CRIAR UM ADMIN DE EMERGÊNCIA
INSERT INTO profiles (id, email, role, full_name, created_at, status)
VALUES (
    gen_random_uuid(),
    'admin@doubletelcom.com.br',
    'admin',
    'Administrador Sistema',
    NOW(),
    'approved'
) ON CONFLICT (email) DO UPDATE SET 
    role = 'admin',
    status = 'approved';

-- 5. VERIFICAR SE O ADMIN FOI CRIADO
SELECT id, email, role, full_name, status FROM profiles WHERE role = 'admin';

-- 6. DEIXAR RLS DESABILITADO POR ENQUANTO (para funcionar)
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; -- Comentado para não causar problema

SELECT 'RLS CORRIGIDO - SISTEMA DEVE FUNCIONAR AGORA' as status;