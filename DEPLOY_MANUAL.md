# Deploy Manual para Servidor de Produção

## Status Atual
- ✅ Aplicação funcionando localmente (Mac) na porta 3009
- ✅ Imagem Docker buildada: `simuladores-app:latest`
- ✅ Arquivos transferidos para servidor 10.10.50.246
- ❌ Containers não estão rodando no servidor

## Passos para Deploy no Servidor

### 1. Conectar ao Servidor
```bash
ssh double@10.10.50.246
# Senha: <SENHA_DO_SERVIDOR>
```

### 2. Verificar se a imagem foi carregada
```bash
cd ~/simuladores
ls -lh ~/simuladores-app.tar.gz

# Se o arquivo existe, carregar a imagem:
gunzip -c ~/simuladores-app.tar.gz | docker load

# Verificar se a imagem foi carregada:
docker images | grep simuladores
```

### 3. Criar/Verificar a rede Docker
```bash
# Remover rede antiga se existir
docker network rm simuladores_network_prod 2>/dev/null || true

# Criar nova rede
docker network create simuladores_network_prod
```

### 4. Subir os containers
```bash
cd ~/simuladores

# Parar containers antigos
docker-compose -f docker-compose.prod.yml --env-file .env.production down

# Subir novos containers
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Aguardar 30 segundos
sleep 30
```

### 5. Verificar status
```bash
# Ver containers
docker ps

# Ver logs
docker logs simuladores_app_prod --tail 50

# Testar aplicação
curl http://localhost:3009
```

### 6. Executar seed (criar usuários)
```bash
docker exec simuladores_app_prod sh -c "cd /app && node_modules/.bin/tsx prisma/seed.ts"
```

### 7. Verificar firewall
```bash
# Verificar se porta 3009 está aberta
sudo ufw status

# Se necessário, abrir porta
sudo ufw allow 3009/tcp
```

## Teste Final
```bash
# Do seu Mac:
curl http://10.10.50.246:3009
```

## Usuários Criados pelo Seed
- Admin: admin@sistema.com / admin123
- Diretor: diretor@sistema.com / diretor123
- Gerente: gerente@sistema.com / gerente123
- Vendedor: vendedor@sistema.com / vendedor123
- Usuário: usuario@sistema.com / usuario123

## Comandos Úteis

### Ver logs em tempo real
```bash
docker logs -f simuladores_app_prod
```

### Reiniciar aplicação
```bash
docker-compose -f docker-compose.prod.yml restart app
```

### Parar tudo
```bash
docker-compose -f docker-compose.prod.yml down
```

### Limpar e recomeçar
```bash
docker-compose -f docker-compose.prod.yml down -v
docker rmi simuladores-app:latest
# Depois refazer o deploy
```

## Troubleshooting

### Container não inicia
```bash
# Ver logs completos
docker logs simuladores_app_prod

# Verificar se banco está saudável
docker ps | grep simuladores_db_prod
```

### Porta não acessível externamente
```bash
# Verificar se está escutando
sudo netstat -tlnp | grep 3009

# Verificar firewall
sudo ufw status

# Testar localmente primeiro
curl http://localhost:3009
```

### Banco de dados com problemas
```bash
# Reiniciar apenas o banco
docker-compose -f docker-compose.prod.yml restart db

# Ver logs do banco
docker logs simuladores_db_prod
```
