-- Schema para tabelas de comissões no Supabase
-- Execute este SQL no Supabase SQL Editor

-- Tabela para comissões do Diretor
CREATE TABLE IF NOT EXISTS commission_channel_director (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    months_12 DECIMAL(12,2) NOT NULL,
    months_24 DECIMAL(12,2) NOT NULL,
    months_36 DECIMAL(12,2) NOT NULL,
    months_48 DECIMAL(12,2) NOT NULL,
    months_60 DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Tabela para comissões do Canal/Vendedor
CREATE TABLE IF NOT EXISTS commission_channel_seller (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    months_12 DECIMAL(12,2) NOT NULL,
    months_24 DECIMAL(12,2) NOT NULL,
    months_36 DECIMAL(12,2) NOT NULL,
    months_48 DECIMAL(12,2) NOT NULL,
    months_60 DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Tabela para comissões do Vendedor (Individual)
CREATE TABLE IF NOT EXISTS commission_seller (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    months_12 DECIMAL(12,2) NOT NULL,
    months_24 DECIMAL(12,2) NOT NULL,
    months_36 DECIMAL(12,2) NOT NULL,
    months_48 DECIMAL(12,2) NOT NULL,
    months_60 DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Tabela para comissões do Canal Influenciador
CREATE TABLE IF NOT EXISTS commission_channel_influencer (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    revenue_range VARCHAR(255) NOT NULL,
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

-- Tabela para comissões do Canal Indicador
CREATE TABLE IF NOT EXISTS commission_channel_indicator (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    revenue_range VARCHAR(255) NOT NULL,
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
ALTER TABLE commission_channel_director ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_channel_seller ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_seller ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_channel_influencer ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_channel_indicator ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (leitura para autenticados)
DROP POLICY IF EXISTS "Allow read for authenticated users" ON commission_channel_director;
CREATE POLICY "Allow read for authenticated users" ON commission_channel_director FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow read for authenticated users" ON commission_channel_seller;
CREATE POLICY "Allow read for authenticated users" ON commission_channel_seller FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow read for authenticated users" ON commission_seller;
CREATE POLICY "Allow read for authenticated users" ON commission_seller FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow read for authenticated users" ON commission_channel_influencer;
CREATE POLICY "Allow read for authenticated users" ON commission_channel_influencer FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow read for authenticated users" ON commission_channel_indicator;
CREATE POLICY "Allow read for authenticated users" ON commission_channel_indicator FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas de segurança (escrita para admin)
DROP POLICY IF EXISTS "Allow all for admin users" ON commission_channel_director;
CREATE POLICY "Allow all for admin users" ON commission_channel_director FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Allow all for admin users" ON commission_channel_seller;
CREATE POLICY "Allow all for admin users" ON commission_channel_seller FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Allow all for admin users" ON commission_seller;
CREATE POLICY "Allow all for admin users" ON commission_seller FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Allow all for admin users" ON commission_channel_influencer;
CREATE POLICY "Allow all for admin users" ON commission_channel_influencer FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Allow all for admin users" ON commission_channel_indicator;
CREATE POLICY "Allow all for admin users" ON commission_channel_indicator FOR ALL USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));


-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger para cada tabela
DROP TRIGGER IF EXISTS update_commission_channel_director_updated_at ON commission_channel_director;
CREATE TRIGGER update_commission_channel_director_updated_at BEFORE UPDATE ON commission_channel_director FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_commission_channel_seller_updated_at ON commission_channel_seller;
CREATE TRIGGER update_commission_channel_seller_updated_at BEFORE UPDATE ON commission_channel_seller FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_commission_seller_updated_at ON commission_seller;
CREATE TRIGGER update_commission_seller_updated_at BEFORE UPDATE ON commission_seller FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_commission_channel_influencer_updated_at ON commission_channel_influencer;
CREATE TRIGGER update_commission_channel_influencer_updated_at BEFORE UPDATE ON commission_channel_influencer FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_commission_channel_indicator_updated_at ON commission_channel_indicator;
CREATE TRIGGER update_commission_channel_indicator_updated_at BEFORE UPDATE ON commission_channel_indicator FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais (baseado nos fallbacks do código)
-- Inserir apenas se a tabela estiver vazia

INSERT INTO commission_channel_director (months_12, months_24, months_36, months_48, months_60)
SELECT 0, 0, 0, 0, 0 WHERE NOT EXISTS (SELECT 1 FROM commission_channel_director);

INSERT INTO commission_channel_seller (months_12, months_24, months_36, months_48, months_60)
SELECT 0.60, 1.20, 2.00, 2.00, 2.00 WHERE NOT EXISTS (SELECT 1 FROM commission_channel_seller);

INSERT INTO commission_seller (months_12, months_24, months_36, months_48, months_60)
SELECT 1.2, 2.4, 3.6, 3.6, 3.6 WHERE NOT EXISTS (SELECT 1 FROM commission_seller);

INSERT INTO commission_channel_influencer (revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60)
SELECT * FROM (VALUES
  ('Até 500,00', 0, 500, 1.50, 2.00, 2.50, 2.50, 2.50),
  ('500,01 a 1.000,00', 500.01, 1000, 2.51, 3.25, 4.00, 4.00, 4.00),
  ('1.000,01 a 1.500,00', 1000.01, 1500, 4.01, 4.50, 5.00, 5.00, 5.00),
  ('1.500,01 a 3.000,00', 1500.01, 3000, 5.01, 5.50, 6.00, 6.00, 6.00),
  ('3.000,01 a 5.000,00', 3000.01, 5000, 6.01, 6.50, 7.00, 7.00, 7.00),
  ('Acima de 5.000,01', 5000.01, 999999999, 7.01, 7.50, 8.00, 8.00, 8.00)
) AS data(revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60)
WHERE NOT EXISTS (SELECT 1 FROM commission_channel_influencer);

INSERT INTO commission_channel_indicator (revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60)
SELECT * FROM (VALUES
  ('Até 500,00', 0, 500, 0.50, 0.67, 0.83, 0.83, 0.83),
  ('500,01 a 1.000,00', 500.01, 1000, 0.84, 1.08, 1.33, 1.33, 1.33),
  ('1.000,01 a 1.500,00', 1000.01, 1500, 1.34, 1.50, 1.67, 1.67, 1.67),
  ('1.500,01 a 3.000,00', 1500.01, 3000, 1.67, 1.83, 2.00, 2.00, 2.00),
  ('3.000,01 a 5.000,00', 3000.01, 5000, 2.00, 2.17, 2.50, 2.50, 2.50),
  ('Acima de 5.000,01', 5000.01, 999999999, 2.34, 2.50, 3.00, 3.00, 3.00)
) AS data(revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60)
WHERE NOT EXISTS (SELECT 1 FROM commission_channel_indicator);
