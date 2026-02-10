# 🔧 Corrigir Erro de Deploy

## ❌ Erro Encontrado

```
Error response from daemon: Get "http://localhost/v2/": dial tcp 127.0.0.1:80: connect: connection refused
```

**Causa**: O Docker está tentando fazer build da imagem do banco de dados, mas a imagem já foi carregada.

## ✅ Solução

### Passo 1: Conectar ao Servidor

```bash
ssh double@10.10.50.246
```

**Senha**: `<SENHA_DO_SERVIDOR>`

### Passo 2: Executar Script de Correção

Após conectar ao servidor, execute:

```bash
cd ~/simuladores
bash CORRIGIR_DEPLOY_NO_SERVIDOR.sh
```

**Senha sudo quando solicitado**: `<SENHA_DO_SERVIDOR>`

O script irá automaticamente:
- ✅ Parar containers antigos
- ✅ Remover imagens antigas
- ✅ Carregar nova imagem
- ✅ Iniciar containers (sem build)
- ✅ Testar health check

### Passo 3: Verificar Status

Após o script terminar, execute:

```bash
sudo docker-compose -f docker-compose.prod.yml ps
```

Você deve ver algo como:

```
NAME                    STATUS
simuladores_app_prod    Up 2 minutes (healthy)
simuladores_db_prod     Up 2 minutes (healthy)
```

### Passo 4: Testar Aplicação

```bash
curl http://localhost:3009/api/health
```

Deve retornar algo como:

```json
{"status":"ok","timestamp":"2026-01-21T19:15:00Z"}
```

## 🌐 Acessar Aplicação

```
URL: http://10.10.50.246:3009

Login padrão:
- Email: admin@sistema.com
- Senha: admin123
```

## 📝 Se Ainda Houver Problemas

### Ver Logs Detalhados

```bash
sudo docker-compose -f docker-compose.prod.yml logs -f app
```

### Reiniciar Tudo do Zero

```bash
# Parar
sudo docker-compose -f docker-compose.prod.yml down

# Remover volumes (CUIDADO: apaga dados!)
sudo docker volume rm simuladores_postgres_prod_data

# Carregar imagem
sudo docker load -i ~/simuladores-app.tar.gz

# Iniciar
sudo docker-compose -f docker-compose.prod.yml up -d --no-build

# Aguardar
sleep 30

# Verificar
sudo docker-compose -f docker-compose.prod.yml ps
```

### Verificar Espaço em Disco

```bash
df -h
```

Se o disco estiver cheio (> 90%), limpe:

```bash
sudo docker system prune -a
```

## 🎯 Resumo

1. Conectar ao servidor: `ssh double@10.10.50.246`
2. Executar script: `cd ~/simuladores && bash CORRIGIR_DEPLOY_NO_SERVIDOR.sh`
3. Aguardar conclusão
4. Testar: `curl http://localhost:3009/api/health`
5. Acessar: `http://10.10.50.246:3009`

---

**Tempo estimado**: 5-10 minutos
**Status**: ✅ Pronto para corrigir
