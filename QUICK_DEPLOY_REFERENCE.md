# ⚡ QUICK DEPLOY REFERENCE

## 🚀 Deploy em 3 Passos

### Passo 1: Verificar Servidor Online
```bash
ping -c 2 10.10.50.246
```

### Passo 2: Executar Deploy
```bash
bash deploy-production-final.sh
```

### Passo 3: Acessar Aplicação
```
http://10.10.50.246:3009
Login: admin@sistema.com / admin123
```

---

## 📊 Valores Inseridos

**Comissão Diretor:**
- 12m: 0,60%
- 24m: 1,20%
- 36m: 2,00%
- 48m: 2,00%
- 60m: 2,00%

---

## 🔐 Credenciais

| Item | Valor |
|------|-------|
| IP | 10.10.50.246 |
| SSH User | double |
| SSH Pass | <SENHA_DO_SERVIDOR> |
| SUDO Pass | <SENHA_DO_SERVIDOR> |
| App Port | 3009 |
| DB Port | 5433 |

---

## 📁 Arquivos Importantes

- `simuladores-app-prod.tar.gz` - Docker image (450MB)
- `deploy-production-final.sh` - Script de deploy
- `DEPLOY_FINAL_INSTRUCTIONS.md` - Instruções completas
- `RESUMO_TRABALHO_REALIZADO.md` - Resumo técnico

---

## ✅ Checklist

- [ ] Servidor online
- [ ] Executar deploy
- [ ] Acessar app
- [ ] Testar comissões
- [ ] Verificar valores

---

## 🐛 Se Algo Falhar

```bash
# Conectar ao servidor
ssh double@10.10.50.246

# Ver logs
cd ~/simuladores
sudo ./deploy.sh logs

# Reiniciar
sudo ./deploy.sh restart
```

---

**Tempo:** 15-20 minutos  
**Status:** ✅ Pronto
