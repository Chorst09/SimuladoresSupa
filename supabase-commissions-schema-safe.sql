-- Schema seguro para tabelas de comissões no Supabase
-- Este script verifica se os elementos já existem antes de criá-los
-- Execute este SQL no Supabase SQL Editor

-- Criar função para atualizar updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar tabela para comissões do Diretor (se não existir)
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

-- Criar tabela para comissões do Canal/Vendedor (se não existir)
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

-- Criar tabela para comissões do Vendedor (se não existir)
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

-- Criar tabela para comissões do Canal Influenciador (se não existir)
CREATE TABLE IF NOT EXISTS commission_channel_influencer (
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

-- Criar tabela para comissões do Canal Indicador (se não existir)
CREATE TABLE IF NOT EXISTS commission_channel_indicator (
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

-- Habilitar RLS em todas as tabelas
ALTER TABLE commission_channel_director ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_channel_seller ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_seller ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_channel_influencer ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_channel_indicator ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança (com verificação de existência)
DO $$
BEGIN
    -- Políticas para commission_channel_director
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'commission_channel_director' 
        AND policyname = 'Allow read for authenticated users'
    ) THEN
        CREATE POLICY "Allow read for authenticated users" ON commission_channel_director
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'commission_channel_director' 
        AND policyname = 'Allow insert/update for admin users'
    ) THEN
        CREATE POLICY "Allow insert/update for admin users" ON commission_channel_director
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.id = auth.uid() 
                    AND users.role = 'admin'
                )
            );
    END IF;

    -- Políticas para commission_channel_seller
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'commission_channel_seller' 
        AND policyname = 'Allow read for authenticated users'
    ) THEN
        CREATE POLICY "Allow read for authenticated users" ON commission_channel_seller
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'commission_channel_seller' 
        AND policyname = 'Allow insert/update for admin users'
    ) THEN
        CREATE POLICY "Allow insert/update for admin users" ON commission_channel_seller
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.id = auth.uid() 
                    AND users.role = 'admin'
                )
            );
    END IF;

    -- Políticas para commission_seller
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'commission_seller' 
        AND policyname = 'Allow read for authenticated users'
    ) THEN
        CREATE POLICY "Allow read for authenticated users" ON commission_seller
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'commission_seller' 
        AND policyname = 'Allow insert/update for admin users'
    ) THEN
        CREATE POLICY "Allow insert/update for admin users" ON commission_seller
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.id = auth.uid() 
                    AND users.role = 'admin'
                )
            );
    END IF;

    -- Políticas para commission_channel_influencer
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'commission_channel_influencer' 
        AND policyname = 'Allow read for authenticated users'
    ) THEN
        CREATE POLICY "Allow read for authenticated users" ON commission_channel_influencer
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'commission_channel_influencer' 
        AND policyname = 'Allow insert/update for admin users'
    ) THEN
        CREATE POLICY "Allow insert/update for admin users" ON commission_channel_influencer
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users 
                    WHERE users.id = auth.uid() 
                    AND users.role = 'admin'
                )
            );
    END IF;

    -- Políticas para commission_channel_indicator
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'commission_channel_indicator' 
        AND policyname = 'Allow read for authenticated users'
    ) THEN
        CREATE POLICY "Allow read for authenticated users" ON commission_channel_indicator
            FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'commission_channel_indicator' 
        AND policyname = 'Allow insert/update for admin users'
    ) THEN
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

-- Criar triggers para atualizar updated_at (com verificação de existência)
DO $$
BEGIN
    -- Trigger para commission_channel_director
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_commission_channel_director_updated_at'
    ) THEN
        CREATE TRIGGER update_commission_channel_director_updated_at 
            BEFORE UPDATE ON commission_channel_director 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger para commission_channel_seller
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_commission_channel_seller_updated_at'
    ) THEN
        CREATE TRIGGER update_commission_channel_seller_updated_at 
            BEFORE UPDATE ON commission_channel_seller 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger para commission_seller
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_commission_seller_updated_at'
    ) THEN
        CREATE TRIGGER update_commission_seller_updated_at 
            BEFORE UPDATE ON commission_seller 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger para commission_channel_influencer
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_commission_channel_influencer_updated_at'
    ) THEN
        CREATE TRIGGER update_commission_channel_influencer_updated_at 
            BEFORE UPDATE ON commission_channel_influencer 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Trigger para commission_channel_indicator
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_commission_channel_indicator_updated_at'
    ) THEN
        CREATE TRIGGER update_commission_channel_indicator_updated_at 
            BEFORE UPDATE ON commission_channel_indicator 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Comentários para documentação
COMMENT ON TABLE commission_channel_director IS 'Tabela para armazenar comissões do Diretor';
COMMENT ON TABLE commission_channel_seller IS 'Tabela para armazenar comissões do Canal/Vendedor';
COMMENT ON TABLE commission_seller IS 'Tabela para armazenar comissões do Vendedor';
COMMENT ON TABLE commission_channel_influencer IS 'Tabela para armazenar comissões do Canal Influenciador';
COMMENT ON TABLE commission_channel_indicator IS 'Tabela para armazenar comissões do Canal Indicador';