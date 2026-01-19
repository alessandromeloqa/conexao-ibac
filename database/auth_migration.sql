-- Tabela de usuários admin
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tokens de acesso para eventos (pastores)
CREATE TABLE IF NOT EXISTS evento_tokens (
    id SERIAL PRIMARY KEY,
    evento_id INT REFERENCES eventos(id) ON DELETE CASCADE,
    token VARCHAR(64) UNIQUE NOT NULL,
    expira_em TIMESTAMP,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar campo token ao evento
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS token_acesso VARCHAR(64) UNIQUE;

-- Índices
CREATE INDEX IF NOT EXISTS idx_evento_tokens_evento ON evento_tokens(evento_id);
CREATE INDEX IF NOT EXISTS idx_evento_tokens_token ON evento_tokens(token);
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
