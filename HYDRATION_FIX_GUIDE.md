# Guia de Correção de Erros de Hidratação

## Problema Identificado

O erro de hidratação estava ocorrendo devido a diferenças entre o que o servidor renderizava e o que o cliente renderizava:

```
Uncaught Error: Hydration failed because the server rendered text didn't match the client.
```

## Causas Identificadas

### 1. Data/Hora Dinâmica no ProductionDebug
- **Problema**: `new Date().toLocaleString()` sendo chamado diretamente no JSX
- **Causa**: Servidor e cliente geravam timestamps diferentes
- **Localização**: `src/components/debug/ProductionDebug.tsx` linha 96

### 2. ThemeProvider sem Proteção de Hidratação
- **Problema**: next-themes pode causar incompatibilidades de tema entre servidor/cliente
- **Localização**: `src/components/theme-provider.tsx`

## Correções Implementadas

### 1. ProductionDebug.tsx

**Antes:**
```tsx
<div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '10px' }}>
  {new Date().toLocaleString()}
</div>
```

**Depois:**
```tsx
const [currentTime, setCurrentTime] = useState<string>('');
const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
  setCurrentTime(new Date().toLocaleString());
  // ... resto do código
}, []);

// Não renderizar até estar montado no cliente
if (!isMounted || !shouldShow) {
  return null;
}

// No JSX:
<div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '10px' }}>
  {currentTime}
</div>
```

**Benefícios:**
- ✅ Elimina diferenças de timestamp entre servidor/cliente
- ✅ Garante que o componente só renderiza após hidratação
- ✅ Mantém a funcionalidade de debug

### 2. ThemeProvider.tsx

**Antes:**
```tsx
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**Depois:**
```tsx
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**Benefícios:**
- ✅ Evita problemas de tema entre servidor/cliente
- ✅ Renderiza children sem tema até hidratação completa
- ✅ Previne flash de conteúdo não estilizado

## Padrão de Correção

Para evitar erros de hidratação no futuro, siga este padrão:

```tsx
'use client';

import { useState, useEffect } from 'react';

export function ComponenteComHidratacao() {
  const [isMounted, setIsMounted] = useState(false);
  const [dadosDinamicos, setDadosDinamicos] = useState('');

  useEffect(() => {
    setIsMounted(true);
    // Definir dados que podem variar entre servidor/cliente
    setDadosDinamicos(new Date().toLocaleString());
  }, []);

  // Não renderizar até estar montado
  if (!isMounted) {
    return null; // ou um placeholder
  }

  return (
    <div>
      {dadosDinamicos}
    </div>
  );
}
```

## Verificação de Sucesso

✅ **Servidor rodando sem erros**: `npm run dev`
✅ **Console limpo**: Sem erros de hidratação no browser
✅ **Funcionalidade mantida**: Debug e temas funcionando normalmente

## Comandos de Teste

```bash
# Executar servidor de desenvolvimento
npm run dev

# Verificar no browser console se há erros de hydration
# Abrir: http://localhost:3001
```

## Recursos Adicionais

- [React Hydration Docs](https://react.dev/link/hydration-mismatch)
- [Next.js SSR Guide](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [next-themes Docs](https://github.com/pacocoursey/next-themes)

## Correção Adicional: Conflito de Hooks useAuth

### Problema Identificado (22/09/2025 - 11:57)
```
Uncaught Error: useAuth must be used within an AuthProvider
    at useAuth (use-auth-simple.tsx:138:11)
    at AuthDebug (AuthDebug.tsx:8:35)
```

### Causa
- **AuthDebug.tsx** estava importando `useAuth` de `@/hooks/use-auth-simple`
- **Layout.tsx** estava usando `AuthProvider` de `@/hooks/use-auth`
- **Conflito**: Componente tentando usar hook de um contexto diferente

### Correção
```tsx
// ANTES (AuthDebug.tsx)
import { useAuth } from '@/hooks/use-auth-simple';

// DEPOIS (AuthDebug.tsx)
import { useAuth } from '@/hooks/use-auth';
```

### Arquivos Corrigidos
- ✅ `src/components/debug/AuthDebug.tsx`
- ✅ `src/app/login-test/page.tsx`

### Verificação
```bash
# Buscar todos os imports de useAuth
grep -r "from '@/hooks/use-auth" src/ --include="*.tsx" --include="*.ts"
```

**Resultado**: Todos os componentes agora usam o mesmo hook `@/hooks/use-auth` que corresponde ao `AuthProvider` no layout.

---

**Data da Correção**: 22/09/2025
**Status**: ✅ Resolvido Completamente
