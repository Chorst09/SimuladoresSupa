-- Script para corrigir problemas de criação de administrador
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela profiles existe e sua estrutura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Se a tabela não existir, criar ela
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'director', 'seller', 'user')),
    password_changed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Adicionar colunas que podem estar faltando
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_changed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Adicionar constraint para role se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'profiles_role_check'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('admin', 'director', 'seller', 'user'));
    END IF;
END $$;

-- 5. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 6. Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas RLS básicas
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON profiles;
CREATE POLICY "Usuários podem ver próprio perfil" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON profiles;
CREATE POLICY "Usuários podem atualizar próprio perfil" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;
CREATE POLICY "Admins podem ver todos os perfis" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins podem inserir perfis" ON profiles;
CREATE POLICY "Admins podem inserir perfis" ON profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        ) OR NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin')
    );

DROP POLICY IF EXISTS "Admins podem atualizar perfis" ON profiles;
CREATE POLICY "Admins podem atualizar perfis" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 8. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Verificar se há algum admin existente
SELECT COUNT(*) as admin_count FROM profiles WHERE role = 'admin';

-- 11. Se necessário, criar um admin de emergência (descomente as linhas abaixo)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
-- VALUES (
--     '00000000-0000-0000-0000-000000000001',
--     'admin@empresa.com',
--     crypt('admin123', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW()
-- ) ON CONFLICT (id) DO NOTHING;

-- INSERT INTO profiles (id, email, role, full_name, password_changed)
-- VALUES (
--     '00000000-0000-0000-0000-000000000001',
--     'admin@empresa.com',
--     'admin',
--     'Administrador',
--     false
-- ) ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 12. Verificar resultado final
SELECT 
    p.id,
    p.email,
    p.role,
    p.full_name,
    p.created_at,
    au.email_confirmed_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.role = 'admin';

COMMIT;