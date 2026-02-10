-- Verificar usuários que precisam trocar senha
SELECT 
  id, 
  email, 
  password_changed,
  account_status,
  created_at
FROM users
WHERE password_changed IS NULL
ORDER BY created_at DESC;

-- Se quiser atualizar um usuário específico para forçar troca de senha:
-- UPDATE users SET password_changed = NULL WHERE email = 'usuario@exemplo.com';
