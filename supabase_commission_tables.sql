-- Script SQL Corrigido para criar e popular as tabelas de comissão no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Remover tabelas existentes se houver conflito de tipo
DROP TABLE IF EXISTS commission_channel_seller CASCADE;
DROP TABLE IF EXISTS commission_channel_director CASCADE;
DROP TABLE IF EXISTS commission_seller CASCADE;
DROP TABLE IF EXISTS commission_channel_influencer CASCADE;
DROP TABLE IF EXISTS commission_channel_indicator CASCADE;

-- 2. Criar tabela commission_channel_seller com id TEXT explícito
CREATE TABLE commission_channel_seller (
    id TEXT PRIMARY KEY,
    months_12 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_24 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_36 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_48 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_60 DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela commission_channel_director
CREATE TABLE commission_channel_director (
    id TEXT PRIMARY KEY,
    months_12 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_24 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_36 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_48 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_60 DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela commission_seller
CREATE TABLE commission_seller (
    id TEXT PRIMARY KEY,
    months_12 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_24 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_36 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_48 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_60 DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela commission_channel_influencer
CREATE TABLE commission_channel_influencer (
    id TEXT PRIMARY KEY,
    revenue_range TEXT NOT NULL,
    revenue_min DECIMAL(10,2) NOT NULL,
    revenue_max DECIMAL(10,2) NOT NULL,
    months_12 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_24 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_36 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_48 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_60 DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Criar tabela commission_channel_indicator
CREATE TABLE commission_channel_indicator (
    id TEXT PRIMARY KEY,
    revenue_range TEXT NOT NULL,
    revenue_min DECIMAL(10,2) NOT NULL,
    revenue_max DECIMAL(10,2) NOT NULL,
    months_12 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_24 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_36 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_48 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_60 DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Inserir dados iniciais

-- Canal/Vendedor
INSERT INTO commission_channel_seller (id, months_12, months_24, months_36, months_48, months_60)
VALUES ('cs_default_001', 0.60, 1.20, 2.00, 2.00, 2.00);

-- Canal/Diretor
INSERT INTO commission_channel_director (id, months_12, months_24, months_36, months_48, months_60)
VALUES ('cd_default_001', 0, 0, 0, 0, 0);

-- Vendedor
INSERT INTO commission_seller (id, months_12, months_24, months_36, months_48, months_60)
VALUES ('s_default_001', 1.2, 2.4, 3.6, 3.6, 3.6);

-- Canal Influenciador
INSERT INTO commission_channel_influencer (id, revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60)
VALUES 
    ('ci_range_001', 'Até 500,00', 0, 500, 1.50, 2.00, 2.50, 2.50, 2.50),
    ('ci_range_002', '500,01 a 1.000,00', 500.01, 1000, 2.51, 3.25, 4.00, 4.00, 4.00),
    ('ci_range_003', '1.000,01 a 1.500,00', 1000.01, 1500, 4.01, 4.50, 5.00, 5.00, 5.00),
    ('ci_range_004', '1.500,01 a 3.000,00', 1500.01, 3000, 5.01, 5.50, 6.00, 6.00, 6.00),
    ('ci_range_005', '3.000,01 a 5.000,00', 3000.01, 5000, 6.01, 6.50, 7.00, 7.00, 7.00),
    ('ci_range_006', 'Acima de 5.000,01', 5000.01, 99999999, 7.01, 7.50, 8.00, 8.00, 8.00);

-- Canal Indicador
INSERT INTO commission_channel_indicator (id, revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60)
VALUES 
    ('cind_range_001', 'Até 500,00', 0, 500, 0.50, 0.67, 0.83, 0.83, 0.83),
    ('cind_range_002', '500,01 a 1.000,00', 500.01, 1000, 0.84, 1.08, 1.33, 1.33, 1.33),
    ('cind_range_003', '1.000,01 a 1.500,00', 1000.01, 1500, 1.34, 1.50, 1.67, 1.67, 1.67),
    ('cind_range_004', '1.500,01 a 3.000,00', 1500.01, 3000, 1.67, 1.83, 2.00, 2.00, 2.00),
    ('cind_range_005', '3.000,01 a 5.000,00', 3000.01, 5000, 2.00, 2.17, 2.50, 2.50, 2.50),
    ('cind_range_006', 'Acima de 5.000,01', 5000.01, 99999999, 2.34, 2.50, 3.00, 3.00, 3.00);

-- 8. Habilitar RLS (Row Level Security)
ALTER TABLE commission_channel_seller ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_channel_director ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_seller ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_channel_influencer ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_channel_indicator ENABLE ROW LEVEL SECURITY;

-- 9. Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'director', 'user')),
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Habilitar RLS na tabela de perfis
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 11. Função para obter o role do usuário atual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM user_profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Políticas para tabelas de comissão (apenas admin)
CREATE POLICY "Admin full access" ON commission_channel_seller FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "Admin full access" ON commission_channel_director FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "Admin full access" ON commission_seller FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "Admin full access" ON commission_channel_influencer FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY "Admin full access" ON commission_channel_indicator FOR ALL USING (get_user_role() = 'admin');

-- 13. Políticas para user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full access profiles" ON user_profiles FOR ALL USING (get_user_role() = 'admin');

-- 14. Verificar se os dados foram inseridos corretamente
SELECT 'commission_channel_seller' as table_name, COUNT(*) as record_count FROM commission_channel_seller
UNION ALL
SELECT 'commission_channel_director' as table_name, COUNT(*) as record_count FROM commission_channel_director
UNION ALL
SELECT 'commission_seller' as table_name, COUNT(*) as record_count FROM commission_seller
UNION ALL
SELECT 'commission_channel_influencer' as table_name, COUNT(*) as record_count FROM commission_channel_influencer
UNION ALL
SELECT 'commission_channel_indicator' as table_name, COUNT(*) as record_count FROM commission_channel_indicator;