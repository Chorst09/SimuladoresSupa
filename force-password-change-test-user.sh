#!/bin/bash

echo "🔧 Forçando troca de senha para test@test.com..."
echo ""

ssh double@10.10.50.246 << 'ENDSSH'
docker exec -it simuladores_db_prod psql -U postgres -d simuladores_prod << 'EOSQL'

-- Verificar antes
SELECT 'ANTES:' as status, id, email, password_changed, account_status 
FROM users 
WHERE email = 'test@test.com';

-- Atualizar para forçar troca de senha
UPDATE users 
SET password_changed = NULL 
WHERE email = 'test@test.com';

-- Verificar depois
SELECT 'DEPOIS:' as status, id, email, password_changed, account_status 
FROM users 
WHERE email = 'test@test.com';

EOSQL
ENDSSH

echo ""
echo "✅ Usuário atualizado!"
echo "🔄 Faça logout e login novamente para testar"
