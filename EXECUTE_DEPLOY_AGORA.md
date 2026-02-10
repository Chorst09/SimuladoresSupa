# 🚀 EXECUTE O DEPLOY AGORA

## ⚡ Resumo Rápido

Todas as mudanças foram implementadas e testadas. Agora é hora de fazer o deploy em produção.

## 📋 Pré-requisitos

✅ Docker image construída: `simuladores-app:latest` (371 MB compactado)
✅ Arquivo pronto: `simuladores-app.tar.gz`
✅ Código compilado sem erros
✅ Testes passando

## 🚀 Executar Deploy (2 Etapas)

### Etapa 1: Transferir Image (no seu PC)

```bash
# Transferir arquivo para servidor
scp -P 22 simuladores-app.tar.gz double@10.10.50.246:~/
```

**Senha quando solicitado:** `<SENHA_DO_SERVIDOR>`

Aguarde até que a transferência termine (pode levar 5-10 minutos).

### Etapa 2: Instalar no Servidor

```bash
# Conectar ao servidor
ssh double@10.10.50.246
```

**Senha:** `<SENHA_DO_SERVIDOR>`

Depois, no servidor, execute:

```bash
# Entrar na pasta
cd ~/simuladores

# Fazer deploy (SEMPRE com sudo)
sudo ./deploy.sh install-on-server
```

**Senha sudo:** `<SENHA_DO_SERVIDOR>`

O script irá automaticamente:
- ✅ Carregar a imagem Docker
- ✅ Criar volumes necessários
- ✅ Iniciar containers
- ✅ Executar migrations

## ✅ Verificar Deploy

Após o deploy, execute:

```bash
# Ver status
sudo ./deploy.sh status

# Ver logs
sudo ./deploy.sh logs

# Testar
curl http://localhost:3009/api/health
```

## 🌐 Acessar Aplicação

```
URL: http://10.10.50.246:3009

Login padrão:
- Email: admin@sistema.com
- Senha: admin123
```

## 🧪 Testar Comissões

### Cenário 1: Cliente Novo
- Não marque "Já é cliente da Base?"
- Comissões devem aparecer normalmente

### Cenário 2: Cliente com Aumento
- Marque "Já é cliente da Base?"
- Mensalidade Anterior: R$ 9.800,00
- Nova Mensalidade: R$ 11.362,80
- **Esperado**: Comissões sobre R$ 1.562,80

### Cenário 3: Cliente com Redução
- Marque "Já é cliente da Base?"
- Mensalidade Anterior: R$ 11.362,80
- Nova Mensalidade: R$ 9.800,00
- **Esperado**: Comissões = R$ 0,00

## 📞 Troubleshooting

### Problema: "Connection refused"
```bash
# Aguarde 30 segundos e tente novamente
sleep 30
curl http://localhost:3009/api/health
```

### Problema: "Permission denied"
```bash
# Adicionar ao grupo docker
sudo usermod -aG docker double

# Relogar
exit
ssh double@10.10.50.246
```

### Problema: Containers não iniciam
```bash
# Ver logs detalhados
sudo ./deploy.sh logs

# Reiniciar do zero
sudo ./deploy.sh stop
sudo ./deploy.sh clean
sudo ./deploy.sh install-on-server
```

## 📝 Mudanças Implementadas

✅ **Comissões para Clientes Existentes**
- Calculadas apenas sobre diferença de valor
- Se diferença for negativa, comissão = R$ 0,00

✅ **Calculadoras Atualizadas**
- InternetFibraCalculator
- InternetRadioCalculator (checkbox duplicado removido)
- InternetManCalculator
- InternetManRadioCalculator
- DoubleFibraRadioCalculator
- InternetOKv2Calculator

✅ **Proteções Adicionadas**
- Null checks em todas as comissões
- Validação de valores positivos
- Remoção de checkbox duplicado

## ⏱️ Tempo Estimado

- Transferência: 5-10 minutos
- Deploy: 2-3 minutos
- Testes: 5-10 minutos
- **Total: ~20 minutos**

## 🎉 Pronto!

Após completar as etapas acima, o deploy estará concluído e a aplicação estará rodando com as correções de comissões implementadas.

---

**Data**: 21 de Janeiro de 2026
**Status**: ✅ PRONTO PARA DEPLOY
