-- Teste com apenas uma tabela para verificar se funciona
CREATE TABLE IF NOT EXISTS public.commission_channel_seller (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    months_12 DECIMAL(5,2) NOT NULL DEFAULT 0.60,
    months_24 DECIMAL(5,2) NOT NULL DEFAULT 1.20,
    months_36 DECIMAL(5,2) NOT NULL DEFAULT 2.00,
    months_48 DECIMAL(5,2) NOT NULL DEFAULT 2.00,
    months_60 DECIMAL(5,2) NOT NULL DEFAULT 2.00
);

INSERT INTO public.commission_channel_seller (months_12, months_24, months_36, months_48, months_60)
SELECT 0.60, 1.20, 2.00, 2.00, 2.00
WHERE NOT EXISTS (SELECT 1 FROM public.commission_channel_seller);

SELECT * FROM public.commission_channel_seller;