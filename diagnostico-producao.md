# 🔍 Diagnóstico - Aplicação em Produção

## ❌ Problema Identificado

**Erro:** ERR_CONNECTION_REFUSED ao acessar `simulador-dre.doubletelecom.com.br`

**Porta configurada:** 3009

---

## 🔧 Passos para Diagnóstico

### 1️⃣ Conectar ao Servidor

```bash
ssh double@10.10.50.246
# Senha: <SENHA_DO_SERVIDOR>
```

### 2️⃣ Verificar Status dos Containers

```bash
cd ~/simuladores
sudo docker ps -a
# Senha sudo: <SENHA_DO_SERVIDOR>
```

**O que verificar:**
- ✅ Container `simuladores_app_prod` está com status "Up"?
- ❌ Container está com status "Exited" ou "Restarting"?

### 3️⃣ Ver Logs da Aplicação

```bash
sudo docker logs simuladores_app_prod --tail 50
```

**Erros comuns:**
- Erro de conexão com banco de dados
- Porta já em uso
- Erro de variáveis de ambiente
- Erro de build/compilação

### 4️⃣ Verificar Porta 3009

```bash
sudo netstat -tulpn | grep :3009
# ou
sudo ss -tulpn | grep :3009
```

**Resultado esperado:**
```
tcp  0  0  0.0.0.0:3009  0.0.0.0:*  LISTEN  12345/docker-proxy
```

### 5️⃣ Testar Acesso Local no Servidor

```bash
curl http://localhost:3009
# ou
curl http://localhost:3009/api/health
```

**Se funcionar localmente mas não externamente:**
- Problema de firewall
- Problema de DNS
- Problema de rede

---

## 🚨 Soluções Comuns

### Solução 1: Container Parado

```bash
cd ~/simuladores
sudo ./deploy.sh start
```

### Solução 2: Container com Erro

```bash
# Ver logs completos
sudo ./deploy.sh logs

# Reiniciar
sudo ./deploy.sh restart
```

### Solução 3: Reinstalar Aplicação

```bash
cd ~/simuladores

# Fazer backup primeiro
sudo ./deploy.sh backup prod

# Parar tudo
sudo ./deploy.sh stop

# Reinstalar
sudo ./deploy.sh install-on-server
```

### Solução 4: Verificar Firewall

```bash
# Verificar se porta 3009 está aberta
sudo ufw status

# Se necessário, abrir porta
sudo ufw allow 3009/tcp
```

### Solução 5: Verificar Nginx

```bash
# Status do Nginx
sudo systemctl status nginx

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 🔍 Checklist de Diagnóstico

- [ ] Container está rodando? (`docker ps`)
- [ ] Logs mostram erros? (`docker logs`)
- [ ] Porta 3009 está em uso? (`netstat -tulpn`)
- [ ] Acesso local funciona? (`curl localhost:3009`)
- [ ] Firewall permite porta 3009? (`ufw status`)
- [ ] Nginx está rodando? (`systemctl status nginx`)
- [ ] DNS está resolvendo? (`nslookup simulador-dre.doubletelecom.com.br`)

---

## 📞 Comandos Rápidos

```bash
# Conectar
ssh double@10.10.50.246

# Status rápido
cd ~/simuladores && sudo docker ps

# Logs em tempo real
sudo docker logs -f simuladores_app_prod

# Reiniciar tudo
cd ~/simuladores && sudo ./deploy.sh restart

# Ver todas as portas em uso
sudo netstat -tulpn | grep LISTEN
```

---

## 🆘 Se Nada Funcionar

1. **Fazer backup:**
   ```bash
   cd ~/simuladores
   sudo ./deploy.sh backup prod
   ```

2. **Limpar tudo:**
   ```bash
   sudo ./deploy.sh stop
   sudo ./deploy.sh clean
   ```

3. **Reinstalar do zero:**
   ```bash
   sudo ./deploy.sh install-on-server
   ```

4. **Verificar logs durante instalação:**
   ```bash
   sudo ./deploy.sh logs
   ```

---

## 📋 Informações Importantes

- **Servidor:** 10.10.50.246
- **Usuário:** double
- **Senha SSH:** <SENHA_DO_SERVIDOR>
- **Senha Sudo:** <SENHA_DO_SERVIDOR>
- **Porta App:** 3009
- **Porta DB:** 5433
- **Domínio:** simulador-dre.doubletelecom.com.br
- **Pasta:** ~/simuladores
