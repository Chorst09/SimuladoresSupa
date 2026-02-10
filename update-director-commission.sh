#!/bin/bash

echo "🔄 Atualizando Comissão Diretor..."
echo "=================================="

export SSHPASS="<SENHA_DO_SERVIDOR>"

# Atualizar valores da Comissão Diretor
sshpass -e ssh double@10.10.50.246 "docker exec simuladores_db_prod psql -U postgres -d simuladores_prod -c \"
UPDATE public.commission_channel_director 
SET 
  months_12 = 0.60,
  months_24 = 1.20,
  months_36 = 2.00,
  months_48 = 2.00,
  months_60 = 2.00,
  updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000002';
\""

echo ""
echo "✅ Verificando atualização..."
sshpass -e ssh double@10.10.50.246 "docker exec simuladores_db_prod psql -U postgres -d simuladores_prod -c \"
SELECT 'Comissão Diretor' as tabela, months_12, months_24, months_36, months_48, months_60 
FROM public.commission_channel_director 
WHERE id = '00000000-0000-0000-0000-000000000002';
\""

echo ""
echo "✅ Comissão Diretor atualizada com sucesso!"
