-- Schema base do sistema Conexão IBAC
-- Compatível com dados existentes

CREATE TABLE IF NOT EXISTS pregadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    telefone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eventos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data_evento DATE NOT NULL,
    local VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'encerrado')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS criterios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    peso DECIMAL(3,2) DEFAULT 1.00,
    ordem INT DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evento_criterios (
    id SERIAL PRIMARY KEY,
    evento_id INT REFERENCES eventos(id),
    criterio_id INT REFERENCES criterios(id),
    ordem INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(evento_id, criterio_id)
);

CREATE INDEX IF NOT EXISTS idx_evento_criterios_evento ON evento_criterios(evento_id);

CREATE TABLE IF NOT EXISTS participacoes (
    id SERIAL PRIMARY KEY,
    evento_id INT REFERENCES eventos(id),
    pregador_id INT REFERENCES pregadores(id),
    tema VARCHAR(255),
    data_apresentacao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(evento_id, pregador_id)
);

CREATE TABLE IF NOT EXISTS avaliacoes (
    id SERIAL PRIMARY KEY,
    participacao_id INT REFERENCES participacoes(id),
    criterio_id INT REFERENCES criterios(id),
    nota DECIMAL(4,2) CHECK (nota >= 0 AND nota <= 10),
    avaliador_nome VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_participacoes_pregador ON participacoes(pregador_id);
CREATE INDEX IF NOT EXISTS idx_participacoes_evento ON participacoes(evento_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_participacao ON avaliacoes(participacao_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_criterio ON avaliacoes(criterio_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_avaliador ON avaliacoes(avaliador_nome);
CREATE INDEX IF NOT EXISTS idx_eventos_status ON eventos(status);
CREATE INDEX IF NOT EXISTS idx_eventos_data ON eventos(data_evento);
CREATE INDEX IF NOT EXISTS idx_criterios_ativo ON criterios(ativo);
CREATE INDEX IF NOT EXISTS idx_evento_criterios_evento ON evento_criterios(evento_id);
CREATE INDEX IF NOT EXISTS idx_certificados_codigo ON certificados(codigo_validacao);
CREATE INDEX IF NOT EXISTS idx_certificados_participacao ON certificados(participacao_id);

-- Constraint de duplicidade
ALTER TABLE avaliacoes ADD CONSTRAINT unique_avaliacao 
    UNIQUE (participacao_id, criterio_id, avaliador_nome);

-- View materializada para histórico do pregador (performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS vw_historico_pregador AS
SELECT 
    p.id as pregador_id,
    p.nome as pregador_nome,
    e.id as evento_id,
    e.nome as evento_nome,
    e.data_evento,
    part.tema,
    AVG(a.nota) as media_geral,
    COUNT(DISTINCT a.id) as total_avaliacoes,
    RANK() OVER (PARTITION BY e.id ORDER BY AVG(a.nota) DESC) as ranking
FROM pregadores p
JOIN participacoes part ON p.id = part.pregador_id
JOIN eventos e ON part.evento_id = e.id
JOIN avaliacoes a ON part.id = a.participacao_id
GROUP BY p.id, p.nome, e.id, e.nome, e.data_evento, part.tema;

CREATE UNIQUE INDEX IF NOT EXISTS idx_vw_historico_pregador ON vw_historico_pregador(pregador_id, evento_id);

-- View para média por critério
CREATE MATERIALIZED VIEW IF NOT EXISTS vw_media_criterio_pregador AS
SELECT 
    p.id as pregador_id,
    e.id as evento_id,
    c.id as criterio_id,
    c.nome as criterio_nome,
    AVG(a.nota) as media_criterio
FROM pregadores p
JOIN participacoes part ON p.id = part.pregador_id
JOIN eventos e ON part.evento_id = e.id
JOIN avaliacoes a ON part.id = a.participacao_id
JOIN criterios c ON a.criterio_id = c.id
GROUP BY p.id, e.id, c.id, c.nome;

CREATE TABLE IF NOT EXISTS certificados (
    id SERIAL PRIMARY KEY,
    participacao_id INT REFERENCES participacoes(id) UNIQUE,
    codigo_validacao UUID DEFAULT gen_random_uuid(),
    data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_certificados_codigo ON certificados(codigo_validacao);
