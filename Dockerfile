# ==========================================
# MULTI-STAGE DOCKERFILE
# Suporta desenvolvimento e produção
# ==========================================

# ==================================
# STAGE 1: BASE (Dependências do sistema)
# ==================================
FROM node:20-slim AS base

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    curl \
    dumb-init \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Criar usuário não-root
RUN groupadd --gid 1001 nodejs \
    && useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json ./

# ==================================
# STAGE 2: DEPENDENCIES (Instalação de dependências)
# ==================================
FROM base AS dependencies

# Instalar todas as dependências (dev + prod)
RUN npm ci --include=dev

# ==================================
# STAGE 3: DEVELOPMENT (Ambiente de desenvolvimento)
# ==================================
FROM dependencies AS development

# Variáveis de ambiente para desenvolvimento
ENV NODE_ENV=development
ENV PORT=3000

# Copiar código fonte com permissões corretas
COPY --chown=nodejs:nodejs . .

# Gerar cliente Prisma
RUN npx prisma generate

# Criar diretórios necessários para o Next.js com permissões corretas
RUN mkdir -p .next && \
    touch next-env.d.ts && \
    chown -R nodejs:nodejs .next next-env.d.ts

# Usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Health check para desenvolvimento
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/api/health || exit 1

# Comando para desenvolvimento (com hot reload)
CMD ["dumb-init", "npm", "run", "dev"]

# ==================================
# STAGE 4: BUILDER (Build para produção)
# ==================================
FROM dependencies AS builder

# Copiar código fonte
COPY . .

# Build da aplicação
ENV NODE_ENV=production
RUN npm run build

# Limpar dependências de desenvolvimento
RUN npm ci --only=production && npm cache clean --force

# ==================================
# STAGE 5: PRODUCTION (Imagem final de produção)
# ==================================
FROM base AS production

# Variáveis de ambiente para produção
ENV NODE_ENV=production
ENV PORT=3000

# Copiar apenas arquivos necessários do builder
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static

# Copiar scripts necessários
COPY --chown=nodejs:nodejs scripts/wait-for-db.sh ./wait-for-db.sh
RUN chmod +x ./wait-for-db.sh

# Usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Health check para produção
HEALTHCHECK --interval=60s --timeout=15s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/api/health || exit 1

# Comando de execução para produção
CMD ["dumb-init", "./wait-for-db.sh", "node", "server.js"]
