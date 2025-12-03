-- Criação da tabela de oportunidades de parceiros
CREATE TABLE IF NOT EXISTS public.oportunidades_parceiro (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_fabricante VARCHAR(100) NOT NULL,
    numero_oportunidade_ext VARCHAR(255) UNIQUE NOT NULL,
    cliente_nome VARCHAR(255) NOT NULL,
    contato_nome VARCHAR(255) NOT NULL,
    contato_email VARCHAR(255) NOT NULL,
    contato_telefone VARCHAR(50),
    produto_descricao TEXT NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'aguardando_aprovacao' NOT NULL,
    data_criacao DATE DEFAULT CURRENT_DATE NOT NULL,
    data_expiracao DATE NOT NULL,
    observacoes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ(6) DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ(6) DEFAULT NOW() NOT NULL
);

-- Criação da tabela de histórico de oportunidades de parceiros
CREATE TABLE IF NOT EXISTS public.oportunidade_parceiro_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oportunidade_parceiro_id UUID NOT NULL REFERENCES public.oportunidades_parceiro(id) ON DELETE CASCADE,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50) NOT NULL,
    observacoes TEXT,
    usuario_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ(6) DEFAULT NOW() NOT NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_oportunidades_parceiro_fabricante_status 
    ON public.oportunidades_parceiro(nome_fabricante, status);

CREATE INDEX IF NOT EXISTS idx_oportunidades_parceiro_data_expiracao 
    ON public.oportunidades_parceiro(data_expiracao);

CREATE INDEX IF NOT EXISTS idx_oportunidade_parceiro_historico_oportunidade 
    ON public.oportunidade_parceiro_historico(oportunidade_parceiro_id);

-- Comentários nas tabelas
COMMENT ON TABLE public.oportunidades_parceiro IS 'Oportunidades de parceiros como Dell, Lenovo, HP, etc.';
COMMENT ON TABLE public.oportunidade_parceiro_historico IS 'Histórico de mudanças de status das oportunidades de parceiros';

-- Comentários nos campos principais
COMMENT ON COLUMN public.oportunidades_parceiro.status IS 'Status: aguardando_aprovacao, aprovado, expirado, negado';
COMMENT ON COLUMN public.oportunidades_parceiro.nome_fabricante IS 'Nome do fabricante/parceiro: Dell, Lenovo, HP, Cisco, etc.';
COMMENT ON COLUMN public.oportunidades_parceiro.numero_oportunidade_ext IS 'Número único da oportunidade fornecido pelo parceiro';
