# Design Document

## Overview

Este documento descreve o design para atualizar todas as tabelas de comissões nas calculadoras do sistema. A solução envolve a criação de novas tabelas no Supabase para armazenar os diferentes tipos de comissões (Canal/Vendedor, Canal Influenciador, Canal Indicador, Vendedor e Diretor), atualização dos componentes React existentes e padronização do layout visual.

## Architecture

### Database Schema

O sistema utilizará o Supabase com as seguintes tabelas:

1. **commission_channel_seller** (existente) - Comissão Canal/Vendedor
2. **commission_channel_director** (existente) - Comissão Diretor  
3. **commission_channel_influencer** (nova) - Comissão Canal Influenciador
4. **commission_channel_indicator** (nova) - Comissão Canal Indicador
5. **commission_seller** (nova) - Comissão Vendedor

### Component Architecture

```
CommissionTablesUnified (novo componente principal)
├── ChannelSellerTable (tabela simples por período)
├── SellerTable (tabela simples por período)
├── DirectorTable (tabela simples por período)
├── ChannelInfluencerTable (tabela por faixa de receita)
└── ChannelIndicatorTable (tabela por faixa de receita)
```

### Data Flow

1. Hook `useCommissions` busca dados de todas as tabelas do Supabase
2. Componente principal `CommissionTablesUnified` recebe os dados
3. Cada sub-componente renderiza sua respectiva tabela
4. Fallback para dados padrão em caso de erro ou dados ausentes

## Components and Interfaces

### Database Interfaces

```typescript
interface CommissionChannelSeller {
  id: string;
  months_12: number;
  months_24: number;
  months_36: number;
  months_48: number;
  months_60: number;
}

interface CommissionChannelDirector {
  id: string;
  months_12: number;
  months_24: number;
  months_36: number;
  months_48: number;
  months_60: number;
}

interface CommissionSeller {
  id: string;
  months_12: number;
  months_24: number;
  months_36: number;
  months_48: number;
  months_60: number;
}

interface CommissionChannelInfluencer {
  id: string;
  revenue_range: string;
  revenue_min: number;
  revenue_max: number;
  months_12: number;
  months_24: number;
  months_36: number;
  months_48: number;
  months_60: number;
}

interface CommissionChannelIndicator {
  id: string;
  revenue_range: string;
  revenue_min: number;
  revenue_max: number;
  months_12: number;
  months_24: number;
  months_36: number;
  months_48: number;
  months_60: number;
}
```

### Component Interfaces

```typescript
interface CommissionTablesUnifiedProps {
  className?: string;
}

interface UseCommissionsResult {
  channelSeller: CommissionChannelSeller | null;
  channelDirector: CommissionChannelDirector | null;
  seller: CommissionSeller | null;
  channelInfluencer: CommissionChannelInfluencer[] | null;
  channelIndicator: CommissionChannelIndicator[] | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}
```

### Layout Structure

O componente principal será organizado em:

1. **Primeira linha**: Comissão Canal/Vendedor (tabela única)
2. **Segunda linha**: Comissão Canal Influenciador e Comissão Canal Indicador (lado a lado)
3. **Terceira linha**: Comissão Vendedor e Comissão Diretor (lado a lado)

## Data Models

### Valores Padrão (Fallback)

**Comissão Canal/Vendedor:**
- 12 meses: 0,60%
- 24 meses: 1,20%
- 36 meses: 2,00%
- 48 meses: 2,00%
- 60 meses: 2,00%

**Comissão Vendedor:**
- 12 meses: 1,2%
- 24 meses: 2,4%
- 36 meses: 3,6%
- 48 meses: 3,6%
- 60 meses: 3,6%

**Comissão Diretor:**
- Todos os períodos: 0%

**Comissão Canal Influenciador:**
- Até 500,00: 1,50% | 2,00% | 2,50% | 2,50% | 2,50%
- 500,01 a 1.000,00: 2,51% | 3,25% | 4,00% | 4,00% | 4,00%
- 1.000,01 a 1.500,00: 4,01% | 4,50% | 5,00% | 5,00% | 5,00%
- 1.500,01 a 3.000,00: 5,01% | 5,50% | 6,00% | 6,00% | 6,00%
- 3.000,01 a 5.000,00: 6,01% | 6,50% | 7,00% | 7,00% | 7,00%
- Acima de 5.000,01: 7,01% | 7,50% | 8,00% | 8,00% | 8,00%

**Comissão Canal Indicador:**
- Até 500,00: 0,50% | 0,67% | 0,83% | 0,83% | 0,83%
- 500,01 a 1.000,00: 0,84% | 1,08% | 1,33% | 1,33% | 1,33%
- 1.000,01 a 1.500,00: 1,34% | 1,50% | 1,67% | 1,67% | 1,67%
- 1.500,01 a 3.000,00: 1,67% | 1,83% | 2,00% | 2,00% | 2,00%
- 3.000,01 a 5.000,00: 2,00% | 2,17% | 2,50% | 2,50% | 2,50%
- Acima de 5.000,01: 2,34% | 2,50% | 3,00% | 3,00% | 3,00%

## Error Handling

### Database Connection Errors
- Exibir mensagem de erro amigável
- Utilizar dados de fallback padrão
- Log de erros para monitoramento

### Data Validation Errors
- Validar tipos de dados recebidos do Supabase
- Sanitizar valores antes da exibição
- Fallback para valores padrão em caso de dados inválidos

### Loading States
- Skeleton loading durante carregamento inicial
- Indicadores de loading para atualizações
- Estados de erro com opção de retry

## Testing Strategy

### Unit Tests
- Testar hook `useCommissions` com dados mockados
- Testar componentes individuais de tabela
- Testar formatação de valores e percentuais
- Testar estados de loading e erro

### Integration Tests
- Testar integração com Supabase
- Testar fallback para dados padrão
- Testar atualização de dados em tempo real

### Visual Tests
- Verificar consistência visual entre calculadoras
- Testar responsividade das tabelas
- Verificar tema escuro em todos os componentes

### Manual Tests
- Testar em todas as calculadoras
- Verificar dados corretos em cada tabela
- Testar cenários de erro de conexão

## Implementation Notes

### Migration Strategy
1. Criar novas tabelas no Supabase
2. Atualizar hook `useCommissions` para buscar todas as tabelas
3. Criar componente `CommissionTablesUnified`
4. Substituir componentes existentes em todas as calculadoras
5. Remover componentes antigos após validação

### Performance Considerations
- Cache de dados de comissões no hook
- Lazy loading de componentes se necessário
- Otimização de queries do Supabase

### Accessibility
- Labels apropriados para screen readers
- Contraste adequado no tema escuro
- Navegação por teclado nas tabelas

### Responsive Design
- Tabelas responsivas com scroll horizontal em mobile
- Layout adaptativo para diferentes tamanhos de tela
- Priorização de conteúdo em telas pequenas