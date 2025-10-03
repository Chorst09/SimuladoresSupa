-- CRIAR ADMIN DE EMERGÊNCIA - Execute no Supabase SQL Editor

-- 1. Ver todos os usuários da tabela auth.users
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- 2. Ver todos os perfis existentes
SELECT * FROM profiles;

-- 3. Criar/atualizar perfil admin para o usuário logado
-- SUBSTITUA o email pelo seu email de login
INSERT INTO profiles (id, email, role, full_name, created_at, updated_at)
SELECT 
    id,
    email,
    'admin' as role,
    COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
    created_at,
    NOW() as updated_at
FROM auth.users 
WHERE email = 'carlos.horst@doubletelcom.com.br'  -- SUBSTITUA PELO SEU EMAIL
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin',
    updated_at = NOW();

-- 4. Verificar se foi criado
SELECT * FROM profiles WHERE email = 'carlos.horst@doubletelcom.com.br';

-- 5. Verificar todos os admins
SELECT * FROM profiles WHERE role = 'admin';

SELECT 'ADMIN CRIADO - Recarregue a página do sistema' as status;