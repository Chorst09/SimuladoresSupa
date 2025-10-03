-- Funções auxiliares para o sistema de gestão de oportunidades

-- Função para registrar automaticamente mudanças de fase
CREATE OR REPLACE FUNCTION log_fase_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a fase mudou, registrar no histórico
  IF OLD.fase IS DISTINCT FROM NEW.fase THEN
    INSERT INTO atividades (
      oportunidade_id,
      tipo,
      titulo,
      descricao,
      usuario_id
    ) VALUES (
      NEW.id,
      'mudanca_fase',
      'Mudança de fase',
      'Fase alterada de "' || OLD.fase || '" para "' || NEW.fase || '"',
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para log automático de mudança de fase
CREATE TRIGGER log_oportunidade_fase_change
  AFTER UPDATE ON oportunidades
  FOR EACH ROW
  EXECUTE FUNCTION log_fase_change();

-- Função para criar notificações de vencimento
CREATE OR REPLACE FUNCTION check_vencimentos()
RETURNS void AS $$
DECLARE
  oportunidade_record RECORD;
BEGIN
  -- Buscar oportunidades que vencem em 7 dias e ainda não têm notificação
  FOR oportunidade_record IN
    SELECT o.*, p.full_name, p.email
    FROM oportunidades o
    JOIN profiles p ON o.responsavel_id = p.id
    WHERE o.fase NOT IN ('aprovada', 'negada')
      AND o.data_vencimento = CURRENT_DATE + INTERVAL '7 days'
      AND NOT EXISTS (
        SELECT 1 FROM notificacoes n 
        WHERE n.oportunidade_id = o.id 
          AND n.tipo = 'vencimento_proximo'
          AND n.created_at::date = CURRENT_DATE
      )
  LOOP
    -- Criar notificação de vencimento próximo
    INSERT INTO notificacoes (
      usuario_id,
      oportunidade_id,
      tipo,
      titulo,
      mensagem
    ) VALUES (
      oportunidade_record.responsavel_id,
      oportunidade_record.id,
      'vencimento_proximo',
      'Oportunidade vence em 7 dias',
      'A oportunidade "' || oportunidade_record.titulo || '" vence em 7 dias (' || 
      to_char(oportunidade_record.data_vencimento, 'DD/MM/YYYY') || ')'
    );
  END LOOP;

  -- Buscar oportunidades vencidas que ainda não têm notificação
  FOR oportunidade_record IN
    SELECT o.*, p.full_name, p.email
    FROM oportunidades o
    JOIN profiles p ON o.responsavel_id = p.id
    WHERE o.fase NOT IN ('aprovada', 'negada')
      AND o.data_vencimento < CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM notificacoes n 
        WHERE n.oportunidade_id = o.id 
          AND n.tipo = 'vencimento_vencido'
          AND n.created_at::date = CURRENT_DATE
      )
  LOOP
    -- Criar notificação de vencimento vencido
    INSERT INTO notificacoes (
      usuario_id,
      oportunidade_id,
      tipo,
      titulo,
      mensagem
    ) VALUES (
      oportunidade_record.responsavel_id,
      oportunidade_record.id,
      'vencimento_vencido',
      'Oportunidade vencida',
      'A oportunidade "' || oportunidade_record.titulo || '" está vencida desde ' || 
      to_char(oportunidade_record.data_vencimento, 'DD/MM/YYYY')
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;-- 
Função para calcular KPIs do dashboard
CREATE OR REPLACE FUNCTION get_dashboard_kpis(user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_abertas INTEGER;
  valor_pipeline DECIMAL(15,2);
  taxa_conversao DECIMAL(5,2);
  valor_medio_ganha DECIMAL(15,2);
  user_role TEXT;
  user_team_id UUID;
BEGIN
  -- Obter informações do usuário
  SELECT role, team_id INTO user_role, user_team_id
  FROM profiles 
  WHERE id = COALESCE(user_id, auth.uid());

  -- Calcular total de oportunidades abertas
  SELECT COUNT(*) INTO total_abertas
  FROM oportunidades o
  WHERE o.fase NOT IN ('aprovada', 'negada')
    AND (
      (user_role = 'vendedor' AND o.responsavel_id = COALESCE(user_id, auth.uid())) OR
      (user_role = 'gerente' AND o.responsavel_id IN (
        SELECT id FROM profiles WHERE team_id = user_team_id
      )) OR
      (user_role = 'diretor')
    );

  -- Calcular valor total do pipeline
  SELECT COALESCE(SUM(o.valor_estimado), 0) INTO valor_pipeline
  FROM oportunidades o
  WHERE o.fase NOT IN ('aprovada', 'negada')
    AND (
      (user_role = 'vendedor' AND o.responsavel_id = COALESCE(user_id, auth.uid())) OR
      (user_role = 'gerente' AND o.responsavel_id IN (
        SELECT id FROM profiles WHERE team_id = user_team_id
      )) OR
      (user_role = 'diretor')
    );

  -- Calcular taxa de conversão (últimos 12 meses)
  WITH conversao_data AS (
    SELECT 
      COUNT(*) FILTER (WHERE fase = 'aprovada') as ganhas,
      COUNT(*) FILTER (WHERE fase IN ('aprovada', 'negada')) as finalizadas
    FROM oportunidades o
    WHERE o.updated_at >= CURRENT_DATE - INTERVAL '12 months'
      AND (
        (user_role = 'vendedor' AND o.responsavel_id = COALESCE(user_id, auth.uid())) OR
        (user_role = 'gerente' AND o.responsavel_id IN (
          SELECT id FROM profiles WHERE team_id = user_team_id
        )) OR
        (user_role = 'diretor')
      )
  )
  SELECT 
    CASE 
      WHEN finalizadas > 0 THEN ROUND((ganhas::DECIMAL / finalizadas::DECIMAL) * 100, 2)
      ELSE 0 
    END INTO taxa_conversao
  FROM conversao_data;

  -- Calcular valor médio de oportunidade ganha (últimos 12 meses)
  SELECT COALESCE(AVG(o.valor_estimado), 0) INTO valor_medio_ganha
  FROM oportunidades o
  WHERE o.fase = 'aprovada'
    AND o.updated_at >= CURRENT_DATE - INTERVAL '12 meses'
    AND (
      (user_role = 'vendedor' AND o.responsavel_id = COALESCE(user_id, auth.uid())) OR
      (user_role = 'gerente' AND o.responsavel_id IN (
        SELECT id FROM profiles WHERE team_id = user_team_id
      )) OR
      (user_role = 'diretor')
    );

  -- Montar resultado JSON
  SELECT json_build_object(
    'total_oportunidades_abertas', total_abertas,
    'valor_total_pipeline', valor_pipeline,
    'taxa_conversao', taxa_conversao,
    'valor_medio_oportunidade_ganha', ROUND(valor_medio_ganha, 2)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter dados do funil de vendas
CREATE OR REPLACE FUNCTION get_funil_vendas(user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_role TEXT;
  user_team_id UUID;
BEGIN
  -- Obter informações do usuário
  SELECT role, team_id INTO user_role, user_team_id
  FROM profiles 
  WHERE id = COALESCE(user_id, auth.uid());

  -- Calcular dados do funil
  SELECT json_agg(
    json_build_object(
      'fase', fase,
      'quantidade', quantidade,
      'valor_total', valor_total
    )
  ) INTO result
  FROM (
    SELECT 
      o.fase,
      COUNT(*) as quantidade,
      COALESCE(SUM(o.valor_estimado), 0) as valor_total
    FROM oportunidades o
    WHERE (
      (user_role = 'vendedor' AND o.responsavel_id = COALESCE(user_id, auth.uid())) OR
      (user_role = 'gerente' AND o.responsavel_id IN (
        SELECT id FROM profiles WHERE team_id = user_team_id
      )) OR
      (user_role = 'diretor')
    )
    GROUP BY o.fase
    ORDER BY 
      CASE o.fase
        WHEN 'aguardando_aprovacao' THEN 1
        WHEN 'aprovada' THEN 2
        WHEN 'vencida' THEN 3
        WHEN 'negada' THEN 4
      END
  ) funil_data;

  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;