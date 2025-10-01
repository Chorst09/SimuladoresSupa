-- Commission Tables Update Migration
-- Creates new commission tables for channel_influencer, channel_indicator, and seller
-- Run this in your Supabase SQL Editor

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_commission_seller_created_at ON commission_seller(created_at);
CREATE INDEX IF NOT EXISTS idx_commission_channel_influencer_revenue_range ON commission_channel_influencer(revenue_range);
CREATE INDEX IF NOT EXISTS idx_commission_channel_influencer_revenue_min ON commission_channel_influencer(revenue_min);
CREATE INDEX IF NOT EXISTS idx_commission_channel_indicator_revenue_range ON commission_channel_indicator(revenue_range);
CREATE INDEX IF NOT EXISTS idx_commission_channel_indicator_revenue_min ON commission_channel_indicator(revenue_min);

-- Enable Row Level Security (RLS)
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

-- Insert default commission data for commission_seller
-- Based on design document: 12 meses (1,2%), 24 meses (2,4%), 36 meses (3,6%), 48 meses (3,6%), 60 meses (3,6%)
INSERT INTO commission_seller (months_12, months_24, months_36, months_48, months_60) VALUES 
(1.2, 2.4, 3.6, 3.6, 3.6);

-- Insert default commission data for commission_channel_influencer
-- Based on design document revenue ranges and commission percentages
INSERT INTO commission_channel_influencer (revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60) VALUES 
('Até 500,00', 0.00, 500.00, 1.50, 2.00, 2.50, 2.50, 2.50),
('500,01 a 1.000,00', 500.01, 1000.00, 2.51, 3.25, 4.00, 4.00, 4.00),
('1.000,01 a 1.500,00', 1000.01, 1500.00, 4.01, 4.50, 5.00, 5.00, 5.00),
('1.500,01 a 3.000,00', 1500.01, 3000.00, 5.01, 5.50, 6.00, 6.00, 6.00),
('3.000,01 a 5.000,00', 3000.01, 5000.00, 6.01, 6.50, 7.00, 7.00, 7.00),
('Acima de 5.000,01', 5000.01, NULL, 7.01, 7.50, 8.00, 8.00, 8.00);

-- Insert default commission data for commission_channel_indicator
-- Based on design document revenue ranges and commission percentages (lower than influencer)
INSERT INTO commission_channel_indicator (revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60) VALUES 
('Até 500,00', 0.00, 500.00, 0.50, 0.67, 0.83, 0.83, 0.83),
('500,01 a 1.000,00', 500.01, 1000.00, 0.84, 1.08, 1.33, 1.33, 1.33),
('1.000,01 a 1.500,00', 1000.01, 1500.00, 1.34, 1.50, 1.67, 1.67, 1.67),
('1.500,01 a 3.000,00', 1500.01, 3000.00, 1.67, 1.83, 2.00, 2.00, 2.00),
('3.000,01 a 5.000,00', 3000.01, 5000.00, 2.00, 2.17, 2.50, 2.50, 2.50),
('Acima de 5.000,01', 5000.01, NULL, 2.34, 2.50, 3.00, 3.00, 3.00);

-- Add table comments for documentation
COMMENT ON TABLE commission_seller IS 'Tabela para armazenar comissões do Vendedor com estrutura simples por período';
COMMENT ON TABLE commission_channel_influencer IS 'Tabela para armazenar comissões do Canal Influenciador baseada em faixas de receita mensal';
COMMENT ON TABLE commission_channel_indicator IS 'Tabela para armazenar comissões do Canal Indicador baseada em faixas de receita mensal';

-- Add column comments
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