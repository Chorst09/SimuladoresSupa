-- Execute este SQL no Supabase SQL Editor (uma linha por vez se necessário)

-- Passo 1: Adicionar coluna password_changed
ALTER TABLE profiles ADD COLUMN password_changed BOOLEAN DEFAULT true;

-- Passo 2: Atualizar usuários existentes (executar após o passo 1)
UPDATE profiles SET password_changed = true;

-- Passo 3: Verificar se funcionou (opcional)
SELECT id, email, role, password_changed FROM profiles LIMIT 5;