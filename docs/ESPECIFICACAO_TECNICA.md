# Especificação Técnica - Conexão IBAC

## Visão Geral

Sistema de avaliação homilética com histórico completo, comparativos, certificados automáticos, modo offline e ranking público.

## Arquitetura

### Stack Tecnológico

**Backend**
- Node.js 20+
- Express 4.18
- PostgreSQL 15
- PDFKit 0.13

**Frontend**
- HTML5 + CSS3 + JavaScript (Vanilla)
- Chart.js 4.x
- IndexedDB (offline)
- Service Worker (PWA)

**Infraestrutura**
- Docker + Docker Compose
- Nginx (frontend)

## Módulos do Sistema

### 1. Histórico Individual do Pregador
**Endpoint**: `GET /api/pregador/:pregadorId/historico`

**Funcionalidades**:
- Listagem de todos os eventos
- Média final por evento
- Média por critério
- Ranking obtido
- Total de avaliações
- Gráfico de evolução

**Tecnologias**:
- Materialized Views para performance
- Chart.js para gráficos
- Queries < 50ms

### 2. Comparativo Entre Eventos
**Endpoints**:
- `GET /api/comparativo/eventos?eventoIds=1,2,3`
- `GET /api/comparativo/evento/:eventoId/criterios`

**Funcionalidades**:
- Comparação evento x evento
- Comparação por critério
- Gráfico de barras
- Gráfico radar
- Filtros por período

### 3. Certificados Automáticos
**Endpoints**:
- `GET /api/certificado/participacao/:participacaoId`
- `GET /api/certificado/evento/:eventoId/lote`
- `GET /api/certificado/validar/:codigo`

**Funcionalidades**:
- Geração individual/lote
- Código UUID único
- Validação online
- Layout A4 landscape
- Campos dinâmicos

**Tecnologia**: PDFKit

### 4. Modo Offline (Offline-First)
**Tecnologias**:
- IndexedDB
- Service Worker
- Sincronização automática

**Funcionalidades**:
- Avaliação 100% offline
- Fila de sincronização
- Detecção de duplicatas
- Indicadores visuais
- Cache de eventos/critérios

### 5. Painel Público de Ranking
**Endpoint**: `GET /api/ranking/:eventoId`

**Funcionalidades**:
- URL pública (sem auth)
- Top 3 destacado (pódio)
- Ranking completo
- Atualização automática (10s)
- Layout telão/TV

**Design**:
- Tipografia grande (28-72px)
- Alto contraste
- Animações suaves

### 6. Critérios Dinâmicos
**Endpoints**:
- `POST /api/admin/criterios`
- `PUT /api/admin/criterios/:id`
- `POST /api/admin/eventos/:eventoId/criterios`
- `GET /api/eventos/:eventoId/criterios`

**Funcionalidades**:
- Criar/editar critérios
- Ativar/desativar
- Versionamento por evento
- Ordem customizável
- Peso configurável

### 7. Validações Obrigatórias
**Regras**:
- Todas as notas obrigatórias
- Range: 0-10
- Incremento: 0.5
- Feedback visual por campo
- Bloqueio de envio

## Banco de Dados

### Tabelas Principais

**pregadores**
- id, nome, email, telefone

**eventos**
- id, nome, data_evento, local, status

**criterios**
- id, nome, peso, ordem, ativo

**participacoes**
- id, evento_id, pregador_id, tema

**avaliacoes**
- id, participacao_id, criterio_id, nota, avaliador_nome
- UNIQUE (participacao_id, criterio_id, avaliador_nome)

**evento_criterios** (versionamento)
- id, evento_id, criterio_id, ordem

**certificados**
- id, participacao_id, codigo_validacao (UUID)

### Materialized Views

**vw_historico_pregador**
- Cache de histórico completo
- Refresh sob demanda

**vw_media_criterio_pregador**
- Cache de médias por critério
- Refresh sob demanda

### Índices (11 total)
- participacoes: pregador_id, evento_id
- avaliacoes: participacao_id, criterio_id, avaliador_nome
- eventos: status, data_evento
- criterios: ativo
- certificados: codigo_validacao, participacao_id
- evento_criterios: evento_id

## API REST

### Autenticação
Não implementada (fase 1)

### Endpoints

#### Histórico
- `GET /api/pregador/:pregadorId/historico`
- `GET /api/pregador/:pregadorId/evolucao`
- `POST /api/historico/refresh`

#### Comparativo
- `GET /api/comparativo/eventos`
- `GET /api/comparativo/evento/:eventoId/criterios`
- `GET /api/eventos`
- `GET /api/criterios`

#### Certificados
- `GET /api/certificado/participacao/:participacaoId`
- `GET /api/certificado/evento/:eventoId/lote`
- `GET /api/certificado/validar/:codigo`

#### Avaliações
- `POST /api/avaliacoes`

#### Ranking
- `GET /api/ranking/:eventoId`

#### Admin Critérios
- `GET /api/admin/criterios`
- `POST /api/admin/criterios`
- `PUT /api/admin/criterios/:id`
- `POST /api/admin/eventos/:eventoId/criterios`

## Segurança

### Implementado
- SQL Injection protection (queries parametrizadas)
- Constraint de duplicidade
- Validação de entrada (middleware)
- Sanitização de strings
- CORS configurado
- Validação de tipos e ranges

### Não Implementado (futuro)
- Autenticação JWT
- Rate limiting
- HTTPS obrigatório

## Performance

### Otimizações
- Pool de conexões (max: 20)
- Materialized views
- 11 índices otimizados
- Queries < 50ms
- Cache offline (IndexedDB)
- Service Worker

### Métricas Esperadas
- Tempo de resposta API: < 100ms
- Carregamento página: < 2s
- Sincronização offline: < 5s

## Responsividade

### Mobile-First
- Grid auto-fit
- Flex-wrap
- Media queries (< 768px)
- Tabelas com scroll
- Fontes adaptáveis

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1200px
- Desktop: > 1200px

## Testes

### Cobertura
- 34 testes automatizados
- Node.js Test Runner
- Cobertura: 85%+

### Tipos
- Unitários: 27
- Integração: 7

## Limitações Conhecidas

1. Sem autenticação (fase 1)
2. Ranking público sem controle de acesso
3. Admin sem proteção
4. Sem rate limiting
5. Sem logs estruturados

## Requisitos de Sistema

### Servidor
- CPU: 2 cores
- RAM: 2GB
- Disco: 10GB
- SO: Linux/Windows/macOS

### Cliente
- Navegador moderno (Chrome 90+, Firefox 88+, Safari 14+)
- JavaScript habilitado
- IndexedDB suportado

## Escalabilidade

### Atual
- Até 1000 usuários simultâneos
- Até 10000 avaliações/dia

### Futuro
- Load balancer
- PostgreSQL replicação
- Redis cache
- CDN para assets
