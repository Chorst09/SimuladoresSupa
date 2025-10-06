-- Tabela de propostas das calculadoras
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  client JSONB NOT NULL, -- Pode ser string ou objeto com dados do cliente
  account_manager JSONB, -- Dados do gerente de contas
  type TEXT NOT NULL CHECK (type IN ('VM', 'FIBER', 'RADIO', 'PABX', 'MAN', 'DOUBLE_FIBRA_RADIO', 'GENERAL')),
  status TEXT NOT NULL DEFAULT 'Rascunho' CHECK (status IN ('Rascunho', 'Enviada', 'Em Análise', 'Aprovada', 'Rejeitada', 'Aguardando aprovação desconto Diretoria', 'Aguardando Aprovação do Cliente', 'Fechado Ganho', 'Perdido')),
  value DECIMAL(15,2) DEFAULT 0,
  total_setup DECIMAL(15,2) DEFAULT 0,
  total_monthly DECIMAL(15,2) DEFAULT 0,
  contract_period INTEGER DEFAULT 12, -- Período do contrato em meses
  date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  created_by UUID REFERENCES profiles(id),
  distributor_id TEXT,
  version INTEGER DEFAULT 1,
  products JSONB DEFAULT '[]'::jsonb, -- Array de produtos/serviços
  items JSONB DEFAULT '[]'::jsonb, -- Array de itens (compatibilidade)
  client_data JSONB, -- Dados completos do cliente (compatibilidade)
  metadata JSONB DEFAULT '{}'::jsonb, -- Dados adicionais específicos por tipo
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_proposals_base_id ON proposals(base_id);
CREATE INDEX IF NOT EXISTS idx_proposals_type ON proposals(type);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_by ON proposals(created_by);
CREATE INDEX IF NOT EXISTS idx_proposals_date ON proposals(date);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_title ON proposals USING gin(to_tsvector('portuguese', title));

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_proposals_updated_at ON proposals;
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar base_id único
DROP FUNCTION IF EXISTS generate_proposal_base_id(TEXT);
CREATE OR REPLACE FUNCTION generate_proposal_base_id(proposal_type TEXT)
RETURNS TEXT AS $$
DECLARE
    type_prefix TEXT;
    next_number INTEGER;
    base_id TEXT;
BEGIN
    -- Definir prefixo baseado no tipo
    CASE proposal_type
        WHEN 'VM' THEN type_prefix := 'Prop_MV_';
        WHEN 'FIBER' THEN type_prefix := 'Prop_Fibra_';
        WHEN 'RADIO' THEN type_prefix := 'Prop_Radio_';
        WHEN 'PABX' THEN type_prefix := 'Prop_PabxSip_';
        WHEN 'MAN' THEN type_prefix := 'Prop_InterMan_';
        WHEN 'DOUBLE_FIBRA_RADIO' THEN type_prefix := 'Prop_Double_';
        ELSE type_prefix := 'Prop_General_';
    END CASE;
    
    -- Obter próximo número sequencial para o tipo
    SELECT COALESCE(MAX(CAST(SUBSTRING(base_id FROM LENGTH(type_prefix) + 1 FOR 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM proposals 
    WHERE base_id LIKE type_prefix || '%';
    
    -- Gerar base_id
    base_id := type_prefix || LPAD(next_number::TEXT, 4, '0') || '_v1';
    
    RETURN base_id;
END;
$$ LANGUAGE plpgsql;