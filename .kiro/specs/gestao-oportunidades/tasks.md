# Implementation Plan - Sistema de Gestão de Oportunidades

- [x] 1. Setup inicial do projeto e configuração base
  - Criar projeto Next.js 14 com TypeScript e configurar estrutura de pastas
  - Instalar e configurar dependências (Tailwind, Shadcn/ui, Supabase, etc.)
  - Configurar variáveis de ambiente e arquivos de configuração
  - _Requirements: Requirement 1, 2, 3, 4, 5, 6, 7_

- [-] 2. Configuração do banco de dados e autenticação
  - [ ] 2.1 Configurar Supabase e criar schema do banco de dados
    - Criar tabelas: profiles, clientes, fornecedores, oportunidades, atividades, notificacoes
    - Implementar constraints, índices e relacionamentos
    - Configurar Row Level Security (RLS) policies
    - _Requirements: Requirement 6, 7_

  - [ ] 2.2 Implementar sistema de autenticação
    - Configurar Supabase Auth com providers (email/password)
    - Criar middleware de autenticação para rotas protegidas
    - Implementar controle de acesso baseado em roles (vendedor/gerente/diretor)
    - _Requirements: Requirement 6_

  - [ ]* 2.3 Criar testes para autenticação e autorização
    - Escrever testes unitários para middleware de auth
    - Criar testes de integração para RLS policies
    - _Requirements: Requirement 6_

- [ ] 3. Implementar tipos TypeScript e validações
  - [ ] 3.1 Criar interfaces e tipos TypeScript
    - Definir tipos para Profile, Cliente, Fornecedor, Oportunidade, Atividade
    - Criar tipos para Dashboard KPIs e métricas
    - Implementar tipos para formulários e validações
    - _Requirements: Requirement 1, 2, 3, 5_

  - [ ] 3.2 Implementar schemas de validação com Zod
    - Criar schemas para validação de formulários de clientes
    - Implementar validação para fornecedores e oportunidades
    - Adicionar validações customizadas (CNPJ, CPF, email, etc.)
    - _Requirements: Requirement 1, 2, 3_

- [ ] 4. Desenvolver componentes base e UI
  - [ ] 4.1 Criar componentes UI reutilizáveis
    - Implementar DataTable com paginação, filtros e ordenação
    - Criar SearchInput com debounce e autocomplete
    - Desenvolver StatusBadge, DatePicker e NotificationCenter
    - _Requirements: Requirement 1, 2, 3, 4_

  - [ ] 4.2 Implementar layout principal e navegação
    - Criar layout do dashboard com sidebar e header
    - Implementar navegação responsiva e breadcrumbs
    - Adicionar sistema de notificações no header
    - _Requirements: Requirement 4, 5_

  - [ ]* 4.3 Criar testes para componentes UI
    - Escrever testes unitários para componentes reutilizáveis
    - Implementar testes de acessibilidade
    - _Requirements: Requirement 1, 2, 3_

- [ ] 5. Implementar módulo de Gestão de Clientes
  - [ ] 5.1 Criar CRUD de clientes
    - Implementar formulário de criação/edição de clientes
    - Desenvolver listagem com busca e filtros por status
    - Criar página de detalhes do cliente com histórico de oportunidades
    - _Requirements: Requirement 1_

  - [ ] 5.2 Implementar funcionalidades avançadas de clientes
    - Adicionar validação de CNPJ/CPF em tempo real
    - Implementar busca por múltiplos campos (nome, documento, contato)
    - Criar sistema de inativação sem exclusão física
    - _Requirements: Requirement 1_

  - [ ]* 5.3 Criar testes para módulo de clientes
    - Escrever testes unitários para componentes de clientes
    - Implementar testes de integração para API de clientes
    - _Requirements: Requirement 1_

- [ ] 6. Implementar módulo de Gestão de Fornecedores
  - [ ] 6.1 Criar CRUD de fornecedores
    - Implementar formulário de criação/edição de fornecedores
    - Desenvolver listagem com busca por nome e CNPJ
    - Criar sistema de categorização por área de atuação
    - _Requirements: Requirement 2_

  - [ ] 6.2 Implementar associações fornecedor-oportunidade
    - Criar sistema de seleção múltipla de fornecedores
    - Implementar visualização de fornecedores associados
    - Adicionar histórico de participação em oportunidades
    - _Requirements: Requirement 2, 3_

- [ ] 7. Desenvolver módulo core de Gestão de Oportunidades
  - [ ] 7.1 Implementar CRUD básico de oportunidades
    - Criar formulário completo de oportunidade com todos os campos
    - Implementar validações de negócio (datas, valores, probabilidades)
    - Desenvolver sistema de associação com clientes e fornecedores
    - _Requirements: Requirement 3_

  - [ ] 7.2 Criar visualização em lista de oportunidades
    - Implementar tabela com filtros avançados (fase, responsável, cliente)
    - Adicionar ordenação por múltiplas colunas
    - Criar filtros rápidos (minhas oportunidades, vencendo, vencidas)
    - _Requirements: Requirement 3, 4_

  - [ ] 7.3 Desenvolver visualização Kanban
    - Implementar board Kanban com drag-and-drop entre fases
    - Criar cards de oportunidade com informações resumidas
    - Adicionar atualização automática de fase ao mover cards
    - _Requirements: Requirement 3_

  - [ ] 7.4 Implementar sistema de atividades e histórico
    - Criar formulário para adicionar atividades (notas, ligações, reuniões)
    - Implementar timeline de atividades com filtros por tipo
    - Adicionar registro automático de mudanças de fase
    - _Requirements: Requirement 3, 7_

  - [ ]* 7.5 Criar testes para módulo de oportunidades
    - Escrever testes unitários para componentes de oportunidades
    - Implementar testes E2E para fluxo completo de oportunidade
    - Criar testes para drag-and-drop do Kanban
    - _Requirements: Requirement 3_

