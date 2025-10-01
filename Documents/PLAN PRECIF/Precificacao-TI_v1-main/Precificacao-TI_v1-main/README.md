# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

Versao com todas formulas de calculos funcionando.

## Deploy no Vercel

### Pré-requisitos
- Conta no Vercel
- Chave da API do Google Gemini

### Passos para Deploy

1. **Conectar ao Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Conecte seu repositório GitHub/GitLab
   - Importe este projeto

2. **Configurar Variáveis de Ambiente:**
   - No dashboard do Vercel, vá em Settings > Environment Variables
   - Adicione: `GEMINI_API_KEY` com sua chave da API do Google Gemini

3. **Deploy Automático:**
   - O Vercel fará o deploy automaticamente
   - Cada push para a branch principal acionará um novo deploy

### Comandos Locais
```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar servidor de produção
npm start
```
