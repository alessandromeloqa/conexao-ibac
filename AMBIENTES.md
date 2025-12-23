# Conexão IBAC - Ambientes Dev e Prod

## Ambientes Separados

### Desenvolvimento (Local)
- **Porta Frontend**: 8081
- **Porta Backend**: 3001
- **Porta Banco**: 5433
- **Banco**: conexao_ibac_dev
- **Hot Reload**: Ativo

### Produção (Servidor)
- **Porta Frontend**: 80/443
- **Porta Backend**: 3000
- **Porta Banco**: 5432
- **Banco**: conexao_ibac_prod
- **SSL**: Configurado

## Desenvolvimento

### Iniciar Ambiente Dev

```bash
# Subir containers
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Parar
docker-compose -f docker-compose.dev.yml down
```

### Acessos Dev
- Frontend: http://localhost:8081
- API: http://localhost:3001/api
- Banco: localhost:5433

### Testes Locais

```bash
# Backend
cd backend
npm test

# Banco
docker exec ibac-postgres-dev psql -U postgres -d conexao_ibac_dev -c "SELECT COUNT(*) FROM criterios;"
```

## Produção

### Instalação Automática (Ubuntu)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/conexao-ibac.git
cd conexao-ibac

# 2. Configure variáveis
cp .env.prod.example .env.prod
nano .env.prod

# 3. Execute instalação
chmod +x install.sh
sudo ./install.sh
```

O script `install.sh` faz:
- ✅ Verifica sistema operacional
- ✅ Instala dependências (Docker, etc)
- ✅ Cria backup antes de instalar
- ✅ Configura SSL (Let's Encrypt ou self-signed)
- ✅ Faz deploy dos containers
- ✅ Executa migrações
- ✅ Roda testes completos
- ✅ Configura backup automático
- ✅ Configura renovação SSL
- ✅ Rollback automático em caso de erro

### Backup Manual

```bash
chmod +x backup.sh
./backup.sh
```

### Acessos Prod
- Frontend: https://seudominio.com
- API: https://seudominio.com/api
- Banco: localhost:5432 (interno)

## Comandos Úteis

### Desenvolvimento

```bash
# Rebuild
docker-compose -f docker-compose.dev.yml up -d --build

# Logs específicos
docker logs ibac-backend-dev -f

# Acessar banco
docker exec -it ibac-postgres-dev psql -U postgres -d conexao_ibac_dev

# Limpar tudo
docker-compose -f docker-compose.dev.yml down -v
```

### Produção

```bash
# Status
docker-compose -f docker-compose.prod.yml ps

# Restart
docker-compose -f docker-compose.prod.yml restart

# Logs
docker-compose -f docker-compose.prod.yml logs -f backend-prod

# Backup
./backup.sh

# Atualizar
git pull
docker-compose -f docker-compose.prod.yml up -d --build
```

## Migração Dev → Prod

### 1. Testar em Dev

```bash
# Dev
docker-compose -f docker-compose.dev.yml up -d
# Testar funcionalidades
npm test
```

### 2. Commit e Push

```bash
git add .
git commit -m "Nova funcionalidade"
git push origin main
```

### 3. Deploy em Prod

```bash
# No servidor
cd /var/www/conexao-ibac
git pull
./backup.sh
docker-compose -f docker-compose.prod.yml up -d --build
```

## Estrutura de Arquivos

```
conexao-ibac/
├── docker-compose.dev.yml      # Dev
├── docker-compose.prod.yml     # Prod
├── nginx-dev.conf              # Nginx dev
├── nginx-prod.conf             # Nginx prod
├── .env.prod.example           # Exemplo prod
├── install.sh                  # Instalação automática
├── backup.sh                   # Backup manual
└── backups/                    # Backups
```

## Troubleshooting

### Dev: Porta em uso

```bash
# Mude as portas em docker-compose.dev.yml
ports:
  - "8082:80"  # Frontend
  - "3002:3000"  # Backend
```

### Prod: SSL não funciona

```bash
# Verifique certificados
ls -la ./ssl/

# Regenere self-signed
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./ssl/privkey.pem \
  -out ./ssl/fullchain.pem
```

### Restaurar Backup

```bash
# Liste backups
ls -lh backups/

# Restaure
docker exec -i ibac-postgres-prod psql -U postgres -d conexao_ibac_prod < backups/db_backup_20240115_020000.sql
```

## Segurança

### Dev
- Senhas simples OK
- Sem SSL necessário
- Logs verbosos

### Prod
- ✅ Senhas fortes obrigatórias
- ✅ SSL obrigatório
- ✅ Logs controlados
- ✅ Backup automático
- ✅ Health checks
- ✅ Restart automático
