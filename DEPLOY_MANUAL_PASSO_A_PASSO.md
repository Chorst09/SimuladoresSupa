# 🚀 DEPLOY MANUAL - PASSO A PASSO

## ⚠️ IMPORTANTE
A imagem Docker já foi transferida para o servidor em: `~/simuladores-app-prod.tar.gz`

## 📋 Passos para fazer o deploy

### Passo 1: Conectar ao servidor
```bash
ssh double@10.10.50.246
# ou
ssh carlos.horst@10.10.50.246
```

### Passo 2: Entrar na pasta do projeto
```bash
cd ~/simuladores
```

### Passo 3: Parar os containers antigos
```bash
sudo docker compose -f docker-compose.prod.yml down
```

### Passo 4: Remover imagem antiga (opcional)
```bash
sudo docker rmi simuladores-app:prod 2>/dev/null || true
```

### Passo 5: Carregar a nova imagem Docker
```bash
sudo docker load -i ~/simuladores-app-prod.tar.gz
```

Isso pode levar alguns minutos...

### Passo 6: Iniciar os containers com a nova imagem
```bash
sudo docker compose -f docker-compose.prod.yml up -d
```

### Passo 7: Aguardar os containers iniciarem
```bash
sleep 15
```

### Passo 8: Verificar o status
```bash
sudo docker compose -f docker-compose.prod.yml ps
```

Todos os containers devem estar em estado "Up".

### Passo 9: Testar a aplicação
```bash
curl -s http://localhost:3009/api/commissions | jq '.channelDirector'
```

Você deve ver os valores:
```json
{
  "months_12": "0.6",
  "months_24": "1.2",
  "months_36": "2",
  "months_48": "2",
  "months_60": "2"
}
```

### Passo 10: Acessar a aplicação
Abra no navegador: **http://10.10.50.246:3009**

Login:
- Email: `admin@sistema.com`
- Senha: `admin123`

## ✅ Verificação Final

1. Abra uma calculadora (ex: Internet Fibra)
2. Clique na aba **"Tabela Comissões"**
3. Verifique a tabela **"Comissão Diretor"**
4. Confirme que os valores aparecem:
   - 12 meses: 0,60%
   - 24 meses: 1,20%
   - 36 meses: 2,00%
   - 48 meses: 2,00%
   - 60 meses: 2,00%

## 🐛 Se algo der errado

### Ver logs
```bash
sudo docker compose -f docker-compose.prod.yml logs -f app
```

### Reiniciar containers
```bash
sudo docker compose -f docker-compose.prod.yml restart
```

### Parar tudo e começar do zero
```bash
sudo docker compose -f docker-compose.prod.yml down
sudo docker system prune -a
sudo docker load -i ~/simuladores-app-prod.tar.gz
sudo docker compose -f docker-compose.prod.yml up -d
```

## 📝 Alterações incluídas nesta versão

✅ Aba "Tabela Comissões" agora aparece para TODOS os usuários
✅ Fallback de Comissão Diretor atualizado com valores corretos
✅ Todas as 8 calculadoras atualizadas
✅ Valores de Comissão Diretor: 0,60% / 1,20% / 2,00% / 2,00% / 2,00%

---

**Data:** 21 de Janeiro de 2026  
**Versão:** 1.0 Final
