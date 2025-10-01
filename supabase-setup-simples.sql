-- Script simplificado para configurar tabelas de comissões no Supabase
-- Execute cada seção separadamente no Supabase SQL Editor

-- ========================================
-- ETAPA 1: CRIAR TABELAS
-- ========================================

-- Tabela: commission_channel_seller
CREATE TABLE IF NOT EXISTS public.commission_channel_seller (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    months_12 DECIMAL(5,2) NOT NULL DEFAULT 0.60,
    months_24 DECIMAL(5,2) NOT NULL DEFAULT 1.20,
    months_36 DECIMAL(5,2) NOT NULL DEFAULT 2.00,
    months_48 DECIMAL(5,2) NOT NULL DEFAULT 2.00,
    months_60 DECIMAL(5,2) NOT NULL DEFAULT 2.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: commission_channel_director
CREATE TABLE IF NOT EXISTS public.commission_channel_director (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    months_12 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_24 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_36 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_48 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_60 DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: commission_seller
CREATE TABLE IF NOT EXISTS public.commission_seller (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    months_12 DECIMAL(5,2) NOT NULL DEFAULT 1.2,
    months_24 DECIMAL(5,2) NOT NULL DEFAULT 2.4,
    months_36 DECIMAL(5,2) NOT NULL DEFAULT 3.6,
    months_48 DECIMAL(5,2) NOT NULL DEFAULT 3.6,
    months_60 DECIMAL(5,2) NOT NULL DEFAULT 3.6,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: commission_channel_influencer
CREATE TABLE IF NOT EXISTS public.commission_channel_influencer (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    revenue_range VARCHAR(50) NOT NULL,
    revenue_min DECIMAL(10,2) NOT NULL,
    revenue_max DECIMAL(10,2) NOT NULL,
    months_12 DECIMAL(5,2) NOT NULL,
    months_24 DECIMAL(5,2) NOT NULL,
    months_36 DECIMAL(5,2) NOT NULL,
    months_48 DECIMAL(5,2) NOT NULL,
    months_60 DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: commission_channel_indicator
CREATE TABLE IF NOT EXISTS public.commission_channel_indicator (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    revenue_range VARCHAR(50) NOT NULL,
    revenue_min DECIMAL(10,2) NOT NULL,
    revenue_max DECIMAL(10,2) NOT NULL,
    months_12 DECIMAL(5,2) NOT NULL,
    months_24 DECIMAL(5,2) NOT NULL,
    months_36 DECIMAL(5,2) NOT NULL,
    months_48 DECIMAL(5,2) NOT NULL,
    months_60 DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- =======
=================================
-- ETAPA 2: INSERIR DADOS INICIAIS
-- ========================================

-- Dados para commission_channel_seller
INSERT INTO public.commission_channel_seller (months_12, months_24, months_36, months_48, months_60)
SELECT 0.60, 1.20, 2.00, 2.00, 2.00
WHERE NOT EXISTS (SELECT 1 FROM public.commission_channel_seller);

-- Dados para commission_channel_director
INSERT INTO public.commission_channel_director (months_12, months_24, months_36, months_48, months_60)
SELECT 0, 0, 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM public.commission_channel_director);

-- Dados para commission_seller
INSERT INTO public.commission_seller (months_12, months_24, months_36, months_48, months_60)
SELECT 1.2, 2.4, 3.6, 3.6, 3.6
WHERE NOT EXISTS (SELECT 1 FROM public.commission_seller);

-- Dados para commission_channel_influencer
INSERT INTO public.commission_channel_influencer (revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60)
SELECT * FROM (VALUES
    ('Até 500,00', 0, 500, 1.50, 2.00, 2.50, 2.50, 2.50),
    ('500,01 a 1.000,00', 500.01, 1000, 2.51, 3.25, 4.00, 4.00, 4.00),
    ('1.000,01 a 1.500,00', 1000.01, 1500, 4.01, 4.50, 5.00, 5.00, 5.00),
    ('1.500,01 a 3.000,00', 1500.01, 3000, 5.01, 5.50, 6.00, 6.00, 6.00),
    ('3.000,01 a 5.000,00', 3000.01, 5000, 6.01, 6.50, 7.00, 7.00, 7.00),
    ('Acima de 5.000,01', 5000.01, 999999999, 7.01, 7.50, 8.00, 8.00, 8.00)
) AS v(revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60)
WHERE NOT EXISTS (SELECT 1 FROM public.commission_channel_influencer);

-- Dados para commission_channel_indicator
INSERT INTO public.commission_channel_indicator (revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60)
SELECT * FROM (VALUES
    ('Até 500,00', 0, 500, 0.50, 0.67, 0.83, 0.83, 0.83),
    ('500,01 a 1.000,00', 500.01, 1000, 0.84, 1.08, 1.33, 1.33, 1.33),
    ('1.000,01 a 1.500,00', 1000.01, 1500, 1.34, 1.50, 1.67, 1.67, 1.67),
    ('1.500,01 a 3.000,00', 1500.01, 3000, 1.67, 1.83, 2.00, 2.00, 2.00),
    ('3.000,01 a 5.000,00', 3000.01, 5000, 2.00, 2.17, 2.50, 2.50, 2.50),
    ('Acima de 5.000,01', 5000.01, 999999999, 2.34, 2.50, 3.00, 3.00, 3.00)
) AS v(revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60)
WHERE NOT EXISTS (SELECT 1 FROM public.commission_channel_indicator);--
 ========================================
-- ETAPA 3: CONFIGURAR PERMISSÕES (RLS)
-- ========================================

-- Habilitar RLS nas tabelas
ALTER TABLE public.commission_channel_seller ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_channel_director ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_seller ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_channel_influencer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_channel_indicator ENABLE ROW LEVEL SECURITY;--
 ========================================
-- ETAPA 4: CRIAR POLÍTICAS DE ACESSO
-- ========================================

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Allow read for authenticated users" ON public.commission_channel_seller;
DROP POLICY IF EXISTS "Allow write for authenticated users" ON public.commission_channel_seller;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON public.commission_channel_director;
DROP POLICY IF EXISTS "Allow write for authenticated users" ON public.commission_channel_director;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON public.commission_seller;
DROP POLICY IF EXISTS "Allow write for authenticated users" ON public.commission_seller;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON public.commission_channel_influencer;
DROP POLICY IF EXISTS "Allow write for authenticated users" ON public.commission_channel_influencer;
DROP POLICY IF EXISTS "Allow read for authenticated users" ON public.commission_channel_indicator;
DROP POLICY IF EXISTS "Allow write for authenticated users" ON public.commission_channel_indicator;

-- Criar políticas para commission_channel_seller
CREATE POLICY "Allow read for authenticated users" ON public.commission_channel_seller
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write for authenticated users" ON public.commission_channel_seller
    FOR ALL USING (auth.role() = 'authenticated');

-- Criar políticas para commission_channel_director
CREATE POLICY "Allow read for authenticated users" ON public.commission_channel_director
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write for authenticated users" ON public.commission_channel_director
    FOR ALL USING (auth.role() = 'authenticated');

-- Criar políticas para commission_seller
CREATE POLICY "Allow read for authenticated users" ON public.commission_seller
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write for authenticated users" ON public.commission_seller
    FOR ALL USING (auth.role() = 'authenticated');

-- Criar políticas para commission_channel_influencer
CREATE POLICY "Allow read for authenticated users" ON public.commission_channel_influencer
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write for authenticated users" ON public.commission_channel_influencer
    FOR ALL USING (auth.role() = 'authenticated');

-- Criar políticas para commission_channel_indicator
CREATE POLICY "Allow read for authenticated users" ON public.commission_channel_indicator
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow write for authenticated users" ON public.commission_channel_indicator
    FOR ALL USING (auth.role() = 'authenticated');-- ==
======================================
-- ETAPA 5: VERIFICAR RESULTADO
-- ========================================

-- Verificar se as tabelas foram criadas
SELECT 
    table_name,
    'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'commission_channel_director',
    'commission_channel_seller', 
    'commission_seller',
    'commission_channel_influencer',
    'commission_channel_indicator'
)
ORDER BY table_name;

-- Contar registros em cada tabela
SELECT 
    'commission_channel_seller' as table_name,
    COUNT(*) as record_count
FROM public.commission_channel_seller
UNION ALL
SELECT 
    'commission_channel_director' as table_name,
    COUNT(*) as record_count
FROM public.commission_channel_director
UNION ALL
SELECT 
    'commission_seller' as table_name,
    COUNT(*) as record_count
FROM public.commission_seller
UNION ALL
SELECT 
    'commission_channel_influencer' as table_name,
    COUNT(*) as record_count
FROM public.commission_channel_influencer
UNION ALL
SELECT 
    'commission_channel_indicator' as table_name,
    COUNT(*) as record_count
FROM public.commission_channel_indicator
ORDER BY table_name;

-- Verificar dados de exemplo
SELECT 'CHANNEL_SELLER' as table_type, * FROM public.commission_channel_seller LIMIT 1;
SELECT 'SELLER' as table_type, * FROM public.commission_seller LIMIT 1;
SELECT 'CHANNEL_INFLUENCER' as table_type, * FROM public.commission_channel_influencer LIMIT 3;
SELECT 'CHANNEL_INDICATOR' as table_type, * FROM public.commission_channel_indicator LIMIT 3;