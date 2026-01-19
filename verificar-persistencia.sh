#!/bin/bash

# Script de Verificação de Persistência de Dados
# Conexão IBAC - Sistema de Avaliação Homilética

echo "🔍 Verificando Persistência de Dados - Conexão IBAC"
echo "=================================================="
echo ""

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando!"
    exit 1
fi

echo "✅ Docker está rodando"
echo ""

# Verificar volumes
echo "📦 Volumes Docker:"
echo "-------------------"
docker volume ls | grep conexao || echo "⚠️  Nenhum volume encontrado"
echo ""

# Verificar containers
echo "🐳 Containers Ativos:"
echo "---------------------"
docker ps --filter "name=conexao" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || echo "⚠️  Nenhum container ativo"
echo ""

# Verificar volume dev
if docker volume inspect conexao-ibac_postgres_dev_data > /dev/null 2>&1; then
    echo "✅ Volume DEV existe: conexao-ibac_postgres_dev_data"
    VOLUME_DEV_SIZE=$(docker volume inspect conexao-ibac_postgres_dev_data --format '{{.Mountpoint}}' | xargs du -sh 2>/dev/null | cut -f1)
    echo "   Tamanho: ${VOLUME_DEV_SIZE:-N/A}"
else
    echo "⚠️  Volume DEV não encontrado"
fi
echo ""

# Verificar volume prod
if docker volume inspect conexao-ibac_postgres_prod_data > /dev/null 2>&1; then
    echo "✅ Volume PROD existe: conexao-ibac_postgres_prod_data"
    VOLUME_PROD_SIZE=$(docker volume inspect conexao-ibac_postgres_prod_data --format '{{.Mountpoint}}' | xargs du -sh 2>/dev/null | cut -f1)
    echo "   Tamanho: ${VOLUME_PROD_SIZE:-N/A}"
else
    echo "⚠️  Volume PROD não encontrado"
fi
echo ""

# Verificar dados no PostgreSQL Dev
if docker ps --filter "name=conexao-postgres-dev" --format "{{.Names}}" | grep -q "conexao-postgres-dev"; then
    echo "📊 Dados no PostgreSQL DEV:"
    echo "---------------------------"
    
    PREGADORES=$(docker exec conexao-postgres-dev psql -U postgres -d conexao_ibac_dev -t -c "SELECT COUNT(*) FROM pregadores;" 2>/dev/null | xargs)
    EVENTOS=$(docker exec conexao-postgres-dev psql -U postgres -d conexao_ibac_dev -t -c "SELECT COUNT(*) FROM eventos;" 2>/dev/null | xargs)
    AVALIACOES=$(docker exec conexao-postgres-dev psql -U postgres -d conexao_ibac_dev -t -c "SELECT COUNT(*) FROM avaliacoes;" 2>/dev/null | xargs)
    CRITERIOS=$(docker exec conexao-postgres-dev psql -U postgres -d conexao_ibac_dev -t -c "SELECT COUNT(*) FROM criterios;" 2>/dev/null | xargs)
    
    echo "   Pregadores: ${PREGADORES:-0}"
    echo "   Eventos: ${EVENTOS:-0}"
    echo "   Critérios: ${CRITERIOS:-0}"
    echo "   Avaliações: ${AVALIACOES:-0}"
else
    echo "⚠️  Container PostgreSQL DEV não está rodando"
fi
echo ""

# Verificar dados no PostgreSQL Prod
if docker ps --filter "name=conexao-postgres-prod" --format "{{.Names}}" | grep -q "conexao-postgres-prod"; then
    echo "📊 Dados no PostgreSQL PROD:"
    echo "----------------------------"
    
    PREGADORES=$(docker exec conexao-postgres-prod psql -U postgres -d conexao_ibac_prod -t -c "SELECT COUNT(*) FROM pregadores;" 2>/dev/null | xargs)
    EVENTOS=$(docker exec conexao-postgres-prod psql -U postgres -d conexao_ibac_prod -t -c "SELECT COUNT(*) FROM eventos;" 2>/dev/null | xargs)
    AVALIACOES=$(docker exec conexao-postgres-prod psql -U postgres -d conexao_ibac_prod -t -c "SELECT COUNT(*) FROM avaliacoes;" 2>/dev/null | xargs)
    CRITERIOS=$(docker exec conexao-postgres-prod psql -U postgres -d conexao_ibac_prod -t -c "SELECT COUNT(*) FROM criterios;" 2>/dev/null | xargs)
    
    echo "   Pregadores: ${PREGADORES:-0}"
    echo "   Eventos: ${EVENTOS:-0}"
    echo "   Critérios: ${CRITERIOS:-0}"
    echo "   Avaliações: ${AVALIACOES:-0}"
else
    echo "⚠️  Container PostgreSQL PROD não está rodando"
fi
echo ""

echo "=================================================="
echo "✅ Verificação concluída!"
echo ""
echo "💡 Dicas:"
echo "   - Volumes nomeados persistem dados automaticamente"
echo "   - Use 'docker-compose down' (SEM -v) para manter dados"
echo "   - Use './backup.sh' para backup manual"
echo ""
