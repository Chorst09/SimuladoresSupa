-- Script SQL para criar e popular as tabelas de comissão no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela commission_channel_seller
CREATE TABLE IF NOT EXISTS commission_channel_seller (
    id TEXT PRIMARY KEY,
    months_12 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_24 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_36 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_48 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_60 DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela commission_channel_director
CREATE TABLE IF NOT EXISTS commission_channel_director (
    id TEXT PRIMARY KEY,
    months_12 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_24 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_36 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_48 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_60 DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela commission_seller
CREATE TABLE IF NOT EXISTS commission_seller (
    id TEXT PRIMARY KEY,
    months_12 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_24 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_36 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_48 DECIMAL(5,2) NOT NULL DEFAULT 0,
    months_60 DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela commission_channel_influencer
CREATE TABLE IF NOT EXISTS commission_channel_influencer (
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

-- 5. Criar tabela commission_channel_indicator
CREATE TABLE IF NOT EXISTS commission_channel_indicator (
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

-- 6. Inserir dados iniciais (usando UPSERT para evitar duplicatas)

-- Canal/Vendedor
INSERT INTO commission_channel_seller (id, months_12, months_24, months_36, months_48, months_60)
VALUES ('default-1', 0.60, 1.20, 2.00, 2.00, 2.00)
ON CONFLICT (id) DO UPDATE SET
    months_12 = EXCLUDED.months_12,
    months_24 = EXCLUDED.months_24,
    months_36 = EXCLUDED.months_36,
    months_48 = EXCLUDED.months_48,
    months_60 = EXCLUDED.months_60,
    updated_at = NOW();

-- Canal/Diretor
INSERT INTO commission_channel_director (id, months_12, months_24, months_36, months_48, months_60)
VALUES ('default-1', 0, 0, 0, 0, 0)
ON CONFLICT (id) DO UPDATE SET
    months_12 = EXCLUDED.months_12,
    months_24 = EXCLUDED.months_24,
    months_36 = EXCLUDED.months_36,
    months_48 = EXCLUDED.months_48,
    months_60 = EXCLUDED.months_60,
    updated_at = NOW();

-- Vendedor
INSERT INTO commission_seller (id, months_12, months_24, months_36, months_48, months_60)
VALUES ('default-1', 1.2, 2.4, 3.6, 3.6, 3.6)
ON CONFLICT (id) DO UPDATE SET
    months_12 = EXCLUDED.months_12,
    months_24 = EXCLUDED.months_24,
    months_36 = EXCLUDED.months_36,
    months_48 = EXCLUDED.months_48,
    months_60 = EXCLUDED.months_60,
    updated_at = NOW();

-- Canal Influenciador
INSERT INTO commission_channel_influencer (id, revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60)
VALUES 
    ('default-1', 'Até 500,00', 0, 500, 1.50, 2.00, 2.50, 2.50, 2.50),
    ('default-2', '500,01 a 1.000,00', 500.01, 1000, 2.51, 3.25, 4.00, 4.00, 4.00),
    ('default-3', '1.000,01 a 1.500,00', 1000.01, 1500, 4.01, 4.50, 5.00, 5.00, 5.00),
    ('default-4', '1.500,01 a 3.000,00', 1500.01, 3000, 5.01, 5.50, 6.00, 6.00, 6.00),
    ('default-5', '3.000,01 a 5.000,00', 3000.01, 5000, 6.01, 6.50, 7.00, 7.00, 7.00),
    ('default-6', 'Acima de 5.000,01', 5000.01, 999999999, 7.01, 7.50, 8.00, 8.00, 8.00)
ON CONFLICT (id) DO UPDATE SET
    revenue_range = EXCLUDED.revenue_range,
    revenue_min = EXCLUDED.revenue_min,
    revenue_max = EXCLUDED.revenue_max,
    months_12 = EXCLUDED.months_12,
    months_24 = EXCLUDED.months_24,
    months_36 = EXCLUDED.months_36,
    months_48 = EXCLUDED.months_48,
    months_60 = EXCLUDED.months_60,
    updated_at = NOW();

-- Canal Indicador
INSERT INTO commission_channel_indicator (id, revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60)
VALUES 
    ('default-1', 'Até 500,00', 0, 500, 0.50, 0.67, 0.83, 0.83, 0.83),
    ('default-2', '500,01 a 1.000,00', 500.01, 1000, 0.84, 1.08, 1.33, 1.33, 1.33),
    ('default-3', '1.000,01 a 1.500,00', 1000.01, 1500, 1.34, 1.50, 1.67, 1.67, 1.67),
    ('default-4', '1.500,01 a 3.000,00', 1500.01, 3000, 1.67, 1.83, 2.00, 2.00, 2.00),
    ('default-5', '3.000,01 a 5.000,00', 3000.01, 5000, 2.00, 2.17, 2.50, 2.50, 2.50),
    ('default-6', 'Acima de 5.000,01', 5000.01, 999999999, 2.34, 2.50, 3.00, 3.00, 3.00)
ON CONFLICT (id) DO UPDATE SET
    revenue_range = EXCLUDED.revenue_range,
    revenue_min = EXCLUDED.revenue_min,
    revenue_max = EXCLUDED.revenue_max,
    months_12 = EXCLUDED.months_12,
    months_24 = EXCLUDED.months_24,
    months_36 = EXCLUDED.months_36,
    months_48 = EXCLUDED.months_48,
    months_60 = EXCLUDED.months_60,
    updated_at = NOW();

-- 7. Habilitar RLS (Row Level Security) se necessário
ALTER TABLE commission_channel_seller ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_channel_director ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_seller ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_channel_influencer ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_channel_indicator ENABLE ROW LEVEL SECURITY;

-- 8. Criar tabela de perfis de usuário (se não existir)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'director', 'user')),
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Habilitar RLS na tabela de perfis
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 10. Função para obter o role do usuário atual
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

-- 11. Políticas para tabelas de comissão
-- Administradores: acesso total
-- Diretores: SEM acesso às tabelas de comissão
-- Usuários: SEM acesso às tabelas de comissão

-- commission_channel_seller
DROP POLICY IF EXISTS "Admin full access" ON commission_channel_seller;
CREATE POLICY "Admin full access" ON commission_channel_seller
    FOR ALL USING (get_user_role() = 'admin');

-- commission_channel_director  
DROP POLICY IF EXISTS "Admin full access" ON commission_channel_director;
CREATE POLICY "Admin full access" ON commission_channel_director
    FOR ALL USING (get_user_role() = 'admin');

-- commission_seller
DROP POLICY IF EXISTS "Admin full access" ON commission_seller;
CREATE POLICY "Admin full access" ON commission_seller
    FOR ALL USING (get_user_role() = 'admin');

-- commission_channel_influencer
DROP POLICY IF EXISTS "Admin full access" ON commission_channel_influencer;
CREATE POLICY "Admin full access" ON commission_channel_influencer
    FOR ALL USING (get_user_role() = 'admin');

-- commission_channel_indicator
DROP POLICY IF EXISTS "Admin full access" ON commission_channel_indicator;
CREATE POLICY "Admin full access" ON commission_channel_indicator
    FOR ALL USING (get_user_role() = 'admin');

-- 12. Políticas para user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin full access profiles" ON user_profiles;
CREATE POLICY "Admin full access profiles" ON user_profiles
    FOR ALL USING (get_user_role() = 'admin');

-- 13. Criar tabela de propostas (se não existir)
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_id TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    title TEXT,
    client_data JSONB NOT NULL,
    account_manager_data JSONB NOT NULL,
    products JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_setup DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    value DECIMAL(10,2) NOT NULL DEFAULT 0,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    contract_period INTEGER,
    distributor_id TEXT,
    date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- 14. Habilitar RLS na tabela de propostas
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- 15. Políticas para propostas
-- Administradores: acesso total a todas as propostas
DROP POLICY IF EXISTS "Admin full access proposals" ON proposals;
CREATE POLICY "Admin full access proposals" ON proposals
    FOR ALL USING (get_user_role() = 'admin');

-- Diretores: podem ver todas as propostas, mas não podem ver tabelas de preços/comissões/DRE
DROP POLICY IF EXISTS "Director view all proposals" ON proposals;
CREATE POLICY "Director view all proposals" ON proposals
    FOR SELECT USING (get_user_role() = 'director');

-- Usuários: podem ver apenas suas próprias propostas
DROP POLICY IF EXISTS "Users own proposals" ON proposals;
CREATE POLICY "Users own proposals" ON proposals
    FOR ALL USING (
        get_user_role() = 'user' AND 
        (created_by = auth.uid() OR updated_by = auth.uid())
    );

-- 16. Função para inserir perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, role, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        'user', -- role padrão
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 17. Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 18. Inserir usuário administrador padrão (ajuste o email conforme necessário)
INSERT INTO user_profiles (id, email, role, full_name)
SELECT 
    id,
    email,
    'admin',
    'Administrador Sistema'
FROM auth.users 
WHERE email = 'admin@sistema.com' -- ALTERE ESTE EMAIL
ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();

-- 19. Verificar se os dados foram inseridos corretamente
SELECT 'commission_channel_seller' as table_name, COUNT(*) as record_count FROM commission_channel_seller
UNION ALL
SELECT 'commission_channel_director' as table_name, COUNT(*) as record_count FROM commission_channel_director
UNION ALL
SELECT 'commission_seller' as table_name, COUNT(*) as record_count FROM commission_seller
UNION ALL
SELECT 'commission_channel_influencer' as table_name, COUNT(*) as record_count FROM commission_channel_influencer
UNION ALL
SELECT 'commission_channel_indicator' as table_name, COUNT(*) as record_count FROM commission_channel_indicator;
