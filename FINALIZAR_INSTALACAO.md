# 🚀 Finalizar Instalação no Servidor

## ✅ O que já foi feito:

1. ✅ Build da imagem Docker concluído
2. ✅ Imagem transferida para o servidor (450MB)
3. ✅ Arquivos de configuração transferidos
4. ⚠️ Instalação iniciada mas não completou

---

## 🔧 Passos para Finalizar

### 1. Conectar ao Servidor

```bash
ssh double@10.10.50.246
# Senha: <SENHA_DO_SERVIDOR>
```

### 2. Carregar a Imagem Docker

```bash
cd ~
sudo docker load < simuladores-app.tar.gz
# Senha sudo: <SENHA_DO_SERVIDOR>
```

Aguarde o carregamento (pode demorar alguns minutos).

### 3. Entrar na Pasta do Projeto

```bash
cd ~/simuladores
```

### 4. Dar Permissão ao Script

```bash
chmod +x deploy.sh
```

### 5. Iniciar os Containers

```bash
sudo docker compose -f docker-compose.prod.yml up -d
```

### 6. Aguardar Inicialização (30-60 segundos)

```bash
# Ver logs em tempo real
sudo docker logs -f simuladores_app_prod
```

Pressione `Ctrl+C` para sair dos logs quando ver:
```
✓ Ready in X ms
```

### 7. Executar Migrations e Seed

```bash
# Entrar no container
sudo docker exec -it simuladores_app_prod sh

# Dentro do container, executar:
npx prisma db push
npx prisma db seed

# Sair do container
exit
```

### 8. Verificar se Está Funcionando

```bash
# Testar localmente
curl http://localhost:3009

# Ver status dos containers
sudo docker ps
```

### 9. Acessar a Aplicação

Abra no navegador:
- http://10.10.50.246:3009
- http://simulador-dre.doubletelecom.com.br

**Login padrão:**
- Email: admin@sistema.com
- Senha: admin123

---

## 🐛 Se Houver Problemas

### Container não inicia

```bash
# Ver logs completos
sudo docker logs simuladores_app_prod

# Reiniciar
sudo docker restart simuladores_app_prod
```

### Erro de banco de dados

```bash
# Verificar se o banco está rodando
sudo docker ps | grep db

# Ver logs do banco
sudo docker logs simuladores_db_prod

# Reiniciar o banco
sudo docker restart simuladores_db_prod
```

### Porta já em uso

```bash
# Verificar o que está usando a porta 3009
sudo netstat -tulpn | grep :3009

# Se necessário, parar o processo
sudo kill -9 <PID>
```

### Limpar e Recomeçar

```bash
cd ~/simuladores

# Parar tudo
sudo docker compose -f docker-compose.prod.yml down

# Limpar volumes (CUIDADO: apaga dados!)
sudo docker volume rm simuladores_postgres_prod_data

# Recriar tudo
sudo docker compose -f docker-compose.prod.yml up -d
```

---

## 📋 Comandos Úteis

```bash
# Ver todos os containers
sudo docker ps -a

# Ver logs em tempo real
sudo docker logs -f simuladores_app_prod

# Reiniciar aplicação
sudo docker restart simuladores_app_prod

# Parar tudo
sudo docker compose -f docker-compose.prod.yml down

# Iniciar tudo
sudo docker compose -f docker-compose.prod.yml up -d

# Entrar no container
sudo docker exec -it simuladores_app_prod sh

# Ver uso de recursos
sudo docker stats
```

---

## ✅ Checklist Final

- [ ] Imagem Docker carregada
- [ ] Containers iniciados
- [ ] Migrations executadas
- [ ] Seed executado
- [ ] Aplicação responde em localhost:3009
- [ ] Aplicação acessível externamente
- [ ] Login funciona
- [ ] Calculadoras funcionam

---

## 📞 Suporte

Se precisar de ajuda, verifique:
1. Logs do container: `sudo docker logs simuladores_app_prod`
2. Status dos containers: `sudo docker ps -a`
3. Portas em uso: `sudo netstat -tulpn | grep 3009`
