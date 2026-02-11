# Atualização de Permissões - Em Progresso

## ✅ Calculadoras Já Atualizadas:
1. ✅ InternetRadioCalculator
2. ✅ InternetFibraCalculator  
3. ✅ PABXSIPCalculator

## 🔄 Calculadoras em Atualização:
4. 🔄 DoubleFibraRadioCalculator - Import adicionado
5. ⏳ InternetManCalculator
6. ⏳ InternetManRadioCalculator
7. ⏳ InternetOKv2Calculator
8. ⏳ MaquinasVirtuaisCalculator

## Padrão de Atualização:

Para cada calculadora, fazer:

### 1. Adicionar import do hook:
```typescript
import { useProposalsWithPermissions } from '@/hooks/use-proposals-with-permissions';
```

### 2. Substituir useState por hook:
```typescript
// ANTES:
const [proposals, setProposals] = useState<Proposal[]>([]);

// DEPOIS:
const { proposals, loading, error, fetchProposals, setProposals } = useProposalsWithPermissions();
```

### 3. Remover fetchProposals antigo:
Remover toda a função `const fetchProposals = React.useCallback(async () => { ... })`

### 4. Atualizar useEffect:
```typescript
// ANTES:
useEffect(() => {
    // ... código de inicialização
    fetchProposals();
}, [fetchProposals]);

// DEPOIS:
useEffect(() => {
    // ... código de inicialização
    fetchProposals();
}, []);
```

### 5. Adicionar filtro local:
```typescript
const filteredTypeProposals = React.useMemo(() => {
    return proposals.filter((p: any) =>
        p.type === 'TIPO' || p.base_id?.startsWith('Prefixo_')
    );
}, [proposals]);
```

### 6. Atualizar referências:
Substituir todas as referências a `proposals` por `filteredTypeProposals` onde apropriado.

## Status Atual:
- Servidor dev rodando: ✅
- Compilação sem erros: ✅
- Pronto para continuar: ✅
