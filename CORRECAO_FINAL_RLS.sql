-- CORREÇÃO FINAL - Execute no Supabase SQL Editor

-- 1. Desabilitar RLS na tabela profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas problemáticas
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

-- 3. Verificar se a tabela funciona
SELECT COUNT(*) as total_usuarios FROM profiles;

-- 4. Verificar se há administradores
SELECT id, email, role, full_name FROM profiles WHERE role = 'admin';

-- 5. Se não houver admin, criar um (substitua o email pelo seu)
INSERT INTO profiles (id, email, role, full_name, created_at)
VALUES (
    gen_random_uuid(),
    'carlos.horst@doubletelcom.com.br',  -- SUBSTITUA PELO SEU EMAIL
    'admin',
    'Administrador Principal',
    NOW()
) ON CONFLICT (email) DO UPDATE SET 
    role = 'admin';

-- 6. Verificar resultado final
SELECT 'CORREÇÃO CONCLUÍDA - Sistema deve funcionar agora' as status;
SELECT id, email, role, full_name, status FROM profiles ORDER BY created_at DESC;