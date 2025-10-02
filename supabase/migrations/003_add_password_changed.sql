-- Adicionar coluna password_changed à tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_changed BOOLEAN DEFAULT true;

-- Atualizar usuários existentes para não precisarem alterar senha
UPDATE profiles 
SET password_changed = true 
WHERE password_changed IS NULL;

-- Comentário da migração
COMMENT ON COLUMN profiles.password_changed IS 'Indica se o usuário já alterou a senha padrão (false = precisa alterar no primeiro login)';