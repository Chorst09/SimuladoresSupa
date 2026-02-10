# 🔧 Reiniciar Deploy - Passo a Passo

## ❌ Problema Identificado

Os containers não estão rodando. A porta 3009 não está respondendo.

## ✅ Solução - Reiniciar Tudo

### Passo 1: Conectar ao Servidor

```bash
ssh double@10.10.50.246
```

Senha: `<SENHA_DO_SERVIDOR>`

### Passo 2: Executar Comandos de Reinicialização

Após conectar, execute **EXATAMENTE** nesta ordem:

#### 1. Entrar na pasta
```bash
cd ~/simuladores
```

#### 2. Parar tudo
```bash
sudo docker-compose -f docker-compose.prod.yml down
```

Senha: `<SENHA_DO_SERVIDOR>`

#### 3. Remover volumes antigos (CUIDADO: apaga dados!)
```bash
sudo docker volume rm simuladores_postgres_prod_data 2>/dev/null || true
```

#### 4. Limpar imagens
```bash
sudo docker system prune -a -f
```

#### 5. Carregar nova imagem
```bash
sudo docker load -i ~/simuladores-app.tar.gz
```

Aguarde 2-3 minutos.

#### 6. Verificar imagens
```bash
sudo docker images | grep simuladores
```

Você deve ver:
```
simuladores-app          latest    ...
simuladores-postgres     prod      ...
```

#### 7. Iniciar containers (SEM BUILD)
```bash
sudo docker-compose -f docker-compose.prod.yml up -d --no-build
```

#### 8. Aguardar 60 segundos
```bash
sleep 60
```

#### 9. Verificar status
```bash
sudo docker-compose -f docker-compose.prod.yml ps
```

Você deve ver:
```
NAME                    STATUS
simuladores_app_prod    Up X minutes (healthy)
simuladores_db_prod     Up X minutes (healthy)
```

#### 10. Ver logs da aplicação
```bash
sudo docker-compose -f docker-compose.prod.yml logs app
```

Procure por mensagens de erro.

#### 11. Testar health check
```bash
curl http://localhost:3009/api/health
```

Deve retornar:
```json
{"status":"ok"}
```

#### 12. Sair
```bash
exit
```

## 🌐 Acessar Aplicação

Após os passos acima:

```
http://10.10.50.246:3009
```

## 📝 Se Ainda Não Funcionar

### Ver logs detalhados
```bash
ssh double@10.10.50.246
cd ~/simuladores
sudo docker-compose -f docker-compose.prod.yml logs -f app
```

### Verificar se a porta está aberta
```bash
sudo netstat -tulpn | grep 3009
```

### Verificar firewall
```bash
sudo ufw status
sudo ufw allow 3009
```

### Reiniciar Docker
```bash
sudo systemctl restart docker
```

### Verificar espaço em disco
```bash
df -h
```

Se estiver > 90%, limpe:
```bash
sudo docker system prune -a
```

---

**Tempo estimado**: 5-10 minutos
**Status**: ✅ Pronto para executar
