# Critérios Dinâmicos - Versionamento por Evento

## Funcionalidades Implementadas

### ✅ Administração de Critérios

#### Criar Critério
- Nome, peso e ordem configuráveis
- Status ativo/inativo
- Endpoint: `POST /api/admin/criterios`

#### Ativar/Desativar
- Toggle de status sem deletar
- Critérios inativos não aparecem em novos eventos
- Endpoint: `PUT /api/admin/criterios/:id`

#### Listar Todos
- Visualização completa (admin)
- Endpoint: `GET /api/admin/criterios`

### ✅ Versionamento por Evento

#### Tabela evento_criterios
- Vincula critérios específicos a cada evento
- Preserva ordem personalizada
- Eventos antigos mantêm critérios originais

#### Vincular Critérios
- Admin seleciona quais critérios usar no evento
- Ordem customizável
- Endpoint: `POST /api/admin/eventos/:eventoId/criterios`

#### Buscar Critérios do Evento
- Retorna critérios específicos do evento
- Fallback para critérios ativos se não houver vínculo
- Endpoint: `GET /api/eventos/:eventoId/criterios`

## Arquitetura

### Banco de Dados

```sql
-- Critérios base
CREATE TABLE criterios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255),
    peso DECIMAL(3,2),
    ordem INT,
    ativo BOOLEAN DEFAULT true
);

-- Versionamento por evento
CREATE TABLE evento_criterios (
    id SERIAL PRIMARY KEY,
    evento_id INT REFERENCES eventos(id),
    criterio_id INT REFERENCES criterios(id),
    ordem INT,
    UNIQUE(evento_id, criterio_id)
);
```

### Fluxo de Dados

1. **Admin cria critério** → Salvo como ativo
2. **Admin vincula ao evento** → Registro em evento_criterios
3. **Avaliador acessa evento** → Carrega critérios específicos
4. **Cálculo de média** → Usa critérios do evento

## Proteção de Dados Históricos

### ✅ Eventos Encerrados
- Critérios vinculados são imutáveis
- Médias históricas não são recalculadas
- Queries usam evento_criterios para dados antigos

### ✅ Novos Eventos
- Usam critérios ativos atuais
- Admin pode customizar antes de iniciar
- Flexibilidade total

## API Endpoints

### Admin

**POST /api/admin/criterios**
```json
{
  "nome": "Conteúdo Bíblico",
  "peso": 1.0,
  "ordem": 1
}
```

**PUT /api/admin/criterios/:id**
```json
{
  "ativo": false
}
```

**POST /api/admin/eventos/:eventoId/criterios**
```json
{
  "criterioIds": [1, 2, 3, 5]
}
```

### Público

**GET /api/eventos/:eventoId/criterios**
Retorna critérios do evento (versionados)

**GET /api/criterios**
Retorna apenas critérios ativos

## Interface Admin

### admin-criterios.html
- Criar novos critérios
- Ativar/desativar existentes
- Vincular critérios a eventos
- Visualização de todos os critérios

## Comportamento

### Evento Novo (sem vínculo)
→ Usa todos os critérios ativos

### Evento com Vínculo
→ Usa apenas critérios vinculados na ordem definida

### Evento Encerrado
→ Critérios congelados, médias preservadas

## Cálculo Automático

- Critérios entram automaticamente no cálculo
- Peso aplicado na média ponderada
- Ordem define apresentação na UI

## Exemplo de Uso

1. Admin cria "Gestão do Tempo"
2. Admin vincula ao "Congresso 2024"
3. Avaliadores veem novo critério
4. Notas são salvas normalmente
5. Média calculada com todos os critérios
6. Evento encerra → critérios congelados
