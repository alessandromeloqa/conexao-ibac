# Modo Offline - Conexão IBAC

## Funcionalidades Implementadas

✅ **Avaliação 100% offline**
- Funciona sem conexão à internet
- Armazenamento local com IndexedDB
- Cache de eventos e critérios

✅ **Sincronização Automática**
- Fila de avaliações pendentes
- Sincronização a cada 30 segundos quando online
- Sincronização imediata ao recuperar conexão

✅ **Indicadores Visuais**
- Status online/offline em tempo real
- Contador de avaliações pendentes
- Feedback visual de sucesso/erro

✅ **Segurança**
- Verificação de duplicatas (local e servidor)
- Validação de notas (0-10)
- Integridade garantida por transações

## Arquitetura

### Service Worker (sw.js)
- Cache de assets estáticos
- Funcionamento offline completo

### IndexedDB (offline.js)
- **avaliacoes**: Fila de sincronização
- **eventos**: Cache de eventos
- **criterios**: Cache de critérios

### Fluxo de Dados

1. **Online**: Dados carregados da API e cacheados
2. **Offline**: Dados lidos do cache local
3. **Avaliação**: Salva no IndexedDB com flag `synced: false`
4. **Sincronização**: Envia pendentes para API e marca `synced: true`

## Uso

### Avaliador (Pastor)

1. Acesse `/avaliacao.html`
2. Preencha nome, evento e pregador
3. Avalie cada critério (0-10)
4. Clique em "Enviar Avaliação"
5. Sistema salva localmente e sincroniza automaticamente

### Status

- 🟢 **Online**: Sincronização ativa
- 🔴 **Offline**: Modo local, sincronizará quando conectar
- **Pendentes**: Número de avaliações aguardando sincronização

## Resolução de Conflitos

- **Duplicatas**: Bloqueadas no cliente e servidor
- **Validação**: Notas validadas antes de salvar
- **Integridade**: Transações atômicas no IndexedDB

## PWA (Progressive Web App)

- Instalável no dispositivo
- Ícone na tela inicial
- Funciona como app nativo
- Manifest configurado

## API

### POST /api/avaliacoes
Recebe avaliação sincronizada

**Body:**
```json
{
  "participacao_id": 1,
  "criterio_id": 2,
  "nota": 8.5,
  "avaliador_nome": "João Silva"
}
```

**Response:**
- `201`: Criado
- `409`: Duplicata
- `500`: Erro
