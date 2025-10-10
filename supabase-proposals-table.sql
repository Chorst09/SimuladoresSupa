-- Criar tabela proposals com estrutura completa
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    base_id TEXT NOT NULL,
    title TEXT NOT NULL,
    client TEXT NOT NULL,
    account_manager TEXT,
    type TEXT NOT NULL DEFAULT 'GENERAL',
    status TEXT DEFAULT 'Rascunho',
    value DECIMAL(10,2) DEFAULT 0,
    total_setup DECIMAL(10,2) DEFAULT 0,
    total_monthly DECIMAL(10,2) DEFAULT 0,
    contract_period INTEGER DEFAULT 12,
    date DATE DEFAULT CURRENT_DATE,
    expiry_date DATE,
    created_by TEXT NOT NULL,
    distributor_id TEXT DEFAULT '',
    version INTEGER DEFAULT 1,
    products JSONB DEFAULT '[]'::jsonb,
    items JSONB DEFAULT '[]'::jsonb,
    client_data JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    changes TEXT DEFAULT '',
    apply_salesperson_discount BOOLEAN DEFAULT false,
    applied_director_discount_percentage DECIMAL(5,2) DEFAULT 0,
    base_total_monthly DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_proposals_type ON public.proposals(type);
CREATE INDEX IF NOT EXISTS idx_proposals_created_by ON public.proposals(created_by);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON public.proposals(created_at);
CREATE INDEX IF NOT EXISTS idx_proposals_base_id ON public.proposals(base_id);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_proposals_updated_at 
    BEFORE UPDATE ON public.proposals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir acesso total com service key
CREATE POLICY "Enable all access for service role" ON public.proposals
    FOR ALL USING (true);

-- Criar política para usuários autenticados
CREATE POLICY "Enable read access for authenticated users" ON public.proposals
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.proposals
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.proposals
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.proposals
    FOR DELETE USING (auth.role() = 'authenticated');