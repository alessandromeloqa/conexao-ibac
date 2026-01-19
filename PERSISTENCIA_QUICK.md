# ⚡ Guia Rápido - Persistência de Dados

## ✅ Seus Dados Estão Seguros!

A persistência está **CONFIGURADA e FUNCIONANDO**. Os dados **NÃO são perdidos** ao recriar containers.

---

## 🔒 Comandos Seguros (Mantêm Dados)

```bash
# Parar containers
docker-compose -f docker-compose.dev.yml down

# Recriar containers
docker-compose -f docker-compose.dev.yml up -d --build

# Reiniciar
docker-compose -f docker-compose.dev.yml restart
```

---

## ⚠️ Comandos Perigosos (Apagam Dados)

```bash
# ❌ NUNCA USE ISSO EM PRODUÇÃO!
docker-compose down -v  # Flag -v remove volumes e APAGA DADOS!

# ❌ CUIDADO!
docker volume rm conexao-ibac_postgres_dev_data  # Apaga volume
docker volume prune  # Remove volumes não usados
```

---

## 🧪 Testar Persistência

### Windows
```cmd
verificar-persistencia.bat
```

### Linux/Mac
```bash
chmod +x verificar-persistencia.sh
./verificar-persistencia.sh
```

---

## 💾 Backup Rápido

```bash
# Dev
docker exec conexao-postgres-dev pg_dump -U postgres conexao_ibac_dev > backup.sql

# Prod
docker exec conexao-postgres-prod pg_dump -U postgres conexao_ibac_prod > backup.sql
```

---

## 📚 Documentação Completa

Ver: `PERSISTENCIA_DADOS.md`

---

## ✅ Checklist

- [x] Volumes nomeados configurados
- [x] Scripts SQL idempotentes
- [x] Dados persistem ao recriar containers
- [x] Backup automático em produção
- [x] Scripts de verificação criados
- [x] Documentação completa

**Status:** ✅ Persistência garantida!
