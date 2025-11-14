# Como Atualizar os Calculadores com o Novo Sistema de IDs

## O que mudou?

Agora os IDs das propostas seguem um padrão específico:
- PABX/SIP: `Prop_Pabx_Sip_001_v1`
- Máquinas Virtuais: `Prop_MV_001_v1`
- Internet Fibra: `Prop_Inter_Fibra_001_v1`
- Internet Rádio: `Prop_Inter_Radio_001_v1`
- Double Fibra/Rádio: `Prop_Inter_Double_001_v1`
- Internet MAN Fibra: `Prop_Inter_Man_001_v1`
- Internet MAN Rádio: `Prop_InterMan_Radio_001_v1`

## Exemplo: InternetFibraCalculator (JÁ ATUALIZADO)

### 1. Adicionar import

```typescript
import { generateNextProposalId } from '@/lib/proposal-id-generator';
```

### 2. Gerar o base_id antes de salvar

```typescript
// Gerar ID único para a proposta
const baseId = generateNextProposalId(proposals, 'FIBER', proposalVersion);

const proposalToSave = {
    base_id: baseId,  // <-- Adicionar esta linha
    title: `Proposta Internet Fibra V${proposalVersion} - ${clientData.companyName || clientData.name || 'Cliente'}`,
    // ... resto dos campos
};
```

## Calculadores que precisam ser atualizados:

### 1. PABXSIPCalculator.tsx
- Tipo: `'PABX'`
- Prefixo: `Prop_Pabx_Sip`

### 2. MaquinasVirtuaisCalculator.tsx
- Tipo: `'VM'`
- Prefixo: `Prop_MV`

### 3. InternetRadioCalculator.tsx
- Tipo: `'RADIO'`
- Prefixo: `Prop_Inter_Radio`

### 4. DoubleFibraRadioCalculator.tsx
- Tipo: `'DOUBLE'`
- Prefixo: `Prop_Inter_Double`

### 5. InternetManCalculator.tsx
- Tipo: `'INTERNET_MAN_FIBRA'`
- Prefixo: `Prop_Inter_Man`

### 6. InternetManRadioCalculator.tsx
- Tipo: `'MANRADIO'`
- Prefixo: `Prop_InterMan_Radio`

### 7. InternetOKv2Calculator.tsx
- Tipo: `'FIBER'`
- Prefixo: `Prop_Inter_Fibra`

## Template para atualização

```typescript
// 1. Adicionar import no topo do arquivo
import { generateNextProposalId } from '@/lib/proposal-id-generator';

// 2. Onde a proposta é salva (procure por "const proposalToSave = {")
// Adicione ANTES do objeto proposalToSave:

const baseId = generateNextProposalId(proposals, 'TIPO_AQUI', proposalVersion);

// 3. Adicione base_id como primeiro campo do objeto:
const proposalToSave = {
    base_id: baseId,
    // ... resto dos campos
};
```

## Tipos disponíveis:

```typescript
type ProposalType = 
  | 'PABX'           // Prop_Pabx_Sip_001_v1
  | 'VM'             // Prop_MV_001_v1
  | 'FIBER'          // Prop_Inter_Fibra_001_v1
  | 'RADIO'          // Prop_Inter_Radio_001_v1
  | 'DOUBLE'         // Prop_Inter_Double_001_v1
  | 'INTERNET_MAN_FIBRA'  // Prop_Inter_Man_001_v1
  | 'MANRADIO';      // Prop_InterMan_Radio_001_v1
```

## Benefícios:

1. IDs padronizados e legíveis
2. Numeração sequencial automática
3. Suporte a versões
4. Fácil identificação do tipo de proposta
5. Evita duplicação de IDs
