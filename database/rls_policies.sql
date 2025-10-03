-- Políticas de Row Level Security (RLS)
-- Este arquivo contém todas as políticas de segurança a nível de linha

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE oportunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE oportunidade_fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para obter o role do usuário atual
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para obter o team_id do usuário atual
CREATE OR REPLACE FUNCTION get_user_team_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT team_id 
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para a tabela profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Gerentes podem ver perfis de sua equipe" ON profiles
  FOR SELECT USING (
    get_user_role() = 'gerente' AND 
    team_id = get_user_team_id()
  );

CREATE POLICY "Diretores podem ver todos os perfis" ON profiles
  FOR SELECT USING (get_user_role() = 'diretor');

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para a tabela clientes
CREATE POLICY "Todos os usuários autenticados podem ver clientes" ON clientes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Todos os usuários autenticados podem criar clientes" ON clientes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Todos os usuários autenticados podem atualizar clientes" ON clientes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para a tabela fornecedores
CREATE POLICY "Todos os usuários autenticados podem ver fornecedores" ON fornecedores
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Todos os usuários autenticados podem criar fornecedores" ON fornecedores
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Todos os usuários autenticados podem atualizar fornecedores" ON fornecedores
  FOR UPDATE USING (auth.role() = 'authenticated');-- 
Políticas para a tabela oportunidades (baseadas em hierarquia)
CREATE POLICY "Vendedores podem ver suas próprias oportunidades" ON oportunidades
  FOR SELECT USING (
    get_user_role() = 'vendedor' AND 
    responsavel_id = auth.uid()
  );

CREATE POLICY "Gerentes podem ver oportunidades de sua equipe" ON oportunidades
  FOR SELECT USING (
    get_user_role() = 'gerente' AND 
    responsavel_id IN (
      SELECT id FROM profiles 
      WHERE team_id = get_user_team_id()
    )
  );

CREATE POLICY "Diretores podem ver todas as oportunidades" ON oportunidades
  FOR SELECT USING (get_user_role() = 'diretor');

CREATE POLICY "Vendedores podem criar oportunidades" ON oportunidades
  FOR INSERT WITH CHECK (
    get_user_role() IN ('vendedor', 'gerente', 'diretor') AND
    responsavel_id = auth.uid()
  );

CREATE POLICY "Vendedores podem atualizar suas próprias oportunidades" ON oportunidades
  FOR UPDATE USING (
    get_user_role() = 'vendedor' AND 
    responsavel_id = auth.uid()
  );

CREATE POLICY "Gerentes podem atualizar oportunidades de sua equipe" ON oportunidades
  FOR UPDATE USING (
    get_user_role() = 'gerente' AND 
    responsavel_id IN (
      SELECT id FROM profiles 
      WHERE team_id = get_user_team_id()
    )
  );

CREATE POLICY "Diretores podem atualizar todas as oportunidades" ON oportunidades
  FOR UPDATE USING (get_user_role() = 'diretor');

-- Políticas para a tabela oportunidade_fornecedores
CREATE POLICY "Acesso baseado na oportunidade associada" ON oportunidade_fornecedores
  FOR ALL USING (
    oportunidade_id IN (
      SELECT id FROM oportunidades 
      WHERE (
        (get_user_role() = 'vendedor' AND responsavel_id = auth.uid()) OR
        (get_user_role() = 'gerente' AND responsavel_id IN (
          SELECT id FROM profiles WHERE team_id = get_user_team_id()
        )) OR
        (get_user_role() = 'diretor')
      )
    )
  );

-- Políticas para a tabela atividades
CREATE POLICY "Acesso baseado na oportunidade associada" ON atividades
  FOR ALL USING (
    oportunidade_id IN (
      SELECT id FROM oportunidades 
      WHERE (
        (get_user_role() = 'vendedor' AND responsavel_id = auth.uid()) OR
        (get_user_role() = 'gerente' AND responsavel_id IN (
          SELECT id FROM profiles WHERE team_id = get_user_team_id()
        )) OR
        (get_user_role() = 'diretor')
      )
    )
  );

-- Políticas para a tabela notificações
CREATE POLICY "Usuários podem ver suas próprias notificações" ON notificacoes
  FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Sistema pode criar notificações" ON notificacoes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar suas próprias notificações" ON notificacoes
  FOR UPDATE USING (usuario_id = auth.uid());