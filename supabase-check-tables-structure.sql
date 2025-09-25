-- Script para verificar a estrutura atual das tabelas
-- Execute este SQL no Supabase SQL Editor para ver as colunas existentes

-- Verificar estrutura da tabela commission_channel_influencer
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'commission_channel_influencer' 
ORDER BY ordinal_position;

-- Verificar estrutura da tabela commission_channel_indicator
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'commission_channel_indicator' 
ORDER BY ordinal_position;

-- Verificar todas as tabelas de comissão existentes
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE 'commission_%' 
AND table_schema = 'public';

-- Verificar dados existentes nas tabelas
SELECT 'commission_channel_influencer' as tabela, COUNT(*) as registros FROM commission_channel_influencer
UNION ALL
SELECT 'commission_channel_indicator' as tabela, COUNT(*) as registros FROM commission_channel_indicator
UNION ALL
SELECT 'commission_channel_director' as tabela, COUNT(*) as registros FROM commission_channel_director
UNION ALL
SELECT 'commission_channel_seller' as tabela, COUNT(*) as registros FROM commission_channel_seller;