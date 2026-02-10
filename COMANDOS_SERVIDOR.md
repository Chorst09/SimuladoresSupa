# Comandos para Executar no Servidor

## 1. Conectar ao servidor
```bash
ssh double@10.10.50.246
# ou se já estiver conectado: double@dockermachine
```

## 2. Verificar status dos containers
```bash
cd ~/simuladores
docker ps
```

## 3. Ver logs da aplicação
```bash
docker logs simuladores_app_prod --tail 50
```

## 4. Ver logs do banco
```bash
docker logs simuladores_db_prod --tail 30
```

## 5. Se os containers não estiverem rodando, subir novamente:
```bash
cd ~/simuladores
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## 6. Aguardar 60 segundos e testar:
```bash
sleep 60
curl http://localhost:3009
```

## 7. Executar seed (criar usuários):
```bash
docker exec simuladores_app_prod sh -c "cd /app && node_modules/.bin/tsx prisma/seed.ts"
```

## 8. Verificar se a porta está aberta no firewall:
```bash
sudo ufw status
sudo ufw allow 3009/tcp
```

## 9. Testar acesso externo (do seu Mac):
```bash
curl http://10.10.50.246:3009
```

## Troubleshooting

### Se o container da aplicação estiver reiniciando:
```bash
# Ver por que está falhando
docker logs simuladores_app_prod

# Reiniciar manualmente
docker-compose -f docker-compose.prod.yml restart app
```

### Se o banco estiver unhealthy:
```bash
# Ver logs do banco
docker logs simuladores_db_prod

# Se necessário, recriar o volume (APAGA DADOS!)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

### Verificar se está escutando na porta:
```bash
sudo netstat -tlnp | grep 3009
# ou
sudo ss -tlnp | grep 3009
```
