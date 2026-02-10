#!/bin/bash

echo "🔍 Verificando usuário test@test.com no banco de produção..."
echo ""

ssh double@10.10.50.246 << 'ENDSSH'
docker exec -it simuladores_db_prod psql -U postgres -d simuladores_prod -c "SELECT id, email, password_changed, account_status, created_at FROM users WHERE email = 'test@test.com';"
ENDSSH
