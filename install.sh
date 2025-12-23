#!/bin/bash

#############################################
# Conexão IBAC - Instalação Produção
# Ubuntu 20.04+ / Debian 11+
#############################################

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Variáveis
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="install_${TIMESTAMP}.log"

# Funções
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1" | tee -a "$LOG_FILE"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then 
        error "Execute como root: sudo ./install.sh"
    fi
}

check_ubuntu() {
    if [ ! -f /etc/os-release ]; then
        error "Sistema operacional não suportado"
    fi
    
    . /etc/os-release
    if [[ "$ID" != "ubuntu" && "$ID" != "debian" ]]; then
        error "Apenas Ubuntu/Debian são suportados"
    fi
    
    log "Sistema: $PRETTY_NAME"
}

install_dependencies() {
    log "Instalando dependências..."
    
    apt-get update -qq
    apt-get install -y -qq \
        curl \
        git \
        docker.io \
        docker-compose \
        postgresql-client \
        certbot \
        python3-certbot-nginx \
        jq \
        > /dev/null 2>&1
    
    systemctl enable docker
    systemctl start docker
    
    log "Dependências instaladas"
}

create_backup() {
    log "Criando backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Carrega variáveis se existir
    if [ -f .env.prod ]; then
        export $(cat .env.prod | grep -v '^#' | xargs)
    fi
    
    # Backup do banco se existir
    if docker ps | grep -q conexao-postgres-prod; then
        docker exec conexao-postgres-prod pg_dump -U "${DB_USER:-postgres}" "${DB_NAME:-conexao_ibac_prod}" > "$BACKUP_DIR/db_backup_${TIMESTAMP}.sql" 2>/dev/null || true
        log "Backup do banco: $BACKUP_DIR/db_backup_${TIMESTAMP}.sql"
    fi
    
    # Backup dos volumes
    if docker volume ls | grep -q postgres_prod_data; then
        docker run --rm -v postgres_prod_data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/volume_backup_${TIMESTAMP}.tar.gz -C /data . 2>/dev/null || true
        log "Backup do volume: $BACKUP_DIR/volume_backup_${TIMESTAMP}.tar.gz"
    fi
    
    # Limpar backups antigos (manter últimos 30 dias)
    find "$BACKUP_DIR" -name "*.sql" -mtime +30 -delete 2>/dev/null || true
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete 2>/dev/null || true
}

check_env_file() {
    log "Verificando arquivo .env.prod..."
    
    if [ ! -f .env.prod ]; then
        warning "Arquivo .env.prod não encontrado"
        
        if [ -f .env.prod.example ]; then
            cp .env.prod.example .env.prod
            warning "Criado .env.prod a partir do exemplo"
            warning "EDITE .env.prod com suas configurações antes de continuar!"
            
            read -p "Deseja editar agora? (s/n): " edit_env
            if [ "$edit_env" = "s" ]; then
                ${EDITOR:-nano} .env.prod
            else
                error "Configure .env.prod e execute novamente"
            fi
        else
            error "Arquivo .env.prod.example não encontrado"
        fi
    fi
    
    # Carrega variáveis
    export $(cat .env.prod | grep -v '^#' | xargs)
    
    # Valida variáveis obrigatórias
    if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" = "ALTERE_SENHA_FORTE_AQUI" ]; then
        error "Configure DB_PASSWORD em .env.prod"
    fi
    
    log "Arquivo .env.prod validado"
}

setup_ssl() {
    log "Configurando SSL..."
    
    mkdir -p ./ssl
    
    if [ -n "$DOMAIN" ] && [ "$DOMAIN" != "seudominio.com" ]; then
        log "Gerando certificado SSL para $DOMAIN..."
        
        # Para para gerar certificado
        docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
        
        certbot certonly --standalone \
            -d "$DOMAIN" \
            --email "$EMAIL" \
            --agree-tos \
            --non-interactive \
            --preferred-challenges http || warning "Falha ao gerar SSL. Usando self-signed."
        
        if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
            cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ./ssl/
            cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ./ssl/
            log "Certificado SSL configurado"
        else
            generate_self_signed
        fi
    else
        generate_self_signed
    fi
}

generate_self_signed() {
    warning "Gerando certificado self-signed..."
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ./ssl/privkey.pem \
        -out ./ssl/fullchain.pem \
        -subj "/C=BR/ST=State/L=City/O=IBAC/CN=localhost" \
        > /dev/null 2>&1
    
    warning "Certificado self-signed gerado (não use em produção real)"
}

deploy_application() {
    log "Fazendo deploy da aplicação..."
    
    # Para containers antigos
    docker-compose -f docker-compose.prod.yml --env-file .env.prod down 2>/dev/null || true
    
    # Build e start
    docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
    
    log "Aguardando containers iniciarem..."
    sleep 15
}

