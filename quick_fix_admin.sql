-- SCRIPT RÁPIDO PARA CORRIGIR ACESSO DE ADMIN
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela user_profiles existe
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'director', 'user')),
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Inserir/atualizar seu usuário como admin
INSERT INTO user_profiles (id, email, role, full_name)
SELECT 
    au.id,
    au.email,
    'admin',
    COALESCE(au.raw_user_meta_data->>'full_name', au.email)
FROM auth.users au
WHERE au.email = 'carlos.horst@doubletelecom.com.br'
ON CONFLICT (id) 
DO UPDATE SET 
    role = 'admin',
    updated_at = NOW();

-- 3. Verificar se funcionou
SELECT 
    up.id,
    up.email,
    up.role,
    up.full_name,
    up.created_at
FROM user_profiles up
WHERE up.email = 'carlos.horst@doubletelecom.com.br';

-- 4. Habilitar RLS (se necessário)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Criar função para verificar role (se não existir)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM user_profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar políticas básicas (se não existirem)
DO $$
BEGIN
    -- Política para visualizar próprio perfil
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON user_profiles 
            FOR SELECT USING (auth.uid() = id);
    END IF;

    -- Política para admin ter acesso total
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Admin full access profiles'
    ) THEN
        CREATE POLICY "Admin full access profiles" ON user_profiles 
            FOR ALL USING (get_user_role() = 'admin');
    END IF;
END
$$;