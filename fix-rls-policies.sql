-- Script para corrigir políticas RLS que causam recursão infinita
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente para corrigir
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes que podem estar causando recursão
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Admins podem inserir perfis" ON profiles;
DROP POLICY IF EXISTS "Admins podem atualizar perfis" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- 3. Criar políticas simples e seguras (sem recursão)

-- Política para permitir leitura do próprio perfil
CREATE POLICY "users_can_view_own_profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para permitir atualização do próprio perfil
CREATE POLICY "users_can_update_own_profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para permitir inserção de novos perfis (necessário para registro)
CREATE POLICY "enable_insert_for_authenticated_users" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Política especial para admins (sem recursão)
CREATE POLICY "admins_can_manage_all_profiles" ON profiles
    FOR ALL USING (
        -- Verificar se o usuário atual é admin através de uma consulta direta
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
        OR
        -- Permitir se não há nenhum admin no sistema (para setup inicial)
        NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin')
    );

-- 4. Reabilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Verificar se as políticas foram criadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 6. Testar se conseguimos acessar a tabela
SELECT COUNT(*) as total_profiles FROM profiles;

-- 7. Verificar se há algum admin
SELECT id, email, role FROM profiles WHERE role = 'admin';

COMMIT;