# 🎯 INSTRUÇÕES FINAIS - DEPLOY PRONTO

## ✅ Status Atual

```
✅ Código testado e funcionando
✅ Comissões implementadas corretamente
✅ Docker corrigido (sem build do PostgreSQL)
✅ Scripts de deploy prontos
✅ Documentação completa
✅ Servidor online
✅ Tudo verificado e pronto
```

---

## 🚀 EXECUTE AGORA

### Opção 1: Deploy Automático (RECOMENDADO)

```bash
./DEPLOY_AGORA.sh
```

Escolha a **opção 3** para executar tudo automaticamente.

### Opção 2: Deploy Manual Rápido

```bash
# Passo 1: Transferir arquivos
scp simuladores-app.tar.gz double@10.10.50.246:~/
scp docker-compose.prod.yml double@10.10.50.246:~/simuladores/

# Passo 2: Conectar ao servidor
ssh double@10.10.50.246

# Passo 3: Executar no servidor
cd ~/simuladores
sudo docker-compose -f docker-compose.prod.yml down
sudo docker volume rm simuladores_postgres_prod_data 2>/dev/null || true
sudo docker system prune -a -f
sudo docker load -i ~/simuladores-app.tar.gz
sudo docker-compose -f docker-compose.prod.yml up -d --no-build
sleep 60
sudo docker-compose -f docker-compose.prod.yml ps
curl http://localhost:3009/api/health
```

---

## 📊 O Que Foi Corrigido

### Problema Original
```
Error response from daemon: Get "http://localhost/v2/": dial tcp 127.0.0.1:80: connect: connection refused
```

### Causa
Docker tentava construir a imagem do PostgreSQL mesmo com `--no-build`.

### Solução
Alterado `docker-compose.prod.yml` para usar PostgreSQL oficial:
```yaml
# Antes (quebrado)
db:
  build:
    context: .
    dockerfile: Dockerfile
    target: postgres

# Depois (funcionando)
db:
  image: docker.io/library/postgres:16-alpine
```

---

## 🧪 Testes Após Deploy

### 1. Verificar Aplicação
```bash
curl http://10.10.50.246:3009/api/health
```

Esperado: `{"status":"ok"}`

### 2. Fazer Login
- URL: http://10.10.50.246:3009
- Email: admin@sistema.com
- Senha: admin123

### 3. Testar Comissões - Cenário 1 (Cliente Novo)
1. Abrir calculadora (ex: Internet Fibra)
2. Preencher dados
3. Verificar comissões
4. Esperado: Comissões sobre valor total

### 4. Testar Comissões - Cenário 2 (Cliente Existente - Upgrade)
1. Marcar "Já é cliente da Base?"
2. Preencher valor anterior: R$ 1.000,00
3. Preencher novo valor: R$ 1.500,00
4. Verificar comissões
5. Esperado: Comissões apenas sobre R$ 500,00 (diferença)

### 5. Testar Comissões - Cenário 3 (Cliente Existente - Downgrade)
1. Marcar "Já é cliente da Base?"
2. Preencher valor anterior: R$ 1.500,00
3. Preencher novo valor: R$ 1.000,00
4. Verificar comissões
5. Esperado: Comissão = R$ 0,00

---

## 🔐 Credenciais

```
Servidor: 10.10.50.246
Usuário SSH: double
Senha SSH: <SENHA_DO_SERVIDOR>
Senha SUDO: <SENHA_DO_SERVIDOR>
Pasta: ~/simuladores
Porta App: 3009
Porta DB: 5433
```

---

## 📁 Arquivos Importantes

| Arquivo | Propósito |
|---------|-----------|
| `DEPLOY_AGORA.sh` | Script interativo (USE ESTE) |
| `DEPLOY_PRONTO.md` | Documentação completa |
| `COMECE_AQUI.md` | Guia rápido |
| `docker-compose.prod.yml` | Configuração corrigida |
| `RESUMO_CORRECAO_DEPLOY.md` | Detalhes técnicos |

---

## ⏱️ Tempo Estimado

| Etapa | Tempo |
|-------|-------|
| Transferir arquivos | 2-5 min |
| Parar containers antigos | 1 min |
| Carregar imagem | 2-3 min |
| Iniciar containers | 1-2 min |
| Aguardar inicialização | 1-2 min |
| **Total** | **10-15 min** |

---

## 🐛 Se Algo Falhar

### Verificar Logs
```bash
ssh double@10.10.50.246
cd ~/simuladores
sudo docker-compose -f docker-compose.prod.yml logs --tail=50 app
```

### Reiniciar
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

## 📋 Checklist Final

- [ ] Servidor online (ping 10.10.50.246)
- [ ] Docker rodando localmente
- [ ] Arquivo simuladores-app.tar.gz existe
- [ ] Executar ./DEPLOY_AGORA.sh
- [ ] Escolher opção 3
- [ ] Aguardar conclusão
- [ ] Acessar http://10.10.50.246:3009
- [ ] Fazer login
- [ ] Testar 3 cenários de comissões
- [ ] Validar cálculos

---

## 🎉 Próximo Passo

```bash
./DEPLOY_AGORA.sh
```

**Escolha a opção 3 e siga as instruções.**

---

## 📞 Suporte Rápido

**Problema:** Servidor offline  
**Solução:** Aguardar servidor voltar online

**Problema:** Docker não rodando  
**Solução:** Iniciar Docker Desktop

**Problema:** Porta 3009 não responde  
**Solução:** Verificar logs com `sudo docker-compose logs app`

**Problema:** Erro de permissão  
**Solução:** Usar `sudo` para comandos Docker

---

## ✨ Resumo

✅ **Problema identificado**: Docker tentava construir PostgreSQL  
✅ **Solução implementada**: Usar PostgreSQL oficial  
✅ **Testes realizados**: Todos passando  
✅ **Scripts criados**: Deploy automático pronto  
✅ **Documentação**: Completa e atualizada  

---

## 🚀 COMECE AGORA!

```bash
./DEPLOY_AGORA.sh
```

**Tempo total: 10-15 minutos**

---

**Data:** 21 de Janeiro de 2026  
**Status:** ✅ PRONTO PARA DEPLOY  
**Versão:** 1.0 Final

