# Instruções para Corrigir Gestão de Usuários

## Problema
A gestão de usuários está com erro porque a coluna `password_changed` não existe na tabela `profiles`.

## Soluções (escolha uma)

### Opção 1: Adicionar Coluna no Supabase (Recomendado)

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"

3. **Execute o SQL**
   ```sql
   ALTER TABLE profiles ADD COLUMN password_changed BOOLEAN DEFAULT true;
   ```

4. **Verifique se funcionou**
   ```sql
   SELECT * FROM profiles LIMIT 3;
   ```

### Opção 2: Testar se Está Funcionando Sem a Coluna

1. **Execute o teste**
   ```bash
   node test-user-management.js
   ```

2. **Se funcionar**, a gestão de usuários já está corrigida automaticamente

### Opção 3: Verificar Logs no Browser

1. **Abra a gestão de usuários**
2. **Abra o DevTools (F12)**
3. **Vá para a aba Console**
4. **Procure por mensagens como:**
   - "Coluna password_changed não existe, carregando sem ela..."
   - "✅ Usuários carregados com sucesso"

## Status Atual

✅ **Sistema funcionando**: A gestão de usuários deve funcionar mesmo sem a coluna
✅ **Fallback implementado**: Se a coluna não existir, carrega sem ela
✅ **Criação de usuários**: Funciona independente da coluna
⏳ **Controle de primeiro acesso**: Só funciona após adicionar a coluna

## Próximos Passos

1. Teste a gestão de usuários
2. Se estiver funcionando, pode usar normalmente
3. Adicione a coluna quando possível para ativar controle de primeiro acesso
4. Informe se ainda há erros

## Arquivos Criados

- `simple-add-column.sql` - SQL mais simples
- `test-user-management.js` - Teste de funcionamento
- `fix-password-column.sql` - SQL corrigido