- [ ] 8. Implementar sistema de alertas e notificações
  - [ ] 8.1 Criar sistema de notificações em tempo real
    - Implementar Supabase real-time subscriptions para notificações
    - Criar componente de centro de notificações no header
    - Desenvolver sistema de marcação de lidas/não lidas
    - _Requirements: Requirement 4_

  - [ ] 8.2 Implementar alertas de vencimento
    - Criar job/função para detectar oportunidades próximas do vencimento
    - Implementar envio de emails de alerta via Resend
    - Adicionar destacamento visual de oportunidades vencidas
    - _Requirements: Requirement 4_

  - [ ] 8.3 Desenvolver filtros de vencimento
    - Implementar filtros "Vencendo esta semana", "Vencendo este mês", "Vencidas"
    - Criar indicadores visuais de urgência nas listagens
    - Adicionar contadores de oportunidades por status de vencimento
    - _Requirements: Requirement 4_

- [ ] 9. Desenvolver Dashboard de Análise e KPIs
  - [ ] 9.1 Implementar KPIs principais
    - Criar queries para calcular total de oportunidades abertas
    - Implementar cálculo de valor total do pipeline
    - Desenvolver cálculo de taxa de conversão
    - Adicionar cálculo de valor médio por oportunidade ganha
    - _Requirements: Requirement 5_

  - [ ] 9.2 Criar gráficos e visualizações
    - Implementar gráfico de funil de vendas com Chart.js ou similar
    - Criar gráfico de ganhos vs perdas por período
    - Desenvolver gráfico de desempenho por vendedor
    - Adicionar filtros de período para todos os gráficos
    - _Requirements: Requirement 5_

  - [ ] 9.3 Implementar listas rápidas e acionáveis
    - Criar lista "Minhas Oportunidades Abertas"
    - Implementar lista "Oportunidades com Vencimento Próximo"
    - Desenvolver feed "Atividades Recentes de toda a equipe"
    - Adicionar links diretos para ações rápidas
    - _Requirements: Requirement 5_

  - [ ]* 9.4 Criar testes para dashboard e KPIs
    - Escrever testes unitários para cálculos de KPIs
    - Implementar testes de integração para queries de dashboard
    - _Requirements: Requirement 5_

- [ ] 10. Implementar controle de acesso e permissões
  - [ ] 10.1 Criar sistema de roles e permissões
    - Implementar middleware para verificação de roles
    - Criar hooks para controle de acesso em componentes
    - Desenvolver sistema de filtros baseado em hierarquia
    - _Requirements: Requirement 6_

  - [ ] 10.2 Implementar visibilidade baseada em roles
    - Vendedor: apenas suas oportunidades
    - Gerente: oportunidades de sua equipe
    - Diretor: todas as oportunidades
    - _Requirements: Requirement 6_

- [ ] 11. Implementar auditoria e logs
  - [ ] 11.1 Criar sistema de auditoria
    - Implementar triggers no banco para log automático de alterações
    - Criar interface para visualização de logs de auditoria
    - Desenvolver relatórios de atividade por usuário
    - _Requirements: Requirement 7_

  - [ ] 11.2 Implementar rastreamento de atividades
    - Criar log automático de login/logout
    - Implementar rastreamento de alterações em oportunidades
    - Adicionar log de ações administrativas
    - _Requirements: Requirement 7_

- [ ] 12. Otimização e performance
  - [ ] 12.1 Implementar otimizações de performance
    - Adicionar lazy loading para componentes pesados
    - Implementar paginação eficiente com cursor-based pagination
    - Criar índices otimizados no banco de dados
    - _Requirements: Requirement 1, 2, 3, 5_

  - [ ] 12.2 Implementar caching estratégico
    - Configurar React Query para cache de dados
    - Implementar cache de KPIs com invalidação inteligente
    - Adicionar service worker para cache offline
    - _Requirements: Requirement 5_

- [ ] 13. Testes finais e deployment
  - [ ]* 13.1 Implementar testes E2E completos
    - Criar testes E2E para fluxos críticos de usuário
    - Implementar testes de performance e carga
    - Adicionar testes de acessibilidade
    - _Requirements: Requirement 1, 2, 3, 4, 5, 6, 7_

  - [ ] 13.2 Configurar deployment e CI/CD
    - Configurar pipeline de deployment no Vercel
    - Implementar testes automatizados no CI
    - Configurar monitoramento de erros com Sentry
    - _Requirements: Requirement 1, 2, 3, 4, 5, 6, 7_

  - [ ] 13.3 Documentação e treinamento
    - Criar documentação técnica da API
    - Desenvolver guia do usuário para cada módulo
    - Preparar material de treinamento para equipe
    - _Requirements: Requirement 1, 2, 3, 4, 5, 6, 7_