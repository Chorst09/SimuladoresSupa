# Comandos para Deploy Final - Troca de Senha Obrigatória

## Execute estes comandos no servidor de produção

Conecte-se ao servidor:
```bash
ssh double@10.10.50.246
# Senha: <SENHA_DO_SERVIDOR>
```

Depois execute os comandos abaixo:

### 1. Carregar a nova imagem Docker
```bash
cd ~/simuladores
gunzip -c ~/simuladores-app-amd64.tar.gz | docker load
```

### 2. Parar os containers atuais
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production down
```

### 3. Iniciar os containers com a nova versão
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### 4. Aguardar 30 segundos e verificar logs
```bash
sleep 30
docker logs simuladores_app_prod --tail 50
```

### 5. Verificar se está rodando
```bash
docker ps --filter "name=simuladores"
curl http://localhost:3009
```

### 6. Limpar arquivo temporário
```bash
rm -f ~/simuladores-app-amd64.tar.gz
```

## Testar a Funcionalidade

Após o deploy, teste criando um novo usuário:

1. Acesse: http://10.10.50.246:3009
2. Faça login como admin: `admin@sistema.com` / `admin123`
3. Vá em "Gerenciar Usuários"
4. Crie um novo usuário de teste
5. Faça logout
6. Tente fazer login com o novo usuário
7. **DEVE redirecionar automaticamente para trocar a senha**

## Forçar Troca de Senha em Usuário Existente

Se quiser testar com um usuário que já existe (como test@test.com):

```bash
docker exec -it simuladores_db_prod psql -U postgres -d simuladores_prod -c "UPDATE users SET password_changed = NULL WHERE email = 'test@test.com';"
```

Depois faça logout e login novamente com esse usuário.

## Verificar Usuários que Precisam Trocar Senha

```bash
docker exec -it simuladores_db_prod psql -U postgres -d simuladores_prod -c "SELECT email, password_changed, account_status FROM users WHERE password_changed IS NULL;"
```

## Alterações Implementadas

✅ **Todos os novos usuários** (criados por admin ou auto-cadastro) agora têm `password_changed = NULL`
✅ No primeiro login, são redirecionados automaticamente para `/change-password`
✅ Não precisam informar a senha antiga para criar a nova
✅ Após trocar a senha, `password_changed` é atualizado e não pedem mais

## Arquivos Modificados

- `src/lib/database.ts` - Função `createUser()` agora define `password_changed: null` para TODOS os novos usuários
- `src/app/login/page.tsx` - Detecta `passwordChanged === false` e redireciona
- `src/app/change-password/page.tsx` - Página de troca de senha
- `src/app/api/auth/change-password/route.ts` - API para trocar senha sem senha antiga
