# Teste de Troca de Senha Obrigatória - Produção

## Status da Implementação
✅ **CÓDIGO DEPLOYADO EM PRODUÇÃO** - http://10.10.50.246:3009

## Funcionalidade Implementada

Quando um administrador cria um novo usuário, o sistema:
1. Define `password_changed = NULL` no banco de dados
2. No primeiro login, detecta que `passwordChanged === false`
3. Redireciona automaticamente para `/change-password`
4. Usuário cria nova senha (sem precisar da senha antiga)
5. Sistema atualiza `password_changed` com a data/hora atual
6. Usuário é redirecionado para fazer login novamente

## Como Testar em Produção

### Passo 1: Criar um Novo Usuário (como Admin)
1. Acesse: http://10.10.50.246:3009
2. Faça login como admin:
   - Email: `admin@sistema.com`
   - Senha: `admin123`
3. Vá para "Gerenciar Usuários"
4. Crie um novo usuário de teste:
   - Nome: `Teste Troca Senha`
   - Email: `teste.senha@teste.com`
   - Senha temporária: `temp123`
   - Cargo: qualquer um
   - **IMPORTANTE**: Marque "Aprovar automaticamente"

### Passo 2: Verificar no Banco (Opcional)
```bash
# Conectar ao banco de produção
docker exec -it simuladores_db_prod psql -U postgres -d simuladores_prod

# Verificar o usuário criado
SELECT id, email, password_changed, account_status 
FROM users 
WHERE email = 'teste.senha@teste.com';

# Deve mostrar: password_changed = NULL
```

### Passo 3: Testar o Primeiro Login
1. Faça logout do admin
2. Tente fazer login com o novo usuário:
   - Email: `teste.senha@teste.com`
   - Senha: `temp123`
3. **RESULTADO ESPERADO**: 
   - Sistema detecta `passwordChanged = false`
   - Mostra toast: "Primeiro acesso - Você precisa criar uma nova senha"
   - Redireciona automaticamente para `/change-password`

### Passo 4: Trocar a Senha
1. Na página de troca de senha:
   - Digite nova senha (mínimo 6 caracteres)
   - Confirme a nova senha
   - Clique em "Alterar Senha"
2. **RESULTADO ESPERADO**:
   - Mensagem: "Senha alterada com sucesso! Faça login novamente."
   - Redireciona para `/login`

### Passo 5: Login com Nova Senha
1. Faça login novamente:
   - Email: `teste.senha@teste.com`
   - Senha: (a nova senha que você criou)
2. **RESULTADO ESPERADO**:
   - Login bem-sucedido
   - Redireciona para `/dashboard`
   - NÃO pede mais para trocar senha

## Verificação no Banco Após Troca

```bash
# Verificar que password_changed foi atualizado
docker exec -it simuladores_db_prod psql -U postgres -d simuladores_prod

SELECT id, email, password_changed, account_status 
FROM users 
WHERE email = 'teste.senha@teste.com';

# Agora deve mostrar: password_changed = [data/hora atual]
```

## Forçar Troca de Senha em Usuário Existente

Se quiser testar com um usuário que já existe:

```sql
-- Conectar ao banco
docker exec -it simuladores_db_prod psql -U postgres -d simuladores_prod

-- Forçar troca de senha para um usuário específico
UPDATE users 
SET password_changed = NULL 
WHERE email = 'usuario@exemplo.com';

-- Verificar
SELECT email, password_changed FROM users WHERE email = 'usuario@exemplo.com';
```

## Arquivos Implementados

1. **API de Troca de Senha**: `src/app/api/auth/change-password/route.ts`
   - Endpoint: POST `/api/auth/change-password`
   - Parâmetros: `{ userId, newPassword }`
   - Não requer senha antiga

2. **Página de Troca de Senha**: `src/app/change-password/page.tsx`
   - Rota: `/change-password`
   - Formulário com nova senha e confirmação
   - Validação de 6 caracteres mínimo

3. **Login Atualizado**: `src/app/login/page.tsx`
   - Verifica `passwordChanged === false`
   - Redireciona para `/change-password`
   - Salva dados do usuário em `sessionStorage`

4. **Função signIn**: `src/lib/auth.ts`
   - Retorna `passwordChanged: user.password_changed !== null`

5. **Criação de Usuário**: `src/lib/database.ts`
   - Define `password_changed: null` quando `created_by_admin: true`

## Troubleshooting

### Problema: Não redireciona para troca de senha
- Verificar no console do navegador se há erros
- Verificar se `passwordChanged` está sendo retornado na resposta do login
- Verificar se o campo `password_changed` está NULL no banco

### Problema: Erro ao trocar senha
- Verificar se o `userId` está correto no sessionStorage
- Verificar logs do container: `docker logs simuladores_app_prod`

### Problema: Usuário criado não tem password_changed NULL
- Verificar se a criação está usando `authService.createUser()`
- Verificar se `created_by_admin: true` está sendo passado

## Comandos Úteis

```bash
# Ver logs da aplicação
docker logs simuladores_app_prod --tail 50 -f

# Conectar ao banco
docker exec -it simuladores_db_prod psql -U postgres -d simuladores_prod

# Verificar todos os usuários e status de senha
docker exec -it simuladores_db_prod psql -U postgres -d simuladores_prod -c "SELECT email, password_changed, account_status FROM users ORDER BY created_at DESC;"

# Reiniciar aplicação (se necessário)
cd ~/simuladores
docker-compose -f docker-compose.prod.yml --env-file .env.production restart app
```

## Próximos Passos

Após confirmar que está funcionando:
1. Testar com diferentes cargos de usuário
2. Verificar se a validação de senha está adequada (pode aumentar requisitos)
3. Considerar adicionar requisitos de complexidade de senha (maiúsculas, números, etc.)
4. Adicionar log de auditoria para trocas de senha
