@echo off
REM Script de Verificação de Persistência de Dados
REM Conexão IBAC - Sistema de Avaliação Homilética

echo.
echo 🔍 Verificando Persistência de Dados - Conexão IBAC
echo ==================================================
echo.

REM Verificar se Docker está rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não está rodando!
    exit /b 1
)

echo ✅ Docker está rodando
echo.

REM Verificar volumes
echo 📦 Volumes Docker:
echo -------------------
docker volume ls | findstr "conexao"
if errorlevel 1 (
    echo ⚠️  Nenhum volume encontrado
)
echo.

REM Verificar containers
echo 🐳 Containers Ativos:
echo ---------------------
docker ps --filter "name=conexao" --format "table {{.Names}}\t{{.Status}}"
if errorlevel 1 (
    echo ⚠️  Nenhum container ativo
)
echo.

REM Verificar volume dev
docker volume inspect conexao-ibac_postgres_dev_data >nul 2>&1
if not errorlevel 1 (
    echo ✅ Volume DEV existe: conexao-ibac_postgres_dev_data
) else (
    echo ⚠️  Volume DEV não encontrado
)
echo.

REM Verificar volume prod
docker volume inspect conexao-ibac_postgres_prod_data >nul 2>&1
if not errorlevel 1 (
    echo ✅ Volume PROD existe: conexao-ibac_postgres_prod_data
) else (
    echo ⚠️  Volume PROD não encontrado
)
echo.

REM Verificar dados no PostgreSQL Dev
docker ps --filter "name=conexao-postgres-dev" --format "{{.Names}}" | findstr "conexao-postgres-dev" >nul 2>&1
if not errorlevel 1 (
    echo 📊 Dados no PostgreSQL DEV:
    echo ---------------------------
    
    for /f %%i in ('docker exec conexao-postgres-dev psql -U postgres -d conexao_ibac_dev -t -c "SELECT COUNT(*) FROM pregadores;" 2^>nul') do set PREGADORES=%%i
    for /f %%i in ('docker exec conexao-postgres-dev psql -U postgres -d conexao_ibac_dev -t -c "SELECT COUNT(*) FROM eventos;" 2^>nul') do set EVENTOS=%%i
    for /f %%i in ('docker exec conexao-postgres-dev psql -U postgres -d conexao_ibac_dev -t -c "SELECT COUNT(*) FROM avaliacoes;" 2^>nul') do set AVALIACOES=%%i
    for /f %%i in ('docker exec conexao-postgres-dev psql -U postgres -d conexao_ibac_dev -t -c "SELECT COUNT(*) FROM criterios;" 2^>nul') do set CRITERIOS=%%i
    
    echo    Pregadores: %PREGADORES%
    echo    Eventos: %EVENTOS%
    echo    Critérios: %CRITERIOS%
    echo    Avaliações: %AVALIACOES%
) else (
    echo ⚠️  Container PostgreSQL DEV não está rodando
)
echo.

REM Verificar dados no PostgreSQL Prod
docker ps --filter "name=conexao-postgres-prod" --format "{{.Names}}" | findstr "conexao-postgres-prod" >nul 2>&1
if not errorlevel 1 (
    echo 📊 Dados no PostgreSQL PROD:
    echo ----------------------------
    
    for /f %%i in ('docker exec conexao-postgres-prod psql -U postgres -d conexao_ibac_prod -t -c "SELECT COUNT(*) FROM pregadores;" 2^>nul') do set PREGADORES=%%i
    for /f %%i in ('docker exec conexao-postgres-prod psql -U postgres -d conexao_ibac_prod -t -c "SELECT COUNT(*) FROM eventos;" 2^>nul') do set EVENTOS=%%i
    for /f %%i in ('docker exec conexao-postgres-prod psql -U postgres -d conexao_ibac_prod -t -c "SELECT COUNT(*) FROM avaliacoes;" 2^>nul') do set AVALIACOES=%%i
    for /f %%i in ('docker exec conexao-postgres-prod psql -U postgres -d conexao_ibac_prod -t -c "SELECT COUNT(*) FROM criterios;" 2^>nul') do set CRITERIOS=%%i
    
    echo    Pregadores: %PREGADORES%
    echo    Eventos: %EVENTOS%
    echo    Critérios: %CRITERIOS%
    echo    Avaliações: %AVALIACOES%
) else (
    echo ⚠️  Container PostgreSQL PROD não está rodando
)
echo.

echo ==================================================
echo ✅ Verificação concluída!
echo.
echo 💡 Dicas:
echo    - Volumes nomeados persistem dados automaticamente
echo    - Use 'docker-compose down' (SEM -v) para manter dados
echo    - Use 'backup.sh' para backup manual
echo.

pause
