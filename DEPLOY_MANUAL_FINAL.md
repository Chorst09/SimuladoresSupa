# 🔧 Deploy Manual Final - Passo a Passo

## ⚠️ Problema Atual

O Docker está tentando fazer build da imagem do banco de dados, mas a imagem já foi carregada.

## ✅ Solução - Execute Manualmente

### Passo 1: Conectar ao Servidor

```bash
ssh double@10.10.50.246
```

Senha: `<SENHA_DO_SERVIDOR>`

### Passo 2: Executar Comandos (um por um)

Após conectar, execute cada comando abaixo:

#### 1. Entrar na pasta
```bash
cd ~/simuladores
```

#### 2. Parar containers
```bash
sudo docker-compose -f docker-compose.prod.yml down
```

Senha: `<SENHA_DO_SERVIDOR>`

#### 3. Remover imagens antigas
```bash
sudo docker rmi simuladores-app:latest 2>/dev/null || true
sudo docker rmi simuladores-postgres:prod 2>/dev/null || true
```

#### 4. Carregar nova imagem
```bash
sudo docker load -i ~/simuladores-app.tar.gz
```

Isso pode levar 2-3 minutos.

#### 5. Verificar imagens
```bash
sudo docker images | grep simuladores
```

Você deve ver:
```
simuladores-app          latest    ...
simuladores-postgres     prod      ...
```

#### 6. Iniciar containers (SEM BUILD)
```bash
sudo docker-compose -f docker-compose.prod.yml up -d --no-build
```

#### 7. Aguardar 30 segundos
```bash
sleep 30
```

#### 8. Verificar status
```bash
sudo docker-compose -f docker-compose.prod.yml ps
```

Você deve ver:
```
NAME                    STATUS
simuladores_app_prod    Up X minutes (healthy)
simuladores_db_prod     Up X minutes (healthy)
```

#### 9. Testar health check
```bash
curl http://localhost:3009/api/health
```

Deve retornar algo como:
```json
{"status":"ok"}
```

#### 10. Sair do servidor
```bash
exit
```

## 🌐 Acessar Aplicação

Após os passos acima, acesse:

```
http://10.10.50.246:3009
```

Login padrão:
- Email: `admin@sistema.com`
- Senha: `admin123`

## 🧪 Testar Comissões

### Cenário 1: Cliente Novo
- Não marque "Já é cliente da Base?"
- Comissões devem aparecer normalmente

### Cenário 2: Cliente com Aumento
- Marque "Já é cliente da Base?"
- Mensalidade Anterior: R$ 9.800,00
- Nova Mensalidade: R$ 11.362,80
- Diferença: +R$ 1.562,80
- **Esperado**: Comissões sobre R$ 1.562,80

### Cenário 3: Cliente com Redução
- Marque "Já é cliente da Base?"
- Mensalidade Anterior: R$ 11.362,80
- Nova Mensalidade: R$ 9.800,00
- Diferença: -R$ 1.562,80
- **Esperado**: Comissões = R$ 0,00

## 📝 Se Houver Problemas

### Ver logs
```bash
sudo docker-compose -f docker-compose.prod.yml logs -f app
```

### Reiniciar containers
```bash
sudo docker-compose -f docker-compose.prod.yml restart
```

### Parar tudo
```bash
sudo docker-compose -f docker-compose.prod.yml down
```

---

**Tempo estimado**: 10-15 minutos
**Status**: ✅ Pronto para executar
