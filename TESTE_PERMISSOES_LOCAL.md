# Guia de Teste - Permissões de Usuário e Diretor

## ✅ Alterações Implementadas

### 1. Arquivos Criados/Modificados:
- ✅ `src/lib/permissions.ts` - Configuração de permissões por função
- ✅ `src/hooks/use-proposals-with-permissions.ts` - Hook para buscar propostas com permissões
- ✅ `src/app/api/proposals/route.ts` - API com filtro de permissões
- ✅ `src/components/calculators/InternetRadioCalculator.tsx` - Atualizado para usar o novo hook

### 2. Lógica de Permissões:

#### Função "Usuario":
- ✅ Acesso às calculadoras
- ✅ Visualiza APENAS suas próprias propostas
- ❌ NÃO visualiza propostas de outros usuários

#### Função "Diretor":
- ✅ Acesso às calculadoras
- ✅ Visualiza TODAS as propostas (de todos os usuários)
- ❌ NÃO pode criar/editar propostas

#### Outras Funções (Admin, Seller, Gerente):
- ✅ Permissões mantidas sem alterações

---

## 🧪 Como Testar Localmente

### Pré-requisitos:
1. Servidor de desenvolvimento rodando: `npm run dev`
2. Acesso ao banco de dados local
3. Pelo menos 2 usuários cadastrados com funções diferentes

### Passo 1: Preparar Usuários de Teste

Você precisa ter no banco de dados:
- **Usuário 1**: Função = "user" (Usuario)
- **Usuário 2**: Função = "director" (Diretor)
- **Usuário 3**: Função = "user" (Usuario) - diferente do Usuário 1

### Passo 2: Criar Propostas de Teste

1. **Login como Usuário 1** (função "user")
   - Acesse: http://localhost:3000
   - Faça login com o Usuário 1
   - Vá para "Calculadoras" → "Internet Rádio"
   - Crie 2-3 propostas de teste
   - Anote os IDs das propostas criadas

2. **Login como Usuário 3** (função "user")
   - Faça logout do Usuário 1
   - Faça login com o Usuário 3
   - Vá para "Calculadoras" → "Internet Rádio"
   - Crie 2-3 propostas de teste
   - Anote os IDs das propostas criadas

### Passo 3: Testar Permissões de Visualização

#### Teste A: Usuário vê apenas suas propostas
1. **Login como Usuário 1** (função "user")
2. Vá para "Calculadoras" → "Internet Rádio"
3. Clique em "Buscar Propostas"
4. **RESULTADO ESPERADO**:
   - ✅ Deve ver APENAS as propostas criadas pelo Usuário 1
   - ❌ NÃO deve ver as propostas do Usuário 3
   - Verifique no console do navegador (F12) as mensagens de log

#### Teste B: Diretor vê todas as propostas
1. **Faça logout e login como Usuário 2** (função "director")
2. Vá para "Calculadoras" → "Internet Rádio"
3. Clique em "Buscar Propostas"
4. **RESULTADO ESPERADO**:
   - ✅ Deve ver TODAS as propostas (Usuário 1 + Usuário 3)
   - Verifique no console do navegador (F12) as mensagens de log

#### Teste C: Outro usuário vê apenas suas propostas
1. **Faça logout e login como Usuário 3** (função "user")
2. Vá para "Calculadoras" → "Internet Rádio"
3. Clique em "Buscar Propostas"
4. **RESULTADO ESPERADO**:
   - ✅ Deve ver APENAS as propostas criadas pelo Usuário 3
   - ❌ NÃO deve ver as propostas do Usuário 1

---

## 🔍 Verificação no Console do Navegador

Abra o Console do Navegador (F12) e procure por estas mensagens:

### Ao buscar propostas:
```
🔍 Buscando propostas com permissões: {userRole: "user", userId: "...", canViewAllProposals: false}
✅ X propostas carregadas para user: {total: X, canViewAll: false}
```

### Para Diretor:
```
🔍 Buscando propostas com permissões: {userRole: "director", userId: "...", canViewAllProposals: true}
✅ X propostas carregadas para director: {total: X, canViewAll: true}
```

---

## 🐛 Troubleshooting

### Problema: Usuário vê propostas de outros usuários
**Solução**: 
1. Verifique se o usuário tem a função "user" no banco de dados
2. Limpe o cache do navegador (Ctrl+Shift+Delete)
3. Faça logout e login novamente
4. Verifique os logs no console do navegador

### Problema: Diretor não vê todas as propostas
**Solução**:
1. Verifique se o usuário tem a função "director" no banco de dados
2. Verifique os logs no console do navegador
3. Verifique se há erros na API: `/api/proposals`

### Problema: Erro ao buscar propostas
**Solução**:
1. Verifique se o servidor está rodando: `npm run dev`
2. Verifique se o banco de dados está acessível
3. Verifique os logs do servidor no terminal

---

## ✅ Checklist de Testes

- [ ] Usuário 1 (user) vê apenas suas propostas
- [ ] Usuário 3 (user) vê apenas suas propostas
- [ ] Diretor vê todas as propostas (Usuário 1 + Usuário 3)
- [ ] Logs no console mostram permissões corretas
- [ ] Não há erros no console do navegador
- [ ] Não há erros no terminal do servidor

---

## 📝 Próximos Passos

Após confirmar que os testes locais estão funcionando:

1. ✅ Fazer commit das alterações
2. ✅ Fazer build da aplicação: `npm run build`
3. ✅ Criar imagem Docker: `docker build --platform linux/amd64 -t simuladores-supa:latest .`
4. ✅ Transferir para o servidor
5. ✅ Deploy em produção

---

## 📞 Suporte

Se encontrar problemas durante os testes, anote:
1. Qual teste falhou
2. Mensagens de erro no console
3. Logs do servidor
4. Função do usuário que está testando
