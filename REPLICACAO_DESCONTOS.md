# Replicação de Descontos - Todas as Calculadoras

## Alterações a serem replicadas:

### 1. useEffect para carregar descontos quando currentProposal mudar
```typescript
// Carregar descontos quando currentProposal mudar - FORÇADO
useEffect(() => {
    console.log('🔄 useEffect EXECUTADO - currentProposal:', currentProposal?.id, 'viewMode:', viewMode);
    
    if (currentProposal) {
        console.log('🔄 Dados da proposta:', {
            applySalespersonDiscount: currentProposal.applySalespersonDiscount,
            appliedDirectorDiscountPercentage: currentProposal.appliedDirectorDiscountPercentage
        });
        
        // FORÇAR aplicação dos descontos
        const salespersonValue = Boolean(currentProposal.applySalespersonDiscount);
        const directorValue = Number(currentProposal.appliedDirectorDiscountPercentage) || 0;
        
        console.log('🔄 FORÇANDO aplicação:', { salespersonValue, directorValue });
        
        setApplySalespersonDiscount(salespersonValue);
        setAppliedDirectorDiscountPercentage(directorValue);
        setDirectorDiscountPercentage(directorValue);
        
        console.log('✅ Descontos aplicados via useEffect');
    }
}, [currentProposal?.id, currentProposal?.applySalespersonDiscount, currentProposal?.appliedDirectorDiscountPercentage]);
```

### 2. Atualizar produtos com descontos antes de salvar nova versão
```typescript
// ATUALIZAR produtos com os descontos atuais ANTES de salvar
const productsWithUpdatedDiscounts = addedProducts.map(product => ({
    ...product,
    details: {
        ...product.details,
        applySalespersonDiscount: applySalespersonDiscount,
        appliedDirectorDiscountPercentage: appliedDirectorDiscountPercentage
    }
}));
```

### 3. Recarregar propostas após salvar
```typescript
// Recarregar todas as propostas para garantir dados atualizados
await fetchProposals();
```

### 4. Corrigir data no card de histórico (visualização)
```typescript
{(() => {
    try {
        const date = currentProposal.createdAt;
        if (!date) return 'N/A';
        if (typeof date === 'string') {
            return new Date(date).toLocaleDateString('pt-BR');
        }
        if (date.toDate && typeof date.toDate === 'function') {
            return date.toDate().toLocaleDateString('pt-BR');
        }
        return new Date(date).toLocaleDateString('pt-BR');
    } catch (e) {
        return 'N/A';
    }
})()}
```

### 5. Logs para debug em viewProposal
```typescript
console.log('👁️ VISUALIZANDO PROPOSTA:', proposal);
console.log('👁️ Descontos na proposta:', {
    applySalespersonDiscount: proposal.applySalespersonDiscount,
    appliedDirectorDiscountPercentage: proposal.appliedDirectorDiscountPercentage
});
```

## Status:
- ✅ Internet Man Radio
- ⏳ Internet Radio
- ⏳ Internet Fibra  
- ⏳ Double Fibra Radio
- ⏳ Internet Man
