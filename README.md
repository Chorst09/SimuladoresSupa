# Simuladores com Supabase

Sistema de simuladores de propostas comerciais integrado com Supabase para persistência de dados.

## 🚀 Funcionalidades

- **Simuladores de Propostas**: Calculadoras para diferentes tipos de serviços
- **Integração Supabase**: Banco de dados PostgreSQL na nuvem
- **Formulários de Contato**: Sistema completo de contato com validação
- **API Routes**: Implementação tanto em App Router quanto Pages API
- **TypeScript**: Tipagem completa em todo o projeto
- **Shadcn/UI**: Interface moderna e responsiva

## 📁 Estrutura do Projeto

```
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── api/contact/        # API Route (App Router)
│   │   ├── contact/            # Página de contato (App Router)
│   │   └── contact-pages-api/  # Página de contato (Pages API)
│   ├── components/
│   │   ├── ContactForm.tsx           # Formulário para App Router
│   │   ├── ContactFormPagesAPI.tsx   # Formulário para Pages API
│   │   └── calculators/              # Componentes dos simuladores
│   ├── hooks/
│   │   └── useSupabaseForm.ts        # Hook personalizado para formulários
│   └── lib/
│       ├── supabaseClient.ts         # Cliente Supabase configurado
│       └── types.ts                  # Tipos TypeScript
├── pages/
│   └── api/
│       ├── contact.js          # API Route JavaScript (Pages API)
│       └── contact.ts          # API Route TypeScript (Pages API)
├── supabase-schema.sql         # Schema SQL para o banco
├── SUPABASE_SETUP.md          # Guia de configuração do Supabase
├── SUPABASE_FORMS_GUIDE.md    # Guia de implementação de formulários
└── PAGES_API_GUIDE.md         # Guia da Pages API
```

## 🛠️ Configuração

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Supabase
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute o script SQL em `supabase-schema.sql`
3. Configure as variáveis de ambiente:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
```

### 3. Executar o Projeto
```bash
npm run dev
```

## 📋 Implementações do Supabase

### 🔧 Cliente Supabase
- **Arquivo**: `src/lib/supabaseClient.ts`
- **Recursos**: Configuração centralizada, validação de variáveis, tratamento de erros

### 📝 Formulários de Contato
- **App Router**: `/contact` - Usa `src/app/api/contact/route.ts`
- **Pages API**: `/contact-pages-api` - Usa `pages/api/contact.ts`

### 🎯 API Routes
1. **App Router** (`src/app/api/contact/route.ts`):
   - Funções nomeadas (GET, POST)
   - Next.js 13+ Route Handlers
   - Mais moderno e performático

2. **Pages API** (`pages/api/contact.ts`):
   - Função handler única
   - Compatível com todas as versões
   - Sintaxe mais simples

### 🔒 Validações Implementadas
- **Client-side**: Campos obrigatórios, formato de email, estados de loading
- **Server-side**: Validação robusta, sanitização, limites de caracteres
- **Segurança**: Tratamento de erros, logs, headers CORS

## 🧪 Testes

### Testar Formulários
1. **App Router**: `http://localhost:3000/contact`
2. **Pages API**: `http://localhost:3000/contact-pages-api`

### Testar APIs Diretamente
```bash
# App Router
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@email.com","message":"Mensagem"}'

# Pages API
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@email.com","message":"Mensagem"}'
```

## 📚 Documentação

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**: Como configurar o Supabase
- **[SUPABASE_FORMS_GUIDE.md](./SUPABASE_FORMS_GUIDE.md)**: Guia completo de formulários
- **[PAGES_API_GUIDE.md](./PAGES_API_GUIDE.md)**: Documentação da Pages API

## 🔄 Migração Firebase → Supabase

Este projeto mantém compatibilidade com Firebase enquanto adiciona suporte ao Supabase:
- **Firebase**: Autenticação e dados existentes
- **Supabase**: Novos formulários e funcionalidades
- **Coexistência**: Ambos funcionam simultaneamente

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm run build
vercel --prod
```

### Configurar Variáveis no Vercel
1. Acesse o dashboard do Vercel
2. Vá em Settings → Environment Variables
3. Adicione as variáveis do Supabase

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação nos arquivos `.md`
2. Verifique os logs do console
3. Abra uma issue no GitHub

---

**Desenvolvido com ❤️ usando Next.js, TypeScript e Supabase**
