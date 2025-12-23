#!/bin/bash

#############################################
# Conexão IBAC - Backup Manual
#############################################

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Carrega variáveis
if [ -f .env.prod ]; then
    export $(cat .env.prod | grep -v '^#' | xargs)
fi

DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-conexao_ibac_prod}

echo "Criando backup..."

# Backup do banco
if docker ps | grep -q conexao-postgres-prod; then
    docker exec conexao-postgres-prod pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_DIR/db_manual_${TIMESTAMP}.sql"
    echo "✓ Backup do banco: $BACKUP_DIR/db_manual_${TIMESTAMP}.sql"
else
    echo "✗ Container do banco não está rodando"
    exit 1
fi

# Backup do volume
if docker volume ls | grep -q postgres_prod_data; then
    docker run --rm -v postgres_prod_data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/volume_manual_${TIMESTAMP}.tar.gz -C /data .
    echo "✓ Backup do volume: $BACKUP_DIR/volume_manual_${TIMESTAMP}.tar.gz"
fi

# Compacta tudo
tar czf "$BACKUP_DIR/full_backup_${TIMESTAMP}.tar.gz" -C "$BACKUP_DIR" db_manual_${TIMESTAMP}.sql volume_manual_${TIMESTAMP}.tar.gz 2>/dev/null || true

echo ""
echo "Backup completo criado: $BACKUP_DIR/full_backup_${TIMESTAMP}.tar.gz"
echo ""
echo "Backups disponíveis:"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "Nenhum backup encontrado"
