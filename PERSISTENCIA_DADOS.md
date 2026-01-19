# 🗄️ Persistência de Dados - Conexão IBAC

## ✅ Configuração de Volumes Docker

### Status Atual: PERSISTÊNCIA CONFIGURADA ✅

Os dados **NÃO são perdidos** ao recriar containers. A configuração está correta.

---

## 📦 Volumes Configurados

### Desenvolvimento (`docker-compose.dev.yml`)
```yaml
volumes:
  postgres_dev_data:  # Volume nomeado persistente

services:
  postgres-dev:
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data  # ✅ PERSISTE DADOS
```

### Produção (`docker-compose.prod.yml`)
```yaml
volumes:
  postgres_prod_data:  # Volume nomeado persistente

services:
  postgres-prod:
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data  # ✅ PERSISTE DADOS
      - ./backups:/backups  # ✅ Diretório de backups
```

---

## 🔍 Como Funciona a Persistência

### 1. Volumes Nomeados (Named Volumes)
- Docker cria volumes gerenciados fora dos containers
- Dados sobrevivem a `docker-compose down`
- Dados sobrevivem a `docker-compose up --build`
- Dados sobrevivem a recriação de containers

### 2. Scripts de Inicialização
```
/docker-entrypoint-initdb.d/
├── 01-schema.sql      # Cria tabelas (IF NOT EXISTS)
├── 02-auth.sql        # Cria usuários admin
└── 03-seed.sql        # Dados iniciais
```

**IMPORTANTE:** Scripts só executam se o volume estiver **VAZIO** (primeira vez).

---

## 🧪 Como Verificar Persistência

### Teste 1: Verificar Volumes Existentes
```bash
# Listar volumes
docker volume ls | grep conexao

# Resultado esperado:
# conexao-ibac_postgres_dev_data
# conexao-ibac_postgres_prod_data
```

### Teste 2: Inspecionar Volume
```bash
# Dev
docker volume inspect conexao-ibac_postgres_dev_data

# Prod
docker volume inspect conexao-ibac_postgres_prod_data
```

### Teste 3: Verificar Dados no Container
```bash
# Acessar PostgreSQL Dev
docker exec -it conexao-postgres-dev psql -U postgres -d conexao_ibac_dev

# Listar tabelas
\dt

# Contar registros
SELECT COUNT(*) FROM pregadores;
SELECT COUNT(*) FROM eventos;
SELECT COUNT(*) FROM avaliacoes;

# Sair
\q
```

### Teste 4: Recriar Container e Verificar Dados
```bash
# 1. Inserir dados de teste
docker exec -it conexao-postgres-dev psql -U postgres -d conexao_ibac_dev -c \
  "INSERT INTO pregadores (nome, email) VALUES ('Teste Persistência', 'teste@ibac.com');"

# 2. Verificar inserção
docker exec -it conexao-postgres-dev psql -U postgres -d conexao_ibac_dev -c \
  "SELECT * FROM pregadores WHERE nome = 'Teste Persistência';"

# 3. Recriar container
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d

# 4. Verificar se dados persistiram
docker exec -it conexao-postgres-dev psql -U postgres -d conexao_ibac_dev -c \
  "SELECT * FROM pregadores WHERE nome = 'Teste Persistência';"

# ✅ Se aparecer o registro, persistência está funcionando!
```

---

## ⚠️ Quando os Dados SÃO Perdidos

### Cenários que APAGAM dados:

#### 1. Remover Volume Explicitamente
```bash
# ❌ ISSO APAGA OS DADOS!
docker-compose down -v  # Flag -v remove volumes
docker volume rm conexao-ibac_postgres_dev_data
```

#### 2. Usar `docker-compose down -v`
```bash
# ❌ NUNCA USE A FLAG -v EM PRODUÇÃO!
docker-compose -f docker-compose.prod.yml down -v
```

#### 3. Deletar Volume Manualmente
```bash
# ❌ ISSO APAGA TUDO!
docker volume prune  # Remove volumes não usados
```

---

## ✅ Comandos Seguros (NÃO Perdem Dados)

### Desenvolvimento
```bash
# Parar containers (dados persistem)
docker-compose -f docker-compose.dev.yml down

# Recriar containers (dados persistem)
docker-compose -f docker-compose.dev.yml up -d --build

# Reiniciar containers (dados persistem)
docker-compose -f docker-compose.dev.yml restart
```

### Produção
```bash
# Parar containers (dados persistem)
docker-compose -f docker-compose.prod.yml down

# Recriar containers (dados persistem)
docker-compose -f docker-compose.prod.yml up -d --build

# Reiniciar containers (dados persistem)
docker-compose -f docker-compose.prod.yml restart
```

---

## 💾 Backup e Restore

### Backup Manual
```bash
# Dev
docker exec conexao-postgres-dev pg_dump -U postgres conexao_ibac_dev > backup_dev_$(date +%Y%m%d).sql

# Prod
docker exec conexao-postgres-prod pg_dump -U postgres conexao_ibac_prod > backup_prod_$(date +%Y%m%d).sql
```

### Restore
```bash
# Dev
docker exec -i conexao-postgres-dev psql -U postgres conexao_ibac_dev < backup_dev_20240101.sql

# Prod
docker exec -i conexao-postgres-prod psql -U postgres conexao_ibac_prod < backup_prod_20240101.sql
```

### Backup Automático (Produção)
```bash
# Script já configurado
./backup.sh

# Backups salvos em: ./backups/
```

---

## 🔧 Correções Aplicadas

### 1. Schema SQL Idempotente
```sql
-- ✅ ANTES (podia falhar)
ALTER TABLE avaliacoes ADD CONSTRAINT unique_avaliacao ...

-- ✅ AGORA (sempre funciona)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_avaliacao'
    ) THEN
        ALTER TABLE avaliacoes ADD CONSTRAINT unique_avaliacao ...
    END IF;
END $$;
```

### 2. Volumes Nomeados Configurados
- ✅ `postgres_dev_data` - Desenvolvimento
- ✅ `postgres_prod_data` - Produção

### 3. Scripts de Inicialização Seguros
- ✅ `CREATE TABLE IF NOT EXISTS`
- ✅ `CREATE INDEX IF NOT EXISTS`
- ✅ `CREATE MATERIALIZED VIEW IF NOT EXISTS`
- ✅ Constraints com verificação

---

## 📊 Localização dos Dados

### Linux/Mac
```
/var/lib/docker/volumes/conexao-ibac_postgres_dev_data/_data
/var/lib/docker/volumes/conexao-ibac_postgres_prod_data/_data
```

### Windows (WSL2)
```
\\wsl$\docker-desktop-data\data\docker\volumes\conexao-ibac_postgres_dev_data\_data
\\wsl$\docker-desktop-data\data\docker\volumes\conexao-ibac_postgres_prod_data\_data
```

---

## ✅ Checklist de Persistência

- [x] Volumes nomeados configurados
- [x] Scripts SQL idempotentes (IF NOT EXISTS)
- [x] Constraints com verificação
- [x] Backup automático em produção
- [x] Documentação de comandos seguros
- [x] Testes de persistência documentados

---

## 🚨 Regras de Ouro

1. **NUNCA** use `docker-compose down -v` em produção
2. **SEMPRE** faça backup antes de mudanças estruturais
3. **SEMPRE** use comandos sem flag `-v`
4. **SEMPRE** verifique volumes antes de deletar

---

## 📞 Suporte

**Alessandro Melo**  
📧 1986.alessandro@gmail.com

**Status:** ✅ Persistência configurada e testada
