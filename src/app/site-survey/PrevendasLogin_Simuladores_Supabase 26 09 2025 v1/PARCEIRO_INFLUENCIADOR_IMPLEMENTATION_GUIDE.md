# Guia de Implementação do Parceiro Influenciador

## ✅ **CALCULADORAS JÁ ATUALIZADAS**

### 1. **MaquinasVirtuaisCalculator.tsx** ✅
- ✅ Estado `includeInfluencerPartner` adicionado
- ✅ Hook `channelInfluencer` importado
- ✅ Função `getInfluencerPartnerCommissionRate` criada
- ✅ Cálculo da comissão implementado
- ✅ Interface do usuário (checkbox) adicionada
- ✅ Exibição no resumo implementada
- ✅ Tabela DRE atualizada

### 2. **RadioInternetCalculator.tsx** ✅
- ✅ Estado `includeInfluencerPartner` adicionado
- ✅ Hook `channelInfluencer` importado
- ✅ Função `getPartnerInfluencerRate` criada
- ✅ Cálculo da comissão implementado
- ✅ Interface do usuário (checkbox) adicionada
- ✅ Exibição no resumo implementada
- ✅ DRE atualizado

## 🔄 **CALCULADORAS PENDENTES**

### 3. **InternetFibraCalculator.tsx** 🔄
```typescript
// 1. Adicionar estado
const [includeInfluencerPartner, setIncludeInfluencerPartner] = useState<boolean>(false);

// 2. Atualizar hook
const { channelIndicator, channelInfluencer } = useCommissions();

// 3. Adicionar import
import { useCommissions, getChannelIndicatorCommissionRate, getChannelInfluencerCommissionRate } from '@/hooks/use-commissions';

// 4. Adicionar função
const getPartnerInfluencerRate = (monthlyRevenue: number, contractMonths: number): number => {
    if (!channelInfluencer || !includeInfluencerPartner) return 0;
    return getChannelInfluencerCommissionRate(channelInfluencer, monthlyRevenue, contractMonths) / 100;
};

// 5. Atualizar cálculo
const calculatedInfluencerPartnerCommission = includeInfluencerPartner
    ? finalPrice * getPartnerInfluencerRate(finalPrice, contractTerm)
    : 0;

// 6. Adicionar checkbox
<div className="flex items-center space-x-2">
    <Checkbox 
        id="includeInfluencerPartner" 
        checked={includeInfluencerPartner} 
        onCheckedChange={(checked) => setIncludeInfluencerPartner(Boolean(checked))} 
    />
    <Label htmlFor="includeInfluencerPartner">Incluir Parceiro Influenciador</Label>
</div>

// 7. Adicionar exibição
{includeInfluencerPartner && (
    <div className="flex justify-between text-purple-400">
        <span>Comissão Parceiro Influenciador:</span> 
        <span>{formatCurrency(costBreakdown.influencerPartnerCommission)}</span>
    </div>
)}
```

### 4. **DoubleFibraRadioCalculator.tsx** 🔄
- Mesmas alterações da InternetFibraCalculator

### 5. **PABXSIPCalculator.tsx** 🔄
- Mesmas alterações, mas adaptadas para a estrutura específica desta calculadora

### 6. **InternetManCalculator.tsx** 🔄
- Mesmas alterações da InternetFibraCalculator

## 📊 **Diferenças entre Parceiro Indicador e Influenciador**

### **Parceiro Indicador** (Canal Indicador)
- ✅ Usa tabela `commission_channel_indicator`
- ✅ Taxas menores (0.50% a 3.00%)
- ✅ Cor: Amarelo/Cyan
- ✅ Foco em indicação simples

### **Parceiro Influenciador** (Canal Influenciador)
- ✅ Usa tabela `commission_channel_influencer`
- ✅ Taxas maiores (1.50% a 8.00%)
- ✅ Cor: Roxo/Purple
- ✅ Foco em influência ativa

## 🎯 **Padrão de Implementação**

### **Estados:**
```typescript
const [includeReferralPartner, setIncludeReferralPartner] = useState<boolean>(false);     // Indicador
const [includeInfluencerPartner, setIncludeInfluencerPartner] = useState<boolean>(false); // Influenciador
```

### **Hooks:**
```typescript
const { channelIndicator, channelInfluencer } = useCommissions();
```

### **Funções:**
```typescript
const getPartnerIndicatorRate = (monthlyRevenue: number, contractMonths: number): number => {
    if (!channelIndicator || !includeReferralPartner) return 0;
    return getChannelIndicatorCommissionRate(channelIndicator, monthlyRevenue, contractMonths) / 100;
};

const getPartnerInfluencerRate = (monthlyRevenue: number, contractMonths: number): number => {
    if (!channelInfluencer || !includeInfluencerPartner) return 0;
    return getChannelInfluencerCommissionRate(channelInfluencer, monthlyRevenue, contractMonths) / 100;
};
```

### **Cálculos:**
```typescript
const calculatedReferralPartnerCommission = includeReferralPartner
    ? finalPrice * getPartnerIndicatorRate(finalPrice, contractTerm)
    : 0;

const calculatedInfluencerPartnerCommission = includeInfluencerPartner
    ? finalPrice * getPartnerInfluencerRate(finalPrice, contractTerm)
    : 0;

// Incluir ambos no cálculo total
const totalCommissions = calculatedCommissionValue + calculatedReferralPartnerCommission + calculatedInfluencerPartnerCommission;
```

### **Interface:**
```typescript
{/* Parceiro Indicador */}
<div className="flex items-center space-x-2">
    <Checkbox id="includeReferralPartner" checked={includeReferralPartner} onCheckedChange={(checked) => setIncludeReferralPartner(Boolean(checked))} />
    <Label htmlFor="includeReferralPartner">Incluir Parceiro Indicador</Label>
</div>

{/* Parceiro Influenciador */}
<div className="flex items-center space-x-2">
    <Checkbox id="includeInfluencerPartner" checked={includeInfluencerPartner} onCheckedChange={(checked) => setIncludeInfluencerPartner(Boolean(checked))} />
    <Label htmlFor="includeInfluencerPartner">Incluir Parceiro Influenciador</Label>
</div>
```

### **Exibição:**
```typescript
{includeReferralPartner && (
    <div className="flex justify-between text-yellow-400">
        <span>Comissão Parceiro Indicador:</span> 
        <span>{formatCurrency(costBreakdown.referralPartnerCommission)}</span>
    </div>
)}

{includeInfluencerPartner && (
    <div className="flex justify-between text-purple-400">
        <span>Comissão Parceiro Influenciador:</span> 
        <span>{formatCurrency(costBreakdown.influencerPartnerCommission)}</span>
    </div>
)}
```

## ✅ **Status Atual**

- ✅ **2/6 calculadoras** implementadas
- ✅ **Sistema de tabelas** funcionando
- ✅ **Padrão definido** para as demais
- 🔄 **4 calculadoras** pendentes

## 🚀 **Próximos Passos**

1. Implementar nas 4 calculadoras restantes
2. Testar todas as funcionalidades
3. Verificar se as tabelas do Supabase estão populadas
4. Validar cálculos e exibições