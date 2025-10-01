-- Atualizar valores da tabela commission_channel_indicator
DELETE FROM commission_channel_indicator;
INSERT INTO commission_channel_indicator (monthly_revenue_min, monthly_revenue_max, months_12, months_24, months_36, months_48, months_60) VALUES 
(0, 500.00, 0.50, 1.00, 1.50, 1.50, 1.50),
(500.01, 1000.00, 1.34, 1.50, 1.67, 1.67, 1.67),
(1000.01, 1500.00, 1.67, 1.83, 2.00, 2.00, 2.00),
(1500.01, 3000.00, 2.00, 2.17, 2.50, 2.50, 2.50),
(3000.01, 5000.00, 2.34, 2.50, 3.00, 3.00, 3.00),
(5000.01, 999999999.99, 2.34, 2.50, 3.00, 3.00, 3.00);

-- Atualizar valores da tabela commission_channel_influencer
DELETE FROM commission_channel_influencer;
INSERT INTO commission_channel_influencer (monthly_revenue_min, monthly_revenue_max, months_12, months_24, months_36, months_48, months_60) VALUES 
(0, 500.00, 1.50, 2.00, 2.50, 2.50, 2.50),
(500.01, 1000.00, 2.51, 3.25, 4.00, 4.00, 4.00),
(1000.01, 1500.00, 4.01, 4.50, 5.50, 5.50, 5.50),
(1500.01, 3000.00, 5.51, 6.50, 7.00, 7.00, 7.00),
(3000.01, 5000.00, 6.01, 6.50, 7.00, 7.00, 7.00),
(5000.01, 6500.00, 6.51, 7.00, 7.50, 7.50, 7.50),
(6500.01, 9000.00, 7.01, 7.50, 8.00, 8.00, 8.00),
(9000.01, 999999999.99, 7.51, 8.00, 8.50, 8.50, 8.50);

-- Atualizar valores da tabela commission_channel_seller
DELETE FROM commission_channel_seller;
INSERT INTO commission_channel_seller (months_12, months_24, months_36, months_48, months_60) VALUES 
(0.60, 1.20, 2.00, 2.00, 2.00);

-- Criar e atualizar tabela para comissões do Diretor
CREATE TABLE IF NOT EXISTS commission_channel_director (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    months_12 DECIMAL(5,2),
    months_24 DECIMAL(5,2),
    months_36 DECIMAL(5,2),
    months_48 DECIMAL(5,2),
    months_60 DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE commission_channel_director ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
DO $$
BEGIN
    -- Verificar se a política "Allow read for authenticated users" já existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'commission_channel_director' 
        AND policyname = 'Allow read for authenticated users'
    ) THEN
        EXECUTE 'CREATE POLICY "Allow read for authenticated users" ON commission_channel_director
                FOR SELECT USING (auth.role() = ''authenticated'')';
    END IF;

    -- Verificar se a política "Allow insert/update for admin users" já existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'commission_channel_director' 
        AND policyname = 'Allow insert/update for admin users'
    ) THEN
        EXECUTE 'CREATE POLICY "Allow insert/update for admin users" ON commission_channel_director
                FOR ALL USING (
                    EXISTS (
                        SELECT 1 FROM users 
                        WHERE users.id = auth.uid() 
                        AND users.role = ''admin''
                    )
                )';
    END IF;
END $$;

-- Trigger para atualizar updated_at
DO $$
BEGIN
    -- Verificar se o trigger já existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_commission_channel_director_updated_at'
        AND tgrelid = 'commission_channel_director'::regclass
    ) THEN
        EXECUTE 'CREATE TRIGGER update_commission_channel_director_updated_at 
                BEFORE UPDATE ON commission_channel_director 
                FOR EACH ROW 
                EXECUTE FUNCTION update_updated_at_column()';
    END IF;
END $$;

-- Atualizar valores da tabela commission_channel_director
DELETE FROM commission_channel_director;
INSERT INTO commission_channel_director (months_12, months_24, months_36, months_48, months_60) VALUES 
(1.20, 2.40, 3.60, 3.60, 3.60);