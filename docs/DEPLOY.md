# Instruções de Deploy - Conexão IBAC

## Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+
- Git
- 2GB RAM disponível
- 10GB disco disponível

## Deploy com Docker (Recomendado)

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/conexao-ibac.git
cd conexao-ibac
```

### 2. Configure Variáveis de Ambiente

```bash
cd backend
cp .env.example .env
```

Edite `.env`:
```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=conexao_ibac
DB_USER=postgres
DB_PASSWORD=SuaSenhaSegura123
PORT=3000
```

### 3. Inicie os Containers

```bash
cd ..
docker-compose up -d
```

### 4. Verifique os Containers

```bash
docker-compose ps
```

Saída esperada:
```
NAME                STATUS              PORTS
postgres            Up                  5432
backend             Up                  3000
frontend            Up                  8080
```

### 5. Execute as Migrações

```bash
docker-compose exec postgres psql -U postgres -d conexao_ibac -f /docker-entrypoint-initdb.d/schema.sql
```

Ou manualmente:
```bash
docker-compose exec postgres psql -U postgres -d conexao_ibac
```

Depois execute o conteúdo de `docs/MIGRACOES.sql`

### 6. Acesse o Sistema

- **Frontend**: http://localhost:8080
- **API**: http://localhost:3000/api
- **Banco**: localhost:5432

### 7. Teste a Instalação

```bash
# Teste API
curl http://localhost:3000/api/criterios

# Teste Frontend
curl http://localhost:8080
```

## Deploy Manual (Sem Docker)

### 1. Instale Dependências

**PostgreSQL 15**
```bash
# Ubuntu/Debian
sudo apt install postgresql-15

# Windows
# Baixe de https://www.postgresql.org/download/windows/
```

**Node.js 20**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# Windows
# Baixe de https://nodejs.org/
```

### 2. Configure o Banco

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE conexao_ibac;
CREATE USER ibac_user WITH PASSWORD 'senha_segura';
GRANT ALL PRIVILEGES ON DATABASE conexao_ibac TO ibac_user;
\q
```

Execute migrações:
```bash
psql -U ibac_user -d conexao_ibac -f docs/MIGRACOES.sql
```

### 3. Configure Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edite `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=conexao_ibac
DB_USER=ibac_user
DB_PASSWORD=senha_segura
PORT=3000
```

Inicie:
```bash
npm start
```

### 4. Configure Frontend

**Opção 1: Nginx**
```bash
sudo apt install nginx
sudo cp -r frontend/* /var/www/html/
sudo systemctl restart nginx
```

**Opção 2: Servidor HTTP simples**
```bash
cd frontend
npx http-server -p 8080
```

### 5. Acesse

- Frontend: http://localhost:8080
- API: http://localhost:3000

## Deploy em Produção

### 1. Configurações de Segurança

**Backend (.env)**
```env
NODE_ENV=production
DB_PASSWORD=SenhaForte123!@#
PORT=3000
```

**PostgreSQL**
```bash
# Altere senha padrão
sudo -u postgres psql
ALTER USER postgres PASSWORD 'SenhaForte123!@#';
```

### 2. HTTPS (Nginx + Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com
```

**nginx.conf**
```nginx
server {
    listen 80;
    server_name seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name seudominio.com;

    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. PM2 (Process Manager)

```bash
npm install -g pm2

cd backend
pm2 start src/server.js --name conexao-ibac
pm2 save
pm2 startup
```

### 4. Backup Automático

```bash
# Crie script de backup
sudo nano /usr/local/bin/backup-ibac.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/conexao-ibac"
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump -U postgres conexao_ibac > $BACKUP_DIR/db_$DATE.sql

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-ibac.sh

# Cron diário às 2h
sudo crontab -e
0 2 * * * /usr/local/bin/backup-ibac.sh
```

### 5. Monitoramento

**Logs**
```bash
# Docker
docker-compose logs -f backend

# PM2
pm2 logs conexao-ibac

# PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

**Health Check**
```bash
# API
curl http://localhost:3000/api/criterios

# Database
docker-compose exec postgres pg_isready
```

## Atualização do Sistema

### Com Docker

```bash
git pull origin main
docker-compose down
docker-compose build
docker-compose up -d
```

### Manual

```bash
git pull origin main

# Backend
cd backend
npm install
pm2 restart conexao-ibac

# Frontend
cd ../frontend
sudo cp -r * /var/www/html/
```

## Troubleshooting

### Erro: Porta já em uso

```bash
# Encontre processo
sudo lsof -i :3000
sudo lsof -i :8080

# Mate processo
sudo kill -9 <PID>
```

### Erro: Conexão com banco

```bash
# Verifique se PostgreSQL está rodando
sudo systemctl status postgresql

# Teste conexão
psql -U postgres -h localhost -d conexao_ibac
```

### Erro: Permissões

```bash
# Docker
sudo usermod -aG docker $USER
newgrp docker

# Arquivos
sudo chown -R $USER:$USER .
```

### Logs de Debug

```bash
# Backend
cd backend
DEBUG=* npm start

# PostgreSQL
docker-compose logs postgres
```

## Rollback

### Docker

```bash
# Volte para versão anterior
git checkout <commit-hash>
docker-compose down
docker-compose up -d
```

### Manual

```bash
# Restaure backup
psql -U postgres -d conexao_ibac < /backups/db_20240115_020000.sql

# Volte código
git checkout <commit-hash>
pm2 restart conexao-ibac
```

## Performance

### Otimizações PostgreSQL

```sql
-- Aumente shared_buffers
ALTER SYSTEM SET shared_buffers = '256MB';

-- Aumente work_mem
ALTER SYSTEM SET work_mem = '16MB';

-- Reload config
SELECT pg_reload_conf();
```

### Refresh de Views

```bash
# Cron a cada hora
0 * * * * psql -U postgres -d conexao_ibac -c "REFRESH MATERIALIZED VIEW CONCURRENTLY vw_historico_pregador; REFRESH MATERIALIZED VIEW CONCURRENTLY vw_media_criterio_pregador;"
```

## Suporte

- Documentação: `/docs`
- Issues: GitHub Issues
- Email: suporte@conexaoibac.com
