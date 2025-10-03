-- Criar função para desabilitar RLS
-- Execute este script no SQL Editor do Supabase

CREATE OR REPLACE FUNCTION disable_rls_profiles()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Desabilitar RLS na tabela profiles
  ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
  
  -- Retornar confirmação
  RETURN 'RLS desabilitado com sucesso na tabela profiles';
END;
$$;