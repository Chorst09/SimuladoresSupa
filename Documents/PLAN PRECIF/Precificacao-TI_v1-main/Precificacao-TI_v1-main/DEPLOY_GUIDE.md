# 🚀 Guia Completo de Deploy no Vercel

## ✅ Status do Projeto
- ✅ Configuração do Vercel completa
- ✅ Scripts de build otimizados
- ✅ Variáveis de ambiente configuradas
- ✅ Arquivos de ignore criados
- ✅ Região brasileira configurada (GRU1)
- ✅ Commit enviado para GitHub

## 🎯 Deploy no Vercel - Passo a Passo

### 1. Acesse o Vercel
- Vá para [vercel.com](https://vercel.com)
- Faça login com sua conta GitHub

### 2. Importe o Projeto
- Clique em **"New Project"**
- Procure por `Chorst09/Precificacao-TI_v1`
- Clique em **"Import"**

### 3. Configure as Variáveis de Ambiente
No dashboard do projeto:
- Vá em **Settings** → **Environment Variables**
- Adicione a variável:
  - **Name:** `GEMINI_API_KEY`
  - **Value:** `AIzaSyBit2SF0m8dMksug9eagXtKFe9jvU78iYs`
  - **Environment:** Production, Preview, Development

### 4. Deploy Automático
- O Vercel detectará automaticamente o Next.js
- O build será executado automaticamente
- Em 2-3 minutos seu projeto estará online!

## 🔧 Configurações Aplicadas

### Performance
- **Região:** Brasil (GRU1) para menor latência
- **Runtime:** Node.js 18.x
- **Timeout:** 30 segundos para funções AI
- **Build otimizado** com cache

### Arquivos Criados
- `vercel.json` - Configuração principal
- `.vercelignore` - Arquivos excluídos do deploy
- `.env.example` - Documentação das variáveis

### Scripts Disponíveis
```bash
npm run dev          # Desenvolvimento local
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run vercel-build # Build específico do Vercel
```

## 🌐 Após o Deploy

### URL do Projeto
Após o deploy, você receberá uma URL como:
`https://precificacao-ti-v1-chorst09.vercel.app`

### Domínio Personalizado (Opcional)
- No dashboard do Vercel, vá em **Settings** → **Domains**
- Adicione seu domínio personalizado

### Monitoramento
- **Analytics:** Disponível no dashboard do Vercel
- **Logs:** Acesse em **Functions** → **View Function Logs**
- **Performance:** Métricas em tempo real

## 🔄 Deploy Automático

Cada push para a branch `main` acionará automaticamente:
1. **Build** do projeto
2. **Deploy** para produção
3. **Invalidação** do cache
4. **Notificação** por email

## 🆘 Solução de Problemas

### Build Falha
- Verifique os logs no dashboard do Vercel
- Confirme se todas as dependências estão no `package.json`

### Erro de Variável de Ambiente
- Verifique se `GEMINI_API_KEY` está configurada
- Confirme se está disponível em todos os ambientes

### Timeout de Função
- Funções AI têm timeout de 30s configurado
- Para operações mais longas, considere otimização

## 📞 Suporte
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)

---
**Projeto pronto para produção!** 🎉