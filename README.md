# 🎯 Conexão IBAC - Sistema de Avaliação Homilética

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Sistema moderno de avaliação homilética com histórico completo de desempenho, arquitetura limpa e design mobile-first.

## ✨ Novidades v1.1.0

🚀 **Arquitetura Moderna** - Service Layer (SOLID, DRY, KISS)  
📱 **Mobile-First** - Design responsivo otimizado  
🎨 **Design System** - CSS Variables para consistência  
⚡ **Performance** - Queries paralelas e otimizadas  
🔐 **Segurança** - Validação robusta e sanitização  

📚 **[Ver documentação completa →](INDICE_NAVEGACAO_V1.1.0.md)**

## 🚀 Quick Start

### Desenvolvimento
```bash
docker-compose -f docker-compose.dev.yml up -d
```
Acesse: http://localhost:8081

### Produção (Ubuntu)
```bash
sudo ./install.sh
```
Acesse: https://seudominio.com

## 📋 Ambientes

### Dev (Local)
- Frontend: http://localhost:8081
- API: http://localhost:3001
- Banco: localhost:5433

### Prod (Servidor)
- Frontend: https://seudominio.com
- API: https://seudominio.com/api
- Banco: localhost:5432 (interno)

## 📚 Documentação

- [AMBIENTES.md](AMBIENTES.md) - Guia completo dev/prod
- [docs/](docs/) - Documentação técnica completa
- [DEPLOY.md](docs/DEPLOY.md) - Instruções de deploy

## ✨ Funcionalidades

✅ Listagem de todos os eventos do pregador  
✅ Média final por evento  
✅ Média por critério  
✅ Ranking obtido em cada evento  
✅ Total de avaliações recebidas  
✅ Gráfico de evolução temporal  
✅ Tabela detalhada por evento  
✅ Dados somente leitura (eventos antigos protegidos)  

## Tecnologias

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: HTML5 + CSS3 + JavaScript + Chart.js
- **Database**: PostgreSQL com Materialized Views
- **Container**: Docker + Docker Compose

## Instalação

### Com Docker (Recomendado)

```bash
docker-compose up -d
```

Acesse:
- Frontend: http://localhost:8080
- API: http://localhost:3000

### Manual

1. **Database**
```bash
psql -U postgres -f database/schema.sql
```

2. **Backend**
```bash
cd backend
npm install
cp .env.example .env
npm start
```

3. **Frontend**
Abra `frontend/index.html` no navegador

## API Endpoints

### GET /api/pregador/:pregadorId/historico
Retorna histórico completo do pregador

**Response:**
```json
{
  "eventos": [...],
  "criterios": [...],
  "resumo": {
    "total_eventos": 5,
    "media_geral_historica": 8.5,
    "total_avaliacoes": 25
  }
}
```

### GET /api/pregador/:pregadorId/evolucao
Retorna dados para gráfico de evolução

### POST /api/historico/refresh
Atualiza as materialized views (executar após novos eventos)

## Performance

- **Materialized Views**: Cache de dados agregados
- **Índices otimizados**: Queries < 50ms
- **Concurrent Refresh**: Atualização sem bloqueio

## Segurança

✅ Dados somente leitura  
✅ Eventos encerrados não podem ser alterados  
✅ Queries parametrizadas (SQL Injection protection)  
✅ CORS configurado  

## Próximos Passos

- Adicionar autenticação JWT
- Exportar PDF do histórico
- Comparação entre pregadores
- Filtros por período

## 👨‍💻 Desenvolvedor

**Alessandro Melo**  
📧 E-mail: [1986.alessandro@gmail.com](mailto:1986.alessandro@gmail.com)

## 📄 Licença

MIT License - Ver arquivo LICENSE na raiz do projeto
