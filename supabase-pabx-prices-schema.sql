-- Schema para tabela de preços PABX no Supabase
-- Execute este SQL no Supabase SQL Editor

-- Criar tabela para preços PABX
CREATE TABLE IF NOT EXISTS pabx_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    price_type VARCHAR(50) NOT NULL, -- 'standard', 'premium', 'sip', 'ai_agent'
    category VARCHAR(50) NOT NULL, -- 'setup', 'monthly', 'hosting', 'device'
    range_key VARCHAR(20) NOT NULL, -- '10', '20', '30', '50', '100', '500', '1000'
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(price_type, category, range_key)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_pabx_prices_type_category ON pabx_prices(price_type, category);
CREATE INDEX IF NOT EXISTS idx_pabx_prices_range ON pabx_prices(range_key);

-- Habilitar RLS
ALTER TABLE pabx_prices ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Allow read for authenticated users" ON pabx_prices
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert/update for authenticated users" ON pabx_prices
    FOR ALL USING (auth.role() = 'authenticated');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_pabx_prices_updated_at 
    BEFORE UPDATE ON pabx_prices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais com os novos valores
INSERT INTO pabx_prices (price_type, category, range_key, price) VALUES
-- Setup prices
('standard', 'setup', '10', 1250.00),
('standard', 'setup', '20', 2000.00),
('standard', 'setup', '30', 2500.00),
('standard', 'setup', '50', 3000.00),
('standard', 'setup', '100', 3500.00),
('standard', 'setup', '500', 4000.00), -- De 101 a 500
('standard', 'setup', '1000', 4500.00), -- De 501 a 1000

-- Monthly prices per extension
('standard', 'monthly', '10', 30.00),
('standard', 'monthly', '20', 29.00),
('standard', 'monthly', '30', 28.00),
('standard', 'monthly', '50', 27.00),
('standard', 'monthly', '100', 26.00),
('standard', 'monthly', '500', 25.00),
('standard', 'monthly', '1000', 24.50),

-- Hosting prices
('standard', 'hosting', '10', 200.00),
('standard', 'hosting', '20', 220.00),
('standard', 'hosting', '30', 250.00),
('standard', 'hosting', '50', 300.00),
('standard', 'hosting', '100', 400.00),
('standard', 'hosting', '500', 450.00), -- De 01 a 500
('standard', 'hosting', '1000', 500.00), -- De 501 a 1000

-- Device rental prices
('standard', 'device', '10', 35.00),
('standard', 'device', '20', 34.00),
('standard', 'device', '30', 33.00),
('standard', 'device', '50', 32.00),
('standard', 'device', '100', 30.00),
('standard', 'device', '500', 29.00), -- De 101 a 500
('standard', 'device', '1000', 28.00) -- De 501 a 1000
ON CONFLICT (price_type, category, range_key) 
DO UPDATE SET 
    price = EXCLUDED.price,
    updated_at = NOW();

COMMENT ON TABLE pabx_prices IS 'Tabela para armazenar preços da calculadora PABX';