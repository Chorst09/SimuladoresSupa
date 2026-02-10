# 🚀 DEPLOY PRONTO - SISTEMA DE SIMULADORES

## ✅ STATUS: TUDO PRONTO PARA DEPLOY

---

## 🔧 Problema Identificado e Corrigido

### ❌ Erro Anterior
```
Error response from daemon: Get "http://localhost/v2/": dial tcp 127.0.0.1:80: connect: connection refused
```

### 🎯 Causa Raiz
O arquivo `docker-compose.prod.yml` estava tentando **construir** a imagem do PostgreSQL a partir do Dockerfile:
```yaml
db:
  build:
    context: .
    dockerfile: Dockerfile
    target: postgres
```

Mas quando carregamos a imagem do arquivo `.tar.gz`, apenas a imagem `simuladores-app:latest` é carregada, não a imagem do PostgreSQL.

### ✅ Solução Implementada
Alterado `docker-compose.prod.yml` para usar a imagem oficial do PostgreSQL diretamente:
```yaml
db:
  image: docker.io/library/postgres:16-alpine
```

Agora o Docker não tentará construir a imagem, apenas usará a que já existe.

---

## 🚀 Como Fazer o Deploy

### Opção 1: Usar Script Interativo (RECOMENDADO)

```bash
./DEPLOY_AGORA.sh
```

O script oferece um menu com as seguintes opções:
1. **Etapa 1**: Preparar e transferir arquivos (PC LOCAL)
2. **Etapa 2**: Instalar no servidor (VIA SSH)
3. **Ambas as etapas**: Executar tudo automaticamente
4. **Verificar status**: Testar conectividade
5. **Sair**

### Opção 2: Executar Manualmente

#### Passo 1: No PC Local

```bash
# Construir imagem Docker (se não existir)
docker build --platform linux/amd64 -t simuladores-app:latest .

# Salvar imagem
docker save simuladores-app:latest | gzip > simuladores-app.tar.gz

# Transferir para servidor
scp simuladores-app.tar.gz double@10.10.50.246:~/
scp docker-compose.prod.yml double@10.10.50.246:~/simuladores/
scp .env.production double@10.10.50.246:~/simuladores/
```

#### Passo 2: No Servidor (via SSH)

```bash
# Conectar ao servidor
ssh double@10.10.50.246

# Entrar na pasta
cd ~/simuladores

# Parar containers antigos
sudo docker-compose -f docker-compose.prod.yml down

# Remover volumes antigos
sudo docker volume rm simuladores_postgres_prod_data 2>/dev/null || true

# Limpar imagens antigas
sudo docker system prune -a -f

# Carregar nova imagem
sudo docker load -i ~/simuladores-app.tar.gz

# Iniciar containers (SEM BUILD)
sudo docker-compose -f docker-compose.prod.yml up -d --no-build

# Aguardar 60 segundos
sleep 60

# Verificar status
sudo docker-compose -f docker-compose.prod.yml ps

# Testar aplicação
curl http://localhost:3009/api/health
```

---

## 📋 Checklist de Deploy

### Antes do Deploy
- [x] Código testado localmente
- [x] Comissões implementadas corretamente
- [x] Docker image construída
- [x] docker-compose.prod.yml corrigido
- [x] .env.production configurado
- [ ] Servidor online (verificar com ping)

### Durante o Deploy
- [ ] Executar DEPLOY_AGORA.sh ou comandos manuais
- [ ] Aguardar conclusão (15-20 minutos)
- [ ] Verificar status dos containers

### Após o Deploy
- [ ] Acessar http://10.10.50.246:3009
- [ ] Fazer login (admin@sistema.com / admin123)
- [ ] Testar calculadora
- [ ] Verificar comissões
- [ ] Validar cálculos

---

## 🔐 Credenciais do Servidor

```
IP: 10.10.50.246
Usuário SSH: double
Senha SSH: <SENHA_DO_SERVIDOR>
Senha SUDO: <SENHA_DO_SERVIDOR>
Pasta: ~/simuladores
Porta App: 3009
Porta DB: 5433
```

---

## 📊 Valores de Comissão Inseridos

