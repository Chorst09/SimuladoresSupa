# Deploy - Correção de Comissões para Clientes Existentes

## 📋 Resumo das Mudanças

Foram implementadas correções no cálculo de comissões em todas as calculadoras para que, quando "Já é cliente da Base?" está marcado, as comissões sejam calculadas APENAS sobre a diferença de valor entre a nova mensalidade e a anterior.

### Calculadoras Atualizadas:
- ✅ InternetFibraCalculator
- ✅ InternetRadioCalculator (também removido checkbox duplicado)
- ✅ InternetManCalculator
- ✅ InternetManRadioCalculator
- ✅ DoubleFibraRadioCalculator
- ✅ InternetOKv2Calculator

## 🚀 Instruções de Deploy

### Opção 1: Deploy Automático (Recomendado)

```bash
# 1. Na máquina local, construir a image
docker build --platform linux/amd64 -t simuladores-app:latest .

# 2. Salvar a image
docker save simuladores-app:latest -o simuladores-app-latest.tar

# 3. Transferir para o servidor
scp -P 22 simuladores-app-latest.tar root@10.10.50.246:/tmp/

# 4. No servidor, executar:
ssh root@10.10.50.246 << 'EOF'
  cd /root
  docker-compose -f docker-compose.prod.yml down
  docker load -i /tmp/simuladores-app-latest.tar
  docker-compose -f docker-compose.prod.yml up -d
  sleep 10
  docker-compose -f docker-compose.prod.yml ps
  curl -s http://localhost:3009/api/health
EOF
```

### Opção 2: Deploy Manual (Passo a Passo)

#### No seu computador:
```bash
# 1. Build da image com arquitetura correta
docker build --platform linux/amd64 -t simuladores-app:latest .

# 2. Salvar a image
docker save simuladores-app:latest -o simuladores-app-latest.tar

# 3. Transferir para o servidor
scp -P 22 simuladores-app-latest.tar root@10.10.50.246:/tmp/
```

#### No servidor (10.10.50.246):
```bash
# 1. Parar containers antigos
docker-compose -f /root/docker-compose.prod.yml down

# 2. Carregar a nova image
docker load -i /tmp/simuladores-app-latest.tar

# 3. Iniciar containers
docker-compose -f /root/docker-compose.prod.yml up -d

# 4. Aguardar inicialização
sleep 10

# 5. Verificar status
docker-compose -f /root/docker-compose.prod.yml ps

# 6. Testar health check
curl -s http://localhost:3009/api/health
```

## ✅ Verificação Pós-Deploy

### 1. Verificar se a aplicação está respondendo
```bash
curl -s http://10.10.50.246:3009/api/health | jq .
```

### 2. Testar o cálculo de comissões

Acesse a calculadora e teste os seguintes cenários:

#### Cenário 1: Cliente Novo
- Não marque "Já é cliente da Base?"
- Comissões devem aparecer normalmente

#### Cenário 2: Cliente Existente com Aumento
- Marque "Já é cliente da Base?"
- Mensalidade Anterior: R$ 9.800,00
- Nova Mensalidade: R$ 11.362,80
- Diferença: +R$ 1.562,80
- **Esperado**: Comissões calculadas sobre R$ 1.562,80

#### Cenário 3: Cliente Existente com Redução
- Marque "Já é cliente da Base?"
- Mensalidade Anterior: R$ 11.362,80
- Nova Mensalidade: R$ 9.800,00
- Diferença: -R$ 1.562,80
- **Esperado**: Comissões = R$ 0,00

### 3. Verificar logs
```bash
docker-compose -f /root/docker-compose.prod.yml logs -f app
```

## 🔍 Troubleshooting

### Problema: "exec format error"
**Solução**: Certifique-se de usar `--platform linux/amd64` ao fazer build da image

```bash
docker build --platform linux/amd64 -t simuladores-app:latest .
```

### Problema: Containers não iniciam
**Solução**: Verificar logs
```bash
docker-compose -f /root/docker-compose.prod.yml logs app
```

### Problema: Porta 3009 já em uso
**Solução**: Parar containers antigos
```bash
docker-compose -f /root/docker-compose.prod.yml down
docker ps -a  # Verificar se há containers antigos
docker rm <container_id>  # Remover se necessário
```

## 📝 Notas Importantes

1. **Backup**: Sempre fazer backup antes de deploy
2. **Teste Local**: Testar localmente antes de fazer deploy em produção
3. **Downtime**: O deploy causará downtime de ~1-2 minutos
4. **Rollback**: Se algo der errado, reverter para a image anterior:
   ```bash
   docker-compose -f /root/docker-compose.prod.yml down
   docker tag simuladores-app:prod simuladores-app:latest
   docker-compose -f /root/docker-compose.prod.yml up -d
   ```

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs: `docker-compose logs -f`
2. Verificar health: `curl http://localhost:3009/api/health`
3. Verificar espaço em disco: `df -h`
4. Verificar memória: `free -h`

---

**Data**: 2026-01-21
**Versão**: 1.0
**Status**: Pronto para Deploy
