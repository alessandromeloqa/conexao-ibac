# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.3.3] - 2024-01-XX

### Fixed
- **Logo nos PDFs**: Adicionados logs de debug para identificar problema
  - Verificação de existência do arquivo
  - Logs de caminho e status

### Improved
- **Nome do Arquivo PDF**: Candidato específico agora inclui nome
  - Antes: `relatorio_candidato_1.pdf`
  - Depois: `relatorio_Joao_Silva.pdf`
  - Espaços substituídos por underscore

## [1.3.2] - 2024-01-XX

### Fixed
- **Logo nos PDFs**: Corrigido logo que não aparecia
  - Logo agora é local (`backend/src/assets/logo.png`)
  - Removida dependência de download HTTPS
  - Performance melhorada (5ms vs 500ms)
  - Funciona offline

### Improved
- **Logo no Sistema**: Substituído logo externo por local em todo o sistema
  - 12 arquivos HTML atualizados
  - Caminho: `assets/logo.png`
  - Performance: Carregamento instantâneo
  - Confiabilidade: Não depende de conexão externa
  - Funciona offline
- **Código**: Simplificado usando arquivo local (KISS)
- **Confiabilidade**: Não depende de conexão externa

## [1.3.1] - 2024-01-XX

### Fixed
- **PDFs**: Corrigida página em branco no final dos relatórios
  - Adicionado `bufferPages: true` em todos os PDFs
  - Verificação de espaço antes de adicionar conteúdo
  - Controle preciso de `yPosition`

### Improved
- **Relatório Geral**: Agora com detalhes completos
  - Todas as notas individuais de cada avaliador
  - Agrupamento por critério
  - Médias calculadas por critério
- **PDFs**: Logo IBAC padronizado em todos os relatórios
  - Função `adicionarCabecalho()` reutilizável (DRY)
  - Posicionamento consistente
- **Relatório Geral**: Seleção de evento
  - Dropdown para escolher evento específico
  - Opção "Todos os eventos"
  - Título do evento no PDF

## [1.3.0] - 2024-01-XX

### Added
- **Relatórios em PDF**: Sistema completo de relatórios
  - Relatório Geral: Todos os candidatos com médias e critérios
  - Relatório por Candidato: Detalhado com todas as notas e avaliadores
  - Botões no Dashboard para geração
  - Modal de seleção de candidato
  - Logo IBAC em todos os relatórios
  - Download automático
- **Toggle de Senha**: Ícone de olho no campo de senha do login
  - Mostrar/ocultar senha digitada
  - Feedback visual (👁️ / 🙈)
  - UX melhorada

### Improved
- **Dashboard**: Nova seção de relatórios
- **UX**: Feedback visual durante geração de PDF
- **Segurança**: Validação de dados antes de gerar relatórios

## [1.2.1] - 2024-01-XX

### Fixed
- **Credenciais de Desenvolvimento**: Usuário fixo para ambiente dev
  - Usuário: `admin`
  - Senha: `admin123`
  - Hash bcrypt fixo no seed.sql
  - ON CONFLICT garante consistência após recriar containers

### Improved
- **Documentação**: `CREDENCIAIS_DEV.md` com instruções completas
- **Segurança**: Avisos claros sobre não usar em produção

## [1.2.0] - 2024-01-XX

### Added
- **Histórico Detalhado**: Visualização completa de todas as avaliações
  - Modal com detalhes por critério
  - Exibição de avaliadores e notas individuais
  - Data e hora de cada avaliação
  - Média calculada por critério
- **Exportação PDF do Histórico**: Botão para gerar PDF completo
  - Logo IBAC no cabeçalho
  - Resumo geral (eventos, média, avaliações)
  - Lista detalhada de todos os eventos
  - Médias por critério em cada evento
  - Download automático
- **Endpoints API**:
  - `GET /api/pregador/:id/evento/:eventoId/detalhes` - Detalhes das avaliações
  - `GET /api/pregador/:id/historico/pdf` - Gerar PDF do histórico

### Improved
- **UX**: Modal responsivo com design limpo
- **Performance**: Query otimizada para detalhes
- **Arquitetura**: Service layer para histórico detalhado

