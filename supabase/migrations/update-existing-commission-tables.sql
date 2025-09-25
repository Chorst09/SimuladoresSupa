-- Update existing commission tables to match new structure and data
-- Run this after the main commission-tables-update.sql migration

-- Update commission_channel_seller with correct values from design document
-- Canal/Vendedor: 12 meses (0,60%), 24 meses (1,20%), 36 meses (2,00%), 48 meses (2,00%), 60 meses (2,00%)
UPDATE commission_channel_seller 
SET 
    months_12 = 0.60,
    months_24 = 1.20,
    months_36 = 2.00,
    months_48 = 2.00,
    months_60 = 2.00,
    updated_at = NOW()
WHERE id IN (SELECT id FROM commission_channel_seller LIMIT 1);

-- If no records exist in commission_channel_seller, insert the correct values
INSERT INTO commission_channel_seller (months_12, months_24, months_36, months_48, months_60)
SELECT 0.60, 1.20, 2.00, 2.00, 2.00
WHERE NOT EXISTS (SELECT 1 FROM commission_channel_seller);

-- Update commission_channel_director with correct values (all zeros as per design)
-- Diretor: Todos os períodos: 0%
UPDATE commission_channel_director 
SET 
    months_12 = 0.00,
    months_24 = 0.00,
    months_36 = 0.00,
    months_48 = 0.00,
    months_60 = 0.00,
    updated_at = NOW()
WHERE id IN (SELECT id FROM commission_channel_director LIMIT 1);

-- If no records exist in commission_channel_director, insert the correct values
INSERT INTO commission_channel_director (months_12, months_24, months_36, months_48, months_60)
SELECT 0.00, 0.00, 0.00, 0.00, 0.00
WHERE NOT EXISTS (SELECT 1 FROM commission_channel_director);

-- Update table comments for existing tables
COMMENT ON TABLE commission_channel_seller IS 'Tabela para armazenar comissões do Canal/Vendedor com estrutura simples por período';
COMMENT ON TABLE commission_channel_director IS 'Tabela para armazenar comissões do Diretor com estrutura simples por período';

-- Add column comments for existing tables
COMMENT ON COLUMN commission_channel_seller.months_12 IS 'Comissão Canal/Vendedor para contratos de 12 meses (%)';
COMMENT ON COLUMN commission_channel_seller.months_24 IS 'Comissão Canal/Vendedor para contratos de 24 meses (%)';
COMMENT ON COLUMN commission_channel_seller.months_36 IS 'Comissão Canal/Vendedor para contratos de 36 meses (%)';
COMMENT ON COLUMN commission_channel_seller.months_48 IS 'Comissão Canal/Vendedor para contratos de 48 meses (%)';
COMMENT ON COLUMN commission_channel_seller.months_60 IS 'Comissão Canal/Vendedor para contratos de 60 meses (%)';

COMMENT ON COLUMN commission_channel_director.months_12 IS 'Comissão Diretor para contratos de 12 meses (%)';
COMMENT ON COLUMN commission_channel_director.months_24 IS 'Comissão Diretor para contratos de 24 meses (%)';
COMMENT ON COLUMN commission_channel_director.months_36 IS 'Comissão Diretor para contratos de 36 meses (%)';
COMMENT ON COLUMN commission_channel_director.months_48 IS 'Comissão Diretor para contratos de 48 meses (%)';
COMMENT ON COLUMN commission_channel_director.months_60 IS 'Comissão Diretor para contratos de 60 meses (%)';