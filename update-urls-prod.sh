#!/bin/bash
# Script para atualizar URLs de desenvolvimento para produção

DOMAIN="conexao.ibacvsj.com.br"

echo "🔄 Atualizando URLs para produção..."

# Atualizar arquivos JavaScript
find frontend -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i "s|http://localhost:3001/api|https://${DOMAIN}/api|g" {} +
find frontend -type f \( -name "*.js" -o -name "*.html" \) -exec sed -i "s|http://localhost:3000/api|https://${DOMAIN}/api|g" {} +

echo "✅ URLs atualizadas para https://${DOMAIN}/api"

# Listar arquivos alterados
echo ""
echo "📝 Arquivos atualizados:"
grep -r "https://${DOMAIN}/api" frontend --include="*.js" --include="*.html" -l

echo ""
echo "✅ Pronto para produção!"
