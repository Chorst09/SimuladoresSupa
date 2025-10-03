-- Execute este SQL no Supabase SQL Editor para adicionar a coluna password_changed

-- Adicionar coluna password_changed à tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_changed BOOLEAN DEFAULT true;

-- Atualizar usuários existentes para não precisarem alterar senha
UPDATE profiles 
SET password_changed = true 
WHERE password_changed IS NULL;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'carlos.horst@doubletelecom.com.br' 
AND column_name = 'Double@2025';