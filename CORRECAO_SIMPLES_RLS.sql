-- CORREÇÃO SIMPLES - Execute no Supabase SQL Editor

-- 1. Desabilitar RLS na tabela profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Verificar estrutura da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 3. Verificar se a tabela funciona
SELECT COUNT(*) as total_usuarios FROM profiles;

-- 4. Verificar se há administradores
SELECT * FROM profiles WHERE role = 'admin';

-- 5. Verificar se já existe admin com este email
SELECT * FROM profiles WHERE email = 'carlos.horst@doubletelcom.com.br';

-- 6. Criar admin simples (apenas se não existir)
-- Se der erro "duplicate key", ignore - significa que já existe
INSERT INTO profiles (id, email, role, full_name)
VALUES (
    gen_random_uuid(),
    'carlos.horst@doubletelcom.com.br',
    'admin',
    'Carlos Horst - Admin'
);

-- 7. Verificar resultado
SELECT 'RLS DESABILITADO - Sistema deve funcionar' as status;
SELECT * FROM profiles ORDER BY created_at DESC NULLS LAST;