-- Dados de exemplo para testes

INSERT INTO pregadores (nome, email) VALUES 
('João Silva', 'joao@example.com'),
('Maria Santos', 'maria@example.com'),
('Pedro Oliveira', 'pedro@example.com')
ON CONFLICT DO NOTHING;

INSERT INTO eventos (nome, data_evento, local, status) VALUES 
('Congresso 2024', '2024-01-15', 'São Paulo', 'encerrado'),
('Seminário Jovens', '2024-03-20', 'Rio de Janeiro', 'encerrado'),
('Encontro Regional', '2024-06-10', 'Belo Horizonte', 'encerrado')
ON CONFLICT DO NOTHING;

INSERT INTO criterios (nome, peso, ordem) VALUES 
('Conteúdo Bíblico', 1.0, 1),
('Clareza', 1.0, 2),
('Aplicação Prática', 1.0, 3),
('Dicção', 1.0, 4),
('Gestão do Tempo', 1.0, 5)
ON CONFLICT DO NOTHING;

-- Refresh das views
REFRESH MATERIALIZED VIEW CONCURRENTLY vw_historico_pregador;
REFRESH MATERIALIZED VIEW CONCURRENTLY vw_media_criterio_pregador;
