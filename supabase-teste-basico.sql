-- Script básico para testar tabelas de comissões (SEM RLS)
-- Execute no Supabase SQL Editor

-- 1. CRIAR TABELAS BÁSICAS
CREATE TABLE IF NOT EXISTS public.commission_channel_seller (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    months_12 DECIMAL(5,2) NOT NULL DEFAULT 0.60,
    months_24 DECIMAL(5,2) NOT NULL DEFAULT 1.20,
    months_36 DECIMAL(5,2) NOT NULL DEFAULT 2.00,
    months_48 DECIMAL(5,2) NOT NULL DEFAULT 2.00,
    months_60 DECIMAL(5,2) NOT NULL DEFAULT 2.00
);

CREATE TABLE IF NOT EXISTS public.commission_seller (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    months_12 DECIMAL(5,2) NOT NULL DEFAULT 1.2,
    months_24 DECIMAL(5,2) NOT NULL DEFAULT 2.4,
    months_36 DECIMAL(5,2) NOT NULL DEFAULT 3.6,
    months_48 DECIMAL(5,2) NOT NULL DEFAULT 3.6,
    months_60 DECIMAL(5,2) NOT NULL DEFAULT 3.6
);

-- 2. INSERIR DADOS BÁSICOS
INSERT INTO public.commission_channel_seller (months_12, months_24, months_36, months_48, months_60)
SELECT 0.60, 1.20, 2.00, 2.00, 2.00
WHERE NOT EXISTS (SELECT 1 FROM public.commission_channel_seller);

INSERT INTO public.commission_seller (months_12, months_24, months_36, months_48, months_60)
SELECT 1.2, 2.4, 3.6, 3.6, 3.6
WHERE NOT EXISTS (SELECT 1 FROM public.commission_seller);

-- 3. VERIFICAR
SELECT 'commission_channel_seller' as table_name, COUNT(*) as records FROM public.commission_channel_seller
UNION ALL
SELECT 'commission_seller' as table_name, COUNT(*) as records FROM public.commission_seller;

-- 4. MOSTRAR DADOS
SELECT * FROM public.commission_channel_seller;
SELECT * FROM public.commission_seller;