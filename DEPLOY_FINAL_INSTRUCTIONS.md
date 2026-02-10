# 🚀 INSTRUÇÕES FINAIS DE DEPLOY - SIMULADORES APP

## ✅ Status Atual

- ✅ Código testado e funcionando localmente
- ✅ API de comissões testada e funcionando
- ✅ Valores de Comissão Diretor atualizados:
  - 12 meses: 0,60%
  - 24 meses: 1,20%
  - 36 meses: 2,00%
  - 48 meses: 2,00%
  - 60 meses: 2,00%
- ✅ Docker image construída e pronta
- ⏳ Servidor de produção: AGUARDANDO VOLTAR ONLINE

---

## 📋 Checklist Pré-Deploy

Antes de fazer o deploy, verifique:

- [ ] Servidor 10.10.50.246 está ONLINE
- [ ] Você tem acesso SSH ao servidor
- [ ] Arquivo `simuladores-app-prod.tar.gz` existe (450MB)
- [ ] Você tem a senha SSH: `<SENHA_DO_SERVIDOR>`
- [ ] Você tem a senha SUDO: `<SENHA_DO_SERVIDOR>`

---

## 🚀 OPÇÃO 1: Deploy Automatizado (Recomendado)

### Passo 1: Verificar se o servidor está online

```bash
ping -c 2 10.10.50.246
```

Se receber resposta, o servidor está online. Prossiga para o Passo 2.

### Passo 2: Executar script de deploy

```bash
# Na pasta do projeto
bash deploy-production-final.sh
```

O script irá:
1. ✅ Verificar conectividade com o servidor
2. ✅ Transferir a imagem Docker (450MB - pode levar 5-10 minutos)
3. ✅ Parar containers antigos
4. ✅ Carregar nova imagem
5. ✅ Iniciar containers
6. ✅ Executar migrations e seed
7. ✅ Verificar status

**Tempo estimado:** 15-20 minutos

---

## 🚀 OPÇÃO 2: Deploy Manual (Passo a Passo)

### Etapa 1: Transferir imagem para o servidor

```bash
# No seu PC local
scp simuladores-app-prod.tar.gz double@10.10.50.246:~/
# Senha: <SENHA_DO_SERVIDOR>
```

### Etapa 2: Conectar ao servidor via SSH

```bash
ssh double@10.10.50.246
# Senha: <SENHA_DO_SERVIDOR>
```

### Etapa 3: Parar aplicação atual

```bash
cd ~/simuladores
sudo ./deploy.sh stop
# Senha sudo: <SENHA_DO_SERVIDOR>
```

### Etapa 4: Limpar containers antigos

```bash
sudo ./deploy.sh clean
# Senha sudo: <SENHA_DO_SERVIDOR>
```

### Etapa 5: Carregar nova imagem Docker

```bash
sudo docker load -i ~/simuladores-app-prod.tar.gz
```

### Etapa 6: Instalar e iniciar

```bash
sudo ./deploy.sh install-on-server
# Responda 'y' quando perguntado
# Senha sudo: <SENHA_DO_SERVIDOR>
```

### Etapa 7: Verificar status

```bash
sudo ./deploy.sh status
```

Todos os containers devem estar em estado "Up".

---

## ✅ Verificação Pós-Deploy

### 1. Verificar se a aplicação está rodando

```bash
curl http://10.10.50.246:3009
```

Deve retornar HTML da página inicial.

### 2. Acessar a aplicação

Abra no navegador: **http://10.10.50.246:3009**

### 3. Fazer login

- Email: `admin@sistema.com`
- Senha: `admin123`

### 4. Verificar comissões

1. Acesse qualquer calculadora (ex: Internet Fibra)
2. Clique em "Editar Comissões"
3. Verifique a tabela "Comissão Diretor"
4. Confirme que os valores estão corretos:
   - 12 meses: 0,60%
   - 24 meses: 1,20%
   - 36 meses: 2,00%
   - 48 meses: 2,00%
   - 60 meses: 2,00%

### 5. Testar edição de comissões

1. Clique em "Editar Comissões"
2. Altere um valor (ex: 12 meses para 0,70%)
3. Clique em "Salvo"
4. Recarregue a página
5. Verifique se o valor foi salvo

---

## 🐛 Troubleshooting

### Servidor offline

```
❌ Erro: Servidor 10.10.50.246 está OFFLINE!
```

**Solução:** Aguarde o servidor voltar online e tente novamente.

### Erro de transferência

```
❌ Erro ao transferir imagem!
```

**Solução:** Verifique:
- Conectividade SSH: `ssh double@10.10.50.246`
- Espaço em disco: `ssh double@10.10.50.246 df -h`
- Arquivo existe: `ls -lh simuladores-app-prod.tar.gz`

### Containers não iniciam

```bash
# Conectar ao servidor
ssh double@10.10.50.246

# Ver logs
cd ~/simuladores
sudo ./deploy.sh logs

# Reiniciar
sudo ./deploy.sh restart
```

### Banco de dados não conecta

```bash
# Verificar status
sudo ./deploy.sh status

# Reiniciar containers
sudo ./deploy.sh stop
sudo ./deploy.sh start
```

---

## 📊 Dados Inseridos

### Comissão Diretor (já atualizada)

| Prazo | Comissão |
|-------|----------|
| 12 meses | 0,60% |
| 24 meses | 1,20% |
| 36 meses | 2,00% |
| 48 meses | 2,00% |
| 60 meses | 2,00% |

### Usuários de Teste

| Email | Senha | Função |
|-------|-------|--------|
| admin@sistema.com | admin123 | Admin |
| diretor@sistema.com | diretor123 | Diretor |
| gerente@sistema.com | gerente123 | Gerente |
| vendedor@sistema.com | vendedor123 | Vendedor |

---

## 📞 Informações do Servidor

```
IP: 10.10.50.246
Usuário SSH: double
Senha SSH: <SENHA_DO_SERVIDOR>
Senha SUDO: <SENHA_DO_SERVIDOR>
Pasta: ~/simuladores
Porta App: 3009
Porta DB: 5433
```

---

## 🔗 Links Úteis

- **Aplicação:** http://10.10.50.246:3009
- **Documentação:** README.md
- **Guia Deploy:** GUIA_DEPLOY.md

---

## ⏱️ Tempo Estimado

| Etapa | Tempo |
|-------|-------|
| Transferência de imagem | 5-10 min |
| Parar containers | 1 min |
| Carregar imagem | 2-3 min |
| Iniciar containers | 2-3 min |
| Migrations e seed | 2-3 min |
| **Total** | **15-20 min** |

---

## 📝 Notas Importantes

1. **Não interrompa o script** durante a transferência de imagem
2. **Responda 'y'** quando o script perguntar sobre confirmações
3. **Aguarde 10 segundos** após o deploy antes de acessar a aplicação
4. **Verifique os logs** se houver problemas: `sudo ./deploy.sh logs`
5. **Faça backup** antes de fazer alterações importantes

---

## ✨ Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Testar todas as calculadoras
2. ✅ Verificar edição de comissões
3. ✅ Testar criação de propostas
4. ✅ Verificar autenticação
5. ✅ Monitorar logs por 24 horas

---

**Última atualização:** 21 de Janeiro de 2026  
**Status:** Pronto para deploy  
**Versão:** 1.0 Final
