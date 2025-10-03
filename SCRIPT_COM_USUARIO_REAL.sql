-- SCRIPT COM USUÁRIO REAL - Execute no Supabase SQL Editor

-- 1. Remover constraint de role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Ver usuários da tabela auth.users (seus logins)
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- 3. Ver se já existem profiles
SELECT * FROM profiles;

-- 4. Criar profile usando ID real do auth.users
-- SUBSTITUA pelo seu email se necessário
INSERT INTO profiles (id, email, role, full_name, created_at, updated_at)
SELECT 
    id,
    email,
    'admin' as role,
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
    created_at,
    NOW() as updated_at
FROM auth.users 
WHERE email = 'carlos.horst@doubletelcom.com.br'
LIMIT 1;

-- 5. Se não encontrou seu email, usar o primeiro usuário
INSERT INTO profiles (id, email, role, full_name, created_at, updated_at)
SELECT 
    id,
    email,
    'admin' as role,
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
    created_at,
    NOW() as updated_at
FROM auth.users 
ORDER BY created_at
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- 6. Verificar resultado
SELECT * FROM profiles;

-- 7. Contar usuários
SELECT COUNT(*) as total_profiles FROM profiles;

SELECT 'USUÁRIO ADMIN CRIADO - Teste o sistema agora!' as status;