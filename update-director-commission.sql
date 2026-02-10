-- Atualizar Comissão Diretor com os valores corretos
UPDATE public.commission_channel_director 
SET 
  months_12 = 0.60,
  months_24 = 1.20,
  months_36 = 2.00,
  months_48 = 2.00,
  months_60 = 2.00,
  updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000002';

-- Verificar se foi atualizado
SELECT id, months_12, months_24, months_36, months_48, months_60, updated_at 
FROM public.commission_channel_director 
WHERE id = '00000000-0000-0000-0000-000000000002';
