# Requirements Document - Sistema de Gestão de Oportunidades

## Introduction

O Sistema de Gestão de Oportunidades é uma plataforma web centralizada para gerenciar todo o ciclo de vida de oportunidades de negócio. A solução permitirá o cadastro de clientes e fornecedores, o registro e acompanhamento de oportunidades, a gestão de prazos e a visualização de dados estratégicos através de um dashboard intuitivo.

**Público-Alvo:** Equipe de Vendas, Gerentes Comerciais e Diretores.

## Requirements

### Requirement 1 - Gestão de Clientes

**User Story:** Como um usuário do sistema, eu quero gerenciar informações de clientes de forma centralizada, para que eu possa manter uma base de dados organizada e acessível.

#### Acceptance Criteria

1. WHEN o usuário acessa o módulo de clientes THEN o sistema SHALL exibir uma lista de todos os clientes cadastrados
2. WHEN o usuário clica em "Criar Cliente" THEN o sistema SHALL exibir um formulário com todos os campos obrigatórios
3. WHEN o usuário preenche os dados do cliente e salva THEN o sistema SHALL validar os campos obrigatórios e criar o registro
4. WHEN o usuário busca por nome, CNPJ/CPF ou palavra-chave THEN o sistema SHALL retornar resultados em tempo real
5. WHEN o usuário aplica filtros por status THEN o sistema SHALL exibir apenas clientes com o status selecionado
6. WHEN o usuário visualiza um cliente THEN o sistema SHALL exibir automaticamente o histórico de oportunidades associadas
7. WHEN o usuário edita informações de um cliente THEN o sistema SHALL permitir alterações em todos os campos editáveis
8. WHEN o usuário inativa um cliente THEN o sistema SHALL alterar o status para "Inativo" sem excluir o registro

### Requirement 2 - Gestão de Fornecedores

**User Story:** Como um usuário do sistema, eu quero cadastrar e gerenciar fornecedores e parceiros, para que eu possa associá-los às oportunidades quando necessário.

#### Acceptance Criteria

1. WHEN o usuário acessa o módulo de fornecedores THEN o sistema SHALL exibir uma lista de todos os fornecedores cadastrados
2. WHEN o usuário cria um novo fornecedor THEN o sistema SHALL validar o CNPJ e salvar as informações
3. WHEN o usuário busca por nome ou CNPJ THEN o sistema SHALL retornar resultados filtrados
4. WHEN o usuário edita um fornecedor THEN o sistema SHALL permitir alterações em todos os campos
5. WHEN o usuário inativa um fornecedor THEN o sistema SHALL alterar o status sem excluir o registro
6. WHEN o usuário visualiza um fornecedor THEN o sistema SHALL exibir todas as informações cadastradas

### Requirement 3 - Gestão de Oportunidades (Core)

**User Story:** Como um vendedor, eu quero registrar e acompanhar oportunidades de negócio, para que eu possa gerenciar meu pipeline de vendas de forma eficiente.

#### Acceptance Criteria

1. WHEN o usuário cria uma oportunidade THEN o sistema SHALL exigir a associação com um cliente
2. WHEN o usuário associa fornecedores THEN o sistema SHALL permitir múltiplas seleções opcionais
3. WHEN o usuário visualiza oportunidades THEN o sistema SHALL oferecer visualização em lista e Kanban
4. WHEN o usuário arrasta uma oportunidade no Kanban THEN o sistema SHALL atualizar a fase automaticamente
5. WHEN o usuário adiciona uma atividade THEN o sistema SHALL registrar no histórico com timestamp
6. WHEN o usuário define uma data de fechamento THEN o sistema SHALL validar que seja uma data futura
7. WHEN o usuário salva uma oportunidade THEN o sistema SHALL validar todos os campos obrigatórios
8. WHEN o usuário filtra oportunidades THEN o sistema SHALL aplicar os filtros selecionados em tempo real

### Requirement 4 - Sistema de Alertas e Vencimentos

**User Story:** Como um vendedor, eu quero receber alertas sobre oportunidades próximas do vencimento, para que eu não perca prazos importantes.

#### Acceptance Criteria

1. WHEN uma oportunidade está a 7 dias do vencimento THEN o sistema SHALL enviar alerta por email ao responsável
2. WHEN uma oportunidade está vencida THEN o sistema SHALL destacá-la em vermelho nas listagens
3. WHEN o usuário acessa o dashboard THEN o sistema SHALL exibir notificações de vencimentos próximos
4. WHEN o usuário aplica filtro "Vencendo esta semana" THEN o sistema SHALL exibir oportunidades com vencimento em 7 dias
5. WHEN o usuário aplica filtro "Vencidas" THEN o sistema SHALL exibir apenas oportunidades com data passada
6. WHEN o sistema envia alertas THEN o sistema SHALL registrar o envio no log de atividades

### Requirement 5 - Dashboard de Análise e KPIs

**User Story:** Como um gerente comercial, eu quero visualizar indicadores e análises do pipeline de vendas, para que eu possa tomar decisões estratégicas baseadas em dados.

#### Acceptance Criteria

1. WHEN o usuário acessa o dashboard THEN o sistema SHALL exibir todos os KPIs principais
2. WHEN o sistema calcula a taxa de conversão THEN o sistema SHALL usar a fórmula (Ganhas / Total Finalizadas) * 100
3. WHEN o usuário visualiza o funil de vendas THEN o sistema SHALL mostrar quantidade e valor por fase
4. WHEN o usuário visualiza gráficos THEN o sistema SHALL permitir filtros por período
5. WHEN o usuário clica em um indicador THEN o sistema SHALL permitir drill-down para detalhes
6. WHEN o sistema exibe desempenho por vendedor THEN o sistema SHALL mostrar apenas oportunidades ganhas
7. WHEN o usuário acessa listas rápidas THEN o sistema SHALL exibir dados atualizados em tempo real
8. WHEN o usuário filtra por período THEN o sistema SHALL recalcular todos os indicadores automaticamente

### Requirement 6 - Controle de Acesso e Segurança

**User Story:** Como um administrador do sistema, eu quero controlar o acesso dos usuários, para que cada pessoa veja apenas as informações apropriadas ao seu nível.

#### Acceptance Criteria

1. WHEN um usuário faz login THEN o sistema SHALL validar credenciais e definir permissões
2. WHEN um vendedor acessa o sistema THEN o sistema SHALL exibir apenas suas oportunidades
3. WHEN um gerente acessa o sistema THEN o sistema SHALL exibir oportunidades de sua equipe
4. WHEN um diretor acessa o sistema THEN o sistema SHALL exibir todas as oportunidades
5. WHEN um usuário tenta acessar dados restritos THEN o sistema SHALL negar acesso e registrar tentativa
6. WHEN o sistema detecta inatividade THEN o sistema SHALL fazer logout automático após 30 minutos

### Requirement 7 - Auditoria e Histórico

**User Story:** Como um gerente, eu quero rastrear todas as alterações no sistema, para que eu possa manter um histórico completo das atividades.

#### Acceptance Criteria

1. WHEN um usuário altera uma oportunidade THEN o sistema SHALL registrar a alteração com timestamp e usuário
2. WHEN um usuário visualiza o histórico THEN o sistema SHALL exibir todas as atividades em ordem cronológica
3. WHEN o sistema registra uma atividade THEN o sistema SHALL incluir data, hora, usuário e descrição da ação
4. WHEN um usuário adiciona uma nota THEN o sistema SHALL salvá-la no histórico da oportunidade
5. WHEN um administrador acessa logs THEN o sistema SHALL exibir relatório completo de auditoria