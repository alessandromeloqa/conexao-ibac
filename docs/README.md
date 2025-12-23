# Documentação - Conexão IBAC

## Índice de Documentos

### 📋 Especificação
- [ESPECIFICACAO_TECNICA.md](ESPECIFICACAO_TECNICA.md) - Especificação técnica completa do sistema

### 🗄️ Banco de Dados
- [MIGRACOES.sql](MIGRACOES.sql) - Scripts SQL de migração e setup

### 📊 Diagramas
- [DIAGRAMAS.md](DIAGRAMAS.md) - Diagramas de arquitetura, ER e fluxos

### 🚀 Deploy
- [DEPLOY.md](DEPLOY.md) - Instruções completas de deploy (Docker e manual)

### ✅ Aceite
- [CHECKLIST_ACEITE.md](CHECKLIST_ACEITE.md) - Checklist completo para aceite do sistema

## Documentação Adicional (Raiz)

### Funcionalidades
- [README.md](../README.md) - Visão geral e quick start
- [OFFLINE.md](../OFFLINE.md) - Modo offline e sincronização
- [RANKING.md](../RANKING.md) - Painel público de ranking
- [CRITERIOS.md](../CRITERIOS.md) - Critérios dinâmicos
- [VALIDACAO.md](../VALIDACAO.md) - Validações obrigatórias

### Arquitetura
- [ARQUITETURA.md](../ARQUITETURA.md) - Arquitetura, performance e segurança
- [TESTES.md](../TESTES.md) - Testes automatizados

## Estrutura do Projeto

```
conexao-ibac/
├── docs/                          # Documentação técnica
│   ├── ESPECIFICACAO_TECNICA.md
│   ├── MIGRACOES.sql
│   ├── DIAGRAMAS.md
│   ├── DEPLOY.md
│   └── CHECKLIST_ACEITE.md
│
├── backend/                       # API Node.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── db.js
│   │   └── server.js
│   ├── tests/                     # Testes automatizados
│   └── package.json
│
├── frontend/                      # Interface web
│   ├── index.html                 # Histórico
│   ├── comparativo.html
│   ├── certificados.html
│   ├── avaliacao.html             # Offline-first
│   ├── ranking.html               # Painel público
│   ├── admin-criterios.html
│   ├── styles.css
│   ├── ranking.css
│   ├── sw.js                      # Service Worker
│   ├── offline.js                 # IndexedDB
│   └── manifest.json              # PWA
│
├── database/                      # Scripts SQL
│   ├── schema.sql
│   └── seed.sql
│
├── docker-compose.yml             # Orquestração
├── .gitignore
└── README.md

```

## Guia Rápido

### Para Desenvolvedores
1. Leia [ESPECIFICACAO_TECNICA.md](ESPECIFICACAO_TECNICA.md)
2. Execute [MIGRACOES.sql](MIGRACOES.sql)
3. Siga [DEPLOY.md](DEPLOY.md) para ambiente local
4. Execute testes: `npm test`

### Para QA
1. Use [CHECKLIST_ACEITE.md](CHECKLIST_ACEITE.md)
2. Consulte [TESTES.md](../TESTES.md) para casos de teste
3. Verifique [DIAGRAMAS.md](DIAGRAMAS.md) para fluxos

### Para DevOps
1. Siga [DEPLOY.md](DEPLOY.md) seção produção
2. Configure backup automático
3. Configure monitoramento
4. Revise [ARQUITETURA.md](../ARQUITETURA.md)

### Para Product Owner
1. Revise [README.md](../README.md) para visão geral
2. Use [CHECKLIST_ACEITE.md](CHECKLIST_ACEITE.md) para aceite
3. Consulte funcionalidades específicas nos docs da raiz

## Contato

- **Desenvolvedor**: Alessandro Melo
- **E-mail**: [1986.alessandro@gmail.com](mailto:1986.alessandro@gmail.com)
- **Repositório**: https://github.com/seu-usuario/conexao-ibac
- **Issues**: https://github.com/seu-usuario/conexao-ibac/issues

## Licença

MIT License - Ver arquivo LICENSE na raiz do projeto
