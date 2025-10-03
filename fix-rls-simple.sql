-- Script simples para corrigir RLS - Execute linha por linha se necessário

-- 1. Desabilitar RLS temporariamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes (uma por vez)
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

-- 3. Verificar se a tabela existe e tem dados
SELECT COUNT(*) as total_profiles FROM profiles;

-- 4. Testar se conseguimos inserir um admin de teste
INSERT INTO profiles (id, email, role, full_name, created_at)
VALUES (
    gen_random_uuid(),
    'admin@teste.com',
    'admin',
    'Administrador Teste',
    NOW()
) ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- 5. Verificar se o admin foi criado
SELECT id, email, role, full_name FROM profiles WHERE role = 'admin';