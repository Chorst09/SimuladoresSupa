# Mudanças - Cálculo de Comissões para Clientes Existentes

## Resumo
Ajustado o cálculo de comissões em todas as calculadoras para que, quando "Já é cliente da Base?" está marcado, as comissões sejam calculadas APENAS sobre a diferença de valor entre a nova mensalidade e a anterior. Se a diferença for negativa ou zero, não há comissão.

## Lógica Implementada

### Antes
```javascript
const baseParaComissao = isExistingClient
    ? (monthlyValue - previousMonthlyFee) // Diferença (poderia ser negativa)
    : monthlyValue;

// Comissões eram calculadas mesmo com diferença negativa
comissaoVendedor = baseParaComissao * percentual * contractTerm;
```

### Depois
```javascript
const baseParaComissao = isExistingClient && previousMonthlyFee > 0
    ? Math.max(0, monthlyValue - previousMonthlyFee) // Diferença (mínimo 0)
    : monthlyValue;

// Comissões só são calculadas se baseParaComissao > 0
if (baseParaComissao > 0) {
    comissaoVendedor = baseParaComissao * percentual * contractTerm;
}
```

## Calculadoras Atualizadas

1. **InternetFibraCalculator.tsx**
   - Ajustado `baseParaComissao` para usar `Math.max(0, ...)`
   - Adicionado check `if (baseParaComissao > 0)` em todas as comissões
   - Comissões do vendedor, indicador e influenciador agora respeitam o limite

2. **InternetRadioCalculator.tsx**
   - Mesmo ajuste que InternetFibraCalculator
   - Removido checkbox duplicado (ID alterado de `isExistingClient` para `isExistingClient2` na segunda ocorrência)

3. **InternetManCalculator.tsx**
   - Mesmo ajuste que InternetFibraCalculator

4. **InternetManRadioCalculator.tsx**
   - Mesmo ajuste que InternetFibraCalculator

5. **DoubleFibraRadioCalculator.tsx**
   - Ajustado `baseParaComissao` para usar `Math.max(0, ...)`
   - Adicionado check `if (baseParaComissao > 0)` em todas as comissões

6. **InternetOKv2Calculator.tsx**
   - Ajustado `baseComissionValue` para usar `Math.max(0, ...)`
   - Adicionado check `if (baseComissionValue > 0)` na comissão do vendedor

## Comportamento Esperado

### Cenário 1: Cliente Novo
- "Já é cliente da Base?" = NÃO marcado
- Comissões calculadas sobre o valor mensal total

### Cenário 2: Cliente Existente com Aumento
- "Já é cliente da Base?" = SIM marcado
- Mensalidade Anterior: R$ 9.800,00
- Nova Mensalidade: R$ 11.362,80
- Diferença: +R$ 1.562,80 (positiva)
- **Comissões calculadas sobre R$ 1.562,80**

### Cenário 3: Cliente Existente com Redução
- "Já é cliente da Base?" = SIM marcado
- Mensalidade Anterior: R$ 11.362,80
- Nova Mensalidade: R$ 9.800,00
- Diferença: -R$ 1.562,80 (negativa)
- **Comissões = R$ 0,00 (nenhuma comissão)**

## Testes Realizados

✅ Build compilou sem erros
✅ Sem erros de tipo TypeScript
✅ Lógica de null checks implementada
✅ Checkbox duplicado removido em InternetRadioCalculator

## Próximos Passos

1. Testar localmente com diferentes cenários
2. Fazer deploy em produção
3. Verificar se as comissões aparecem corretamente no DRE