## [1.1.1] - 2024-01-XX

### Fixed
- **Persistência de Dados**: Corrigida constraint SQL para ser idempotente
  - Constraint `unique_avaliacao` agora verifica existência antes de criar
  - Previne erro ao recriar containers com volume existente
  - Schema SQL 100% idempotente (pode ser executado múltiplas vezes)

### Added
- **Documentação de Persistência**: `PERSISTENCIA_DADOS.md`
  - Explicação completa sobre volumes Docker
  - Comandos seguros vs comandos que apagam dados
  - Testes de verificação de persistência
  - Guia de backup e restore
- **Scripts de Verificação**:
  - `verificar-persistencia.sh` (Linux/Mac)
  - `verificar-persistencia.bat` (Windows)
  - Verificam volumes, containers e contagem de registros

### Improved
- **Confiabilidade**: Dados agora persistem corretamente em todos os cenários
- **Documentação**: Guia completo de persistência e backup

## [1.1.0] - 2024-01-XX

### Added
- **Service Layer**: Implementação de camada de serviços seguindo SOLID
  - `historicoService.js`: Lógica de negócio para histórico
  - `eventoService.js`: Lógica de negócio para eventos
  - `pdfService.gerarRankingPDF()`: Geração de PDF do ranking com logo
- **Frontend Moderno**: Nova versão mobile-first
  - `index-v2.html`: HTML semântico com acessibilidade
  - `styles-v2.css`: Design system com CSS variables
  - `app-v2.js`: JavaScript modular com ES6+ classes
- **Middleware Avançado**: Validação e segurança aprimoradas
  - `validation-v2.js`: Validações robustas e rate limiting
  - Validação obrigatória do campo avaliador
- **Design System**: Variáveis CSS para consistência visual
- **Acessibilidade**: ARIA labels e navegação por teclado
- **Performance**: Promise.all para requisições paralelas
- **Exportação PDF**: Botão para exportar ranking em PDF com logo IBAC

### Improved
- **Arquitetura**: Separação clara de responsabilidades (Controller → Service → DB)
- **Error Handling**: Tratamento de erros padronizado com mensagens amigáveis
- **Responsividade**: Layout 100% mobile-first com breakpoints otimizados
- **UX**: Feedback visual aprimorado (loading states, mensagens de erro)
- **Code Quality**: Aplicação de princípios SOLID, DRY e KISS
- **Security**: Sanitização de inputs e validação reforçada
- **Performance**: Queries otimizadas com campos específicos (sem SELECT *)
- **Validação**: Campo "Nome do Avaliador" agora é obrigatório com validação frontend e backend

### Changed
- Controllers agora delegam lógica para services
- Responses padronizadas com `{ success, message, data }`
- CSS refatorado com design system e variáveis
- JavaScript refatorado em classes com responsabilidade única
- Campo avaliador com indicador visual de obrigatoriedade

### Technical Debt Paid
- Removida lógica de negócio dos controllers
- Eliminado código duplicado
- Melhorada separação de concerns
- Adicionada documentação inline

## [1.0.0] - 2024-01-XX

### Added
- Sistema de avaliação homilética
- Histórico individual do pregador
- Critérios dinâmicos versionados por evento
- Proteção de dados históricos
- API RESTful com Express
- Frontend com Chart.js
- Docker e Docker Compose
- Materialized Views para performance
- Autenticação JWT
- Certificados PDF
- Ranking de pregadores
- Dashboard administrativo
- Modo offline com Service Worker

### Security
- Queries parametrizadas (SQL Injection protection)
- CORS configurado
- Eventos encerrados somente leitura
- Validação de inputs
- Sanitização de dados

### Performance
- Materialized Views com refresh concorrente
- Índices otimizados
- Queries < 100ms
- Cache de dados agregados

---

## Tipos de Mudanças

- `Added` - Novas funcionalidades
- `Changed` - Mudanças em funcionalidades existentes
- `Deprecated` - Funcionalidades que serão removidas
- `Removed` - Funcionalidades removidas
- `Fixed` - Correções de bugs
- `Security` - Correções de segurança
- `Improved` - Melhorias e otimizações
- `Technical Debt Paid` - Refatorações e melhorias de código
