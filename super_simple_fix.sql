-- CORREÇÃO SUPER SIMPLES - SEM RLS
-- Execute no Supabase SQL Editor

-- 1. Desabilitar RLS completamente (temporário)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. Atualizar seu perfil para admin
UPDATE user_profiles 
SET role = 'admin', updated_at = NOW()
WHERE id = 'c4bf3c47-2ca9-45f8-b49d-5b433b7b8b55';

-- 3. Se não existir, inserir
INSERT INTO user_profiles (id, email, role, full_name)
SELECT 
    'c4bf3c47-2ca9-45f8-b49d-5b433b7b8b55',
    'carlos.horst@doubletelecom.com.br',
    'admin',
    'carlos.horst@doubletelecom.com.br'
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = 'c4bf3c47-2ca9-45f8-b49d-5b433b7b8b55'
);

-- 4. Verificar se funcionou
SELECT id, email, role, full_name FROM user_profiles 
WHERE email = 'carlos.horst@doubletelecom.com.br';

-- DEIXAR RLS DESABILITADO POR ENQUANTO
-- (você pode reabilitar depois quando tudo estiver funcionando)

-- Para reabilitar RLS mais tarde, execute:
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;