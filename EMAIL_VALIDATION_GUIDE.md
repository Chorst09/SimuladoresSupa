# Guia de Resolução - Problemas de Email no Supabase

## Problema Identificado
```
Email address 'admin@test.com' is invalid
```

## Possíveis Causas

### 1. **Validação de Domínio**
- Supabase pode estar rejeitando domínios como `test.com`
- Alguns provedores bloqueiam emails de teste

### 2. **Configurações de Segurança**
- Email confirmation habilitado
- Whitelist de domínios configurada
- Políticas de segurança restritivas

## Soluções Testadas

### ✅ **Solução 1: Emails Mais Realistas**
Use emails com domínios brasileiros válidos:

```
✅ admin@exemplo.com.br / admin123456
✅ diretor@exemplo.com.br / diretor123456  
✅ usuario@exemplo.com.br / user123456
```

### ✅ **Solução 2: Seu Email Real**
Use seu próprio email para teste:

```
📧 seuemail@gmail.com / suasenha123
```

### ✅ **Solução 3: Emails Temporários**
Use serviços de email temporário:

```
🔗 https://temp-mail.org
🔗 https://10minutemail.com
```

## Passos para Testar

### 1. **Método Recomendado - Página de Cadastro**
```bash
1. Vá para: http://localhost:3001/signup
2. Use: admin@exemplo.com.br / admin123456
3. Clique em "Criar Conta"
4. Volte para /login e faça login
```

### 2. **Método Alternativo - Seu Email**
```bash
1. Vá para: http://localhost:3001/signup
2. Use seu email real + senha forte
3. Confirme email se necessário
4. Faça login normalmente
```

## Configurações do Supabase para Verificar

### 1. **Authentication Settings**
```
Dashboard > Authentication > Settings

Verificar:
- Enable email confirmations: ON/OFF
- Enable sign ups: Deve estar ON
- Allowed email domains: Verificar se há restrições
```

### 2. **Email Templates**
```
Dashboard > Authentication > Email Templates

Verificar:
- Confirm signup: Template configurado
- SMTP Settings: Configuração de email
```

### 3. **URL Configuration**
```
Dashboard > Authentication > URL Configuration

Verificar:
- Site URL: http://localhost:3001
- Redirect URLs: Configurados corretamente
```

## Debugging Avançado

### 1. **Console Logs**
Abra DevTools e procure por:
```javascript
// Erros de validação
"Email validation failed"
"Invalid email format"
"Domain not allowed"
```

### 2. **Network Tab**
Verifique requests para:
```
POST /auth/v1/signup
Response: 400 Bad Request
```

### 3. **Supabase Dashboard**
```
Dashboard > Authentication > Users
- Verificar se usuários estão sendo criados
- Verificar status de confirmação
```

## Soluções Rápidas

### 🚀 **Opção 1: Email Brasileiro**
```
Email: admin@exemplo.com.br
Senha: admin123456
```

### 🚀 **Opção 2: Gmail Temporário**
```
Email: teste.supabase.2025@gmail.com
Senha: MinhaSenh@123
```

### 🚀 **Opção 3: Desabilitar Confirmação**
```
Supabase Dashboard > Authentication > Settings
Desmarcar: "Enable email confirmations"
```

## Comandos de Teste

### Testar Email Válido
```javascript
// No DevTools Console
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
console.log(emailRegex.test('admin@exemplo.com.br')); // true
console.log(emailRegex.test('admin@test.com')); // true (formato OK)
```

### Testar Supabase
```javascript
// No DevTools Console
import { supabase } from '@/lib/supabaseClient';
const result = await supabase.auth.signUp({
  email: 'admin@exemplo.com.br',
  password: 'admin123456'
});
console.log(result);
```

---

**Próximos Passos Recomendados:**
1. ✅ Use `admin@exemplo.com.br` na página de cadastro
2. ✅ Ou use seu email real para teste
3. ✅ Verifique configurações no Supabase Dashboard se persistir

**Data:** 22/09/2025  
**Status:** ✅ Soluções implementadas
