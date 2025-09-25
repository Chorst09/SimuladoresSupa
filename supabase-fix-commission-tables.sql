-- Script para corrigir a estrutura das tabelas de comissões
-- Execute este SQL no Supabase SQL Editor

-- Verificar estrutura atual das tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN (
    'commission_channel_influencer',
    'commission_channel_indicator'
)
ORDER BY table_name, ordinal_position;

-- Verificar se as tabelas existem e têm a estrutura correta
DO $$
DECLARE
    influencer_has_revenue_range boolean := false;
    indicator_has_revenue_range boolean := false;
BEGIN
    -- Verificar se commission_channel_influencer tem revenue_range
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'commission_channel_influencer' 
        AND column_name = 'revenue_range'
    ) INTO influencer_has_revenue_range;
    
    -- Verificar se commission_channel_indicator tem revenue_range
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'commission_channel_indicator' 
        AND column_name = 'revenue_range'
    ) INTO indicator_has_revenue_range;
    
    RAISE NOTICE 'commission_channel_influencer tem revenue_range: %', influencer_has_revenue_range;
    RAISE NOTICE 'commission_channel_indicator tem revenue_range: %', indicator_has_revenue_range;
    
    -- Se as tabelas existem mas não têm a estrutura correta, vamos recriá-las
    IF NOT influencer_has_revenue_range THEN
        RAISE NOTICE 'Recriando commission_channel_influencer...';
        DROP TABLE IF EXISTS commission_channel_influencer CASCADE;
        
        CREATE TABLE commission_channel_influencer (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            revenue_range TEXT NOT NULL,
            revenue_min DECIMAL(12,2) NOT NULL,
            revenue_max DECIMAL(12,2) NOT NULL,
            months_12 DECIMAL(12,2) NOT NULL,
            months_24 DECIMAL(12,2) NOT NULL,
            months_36 DECIMAL(12,2) NOT NULL,
            months_48 DECIMAL(12,2) NOT NULL,
            months_60 DECIMAL(12,2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_by UUID REFERENCES auth.users(id)
        );
        
        -- Habilitar RLS
        ALTER TABLE commission_channel_influencer ENABLE ROW LEVEL SECURITY;
        
        -- Criar políticas
        CREATE POLICY "Allow read for authenticated users" ON commission_channel_influencer
            FOR SELECT USING (auth.role() = 'authenticated');
            
        CREATE POLICY "Allow insert/update for admin users" ON commission_channel_influencer
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.id = auth.uid() 
                    AND users.role = 'admin'
                )
            );
    END IF;
    
    IF NOT indicator_has_revenue_range THEN
        RAISE NOTICE 'Recriando commission_channel_indicator...';
        DROP TABLE IF EXISTS commission_channel_indicator CASCADE;
        
        CREATE TABLE commission_channel_indicator (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            revenue_range TEXT NOT NULL,
            revenue_min DECIMAL(12,2) NOT NULL,
            revenue_max DECIMAL(12,2) NOT NULL,
            months_12 DECIMAL(12,2) NOT NULL,
            months_24 DECIMAL(12,2) NOT NULL,
            months_36 DECIMAL(12,2) NOT NULL,
            months_48 DECIMAL(12,2) NOT NULL,
            months_60 DECIMAL(12,2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_by UUID REFERENCES auth.users(id)
        );
        
        -- Habilitar RLS
        ALTER TABLE commission_channel_indicator ENABLE ROW LEVEL SECURITY;
        
        -- Criar políticas
        CREATE POLICY "Allow read for authenticated users" ON commission_channel_indicator
            FOR SELECT USING (auth.role() = 'authenticated');
            
        CREATE POLICY "Allow insert/update for admin users" ON commission_channel_indicator
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.id = auth.uid() 
                    AND users.role = 'admin'
                )
            );
    END IF;
END $$;

-- Inserir dados nas tabelas corrigidas
DELETE FROM commission_channel_influencer;
INSERT INTO commission_channel_influencer (revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60) VALUES 
('Até 500,00', 0.00, 500.00, 1.50, 2.00, 2.50, 2.50, 2.50),
('500,01 a 1.000,00', 500.01, 1000.00, 2.51, 3.25, 4.00, 4.00, 4.00),
('1.000,01 a 1.500,00', 1000.01, 1500.00, 4.01, 4.50, 5.00, 5.00, 5.00),
('1.500,01 a 3.000,00', 1500.01, 3000.00, 5.01, 5.50, 6.00, 6.00, 6.00),
('3.000,01 a 5.000,00', 3000.01, 5000.00, 6.01, 6.50, 7.00, 7.00, 7.00),
('Acima de 5.000,01', 5000.01, 999999999.99, 7.01, 7.50, 8.00, 8.00, 8.00);

DELETE FROM commission_channel_indicator;
INSERT INTO commission_channel_indicator (revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60) VALUES 
('Até 500,00', 0.00, 500.00, 0.50, 0.67, 0.83, 0.83, 0.83),
('500,01 a 1.000,00', 500.01, 1000.00, 0.84, 1.08, 1.33, 1.33, 1.33),
('1.000,01 a 1.500,00', 1000.01, 1500.00, 1.34, 1.50, 1.67, 1.67, 1.67),
('1.500,01 a 3.000,00', 1500.01, 3000.00, 1.67, 1.83, 2.00, 2.00, 2.00),
('3.000,01 a 5.000,00', 3000.01, 5000.00, 2.00, 2.17, 2.50, 2.50, 2.50),
('Acima de 5.000,01', 5000.01, 999999999.99, 2.34, 2.50, 3.00, 3.00, 3.00);

-- Verificar se os dados foram inseridos
SELECT 'commission_channel_influencer' as tabela, COUNT(*) as registros FROM commission_channel_influencer
UNION ALL
SELECT 'commission_channel_indicator' as tabela, COUNT(*) as registros FROM commission_channel_indicator;

-- Mostrar alguns dados de exemplo
SELECT 'INFLUENCER - Primeiros 3 registros:' as info;
SELECT revenue_range, months_12, months_24, months_36 FROM commission_channel_influencer LIMIT 3;

SELECT 'INDICATOR - Primeiros 3 registros:' as info;
SELECT revenue_range, months_12, months_24, months_36 FROM commission_channel_indicator LIMIT 3;