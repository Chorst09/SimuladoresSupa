-- DEBUG DA TABELA PROFILES - Execute no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'profiles'
) as tabela_existe;

-- 2. Ver estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 3. Ver todos os dados da tabela
SELECT * FROM profiles;

-- 4. Contar registros
SELECT COUNT(*) as total_registros FROM profiles;

-- 5. Ver usuários da tabela auth
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- 6. Inserir um usuário de teste diretamente
INSERT INTO profiles (id, email, role, full_name, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'teste@exemplo.com',
    'admin',
    'Usuário Teste',
    NOW(),
    NOW()
);

-- 7. Verificar se foi inserido
SELECT * FROM profiles WHERE email = 'teste@exemplo.com';

-- 8. Status final
SELECT 'DEBUG CONCLUÍDO' as status;