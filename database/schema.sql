-- Schema do Sistema de Gestão de Oportunidades
-- Este arquivo contém a estrutura completa do banco de dados

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de perfis de usuário (estende auth.users do Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('vendedor', 'gerente', 'diretor')),
  team_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_razao_social TEXT NOT NULL,
  cnpj_cpf TEXT UNIQUE,
  nome_contato TEXT NOT NULL,
  email_contato TEXT NOT NULL,
  telefone TEXT,
  endereco_completo TEXT,
  status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('ativo', 'prospect', 'inativo')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_razao_social TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  contato_principal_nome TEXT NOT NULL,
  contato_principal_email TEXT NOT NULL,
  contato_principal_telefone TEXT,
  area_atuacao TEXT,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de oportunidades
CREATE TABLE IF NOT EXISTS oportunidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_oportunidade TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  valor_estimado DECIMAL(15,2) NOT NULL,
  fase TEXT NOT NULL DEFAULT 'aguardando_aprovacao' CHECK (fase IN ('aguardando_aprovacao', 'aprovada', 'vencida', 'negada')),
  data_fechamento_prevista DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  responsavel_id UUID NOT NULL REFERENCES profiles(id),
  probabilidade_fechamento INTEGER CHECK (probabilidade_fechamento >= 0 AND probabilidade_fechamento <= 100),
  descricao TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de associação oportunidade-fornecedor (many-to-many)
CREATE TABLE IF NOT EXISTS oportunidade_fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidade_id UUID NOT NULL REFERENCES oportunidades(id) ON DELETE CASCADE,
  fornecedor_id UUID NOT NULL REFERENCES fornecedores(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(oportunidade_id, fornecedor_id)
);

-- Tabela de atividades/histórico
CREATE TABLE IF NOT EXISTS atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oportunidade_id UUID NOT NULL REFERENCES oportunidades(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('nota', 'ligacao', 'email', 'reuniao', 'proposta', 'mudanca_fase', 'sistema')),
  titulo TEXT NOT NULL,
  descricao TEXT,
  usuario_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES profiles(id),
  oportunidade_id UUID REFERENCES oportunidades(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('vencimento_proximo', 'vencimento_vencido', 'mudanca_fase')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  enviada_email BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Índices
 para otimização de performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON profiles(team_id);

CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);
CREATE INDEX IF NOT EXISTS idx_clientes_cnpj_cpf ON clientes(cnpj_cpf);
CREATE INDEX IF NOT EXISTS idx_clientes_nome_razao_social ON clientes USING gin(to_tsvector('portuguese', nome_razao_social));
CREATE INDEX IF NOT EXISTS idx_clientes_created_by ON clientes(created_by);

CREATE INDEX IF NOT EXISTS idx_fornecedores_status ON fornecedores(status);
CREATE INDEX IF NOT EXISTS idx_fornecedores_cnpj ON fornecedores(cnpj);
CREATE INDEX IF NOT EXISTS idx_fornecedores_nome_razao_social ON fornecedores USING gin(to_tsvector('portuguese', nome_razao_social));
CREATE INDEX IF NOT EXISTS idx_fornecedores_created_by ON fornecedores(created_by);

CREATE INDEX IF NOT EXISTS idx_oportunidades_numero ON oportunidades(numero_oportunidade);
CREATE INDEX IF NOT EXISTS idx_oportunidades_fase ON oportunidades(fase);
CREATE INDEX IF NOT EXISTS idx_oportunidades_responsavel_id ON oportunidades(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_oportunidades_cliente_id ON oportunidades(cliente_id);
CREATE INDEX IF NOT EXISTS idx_oportunidades_data_fechamento_prevista ON oportunidades(data_fechamento_prevista);
CREATE INDEX IF NOT EXISTS idx_oportunidades_data_vencimento ON oportunidades(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_oportunidades_created_by ON oportunidades(created_by);
CREATE INDEX IF NOT EXISTS idx_oportunidades_titulo ON oportunidades USING gin(to_tsvector('portuguese', titulo));

CREATE INDEX IF NOT EXISTS idx_oportunidade_fornecedores_oportunidade_id ON oportunidade_fornecedores(oportunidade_id);
CREATE INDEX IF NOT EXISTS idx_oportunidade_fornecedores_fornecedor_id ON oportunidade_fornecedores(fornecedor_id);

CREATE INDEX IF NOT EXISTS idx_atividades_oportunidade_id ON atividades(oportunidade_id);
CREATE INDEX IF NOT EXISTS idx_atividades_usuario_id ON atividades(usuario_id);
CREATE INDEX IF NOT EXISTS idx_atividades_tipo ON atividades(tipo);
CREATE INDEX IF NOT EXISTS idx_atividades_created_at ON atividades(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_tipo ON notificacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON notificacoes(created_at DESC);-- Funçã
o para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON fornecedores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oportunidades_updated_at BEFORE UPDATE ON oportunidades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();