# ==========================================
# MULTI-STAGE DOCKERFILE
# Suporta desenvolvimento, produção e PostgreSQL customizado
# ==========================================

# ==================================
# STAGE 0: POSTGRES (PostgreSQL customizado)
# ==================================
FROM docker.io/library/postgres:16-alpine AS postgres

# Instalar extensões necessárias
RUN apk add --no-cache postgresql-contrib

# Criar script de inicialização inline
RUN mkdir -p /docker-entrypoint-initdb.d && \
    echo "-- Criar schemas necessários" > /docker-entrypoint-initdb.d/01-init.sql && \
    echo "CREATE SCHEMA IF NOT EXISTS auth;" >> /docker-entrypoint-initdb.d/01-init.sql && \
    echo "CREATE SCHEMA IF NOT EXISTS public;" >> /docker-entrypoint-initdb.d/01-init.sql && \
    echo "GRANT ALL ON SCHEMA auth TO postgres;" >> /docker-entrypoint-initdb.d/01-init.sql && \
    echo "GRANT ALL ON SCHEMA public TO postgres;" >> /docker-entrypoint-initdb.d/01-init.sql && \
    echo "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" >> /docker-entrypoint-initdb.d/01-init.sql && \
    echo "CREATE EXTENSION IF NOT EXISTS \"pg_stat_statements\";" >> /docker-entrypoint-initdb.d/01-init.sql && \
    echo "CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";" >> /docker-entrypoint-initdb.d/01-init.sql && \
    echo "SET timezone = 'America/Sao_Paulo';" >> /docker-entrypoint-initdb.d/01-init.sql

# Configurações de performance
RUN echo "shared_preload_libraries = 'pg_stat_statements'" >> /usr/local/share/postgresql/postgresql.conf.sample && \
    echo "pg_stat_statements.track = all" >> /usr/local/share/postgresql/postgresql.conf.sample && \
    echo "timezone = 'America/Sao_Paulo'" >> /usr/local/share/postgresql/postgresql.conf.sample

EXPOSE 5432

# ==================================
# STAGE 1: BASE (Dependências do sistema)
# ==================================
FROM docker.io/library/node:20-slim AS base

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

# Configurar variável de ambiente para Prisma (necessário antes de copiar)
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Copiar arquivos de dependências
COPY package.json package-lock.json ./

# Copiar schema do Prisma (necessário para postinstall)
COPY prisma ./prisma

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
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Copiar código fonte com permissões corretas
COPY --chown=nodejs:nodejs . .

# Gerar Prisma Client como root (antes de trocar de usuário)
RUN PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate || echo "Prisma generate falhou, será tentado no runtime"

# Criar diretórios necessários para o Next.js com permissões corretas
RUN mkdir -p .next && \
    touch next-env.d.ts && \
    chown -R nodejs:nodejs .next next-env.d.ts node_modules

# Usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Health check para desenvolvimento
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/api/health || exit 1

# Comando para desenvolvimento (com hot reload e inicialização do DB)
CMD ["dumb-init", "sh", "-c", "echo '🔧 Inicializando banco de dados...' && npx prisma db push && (npm run db:seed || echo '⚠️  Seed já executado ou falhou') && echo '🚀 Iniciando aplicação...' && npm run dev"]

# ==================================
# STAGE 4: BUILDER (Build para produção)
# ==================================
FROM dependencies AS builder

# Copiar código fonte
COPY . .

# Gerar Prisma Client
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
RUN npx prisma generate || echo "Prisma generate falhou, será tentado no runtime"

# Build da aplicação
ENV NODE_ENV=production
RUN npm run build

# NÃO remover dev dependencies - necessárias para Prisma migrations em produção
# RUN npm ci --only=production && npm cache clean --force

# ==================================
# STAGE 5: PRODUCTION (Imagem final de produção)
# ==================================
FROM base AS production

# Variáveis de ambiente para produção
ENV NODE_ENV=production
ENV PORT=3000
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# Copiar tudo do builder (incluindo node_modules completo)
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/package-lock.json ./package-lock.json

# Usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Health check para produção
HEALTHCHECK --interval=60s --timeout=15s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/api/health || exit 1

# Comando de execução para produção
# Next.js standalone usa `process.env.HOSTNAME` para bind; em containers isso costuma ser o ID do container,
# o que quebra o healthcheck via `localhost`. Forçamos bind em 0.0.0.0.
CMD ["dumb-init", "sh", "-c", "echo '🔧 Inicializando banco...' && npx prisma db push && (npx prisma db seed || echo '⚠️ Seed falhou') && echo '🚀 Iniciando app...' && HOSTNAME=0.0.0.0 node server.js"]
