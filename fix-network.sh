#!/bin/bash

echo "🔧 Corrigindo rede Docker..."

# Para todos os containers que usam a rede
echo "Parando containers..."
docker-compose -f docker-compose.prod.yml down

# Remove a rede existente
echo "Removendo rede antiga..."
docker network rm simuladores_network_prod 2>/dev/null || true

# Recria a rede
echo "Criando nova rede..."
docker network create simuladores_network_prod

echo "✅ Rede corrigida! Agora você pode executar:"
echo "   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d"