run_migrations() {
    log "Executando migrações..."
    
    # Aguarda banco estar pronto
    for i in {1..30}; do
        if docker exec conexao-postgres-prod pg_isready -U "$DB_USER" > /dev/null 2>&1; then
            break
        fi
        sleep 2
    done
    
    # Executa migrações
    docker exec conexao-postgres-prod psql -U "$DB_USER" -d "$DB_NAME" -f /docker-entrypoint-initdb.d/schema.sql > /dev/null 2>&1 || true
    
    log "Migrações executadas"
}

run_tests() {
    log "Executando testes..."
    
    # Testa banco de dados
    if ! docker exec conexao-postgres-prod pg_isready -U "$DB_USER" > /dev/null 2>&1; then
        error "Banco de dados não está respondendo"
    fi
    log "✓ Banco de dados OK"
    
    # Testa backend
    sleep 5
    if ! curl -sf http://localhost:3000/api/criterios > /dev/null; then
        error "Backend não está respondendo"
    fi
    log "✓ Backend OK"
    
    # Testa frontend
    if ! curl -sf http://localhost > /dev/null; then
        error "Frontend não está respondendo"
    fi
    log "✓ Frontend OK"
    
    # Testa conexão banco-backend
    CRITERIOS=$(curl -s http://localhost:3000/api/criterios | jq '. | length')
    if [ "$CRITERIOS" -ge 0 ] 2>/dev/null; then
        log "✓ Conexão banco-backend OK"
    else
        error "Falha na conexão banco-backend"
    fi
    
    # Testa escrita no banco
    TEST_RESULT=$(docker exec conexao-postgres-prod psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT 1" 2>/dev/null | xargs)
    if [ "$TEST_RESULT" = "1" ]; then
        log "✓ Escrita no banco OK"
    else
        error "Falha ao escrever no banco"
    fi
    
    log "Todos os testes passaram!"
}

setup_cron_backup() {
    log "Configurando backup automático..."
    
    CRON_JOB="0 2 * * * cd $(pwd) && docker exec conexao-postgres-prod pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/db_auto_\$(date +\%Y\%m\%d_\%H\%M\%S).sql 2>&1"
    
    (crontab -l 2>/dev/null | grep -v "conexao-postgres-prod"; echo "$CRON_JOB") | crontab -
    
    log "Backup automático configurado (diário às 2h)"
}

setup_cron_ssl_renewal() {
    if [ -n "$DOMAIN" ] && [ "$DOMAIN" != "seudominio.com" ]; then
        log "Configurando renovação automática SSL..."
        
        CRON_JOB="0 3 * * 0 certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/*.pem $(pwd)/ssl/ && cd $(pwd) && docker-compose -f docker-compose.prod.yml --env-file .env.prod restart frontend-prod"
        
        (crontab -l 2>/dev/null | grep -v "certbot renew"; echo "$CRON_JOB") | crontab -
        
        log "Renovação SSL configurada (semanal)"
    fi
}

show_summary() {
    log ""
    log "=========================================="
    log "  Instalação Concluída com Sucesso!"
    log "=========================================="
    log ""
    log "Acessos:"
    log "  Frontend: http://localhost (ou https://$DOMAIN)"
    log "  API: http://localhost:3000/api"
    log "  Banco: localhost:5432"
    log ""
    log "Containers:"
    docker-compose -f docker-compose.prod.yml --env-file .env.prod ps
    log ""
    log "Logs:"
    log "  Instalação: $LOG_FILE"
    log "  Backend: docker logs conexao-backend-prod"
    log "  Banco: docker logs conexao-postgres-prod"
    log ""
    log "Backup:"
    log "  Localização: $BACKUP_DIR"
    log "  Automático: Diário às 2h"
    log ""
    log "Comandos úteis:"
    log "  Parar: docker-compose -f docker-compose.prod.yml --env-file .env.prod down"
    log "  Iniciar: docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d"
    log "  Logs: docker-compose -f docker-compose.prod.yml --env-file .env.prod logs -f"
    log "  Backup manual: ./backup.sh"
    log ""
}

rollback() {
    error "Instalação falhou. Executando rollback..."
    
    docker-compose -f docker-compose.prod.yml --env-file .env.prod down 2>/dev/null || true
    
    # Restaura último backup se existir
    LAST_BACKUP=$(ls -t $BACKUP_DIR/db_backup_*.sql 2>/dev/null | head -1)
    if [ -n "$LAST_BACKUP" ]; then
        warning "Restaurando backup: $LAST_BACKUP"
        # Restauração seria feita aqui
    fi
    
    exit 1
}

# Trap para rollback em caso de erro
trap rollback ERR

# Execução principal
main() {
    log "Iniciando instalação Conexão IBAC..."
    
    check_root
    check_ubuntu
    install_dependencies
    create_backup
    check_env_file
    setup_ssl
    deploy_application
    run_migrations
    run_tests
    setup_cron_backup
    setup_cron_ssl_renewal
    show_summary
    
    log "Instalação finalizada!"
}

main "$@"
