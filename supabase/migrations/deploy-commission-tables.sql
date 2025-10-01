-- Complete Commission Tables Migration Script
-- This script creates all new commission tables and updates existing ones
-- Execute this entire script in your Supabase SQL Editor

-- ============================================================================
-- PART 1: Create new commission tables
-- ============================================================================

-- Create commission_seller table (simple period-based structure)
CREATE TABLE IF NOT EXISTS commission_seller (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    months_12 DECIMAL(5,2) NOT NULL,
    months_24 DECIMAL(5,2) NOT NULL,
    months_36 DECIMAL(5,2) NOT NULL,
    months_48 DECIMAL(5,2) NOT NULL,
    months_60 DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create commission_channel_influencer table (revenue-range based structure)
CREATE TABLE IF NOT EXISTS commission_channel_influencer (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    revenue_range VARCHAR(50) NOT NULL,
    revenue_min DECIMAL(10,2) NOT NULL,
    revenue_max DECIMAL(10,2),
    months_12 DECIMAL(5,2) NOT NULL,
    months_24 DECIMAL(5,2) NOT NULL,
    months_36 DECIMAL(5,2) NOT NULL,
    months_48 DECIMAL(5,2) NOT NULL,
    months_60 DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(revenue_range)
);

-- Create commission_channel_indicator table (revenue-range based structure)
CREATE TABLE IF NOT EXISTS commission_channel_indicator (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    revenue_range VARCHAR(50) NOT NULL,
    revenue_min DECIMAL(10,2) NOT NULL,
    revenue_max DECIMAL(10,2),
    months_12 DECIMAL(5,2) NOT NULL,
    months_24 DECIMAL(5,2) NOT NULL,
    months_36 DECIMAL(5,2) NOT NULL,
    months_48 DECIMAL(5,2) NOT NULL,
    months_60 DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(revenue_range)
);

-- ============================================================================
-- PART 2: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_commission_seller_created_at ON commission_seller(created_at);
CREATE INDEX IF NOT EXISTS idx_commission_channel_influencer_revenue_range ON commission_channel_influencer(revenue_range);
CREATE INDEX IF NOT EXISTS idx_commission_channel_influencer_revenue_min ON commission_channel_influencer(revenue_min);
CREATE INDEX IF NOT EXISTS idx_commission_channel_indicator_revenue_range ON commission_channel_indicator(revenue_range);
CREATE INDEX IF NOT EXISTS idx_commission_channel_indicator_revenue_min ON commission_channel_indicator(revenue_min);

-- ============================================================================
-- PART 3: Enable Row Level Security and create policies
-- ============================================================================

-- Enable RLS
ALTER TABLE commission_seller ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_channel_influencer ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_channel_indicator ENABLE ROW LEVEL SECURITY;

-- RLS Policies for commission_seller
CREATE POLICY "Allow read for authenticated users" ON commission_seller
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert/update for admin users" ON commission_seller
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- RLS Policies for commission_channel_influencer
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

-- RLS Policies for commission_channel_indicator
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

-- ============================================================================
-- PART 4: Create triggers for automatic timestamp updates
-- ============================================================================

-- Create or update the trigger function for updated_at (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_commission_seller_updated_at 
    BEFORE UPDATE ON commission_seller 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commission_channel_influencer_updated_at 
    BEFORE UPDATE ON commission_channel_influencer 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commission_channel_indicator_updated_at 
    BEFORE UPDATE ON commission_channel_indicator 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 5: Insert default commission data
-- ============================================================================

-- Insert default commission data for commission_seller
-- Based on design document: 12 meses (1,2%), 24 meses (2,4%), 36 meses (3,6%), 48 meses (3,6%), 60 meses (3,6%)
INSERT INTO commission_seller (months_12, months_24, months_36, months_48, months_60) 
VALUES (1.2, 2.4, 3.6, 3.6, 3.6)
ON CONFLICT DO NOTHING;

-- Insert default commission data for commission_channel_influencer
-- Based on design document revenue ranges and commission percentages
INSERT INTO commission_channel_influencer (revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60) VALUES 
('Até 500,00', 0.00, 500.00, 1.50, 2.00, 2.50, 2.50, 2.50),
('500,01 a 1.000,00', 500.01, 1000.00, 2.51, 3.25, 4.00, 4.00, 4.00),
('1.000,01 a 1.500,00', 1000.01, 1500.00, 4.01, 4.50, 5.00, 5.00, 5.00),
('1.500,01 a 3.000,00', 1500.01, 3000.00, 5.01, 5.50, 6.00, 6.00, 6.00),
('3.000,01 a 5.000,00', 3000.01, 5000.00, 6.01, 6.50, 7.00, 7.00, 7.00),
('Acima de 5.000,01', 5000.01, NULL, 7.01, 7.50, 8.00, 8.00, 8.00)
ON CONFLICT (revenue_range) DO NOTHING;

-- Insert default commission data for commission_channel_indicator
-- Based on design document revenue ranges and commission percentages (lower than influencer)
INSERT INTO commission_channel_indicator (revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60) VALUES 
('Até 500,00', 0.00, 500.00, 0.50, 0.67, 0.83, 0.83, 0.83),
('500,01 a 1.000,00', 500.01, 1000.00, 0.84, 1.08, 1.33, 1.33, 1.33),
('1.000,01 a 1.500,00', 1000.01, 1500.00, 1.34, 1.50, 1.67, 1.67, 1.67),
('1.500,01 a 3.000,00', 1500.01, 3000.00, 1.67, 1.83, 2.00, 2.00, 2.00),
('3.000,01 a 5.000,00', 3000.01, 5000.00, 2.00, 2.17, 2.50, 2.50, 2.50),
('Acima de 5.000,01', 5000.01, NULL, 2.34, 2.50, 3.00, 3.00, 3.00)
ON CONFLICT (revenue_range) DO NOTHING;

-- ============================================================================
-- PART 6: Update existing commission tables with correct values
-- ============================================================================

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
WHERE EXISTS (SELECT 1 FROM commission_channel_seller);

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
WHERE EXISTS (SELECT 1 FROM commission_channel_director);

-- If no records exist in commission_channel_director, insert the correct values
INSERT INTO commission_channel_director (months_12, months_24, months_36, months_48, months_60)
SELECT 0.00, 0.00, 0.00, 0.00, 0.00
WHERE NOT EXISTS (SELECT 1 FROM commission_channel_director);

-- ============================================================================
-- PART 7: Add documentation comments
-- ============================================================================

-- Add table comments for documentation
COMMENT ON TABLE commission_seller IS 'Tabela para armazenar comissões do Vendedor com estrutura simples por período';
COMMENT ON TABLE commission_channel_influencer IS 'Tabela para armazenar comissões do Canal Influenciador baseada em faixas de receita mensal';
COMMENT ON TABLE commission_channel_indicator IS 'Tabela para armazenar comissões do Canal Indicador baseada em faixas de receita mensal';
COMMENT ON TABLE commission_channel_seller IS 'Tabela para armazenar comissões do Canal/Vendedor com estrutura simples por período';
COMMENT ON TABLE commission_channel_director IS 'Tabela para armazenar comissões do Diretor com estrutura simples por período';

-- Add column comments for new tables
COMMENT ON COLUMN commission_seller.months_12 IS 'Comissão para contratos de 12 meses (%)';
COMMENT ON COLUMN commission_seller.months_24 IS 'Comissão para contratos de 24 meses (%)';
COMMENT ON COLUMN commission_seller.months_36 IS 'Comissão para contratos de 36 meses (%)';
COMMENT ON COLUMN commission_seller.months_48 IS 'Comissão para contratos de 48 meses (%)';
COMMENT ON COLUMN commission_seller.months_60 IS 'Comissão para contratos de 60 meses (%)';

COMMENT ON COLUMN commission_channel_influencer.revenue_range IS 'Descrição da faixa de receita mensal';
COMMENT ON COLUMN commission_channel_influencer.revenue_min IS 'Valor mínimo da faixa de receita (R$)';
COMMENT ON COLUMN commission_channel_influencer.revenue_max IS 'Valor máximo da faixa de receita (R$) - NULL para faixa aberta';

COMMENT ON COLUMN commission_channel_indicator.revenue_range IS 'Descrição da faixa de receita mensal';
COMMENT ON COLUMN commission_channel_indicator.revenue_min IS 'Valor mínimo da faixa de receita (R$)';
COMMENT ON COLUMN commission_channel_indicator.revenue_max IS 'Valor máximo da faixa de receita (R$) - NULL para faixa aberta';

-- ============================================================================
-- VERIFICATION QUERIES (Optional - run these to verify the migration)
-- ============================================================================

-- Uncomment these queries to verify the data was inserted correctly:

-- SELECT 'commission_seller' as table_name, * FROM commission_seller;
-- SELECT 'commission_channel_influencer' as table_name, * FROM commission_channel_influencer ORDER BY revenue_min;
-- SELECT 'commission_channel_indicator' as table_name, * FROM commission_channel_indicator ORDER BY revenue_min;
-- SELECT 'commission_channel_seller' as table_name, * FROM commission_channel_seller;
-- SELECT 'commission_channel_director' as table_name, * FROM commission_channel_director;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- This migration script has:
-- 1. ✅ Created 3 new commission tables (seller, channel_influencer, channel_indicator)
-- 2. ✅ Added proper indexes for performance
-- 3. ✅ Enabled RLS and created security policies
-- 4. ✅ Created triggers for automatic timestamp updates
-- 5. ✅ Inserted default commission data based on design document
-- 6. ✅ Updated existing commission tables with correct values
-- 7. ✅ Added comprehensive documentation comments