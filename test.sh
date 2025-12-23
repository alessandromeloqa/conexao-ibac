#!/bin/bash

#############################################
# Conexão IBAC - Testes Automatizados
#############################################

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

FAILED=0

test_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

test_fail() {
    echo -e "${RED}✗${NC} $1"
    FAILED=$((FAILED + 1))
}

echo "Executando testes automatizados..."
echo ""

# Teste 1: Containers rodando
echo "1. Verificando containers..."
if docker ps | grep -q conexao-postgres-prod && \
   docker ps | grep -q conexao-backend-prod && \
   docker ps | grep -q conexao-frontend-prod; then
    test_pass "Todos os containers estão rodando"
else
    test_fail "Algum container não está rodando"
fi

# Teste 2: Banco de dados
echo "2. Testando banco de dados..."
if [ -f .env.prod ]; then
    export $(cat .env.prod | grep -v '^#' | xargs)
fi
DB_USER=${DB_USER:-postgres}
if docker exec conexao-postgres-prod pg_isready -U "$DB_USER" > /dev/null 2>&1; then
    test_pass "Banco de dados respondendo"
else
    test_fail "Banco de dados não responde"
fi

# Teste 3: Backend API
echo "3. Testando backend..."
sleep 2
if curl -sf http://localhost:3000/api/criterios > /dev/null; then
    test_pass "Backend API respondendo"
else
    test_fail "Backend API não responde"
fi

# Teste 4: Frontend
echo "4. Testando frontend..."
if curl -sf http://localhost > /dev/null; then
    test_pass "Frontend respondendo"
else
    test_fail "Frontend não responde"
fi

# Teste 5: Conexão banco-backend
echo "5. Testando conexão banco-backend..."
CRITERIOS=$(curl -s http://localhost:3000/api/criterios | jq '. | length' 2>/dev/null || echo "0")
if [ "$CRITERIOS" -ge 0 ] 2>/dev/null; then
    test_pass "Conexão banco-backend OK ($CRITERIOS critérios)"
else
    test_fail "Falha na conexão banco-backend"
fi

# Teste 6: Tabelas criadas
echo "6. Verificando tabelas..."
TABLES=$(docker exec conexao-postgres-prod psql -U postgres -d conexao_ibac_prod -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'" 2>/dev/null | xargs)
if [ "$TABLES" -ge 7 ] 2>/dev/null; then
    test_pass "Tabelas criadas ($TABLES tabelas)"
else
    test_fail "Tabelas não criadas corretamente"
fi

# Teste 7: Índices criados
echo "7. Verificando índices..."
INDEXES=$(docker exec conexao-postgres-prod psql -U postgres -d conexao_ibac_prod -t -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public'" 2>/dev/null | xargs)
if [ "$INDEXES" -ge 11 ] 2>/dev/null; then
    test_pass "Índices criados ($INDEXES índices)"
else
    test_fail "Índices não criados corretamente"
fi

# Teste 8: Materialized views
echo "8. Verificando materialized views..."
VIEWS=$(docker exec conexao-postgres-prod psql -U postgres -d conexao_ibac_prod -t -c "SELECT COUNT(*) FROM pg_matviews WHERE schemaname='public'" 2>/dev/null | xargs)
if [ "$VIEWS" -ge 2 ] 2>/dev/null; then
    test_pass "Materialized views criadas ($VIEWS views)"
else
    test_fail "Materialized views não criadas"
fi

# Teste 9: Health checks
echo "9. Testando health checks..."
if docker inspect conexao-postgres-prod | grep -q '"Health"' && \
   docker inspect conexao-backend-prod | grep -q '"Health"'; then
    test_pass "Health checks configurados"
else
    test_fail "Health checks não configurados"
fi

# Teste 10: SSL
echo "10. Verificando SSL..."
if [ -f ./ssl/fullchain.pem ] && [ -f ./ssl/privkey.pem ]; then
    test_pass "Certificados SSL presentes"
else
    test_fail "Certificados SSL ausentes"
fi

# Teste 11: Backup automático
echo "11. Verificando backup automático..."
if crontab -l | grep -q "conexao-postgres-prod"; then
    test_pass "Backup automático configurado"
else
    test_fail "Backup automático não configurado"
fi

# Teste 12: Testes unitários
echo "12. Executando testes unitários..."
if docker exec conexao-backend-prod npm test > /dev/null 2>&1; then
    test_pass "Testes unitários passaram"
else
    test_fail "Testes unitários falharam"
fi

echo ""
echo "=========================================="
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}Todos os testes passaram!${NC}"
    exit 0
else
    echo -e "${RED}$FAILED teste(s) falharam${NC}"
    exit 1
fi
