-- Script para configurar usuário administrador
-- IMPORTANTE: Substitua 'SEU_EMAIL@DOMINIO.COM' pelo seu email real

-- 1. Verificar usuários existentes no auth.users
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- 2. Verificar perfis existentes
SELECT * FROM user_profiles;

-- 3. Criar perfil de admin para o primeiro usuário (AJUSTE O EMAIL)
INSERT INTO user_profiles (id, email, role, full_name)
SELECT 
    id,
    email,
    'admin' as role,
    'Administrador Sistema' as full_name
FROM auth.users 
WHERE email = 'carlos.horst@doubletelecom.com.br'  -- ALTERE ESTE EMAIL PARA O SEU
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();

-- 4. OU criar admin para TODOS os usuários existentes (use apenas se necessário)
-- INSERT INTO user_profiles (id, email, role, full_name)
-- SELECT 
--     id,
--     email,
--     'admin' as role,
--     COALESCE(raw_user_meta_data->>'full_name', email) as full_name
-- FROM auth.users 
-- ON CONFLICT (id) DO UPDATE SET
--     role = 'admin',
--     updated_at = NOW();

-- 5. Verificar se o perfil foi criado
SELECT 
    up.id,
    up.email,
    up.role,
    up.full_name,
    au.email as auth_email
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
ORDER BY up.created_at DESC;

-- 6. Testar a função get_user_role (execute quando logado)
-- SELECT get_user_role() as my_role;

-- 7. Temporariamente desabilitar RLS para teste (APENAS PARA DEBUG)
-- CUIDADO: Isso remove a segurança temporariamente
-- ALTER TABLE commission_channel_seller DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE commission_channel_director DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE commission_seller DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE commission_channel_influencer DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE commission_channel_indicator DISABLE ROW LEVEL SECURITY;

-- 8. Para reabilitar RLS após o teste
-- ALTER TABLE commission_channel_seller ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE commission_channel_director ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE commission_seller ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE commission_channel_influencer ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE commission_channel_indicator ENABLE ROW LEVEL SECURITY;
