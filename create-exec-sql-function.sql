-- Função para executar SQL dinamicamente (Execute no Supabase SQL Editor)

CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN 'SQL executado com sucesso';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Erro: ' || SQLERRM;
END;
$$;