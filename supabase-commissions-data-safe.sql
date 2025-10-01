-- Script seguro para inserir/atualizar dados das comissões
-- Execute este SQL no Supabase SQL Editor APÓS executar o schema

-- Limpar e inserir dados para commission_channel_director
DELETE FROM commission_channel_director;
INSERT INTO commission_channel_director (months_12, months_24, months_36, months_48, months_60) VALUES 
(0.00, 0.00, 0.00, 0.00, 0.00);

-- Limpar e inserir dados para commission_channel_seller
DELETE FROM commission_channel_seller;
INSERT INTO commission_channel_seller (months_12, months_24, months_36, months_48, months_60) VALUES 
(0.60, 1.20, 2.00, 2.00, 2.00);

-- Limpar e inserir dados para commission_seller
DELETE FROM commission_seller;
INSERT INTO commission_seller (months_12, months_24, months_36, months_48, months_60) VALUES 
(1.20, 2.40, 3.60, 3.60, 3.60);

-- Limpar e inserir dados para commission_channel_influencer
DELETE FROM commission_channel_influencer;
INSERT INTO commission_channel_influencer (revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60) VALUES 
('Até 500,00', 0.00, 500.00, 1.50, 2.00, 2.50, 2.50, 2.50),
('500,01 a 1.000,00', 500.01, 1000.00, 2.51, 3.25, 4.00, 4.00, 4.00),
('1.000,01 a 1.500,00', 1000.01, 1500.00, 4.01, 4.50, 5.00, 5.00, 5.00),
('1.500,01 a 3.000,00', 1500.01, 3000.00, 5.01, 5.50, 6.00, 6.00, 6.00),
('3.000,01 a 5.000,00', 3000.01, 5000.00, 6.01, 6.50, 7.00, 7.00, 7.00),
('Acima de 5.000,01', 5000.01, 999999999.99, 7.01, 7.50, 8.00, 8.00, 8.00);

-- Limpar e inserir dados para commission_channel_indicator
DELETE FROM commission_channel_indicator;
INSERT INTO commission_channel_indicator (revenue_range, revenue_min, revenue_max, months_12, months_24, months_36, months_48, months_60) VALUES 
('Até 500,00', 0.00, 500.00, 0.50, 0.67, 0.83, 0.83, 0.83),
('500,01 a 1.000,00', 500.01, 1000.00, 0.84, 1.08, 1.33, 1.33, 1.33),
('1.000,01 a 1.500,00', 1000.01, 1500.00, 1.34, 1.50, 1.67, 1.67, 1.67),
('1.500,01 a 3.000,00', 1500.01, 3000.00, 1.67, 1.83, 2.00, 2.00, 2.00),
('3.000,01 a 5.000,00', 3000.01, 5000.00, 2.00, 2.17, 2.50, 2.50, 2.50),
('Acima de 5.000,01', 5000.01, 999999999.99, 2.34, 2.50, 3.00, 3.00, 3.00);

-- Verificar se os dados foram inseridos corretamente
SELECT 'commission_channel_director' as tabela, COUNT(*) as registros FROM commission_channel_director
UNION ALL
SELECT 'commission_channel_seller' as tabela, COUNT(*) as registros FROM commission_channel_seller
UNION ALL
SELECT 'commission_seller' as tabela, COUNT(*) as registros FROM commission_seller WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commission_seller')
UNION ALL
SELECT 'commission_channel_influencer' as tabela, COUNT(*) as registros FROM commission_channel_influencer
UNION ALL
SELECT 'commission_channel_indicator' as tabela, COUNT(*) as registros FROM commission_channel_indicator;