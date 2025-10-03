-- SCRIPT FINAL SIMPLES - Execute linha por linha no Supabase SQL Editor

-- 1. Ver a constraint problemática
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class cl ON cl.oid = c.conrelid
WHERE cl.relname = 'profiles' AND n.nspname = 'public' AND conname LIKE '%role%';

-- 2. REMOVER a constraint problemática
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 3. Ver se há dados na tabela
SELECT * FROM profiles;

-- 4. Inserir usuário admin simples (sem ON CONFLICT)
INSERT INTO profiles (id, email, role, full_name, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'carlos.horst@doubletelcom.com.br',
    'admin',
    'Carlos Horst - Admin',
    NOW(),
    NOW()
);

-- 5. Verificar se foi inserido
SELECT * FROM profiles WHERE email = 'carlos.horst@doubletelcom.com.br';

-- 6. Contar total de usuários
SELECT COUNT(*) as total_usuarios FROM profiles;

-- PRONTO! Agora teste o sistema