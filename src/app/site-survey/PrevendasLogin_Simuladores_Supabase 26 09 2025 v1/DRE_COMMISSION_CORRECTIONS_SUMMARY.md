# Correções dos Cálculos de DRE - Comissões

## Problema Identificado

Todas as calculadoras estavam calculando as comissões incorretamente no DRE. O problema era que sempre usavam a **comissão do Vendedor individual**, mesmo quando havia parceiros selecionados.

## Regra Correta Implementada

### ✅ **Com Parceiros Selecionados (Indicador ou Influenciador):**
- **Comissão do Canal/Vendedor** (baseada no prazo contratual)
- **+** Comissão do Parceiro Indicador (se selecionado)
- **+** Comissão do Parceiro Influenciador (se selecionado)

### ✅ **Sem Parceiros Selecionados:**
- **Apenas Comissão do Vendedor** (baseada no prazo contratual)

## Calculadoras Corrigidas

### 1. ✅ **RadioInternetCalculator**
**Antes:** Sempre usava `costBreakdown.commissionValue` (comissão vendedor)
**Depois:** 
```typescript
const temParceiros = includeReferralPartner || includeInfluencerPartner;
const comissaoVendedor = temParceiros 
    ? (receitaMensal * getChannelSellerCommissionRate(channelSeller, contractTerm) / 100) 
    : (costBreakdown.commissionValue || 0);
```

### 2. ✅ **InternetFibraCalculator**
**Antes:** Sempre usava `costBreakdown.commissionValue`
**Depois:**
```typescript
const temParceiros = includeReferralPartner || includeInfluencerPartner;
const comissaoVendedor = temParceiros 
    ? (costBreakdown.finalPrice * getChannelSellerCommissionRate(channelSeller, contractTerm) / 100) 
    : (costBreakdown.commissionValue || 0);
```

### 3. ✅ **DoubleFibraRadioCalculator (Internet MAN)**
**Antes:** Sempre usava `costBreakdown.commissionValue`
**Depois:**
```typescript
const temParceiros = includeReferralPartner || includeInfluencerPartner;
const comissaoVendedor = temParceiros 
    ? (costBreakdown.finalPrice * getChannelSellerCommissionRate(channelSeller, contractTerm) / 100) 
    : (costBreakdown.commissionValue || 0);
```

### 4. ✅ **MaquinasVirtuaisCalculator**
**Antes:** Sempre usava `priceAfterDirectorDiscount * Comm` (comissão vendedor)
**Depois:**
```typescript
const temParceiros = includeReferralPartner || includeInfluencerPartner;
const calculatedCommissionValue = temParceiros 
    ? (priceAfterDirectorDiscount * getChannelSellerCommissionRate(channelSeller, vmContractPeriod) / 100)
    : (priceAfterDirectorDiscount * Comm);
```

### 5. ✅ **PABXSIPCalculator**
**Antes:** Usava dados locais e lógica fixa
**Depois:** Migrado para usar tabelas do Supabase
```typescript
const temParceiros = includeParceiroIndicador || includeParceiroInfluenciador;

const vendedorRate = temParceiros 
    ? getChannelSellerCommissionRate(channelSeller, months)
    : getSellerCommissionRate(seller, months);
    
const parceiroIndicadorRate = includeParceiroIndicador 
    ? getChannelIndicatorCommissionRate(channelIndicator, dreMonthlyRevenue, months) 
    : 0;
    
const parceiroInfluenciadorRate = includeParceiroInfluenciador 
    ? getChannelInfluencerCommissionRate(channelInfluencer, dreMonthlyRevenue, months) 
    : 0;
```

## Funções do Supabase Utilizadas

Todas as calculadoras agora usam as funções corretas do hook `useCommissions`:

- ✅ `getChannelSellerCommissionRate()` - Comissão Canal/Vendedor
- ✅ `getSellerCommissionRate()` - Comissão Vendedor individual  
- ✅ `getChannelIndicatorCommissionRate()` - Comissão Parceiro Indicador
- ✅ `getChannelInfluencerCommissionRate()` - Comissão Parceiro Influenciador
- ✅ `getDirectorCommissionRate()` - Comissão Diretor

## Importações Adicionadas

Todas as calculadoras agora importam as funções necessárias:

```typescript
import { 
    useCommissions, 
    getChannelIndicatorCommissionRate, 
    getChannelInfluencerCommissionRate, 
    getChannelSellerCommissionRate,
    getSellerCommissionRate,
    getDirectorCommissionRate 
} from '@/hooks/use-commissions';
```

## Hooks Atualizados

Todas as calculadoras agora acessam todos os dados necessários:

```typescript
const { 
    channelIndicator, 
    channelInfluencer, 
    channelSeller, 
    seller, 
    channelDirector 
} = useCommissions();
```

## Impacto nos DREs

### ✅ **Cálculos Corretos Agora:**
1. **Receita Bruta** - Inalterada
2. **Impostos sobre Receita** - Inalterados  
3. **Receita Líquida** - Inalterada
4. **Custos Diretos** - Inalterados
5. **Comissões** - ✅ **CORRIGIDAS** (agora usa a lógica correta)
6. **Lucro Operacional** - ✅ **CORRIGIDO** (reflete comissões corretas)
7. **Impostos sobre Lucro** - ✅ **CORRIGIDOS** (baseados no lucro correto)
8. **Lucro Líquido** - ✅ **CORRIGIDO** (resultado final correto)
9. **Margem Líquida** - ✅ **CORRIGIDA** (percentual correto)

## Resultado Final

✅ **Todas as 5 calculadoras** agora calculam as comissões corretamente no DRE
✅ **Build bem-sucedido** sem erros
✅ **Lógica unificada** em todas as calculadoras
✅ **Uso correto das tabelas do Supabase** 
✅ **Compatibilidade com dados de fallback** mantida

## Próximos Passos

1. **Testar no navegador** - Verificar se os cálculos estão corretos
2. **Validar com dados reais** - Confirmar os percentuais
3. **Remover logs de debug** - Limpar código após validação
4. **Documentar para usuários** - Explicar a nova lógica de comissões