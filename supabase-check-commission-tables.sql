-- Script para verificar se as tabelas de comissões existem e têm dados
-- Execute este SQL no Supabase SQL Editor

-- Verificar se as tabelas existem
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN 'EXISTS'
        ELSE 'NOT EXISTS'
    END as status
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

-- Verificar estrutura das tabelas (se existirem)
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN (
    'commission_channel_director',
    'commission_channel_seller', 
    'commission_seller',
    'commission_channel_influencer',
    'commission_channel_indicator'
)
ORDER BY table_name, ordinal_position;

-- Contar registros em cada tabela (se existirem)
DO $$
DECLARE
    table_name text;
    sql_query text;
    record_count integer;
BEGIN
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        WHERE t.table_schema = 'public' 
        AND t.table_name IN (
            'commission_channel_director',
            'commission_channel_seller', 
            'commission_seller',
            'commission_channel_influencer',
            'commission_channel_indicator'
        )
    LOOP
        sql_query := 'SELECT COUNT(*) FROM ' || table_name;
        EXECUTE sql_query INTO record_count;
        RAISE NOTICE 'Tabela %: % registros', table_name, record_count;
    END LOOP;
END $$;

-- Verificar dados de exemplo (primeiros registros de cada tabela)
DO $$
DECLARE
    table_exists boolean;
BEGIN
    -- commission_channel_director
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'commission_channel_director'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '=== COMMISSION_CHANNEL_DIRECTOR ===';
        PERFORM * FROM commission_channel_director LIMIT 1;
    END IF;

    -- commission_channel_seller
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'commission_channel_seller'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '=== COMMISSION_CHANNEL_SELLER ===';
        PERFORM * FROM commission_channel_seller LIMIT 1;
    END IF;

    -- commission_seller
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'commission_seller'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '=== COMMISSION_SELLER ===';
        PERFORM * FROM commission_seller LIMIT 1;
    END IF;

    -- commission_channel_influencer
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'commission_channel_influencer'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '=== COMMISSION_CHANNEL_INFLUENCER ===';
        PERFORM * FROM commission_channel_influencer LIMIT 3;
    END IF;

    -- commission_channel_indicator
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'commission_channel_indicator'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '=== COMMISSION_CHANNEL_INDICATOR ===';
        PERFORM * FROM commission_channel_indicator LIMIT 3;
    END IF;
END $$;