#!/bin/bash
# Script para atualizar versão automaticamente

# Obter hash do commit
COMMIT_HASH=$(git rev-parse --short HEAD)

# Obter data do commit
COMMIT_DATE=$(git log -1 --format=%cd --date=short)

# Obter tag ou usar 1.0.0
VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "1.0.0")

# Criar version.json
cat > frontend/version.json << EOF
{
  "version": "${VERSION}",
  "build": "${COMMIT_HASH}",
  "date": "${COMMIT_DATE}"
}
EOF

echo "Versão atualizada: ${VERSION} (${COMMIT_HASH})"
