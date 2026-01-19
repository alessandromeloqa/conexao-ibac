# 🔐 Credenciais de Desenvolvimento

## ⚠️ APENAS PARA AMBIENTE DE DESENVOLVIMENTO

### Usuário Fixo

```
Usuário: admin
Senha: admin123
```

---

## 📍 Onde Está Configurado

**Arquivo:** `database/seed.sql`

```sql
INSERT INTO usuarios (username, password_hash, nome, ativo) 
VALUES (
  'admin', 
  '$2b$10$mcYJSoXsvn.5Kq0Bt6mYQOauEmJxjwG2ktP.wRGohR.F/AXVe1wu6', 
  'Administrador',
  true
)
ON CONFLICT (username) DO UPDATE SET 
  password_hash = '$2b$10$mcYJSoXsvn.5Kq0Bt6mYQOauEmJxjwG2ktP.wRGohR.F/AXVe1wu6',
  nome = 'Administrador',
  ativo = true;
```

---

## 🔄 Como Funciona

1. **Primeira execução:** Cria o usuário `admin` com senha `admin123`
2. **Execuções seguintes:** Atualiza o hash da senha para garantir que sempre seja `admin123`
3. **Persistência:** Dados mantidos no volume Docker `postgres_dev_data`

---

## 🧪 Como Testar

### Login no Sistema

```bash
# Acesse
http://localhost:8081/login.html

# Credenciais
Usuário: admin
Senha: admin123
```

### Verificar no Banco

```bash
# Acessar PostgreSQL
docker exec -it conexao-postgres-dev psql -U postgres -d conexao_ibac_dev

# Verificar usuário
SELECT username, nome, ativo FROM usuarios;

# Resultado esperado:
# username | nome          | ativo
# ---------|---------------|-------
# admin    | Administrador | t

# Sair
\q
```

---

## 🔒 Segurança

### Desenvolvimento
- ✅ Senha fixa para facilitar testes
- ✅ Hash bcrypt (seguro)
- ✅ Usuário único

### Produção
- ⚠️ **NUNCA** use `admin123` em produção
- ⚠️ Altere a senha imediatamente após deploy
- ⚠️ Use senhas fortes (mínimo 12 caracteres)

---

## 🔄 Resetar Senha (Se Necessário)

### Opção 1: Recriar Container
```bash
# Remove volume e recria
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Opção 2: SQL Direto
```bash
# Gerar novo hash
node backend/gerar-hash.js admin123

# Atualizar no banco
docker exec -it conexao-postgres-dev psql -U postgres -d conexao_ibac_dev -c \
  "UPDATE usuarios SET password_hash = '$2b$10$mcYJSoXsvn.5Kq0Bt6mYQOauEmJxjwG2ktP.wRGohR.F/AXVe1wu6' WHERE username = 'admin';"
```

---

## 📋 Checklist

- [x] Usuário fixo: `admin`
- [x] Senha fixa: `admin123`
- [x] Hash bcrypt seguro
- [x] ON CONFLICT para garantir consistência
- [x] Documentação clara
- [x] Aviso de segurança para produção

---

## ⚠️ IMPORTANTE

**Este usuário é APENAS para desenvolvimento local.**

Em produção:
1. Altere a senha imediatamente
2. Use variáveis de ambiente
3. Implemente rotação de senhas
4. Considere autenticação JWT

---

## 📞 Suporte

**Alessandro Melo**  
📧 1986.alessandro@gmail.com

**Status:** ✅ Configurado para desenvolvimento
