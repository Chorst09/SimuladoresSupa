-- DESCOBRIR E CORRIGIR CONSTRAINT - Execute no Supabase SQL Editor

-- 1. Ver a definição exata da constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class cl ON cl.oid = c.conrelid
WHERE cl.relname = 'profiles' AND n.nspname = 'public' AND conname LIKE '%role%';

-- 2. Ver todos os dados existentes na tabela (para entender o padrão)
SELECT * FROM profiles;

-- 3. Ver valores únicos de role que já existem
SELECT DISTINCT role, COUNT(*) FROM profiles GROUP BY role;

-- 4. REMOVER a constraint problemática (se existir)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 5. Agora tentar inserir um usuário de teste
INSERT INTO profiles (id, email, role, full_name, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin@doubletelcom.com.br',
    'admin',
    'Administrador Principal',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET 
    role = 'admin',
    full_name = 'Administrador Principal';

-- 6. Verificar se foi inserido
SELECT * FROM profiles WHERE email = 'admin@doubletelcom.com.br';

-- 7. Criar uma constraint mais flexível (opcional)
-- ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
-- CHECK (role IN ('admin', 'director', 'user', 'seller', 'pending'));

-- 8. Status final
SELECT 'CONSTRAINT REMOVIDA - Teste o sistema agora' as status;
SELECT COUNT(*) as total_usuarios FROM profiles;