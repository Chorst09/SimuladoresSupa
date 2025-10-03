-- Migração para atualizar a estrutura de oportunidades
-- Execute este script para atualizar oportunidades existentes

-- 1. Adicionar novos campos
ALTER TABLE oportunidades 
ADD COLUMN IF NOT EXISTS numero_oportunidade TEXT,
ADD COLUMN IF NOT EXISTS data_vencimento DATE;

-- 2. Atualizar constraint de fase
ALTER TABLE oportunidades 
DROP CONSTRAINT IF EXISTS oportunidades_fase_check;

ALTER TABLE oportunidades 
ADD CONSTRAINT oportunidades_fase_check 
CHECK (fase IN ('aguardando_aprovacao', 'aprovada', 'vencida', 'negada'));

-- 3. Migrar dados existentes (se houver)
-- Mapear fases antigas para novas
UPDATE oportunidades SET fase = 'aguardando_aprovacao' WHERE fase = 'qualificacao';
UPDATE oportunidades SET fase = 'aguardando_aprovacao' WHERE fase = 'proposta';
UPDATE oportunidades SET fase = 'aguardando_aprovacao' WHERE fase = 'negociacao';
UPDATE oportunidades SET fase = 'aprovada' WHERE fase = 'ganha';
UPDATE oportunidades SET fase = 'negada' WHERE fase = 'perdida';

-- 4. Gerar números de oportunidade para registros existentes
UPDATE oportunidades 
SET numero_oportunidade = 'OPP-' || TO_CHAR(created_at, 'YYYY') || '-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 3, '0')
WHERE numero_oportunidade IS NULL;

-- 5. Definir data_vencimento igual a data_fechamento_prevista para registros existentes
UPDATE oportunidades 
SET data_vencimento = data_fechamento_prevista 
WHERE data_vencimento IS NULL;

-- 6. Tornar campos obrigatórios
ALTER TABLE oportunidades 
ALTER COLUMN numero_oportunidade SET NOT NULL,
ALTER COLUMN data_vencimento SET NOT NULL;

-- 7. Adicionar constraint de unicidade para numero_oportunidade
ALTER TABLE oportunidades 
ADD CONSTRAINT oportunidades_numero_oportunidade_unique 
UNIQUE (numero_oportunidade);

-- 8. Adicionar índices
CREATE INDEX IF NOT EXISTS idx_oportunidades_numero ON oportunidades(numero_oportunidade);
CREATE INDEX IF NOT EXISTS idx_oportunidades_data_vencimento ON oportunidades(data_vencimento);

-- 9. Verificar resultado
SELECT 
  'Migração concluída' as status,
  COUNT(*) as total_oportunidades,
  COUNT(CASE WHEN numero_oportunidade IS NOT NULL THEN 1 END) as com_numero,
  COUNT(CASE WHEN data_vencimento IS NOT NULL THEN 1 END) as com_vencimento
FROM oportunidades;