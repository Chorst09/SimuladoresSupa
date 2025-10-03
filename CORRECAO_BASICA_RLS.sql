-- CORREÇÃO BÁSICA - Execute linha por linha se necessário

-- 1. Desabilitar RLS (MAIS IMPORTANTE)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se funciona
SELECT COUNT(*) as total_usuarios FROM profiles;

-- 3. Ver todos os usuários
SELECT * FROM profiles;

-- 4. Ver estrutura da tabela
\d profiles

-- 5. Se quiser criar admin manualmente, use este comando:
-- (Substitua o email pelo seu e execute apenas se necessário)
/*
INSERT INTO profiles (id, email, role, full_name)
VALUES (
    gen_random_uuid(),
    'SEU_EMAIL_AQUI@exemplo.com',
    'admin',
    'Seu Nome Aqui'
);
*/

-- 6. Verificar admins existentes
SELECT * FROM profiles WHERE role = 'admin';

-- PRONTO! Agora teste o sistema no navegador