| Prazo | Comissão | Status |
|-------|----------|--------|
| 12 meses | 0,60% | ✅ |
| 24 meses | 1,20% | ✅ |
| 36 meses | 2,00% | ✅ |
| 48 meses | 2,00% | ✅ |
| 60 meses | 2,00% | ✅ |

---

## 🧪 Testes a Realizar Após Deploy

### 1. Teste de Acesso
```bash
curl http://10.10.50.246:3009/api/health
```

### 2. Teste de Login
- Email: admin@sistema.com
- Senha: admin123

### 3. Teste de Comissões - Cenário 1: Cliente Novo
- Abrir calculadora (ex: Internet Fibra)
- Preencher dados
- Verificar comissões calculadas
- Esperado: Comissões sobre valor total

### 4. Teste de Comissões - Cenário 2: Cliente Existente (Upgrade)
- Marcar "Já é cliente da Base?"
- Preencher valor anterior
- Preencher novo valor (maior)
- Verificar comissões
- Esperado: Comissões apenas sobre diferença positiva

### 5. Teste de Comissões - Cenário 3: Cliente Existente (Downgrade)
- Marcar "Já é cliente da Base?"
- Preencher valor anterior (maior)
- Preencher novo valor (menor)
- Verificar comissões
- Esperado: Comissão = R$ 0,00

---

## 🐛 Se Algo Falhar

### Verificar Logs
```bash
ssh double@10.10.50.246
cd ~/simuladores
sudo docker-compose -f docker-compose.prod.yml logs --tail=50 app
```

### Reiniciar Containers
```bash
sudo docker-compose -f docker-compose.prod.yml restart
```

### Fazer Rollback
```bash
sudo docker-compose -f docker-compose.prod.yml down
sudo docker volume rm simuladores_postgres_prod_data
# Transferir imagem anterior
sudo docker load -i ~/simuladores-app-anterior.tar.gz
sudo docker-compose -f docker-compose.prod.yml up -d --no-build
```

---

## 📁 Arquivos Modificados

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `docker-compose.prod.yml` | Remover build do PostgreSQL | ✅ |
| `DEPLOY_AGORA.sh` | Novo script interativo | ✅ |
| `DEPLOY_PRONTO.md` | Este documento | ✅ |

---

## ⏱️ Tempo Estimado

| Etapa | Tempo |
|-------|-------|
| Construir imagem | 5-10 min |
| Transferir arquivo | 2-5 min |
| Instalar no servidor | 5-10 min |
| Aguardar containers | 1-2 min |
| **Total** | **15-25 min** |

---

## 🎯 Próximos Passos

1. **Verificar servidor online**
   ```bash
   ping -c 2 10.10.50.246
   ```

2. **Executar deploy**
   ```bash
   ./DEPLOY_AGORA.sh
   ```

3. **Escolher opção 3** (Executar ambas as etapas)

4. **Aguardar conclusão**

5. **Acessar aplicação**
   - URL: http://10.10.50.246:3009
   - Login: admin@sistema.com / admin123

6. **Testar funcionalidades**

---

## 📞 Suporte

Se encontrar problemas:

1. Verificar conectividade com servidor
2. Verificar logs dos containers
3. Verificar espaço em disco no servidor
4. Verificar portas disponíveis (3009, 5433)
5. Fazer rollback se necessário

---

## ✨ Resumo das Correções

✅ **docker-compose.prod.yml**: Removido build do PostgreSQL  
✅ **DEPLOY_AGORA.sh**: Script interativo para deploy  
✅ **Comissões**: Implementadas corretamente em todas as calculadoras  
✅ **Testes**: Todos os cenários testados localmente  
✅ **Documentação**: Completa e atualizada  

---

## 🎉 Status Final

**O sistema está 100% pronto para deploy em produção!**

Todos os problemas foram identificados e corrigidos. A aplicação foi testada localmente e está funcionando corretamente. O servidor aguarda apenas o comando de deploy.

---

**Data:** 21 de Janeiro de 2026  
**Versão:** 1.0 Final  
**Status:** ✅ PRONTO PARA PRODUÇÃO

