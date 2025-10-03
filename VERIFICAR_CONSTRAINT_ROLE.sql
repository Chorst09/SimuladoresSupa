-- VERIFICAR CONSTRAINT DE ROLE - Execute no Supabase SQL Editor

-- 1. Ver todas as constraints da tabela profiles
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class cl ON cl.oid = c.conrelid
WHERE cl.relname = 'profiles' AND n.nspname = 'public';

-- 2. Ver especificamente a constraint de role
SELECT 
    conname,
    pg_get_constraintdef(c.oid) as definition
FROM pg_constraint c
JOIN pg_class cl ON cl.oid = c.conrelid
WHERE cl.relname = 'profiles' AND conname LIKE '%role%';

-- 3. Ver todos os valores únicos de role que existem
SELECT DISTINCT role FROM profiles;

-- 4. Tentar inserir com role 'user' (que provavelmente é válido)
INSERT INTO profiles (id, email, role, full_name, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'teste@exemplo.com',
    'user',  -- Mudando para 'user'
    'Usuário Teste',
    NOW(),
    NOW()
);

-- 5. Verificar se foi inserido
SELECT * FROM profiles WHERE email = 'teste@exemplo.com';

-- 6. Tentar outros valores comuns
-- INSERT INTO profiles (id, email, role, full_name) VALUES (gen_random_uuid(), 'teste2@exemplo.com', 'director', 'Teste Director');
-- INSERT INTO profiles (id, email, role, full_name) VALUES (gen_random_uuid(), 'teste3@exemplo.com', 'seller', 'Teste Seller');

SELECT 'VERIFICAÇÃO DE CONSTRAINT CONCLUÍDA' as status;