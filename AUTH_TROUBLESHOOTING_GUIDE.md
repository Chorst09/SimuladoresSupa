# Guia de Solução de Problemas - Autenticação

## Erro: "Invalid login credentials"

### Possíveis Causas

#### 1. **Usuário não existe no Supabase**
- **Problema**: Tentativa de login com email/senha que não foram cadastrados
- **Solução**: Criar conta primeiro ou usar credenciais de teste

#### 2. **Email não confirmado**
- **Problema**: Supabase pode exigir confirmação de email
- **Solução**: Verificar configurações de email no Supabase Dashboard

#### 3. **Senha incorreta**
- **Problema**: Senha digitada incorretamente
- **Solução**: Verificar caps lock, caracteres especiais

#### 4. **Configuração do Supabase**
- **Problema**: URLs ou chaves incorretas
- **Solução**: Verificar variáveis de ambiente

## Soluções Rápidas

### 1. **Usar Usuários de Teste** 🧪
Na página de login (desenvolvimento), use o **Auth Test Helper** no canto inferior direito:

```
Credenciais de teste:
• admin@test.com / admin123
• diretor@test.com / diretor123  
• user@test.com / user123
```

### 2. **Criar Nova Conta**
1. Clique em "Cadastre-se" na página de login
2. Preencha email e senha (mín. 6 caracteres)
3. Aguarde confirmação (se habilitada)

### 3. **Verificar Configuração do Supabase**

#### Variáveis de Ambiente (.env.local):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://wfuhtdckdgovfbgnlyie.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Verificar no Console:
- Abra DevTools (F12)
- Procure por mensagens do ProductionDebug
- Verifique se as variáveis estão carregadas

### 4. **Configurações do Supabase Dashboard**

#### Authentication Settings:
1. Acesse: https://supabase.com/dashboard
2. Vá para Authentication > Settings
3. Verifique:
   - **Enable email confirmations**: Pode estar habilitado
   - **Enable sign ups**: Deve estar habilitado
   - **Minimum password length**: Padrão é 6

#### Users Table:
```sql
-- Verificar se a tabela users existe
SELECT * FROM users LIMIT 5;

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Debugging Avançado

### 1. **Console Logs**
```javascript
// No DevTools Console, execute:
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
```

### 2. **Testar Conexão Supabase**
```javascript
// No DevTools Console:
import { supabase } from '@/lib/supabaseClient';
const { data, error } = await supabase.auth.getSession();
console.log('Session:', data, error);
```

### 3. **Verificar Network Tab**
1. Abra DevTools > Network
2. Tente fazer login
3. Procure por requests para `supabase.co`
4. Verifique status codes e responses

## Componentes de Debug Disponíveis

### 1. **ProductionDebug** (canto superior direito)
- Mostra status das variáveis de ambiente
- Testa conexão com Supabase
- Visível apenas em desenvolvimento ou com problemas

### 2. **AuthDebug** (canto superior esquerdo)
- Mostra estado atual da autenticação
- Número de renders do componente
- Status de loading e dados do usuário

### 3. **AuthTestHelper** (canto inferior direito)
- Cria usuários de teste rapidamente
- Apenas em desenvolvimento
- Credenciais pré-definidas para diferentes roles

## Comandos Úteis

```bash
# Verificar variáveis de ambiente
cat .env.local

# Reiniciar servidor
npm run dev

# Limpar cache do Next.js
rm -rf .next
npm run dev

# Verificar logs do servidor
# (já visível no terminal onde rodou npm run dev)
```

## Contatos de Suporte

### Supabase Dashboard
- URL: https://supabase.com/dashboard
- Projeto: wfuhtdckdgovfbgnlyie

### Documentação
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js Auth](https://nextjs.org/docs/authentication)

---

**Última atualização**: 22/09/2025
**Status**: ✅ Guia completo com soluções práticas
