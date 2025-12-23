-- Criar materialized views para histórico do pregador

-- View materializada para histórico do pregador
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_vw_media_criterio ON vw_media_criterio_pregador(pregador_id, evento_id, criterio_id);
