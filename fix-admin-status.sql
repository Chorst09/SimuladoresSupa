-- Atualizar status do admin para aprovado
UPDATE auth.users 
SET account_status = 'approved',
    is_super_admin = true,
    email_confirmed_at = CURRENT_TIMESTAMP
WHERE email = 'admin@sistema.com';

-- Verificar
SELECT email, account_status, is_super_admin, email_confirmed_at 
FROM auth.users 
WHERE email = 'admin@sistema.com';
