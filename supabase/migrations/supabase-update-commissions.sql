-- Atualizar valores da tabela commission_channel_director
DELETE FROM commission_channel_director;
INSERT INTO commission_channel_director (months_12, months_24, months_36, months_48, months_60)
VALUES (1.2, 2.4, 3.6, 3.6, 3.6);

-- Atualizar valores da tabela commission_channel_seller
DELETE FROM commission_channel_seller;
INSERT INTO commission_channel_seller (months_12, months_24, months_36, months_48, months_60)
VALUES (1.2, 2.4, 3.6, 3.6, 3.6);