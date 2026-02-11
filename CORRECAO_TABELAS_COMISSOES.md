# ✅ Correção - Tabelas de Comissões Protegidas

## Problema Identificado

As tabelas de comissões estavam visíveis para TODOS os usuários (user, director, admin).

## Solução Implementada

Adicionei verificação de permissão `{user?.role === 'admin' && (...)}` para:
- Esconder a aba "Tabela Comissões" para usuários não-admin
- Esconder o conteúdo das tabelas de comissões

## Calculadoras Já Corrigidas:

1. ✅ **InternetFibraCalculator** - Tabela protegida
2. ✅ **InternetRadioCalculator** - Tabela protegida

## Calculadoras Pendentes:

3. ⏳ PABXSIPCalculator
4. ⏳ DoubleFibraRadioCalculator
5. ⏳ InternetManCalculator
6. ⏳ InternetManRadioCalculator
7. ⏳ InternetOKv2Calculator
8. ⏳ MaquinasVirtuaisCalculator

## Comportamento Correto Agora:

### Admin:
- ✅ Vê aba "Tabela Comissões"
- ✅ Pode visualizar e editar comissões
- ✅ Vê aba "Tabela de Preços"
- ✅ Vê aba "DRE"

### Usuário (user):
- ❌ NÃO vê aba "Tabela Comissões"
- ❌ NÃO pode visualizar/editar comissões
- ✅ Vê apenas "Calculadora" e "Proposta"

### Diretor (director):
- ❌ NÃO vê aba "Tabela Comissões"
- ❌ NÃO pode visualizar/editar comissões
- ✅ Vê apenas "Calculadora" e "Proposta"

## Como Testar:

1. **Recarregue a página** (Ctrl+Shift+R)
2. **Vá para Internet Fibra**
3. **Verifique as abas disponíveis:**
   - Se você é admin: Deve ver "Tabela Comissões"
   - Se você é user/director: NÃO deve ver "Tabela Comissões"

## Status:
- ✅ 2 de 8 calculadoras corrigidas
- ⏳ Aguardando teste
- ⏳ Depois corrijo as outras 6
