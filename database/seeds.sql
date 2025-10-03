-- Dados iniciais para o sistema de gestão de oportunidades

-- Inserir dados de exemplo apenas se não existirem
-- Nota: Este arquivo deve ser executado após a criação dos usuários no Supabase Auth

-- Exemplo de como inserir perfis (deve ser adaptado com IDs reais do Supabase Auth)
-- INSERT INTO profiles (id, full_name, email, role, team_id) VALUES
-- ('uuid-do-usuario-1', 'João Silva', 'joao@empresa.com', 'diretor', NULL),
-- ('uuid-do-usuario-2', 'Maria Santos', 'maria@empresa.com', 'gerente', 'uuid-team-1'),
-- ('uuid-do-usuario-3', 'Pedro Costa', 'pedro@empresa.com', 'vendedor', 'uuid-team-1');

-- Inserir clientes de exemplo
INSERT INTO clientes (nome_razao_social, cnpj_cpf, nome_contato, email_contato, telefone, endereco_completo, status) VALUES
('Empresa ABC Ltda', '12.345.678/0001-90', 'Carlos Oliveira', 'carlos@empresaabc.com', '(11) 99999-1234', 'Rua das Flores, 123 - São Paulo/SP', 'ativo'),
('Comércio XYZ S.A.', '98.765.432/0001-10', 'Ana Paula', 'ana@comercioxyz.com', '(11) 88888-5678', 'Av. Paulista, 456 - São Paulo/SP', 'prospect'),
('Indústria 123 Ltda', '11.222.333/0001-44', 'Roberto Lima', 'roberto@industria123.com', '(11) 77777-9012', 'Rua Industrial, 789 - São Paulo/SP', 'ativo'),
('Serviços DEF ME', '55.666.777/0001-88', 'Fernanda Costa', 'fernanda@servicosdef.com', '(11) 66666-3456', 'Rua dos Serviços, 321 - São Paulo/SP', 'prospect');

-- Inserir fornecedores de exemplo
INSERT INTO fornecedores (nome_razao_social, cnpj, contato_principal_nome, contato_principal_email, contato_principal_telefone, area_atuacao, status) VALUES
('TechSolutions Ltda', '22.333.444/0001-55', 'Marcos Silva', 'marcos@techsolutions.com', '(11) 55555-1111', 'Tecnologia da Informação', 'ativo'),
('LogisticaPro S.A.', '33.444.555/0001-66', 'Juliana Santos', 'juliana@logisticapro.com', '(11) 44444-2222', 'Logística e Transporte', 'ativo'),
('ConsultoriaMax ME', '44.555.666/0001-77', 'Ricardo Pereira', 'ricardo@consultoriamax.com', '(11) 33333-3333', 'Consultoria Empresarial', 'ativo'),
('SuporteTotal Ltda', '55.666.777/0001-88', 'Patrícia Lima', 'patricia@suportetotal.com', '(11) 22222-4444', 'Suporte Técnico', 'ativo');

-- Nota: As oportunidades, atividades e notificações devem ser inseridas após a criação dos perfis
-- com os IDs corretos dos usuários do Supabase Auth

-- Exemplo de estrutura para oportunidades (comentado até ter usuários reais):
/*
INSERT INTO oportunidades (titulo, cliente_id, valor_estimado, fase, data_fechamento_prevista, responsavel_id, probabilidade_fechamento, descricao) VALUES
('Implementação Sistema ERP', (SELECT id FROM clientes WHERE nome_razao_social = 'Empresa ABC Ltda'), 150000.00, 'qualificacao', '2024-06-30', 'uuid-vendedor-1', 70, 'Projeto de implementação de sistema ERP completo'),
('Consultoria Processos', (SELECT id FROM clientes WHERE nome_razao_social = 'Comércio XYZ S.A.'), 85000.00, 'proposta', '2024-05-15', 'uuid-vendedor-2', 60, 'Consultoria para otimização de processos internos'),
('Suporte Técnico Anual', (SELECT id FROM clientes WHERE nome_razao_social = 'Indústria 123 Ltda'), 120000.00, 'negociacao', '2024-04-20', 'uuid-vendedor-1', 85, 'Contrato anual de suporte técnico especializado');
*/