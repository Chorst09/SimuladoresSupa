-- Script para desabilitar RLS temporariamente e permitir setup inicial
-- Execute este script no SQL Editor do Supabase

-- Desabilitar RLS na tabela profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Verificar se funcionou
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- Testar acesso à tabela
SELECT COUNT(*) as total_profiles FROM profiles;

-- Criar admin de teste se não existir
INSERT INTO profiles (id, email, role, full_name, created_at)
VALUES (
    gen_random_uuid(),
    'admin@empresa.com',
    'admin',
    'Administrador',
    NOW()
) ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Verificar resultado
SELECT * FROM profiles WHERE role = 'admin';