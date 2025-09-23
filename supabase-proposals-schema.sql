-- Supabase Schema for Proposals and Partners
-- Run this in your Supabase SQL Editor after the basic schema

-- Create partners table
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'Cliente',
    main_contact VARCHAR(255),
    contact VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
    site VARCHAR(255),
    products TEXT,
    site_partner VARCHAR(255),
    site_ro VARCHAR(255),
    template_ro VARCHAR(255),
    procedimento_ro VARCHAR(255),
    login VARCHAR(255),
    password VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    base_id VARCHAR(100) NOT NULL,
    version INTEGER DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    client TEXT NOT NULL, -- Can be string or JSON object
    type VARCHAR(50) NOT NULL CHECK (type IN ('VM', 'FIBER', 'RADIO', 'PABX', 'MAN', 'DOUBLE_FIBRA_RADIO', 'GENERAL')),
    value DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Rascunho' CHECK (status IN ('Rascunho', 'Enviada', 'Em Análise', 'Aprovada', 'Rejeitada', 'Aguardando aprovação desconto Diretoria', 'Aguardando Aprovação do Cliente', 'Fechado Ganho', 'Perdido')),
    created_by VARCHAR(255) NOT NULL,
    account_manager TEXT, -- Can be string or JSON object
    distributor_id VARCHAR(100),
    date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Additional fields for extended proposal data
    total_setup DECIMAL(12,2),
    total_monthly DECIMAL(12,2),
    contract_period INTEGER,
    client_data JSONB,
    products JSONB,
    items JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by VARCHAR(255)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_partners_name ON partners(name);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(type);

CREATE INDEX IF NOT EXISTS idx_proposals_base_id ON proposals(base_id);
CREATE INDEX IF NOT EXISTS idx_proposals_type ON proposals(type);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON proposals(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_created_by ON proposals(created_by);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Partners table policies
CREATE POLICY "Allow select for authenticated users" ON partners
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for authenticated users" ON partners
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated users" ON partners
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for admin users" ON partners
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'diretor')
        )
    );

-- Proposals table policies
CREATE POLICY "Users can view own proposals" ON proposals
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'diretor')
        )
    );

CREATE POLICY "Users can insert own proposals" ON proposals
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own proposals" ON proposals
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'diretor')
        )
    );

CREATE POLICY "Users can delete own proposals" ON proposals
    FOR DELETE USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'diretor')
        )
    );

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_partners_updated_at 
    BEFORE UPDATE ON partners 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at 
    BEFORE UPDATE ON proposals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO partners (name, type, contact, phone, status) VALUES 
('Empresa Exemplo Ltda', 'Cliente', 'João Silva', '(11) 99999-9999', 'Ativo'),
('Tech Solutions Corp', 'Cliente', 'Maria Santos', '(11) 88888-8888', 'Ativo')
ON CONFLICT DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE partners IS 'Tabela para armazenar informações de parceiros e clientes';
COMMENT ON TABLE proposals IS 'Tabela para armazenar propostas comerciais dos calculadores';

COMMENT ON COLUMN proposals.base_id IS 'ID base da proposta (ex: Prop_VM_0001)';
COMMENT ON COLUMN proposals.version IS 'Versão da proposta';
COMMENT ON COLUMN proposals.client IS 'Dados do cliente (string ou JSON)';
COMMENT ON COLUMN proposals.type IS 'Tipo da proposta (VM, FIBER, RADIO, etc.)';
COMMENT ON COLUMN proposals.client_data IS 'Dados detalhados do cliente em JSON';
COMMENT ON COLUMN proposals.products IS 'Lista de produtos/serviços em JSON';
COMMENT ON COLUMN proposals.items IS 'Itens da proposta em JSON';
