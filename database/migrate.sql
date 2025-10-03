-- Script de migração completa para o Sistema de Gestão de Oportunidades
-- Execute este arquivo no SQL Editor do Supabase para criar toda a estrutura

-- 1. Criar schema principal
\i schema.sql

-- 2. Criar funções auxiliares
\i functions.sql

-- 3. Configurar políticas RLS
\i rls_policies.sql

-- 4. Inserir dados iniciais (opcional)
-- \i seeds.sql

-- Verificar se tudo foi criado corretamente
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'clientes', 'fornecedores', 'oportunidades', 'oportunidade_fornecedores', 'atividades', 'notificacoes')
ORDER BY tablename;