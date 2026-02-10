#!/bin/bash

echo "🔧 Atualizando Comissão Diretor PRODUÇÃO para 1.50%..."

ssh double@10.10.50.246 << 'ENDSSH'
docker exec simuladores_db_prod psql -U postgres -d simuladores_prod << 'EOSQL'

-- Atualizar Comissão Diretor para 1.50% em todos os períodos
UPDATE commission_channel_director 
SET 
  months_12 = 1.50,
  months_24 = 1.50,
  months_36 = 1.50,
  months_48 = 1.50,
  months_60 = 1.50,
  updated_at = NOW();

-- Verificar resultado
SELECT 'PRODUÇÃO - Comissão Diretor atualizada:' as status;
SELECT months_12, months_24, months_36, months_48, months_60 
FROM commission_channel_director;

EOSQL
ENDSSH

echo "✅ Comissão Diretor atualizada em PRODUÇÃO!"