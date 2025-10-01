# Requirements Document

## Introduction

Este documento define os requisitos para atualizar todas as tabelas de comissões nas calculadoras do sistema com base nas novas estruturas fornecidas nos prints. O sistema atualmente possui diferentes tipos de tabelas de comissões (Canal/Vendedor, Canal Influenciador, Canal Indicador, Vendedor e Diretor) que precisam ser padronizadas e atualizadas com os novos valores e estruturas.

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema, eu quero que todas as calculadoras exibam as tabelas de comissões atualizadas conforme os novos padrões, para que eu possa visualizar as informações corretas de comissão.

#### Acceptance Criteria

1. WHEN o usuário acessa qualquer calculadora THEN o sistema SHALL exibir as tabelas de comissões com a nova estrutura padronizada
2. WHEN o usuário visualiza a tabela "Comissão Canal/Vendedor" THEN o sistema SHALL mostrar os valores: 12 meses (0,60%), 24 meses (1,20%), 36 meses (2,00%), 48 meses (2,00%), 60 meses (2,00%)
3. WHEN o usuário visualiza a tabela "Comissão Vendedor" THEN o sistema SHALL mostrar os valores: 12 meses (1,2%), 24 meses (2,4%), 36 meses (3,6%), 48 meses (3,6%), 60 meses (3,6%)
4. WHEN o usuário visualiza a tabela "Comissão Diretor" THEN o sistema SHALL mostrar os valores: 12 meses (0%), 24 meses (0%), 36 meses (0%), 48 meses (0%), 60 meses (0%)

### Requirement 2

**User Story:** Como um usuário do sistema, eu quero que as tabelas de "Comissão Canal Influenciador" e "Comissão Canal Indicador" sejam exibidas com a estrutura baseada em faixas de receita mensal, para que eu possa ver as comissões corretas por faixa de valor.

#### Acceptance Criteria

1. WHEN o usuário visualiza a tabela "Comissão Canal Influenciador" THEN o sistema SHALL exibir as faixas de receita: "Até 500,00", "500,01 a 1.000,00", "1.000,01 a 1.500,00", "1.500,01 a 3.000,00", "3.000,01 a 5.000,00", "Acima de 5.000,01"
2. WHEN o usuário visualiza a tabela "Comissão Canal Influenciador" THEN o sistema SHALL exibir as comissões por período: 12 meses (1,50%, 2,51%, 4,01%, 5,01%, 6,01%, 7,01%), 24 meses (2,00%, 3,25%, 4,50%, 5,50%, 6,50%, 7,50%), 36-60 meses (2,50%, 4,00%, 5,00%, 6,00%, 7,00%, 8,00%)
3. WHEN o usuário visualiza a tabela "Comissão Canal Indicador" THEN o sistema SHALL exibir as mesmas faixas de receita com comissões menores: 12 meses (0,50%, 0,84%, 1,34%, 1,67%, 2,00%, 2,34%), 24 meses (0,67%, 1,08%, 1,50%, 1,83%, 2,17%, 2,50%), 36-60 meses (0,83%, 1,33%, 1,67%, 2,00%, 2,50%, 3,00%)

### Requirement 3

**User Story:** Como um desenvolvedor, eu quero que o sistema utilize dados do Supabase para armazenar e recuperar as informações das tabelas de comissões, para que os dados sejam persistentes e gerenciáveis.

#### Acceptance Criteria

1. WHEN o sistema carrega as tabelas de comissões THEN o sistema SHALL buscar os dados das tabelas do Supabase
2. WHEN não há dados no Supabase THEN o sistema SHALL utilizar os valores padrão definidos nos prints como fallback
3. WHEN há erro na conexão com o Supabase THEN o sistema SHALL exibir uma mensagem de erro apropriada e utilizar dados de fallback
4. WHEN os dados são atualizados no Supabase THEN o sistema SHALL refletir as mudanças em todas as calculadoras

### Requirement 4

**User Story:** Como um usuário do sistema, eu quero que todas as calculadoras (Internet Fibra, Internet MAN, Internet Rádio, PABX SIP, Máquinas Virtuais) exibam as mesmas tabelas de comissões padronizadas, para que haja consistência em todo o sistema.

#### Acceptance Criteria

1. WHEN o usuário acessa qualquer calculadora THEN o sistema SHALL exibir as mesmas tabelas de comissões padronizadas
2. WHEN o usuário navega entre diferentes calculadoras THEN o sistema SHALL manter a consistência visual e de dados das tabelas de comissões
3. WHEN o sistema exibe as tabelas THEN o sistema SHALL usar o mesmo layout e estilo visual em todas as calculadoras
4. WHEN há atualizações nas tabelas THEN o sistema SHALL aplicar as mudanças em todas as calculadoras simultaneamente

### Requirement 5

**User Story:** Como um usuário do sistema, eu quero que as tabelas de comissões tenham um design visual consistente com o tema escuro do sistema, para que a experiência visual seja uniforme.

#### Acceptance Criteria

1. WHEN o sistema exibe as tabelas de comissões THEN o sistema SHALL usar o tema escuro (background slate-900/gray-900) conforme os prints
2. WHEN o sistema exibe os cabeçalhos das tabelas THEN o sistema SHALL usar texto branco em fundo escuro
3. WHEN o sistema exibe os valores das comissões THEN o sistema SHALL formatar os percentuais com precisão de duas casas decimais
4. WHEN o sistema exibe as faixas de valores THEN o sistema SHALL formatar os valores monetários no padrão brasileiro (R$)