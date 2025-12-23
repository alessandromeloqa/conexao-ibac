# Diagramas - Conexão IBAC

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Histórico│  │Comparativo│  │Certificado│  │ Ranking  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │              │          │
│  ┌────┴─────────────┴──────────────┴──────────────┴─────┐  │
│  │              Service Worker (PWA)                      │  │
│  │              IndexedDB (Offline)                       │  │
│  └────────────────────────────┬───────────────────────────┘  │
└───────────────────────────────┼──────────────────────────────┘
                                │ HTTP/REST
┌───────────────────────────────┼──────────────────────────────┐
│                         BACKEND (Node.js)                     │
│  ┌────────────────────────────┴───────────────────────────┐  │
│  │                    Express Server                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │Middleware│  │Controllers│  │ Services │            │  │
│  │  │Validation│  │  (Logic)  │  │   (PDF)  │            │  │
│  │  └──────────┘  └──────────┘  └──────────┘            │  │
│  └────────────────────────────┬───────────────────────────┘  │
└───────────────────────────────┼──────────────────────────────┘
                                │ SQL
┌───────────────────────────────┼──────────────────────────────┐
│                      DATABASE (PostgreSQL)                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Tables: pregadores, eventos, criterios, avaliacoes     │ │
│  │  Materialized Views: vw_historico, vw_media_criterio    │ │
│  │  Indexes: 11 índices otimizados                         │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

## Diagrama de Banco de Dados (ER)

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  pregadores │         │   eventos   │         │  criterios  │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)     │         │ id (PK)     │
│ nome        │         │ nome        │         │ nome        │
│ email       │         │ data_evento │         │ peso        │
│ telefone    │         │ local       │         │ ordem       │
└──────┬──────┘         │ status      │         │ ativo       │
       │                └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │                       │                       │
       │         ┌─────────────┴─────────────┐        │
       │         │                           │        │
       └────────►│     participacoes         │◄───────┘
                 ├───────────────────────────┤        │
                 │ id (PK)                   │        │
                 │ evento_id (FK)            │        │
                 │ pregador_id (FK)          │        │
                 │ tema                      │        │
                 └──────┬────────────────────┘        │
                        │                             │
                        │                             │
                        │         ┌───────────────────┘
                        │         │
                        └────────►│     avaliacoes
                                  ├─────────────────────
                                  │ id (PK)
                                  │ participacao_id (FK)
                                  │ criterio_id (FK)
                                  │ nota
                                  │ avaliador_nome
                                  └─────────────────────

┌─────────────┐         ┌─────────────────────┐
│   eventos   │         │  evento_criterios   │
│             │◄────────┤  (versionamento)    │
└─────────────┘         ├─────────────────────┤
                        │ id (PK)             │
┌─────────────┐         │ evento_id (FK)      │
│  criterios  │◄────────┤ criterio_id (FK)    │
└─────────────┘         │ ordem               │
                        └─────────────────────┘

┌─────────────┐         ┌─────────────────────┐
│participacoes│         │   certificados      │
│             │◄────────┤                     │
└─────────────┘         ├─────────────────────┤
                        │ id (PK)             │
                        │ participacao_id (FK)│
                        │ codigo_validacao    │
                        └─────────────────────┘
```

## Fluxo de Avaliação Offline → Online

```
┌──────────────┐
│   USUÁRIO    │
└──────┬───────┘
       │ 1. Preenche avaliação
       ▼
┌──────────────────────┐
│   FRONTEND (PWA)     │
│  ┌────────────────┐  │
│  │ Validação JS   │  │ 2. Valida campos
│  └────────┬───────┘  │
│           │          │
│  ┌────────▼───────┐  │
│  │  IndexedDB     │  │ 3. Salva local (synced: false)
│  └────────┬───────┘  │
└───────────┼──────────┘
            │
            │ 4. Detecta conexão online
            ▼
┌───────────────────────┐
│  Sincronização Auto   │ 5. Envia fila pendente
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│   BACKEND (API)       │
│  ┌────────────────┐   │
│  │ Middleware     │   │ 6. Valida novamente
│  └────────┬───────┘   │
│           │           │
│  ┌────────▼───────┐   │
│  │ Controller     │   │ 7. Verifica duplicata
│  └────────┬───────┘   │
└───────────┼───────────┘
            │
            ▼
┌───────────────────────┐
│   PostgreSQL          │ 8. INSERT com constraint
└───────────┬───────────┘
            │
            │ 9. Sucesso (201)
            ▼
┌───────────────────────┐
│   IndexedDB           │ 10. Marca synced: true
└───────────────────────┘
```

## Fluxo de Geração de Certificado

```
┌──────────────┐
│    ADMIN     │
└──────┬───────┘
       │ 1. Seleciona participação
       ▼
┌──────────────────────────────┐
│  GET /api/certificado/:id    │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Controller                  │
│  1. Verifica evento encerrado│
│  2. Busca dados participação │
│  3. Gera/busca UUID          │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  PDFService                  │
│  1. Cria documento A4        │
│  2. Adiciona bordas          │
│  3. Preenche dados           │
│  4. Adiciona UUID            │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Response (application/pdf)  │
└──────────────────────────────┘
```

## Fluxo de Critérios Dinâmicos

```
┌──────────────┐
│    ADMIN     │
└──────┬───────┘
       │ 1. Cria critério
       ▼
┌──────────────────────────────┐
│  POST /api/admin/criterios   │
│  { nome, peso, ordem }       │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  INSERT INTO criterios       │
│  (ativo = true)              │
└──────────┬───────────────────┘
           │
           │ 2. Vincula ao evento
           ▼
┌──────────────────────────────┐
│  POST /api/admin/eventos/    │
│  :id/criterios               │
│  { criterioIds: [1,2,3] }    │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  INSERT INTO evento_criterios│
│  (versionamento)             │
└──────────┬───────────────────┘
           │
           │ 3. Avaliador acessa
           ▼
┌──────────────────────────────┐
│  GET /api/eventos/:id/       │
│  criterios                   │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  SELECT FROM evento_criterios│
│  (critérios específicos)     │
└──────────────────────────────┘
```

## Diagrama de Deploy (Docker)

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Host                          │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │           Docker Compose Network                  │ │
│  │                                                   │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────┐ │ │
│  │  │   Nginx      │  │   Backend    │  │Postgres│ │ │
│  │  │  (Frontend)  │  │   (Node.js)  │  │   DB   │ │ │
│  │  │              │  │              │  │        │ │ │
│  │  │  Port: 8080  │  │  Port: 3000  │  │Port:   │ │ │
│  │  │              │  │              │  │ 5432   │ │ │
│  │  └──────┬───────┘  └──────┬───────┘  └───┬────┘ │ │
│  │         │                 │              │      │ │
│  │         └─────────────────┴──────────────┘      │ │
│  │                    Internal Network             │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  Volumes:                                               │
│  - postgres_data (persistente)                          │
│  - ./frontend (bind mount)                              │
│  - ./backend (bind mount)                               │
└─────────────────────────────────────────────────────────┘
```
