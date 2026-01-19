# 📘 AMAZON Q – GUIDELINES OFICIAIS DO PROJETO
## Conexão IBAC – Sistema de Avaliação Homilética

⚠️ **DOCUMENTO DE AUTORIDADE MÁXIMA DO PROJETO**

Este arquivo define padrões obrigatórios de **desenvolvimento, arquitetura, performance, segurança, UX, versionamento e evolução tecnológica** que **DEVEM ser seguidos** pelo Amazon Q em qualquer alteração no projeto Conexão IBAC.

> ❌ Nenhuma modificação pode ignorar este documento  
> ✅ Em caso de conflito, ESTE DOCUMENTO PREVALECE  

---

## 🎯 CONTEXTO DO PROJETO

- **Projeto:** Conexão IBAC  
- **Objetivo:** Sistema de avaliação homilética com:
  - Critérios dinâmicos versionados por evento
  - Proteção de dados históricos
  - API pública e administrativa
  - Interface administrativa
- **Versão atual no Git (única existente):** `v1.0.0`
- **Status:** Estável e funcional

---

## 🧱 STACK TECNOLÓGICA (ATUAL E MODERNA)

### Backend (MODERNO E ADEQUADO)
- **Node.js (LTS)** ✅
- **Express** ✅ (ainda moderno para APIs REST)
- **PostgreSQL** ✅
- **Materialized Views** ✅
- **SQL parametrizado** ✅

> ✔️ Stack backend é moderna, segura e amplamente usada em produção  
> ❌ Não há necessidade de migrar para framework pesado (NestJS) neste momento

---

### Frontend (SIMPLES, MODERNO E CORRETO)
- **HTML5** ✅
- **CSS3 (Grid + Flexbox)** ✅
- **JavaScript Vanilla (ES6+)** ✅
- **Chart.js** ✅

> ✔️ Vanilla JS é totalmente aceitável para este escopo  
> ⚠️ Frameworks como React/Vue **não são obrigatórios** agora

---

### Infraestrutura (MODERNA)
- **Docker**
- **Docker Compose**
- Ambientes separados (dev / prod)

---

## 📁 ARQUITETURA E ORGANIZAÇÃO

### Estrutura Backend

backend/
├── src/
│ ├── controllers/ # Entrada HTTP
│ ├── routes/ # Endpoints
│ ├── services/ # Regras reutilizáveis
│ ├── middleware/ # Validação e segurança
│ ├── db.js # Pool PostgreSQL
│ └── server.js # Bootstrap Express


### Regras de Arquitetura
- Controllers **não** concentram regra de negócio
- Services concentram regras
- Middleware valida e protege
- Routes apenas mapeiam

---

## 🧠 PRINCÍPIOS DE DESENVOLVIMENTO

Obrigatório aplicar:
- SOLID
- DRY
- KISS
- Separation of Concerns
- Código simples > código complexo

---

## ⚡ PERFORMANCE

- Queries devem responder em **< 100ms**
- Uso obrigatório de **Materialized Views**
- Refresh sempre com:
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY


Índices obrigatórios

Evitar processamento no frontend

Nunca recalcular médias no JavaScript

🛢️ BANCO DE DADOS

Queries sempre parametrizadas

Proibido SELECT *

Constraints para evitar duplicidade

Dados históricos são imutáveis

🔐 SEGURANÇA

Obrigatório:

Proteção contra SQL Injection

Validação e sanitização de entrada

CORS configurado corretamente

Eventos encerrados:

Somente leitura

Nunca alteráveis

⚠️ Segurança sempre tem prioridade sobre performance.

📊 PADRÕES DE API

RESTful

Verbos HTTP corretos

Responses padronizados

{
  "success": false,
  "message": "Evento não encontrado"
}

🎨 UX / UI (FULLSTACK + UX)

Mobile-first

Layout responsivo

Hierarquia visual clara

Feedback visual de erro/sucesso

Interface administrativa simples e intuitiva

🔢 VERSIONAMENTO SEMÂNTICO (SEMVER)
Versão Base do Projeto

v1.0.0 — única versão existente no Git

Padrão
MAJOR.MINOR.PATCH

Tipo	Uso
MAJOR	Quebra de compatibilidade
MINOR	Nova funcionalidade
PATCH	Bugfix / melhoria

📌 Na dúvida, usar PATCH.

Exemplos

Bugfix → v1.0.1

Nova funcionalidade → v1.1.0

Breaking change → v2.0.0

🏷️ GIT TAGS (OBRIGATÓRIO)

Toda versão deve gerar tag:

git tag v1.0.1
git push origin v1.0.1


❌ Deploy sem tag é proibido.

📝 CHANGELOG (OBRIGATÓRIO)
## v1.0.1 - YYYY-MM-DD
### Fixed
- Correção de bug X

### Improved
- Otimização de query Y

🔄 REFATORAÇÃO E EVOLUÇÃO TECNOLÓGICA
Permitido

Refatorações internas

Melhorias de performance

Organização de código

Evolução incremental

Proibido sem justificativa

Trocar stack sem necessidade

Introduzir frameworks pesados

Breaking changes desnecessários

📈 VISÃO DE FUTURO (NÃO BLOQUEAR)

Autenticação JWT

Exportação PDF

Comparação entre pregadores

Ranking público

Multi-igrejas