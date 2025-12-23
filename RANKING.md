# Painel Público de Ranking

## Características

✅ **URL Pública**: `ranking.html?evento={ID}`
✅ **Sem Autenticação**: Acesso livre
✅ **Atualização Automática**: A cada 10 segundos
✅ **Layout Telão**: Otimizado para TV/projetor
✅ **Somente Leitura**: Nenhuma edição possível

## Exibição

### Top 3 (Pódio)
- **1º Lugar**: Destaque dourado, maior
- **2º Lugar**: Destaque prata
- **3º Lugar**: Destaque bronze

### Ranking Completo
- Tabela com todos os participantes
- Posição, nome e média
- Tipografia grande (28-32px)

## Design

- **Alto Contraste**: Fundo azul gradiente + texto branco
- **Tipografia Grande**: 28px a 72px
- **Animações**: Fade in e slide up
- **Responsivo**: Adapta para diferentes resoluções

## Uso

### Administrador
1. Acesse `ranking-select.html`
2. Selecione o evento ativo
3. Clique em "Abrir Painel de Ranking"
4. Compartilhe a URL gerada

### Público (Telão)
1. Abra a URL: `ranking.html?evento=1`
2. Pressione F11 para tela cheia
3. Ranking atualiza automaticamente

## API

### GET /api/ranking/:eventoId
Retorna ranking do evento

**Response:**
```json
{
  "evento": {
    "nome": "Congresso 2024",
    "data_evento": "2024-01-15"
  },
  "ranking": [
    {
      "posicao": 1,
      "pregador": "João Silva",
      "media": "9.50",
      "total_avaliacoes": 10
    }
  ]
}
```

## Segurança

✅ Nenhum dado sensível exibido
✅ Apenas nome e média pública
✅ Sem informações de avaliadores
✅ Sem detalhes de critérios individuais

## Exemplos de URL

- Evento 1: `http://localhost:8080/ranking.html?evento=1`
- Evento 2: `http://localhost:8080/ranking.html?evento=2`

## Recursos Visuais

- Gradiente azul institucional
- Efeito blur nos cards
- Sombras e bordas destacadas
- Animações suaves
- Hover effects
