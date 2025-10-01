-- Schema para tabelas de comissões no Supabase
-- Execute este SQL no Supabase SQL Editor

-- Criar tabela para comissões do Diretor
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

-- Criar tabela para comissões do Vendedor
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

-- Habilitar RLS
ALTER TABLE commission_channel_director ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_channel_seller ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Allow read for authenticated users" ON commission_channel_director
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read for authenticated users" ON commission_channel_seller
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert/update for admin users" ON commission_channel_director
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Allow insert/update for admin users" ON commission_channel_seller
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_commission_channel_director_updated_at 
    BEFORE UPDATE ON commission_channel_director 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commission_channel_seller_updated_at 
    BEFORE UPDATE ON commission_channel_seller 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais para Diretor
INSERT INTO commission_channel_director (months_12, months_24, months_36, months_48, months_60) VALUES 
(0, 0, 0, 0, 0);

-- Inserir dados iniciais para Vendedor
INSERT INTO commission_channel_seller (months_12, months_24, months_36, months_48, months_60) VALUES 
(1.2, 2.4, 3.6, 3.6, 3.6);

-- Comentários para documentação
COMMENT ON TABLE commission_channel_director IS 'Tabela para armazenar comissões do Diretor';
COMMENT ON TABLE commission_channel_seller IS 'Tabela para armazenar comissões do Vendedor';