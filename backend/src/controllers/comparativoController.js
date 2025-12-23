import pool from '../db.js';

export const compararEventos = async (req, res) => {
  const { eventoIds, criterioId } = req.query;
  
  try {
    const ids = eventoIds.split(',').map(id => parseInt(id));
    
    const query = criterioId 
      ? `SELECT e.id, e.nome as evento, c.nome as criterio, AVG(a.nota) as media
         FROM eventos e
         JOIN participacoes p ON e.id = p.evento_id
         JOIN avaliacoes a ON p.id = a.participacao_id
         JOIN criterios c ON a.criterio_id = c.id
         WHERE e.id = ANY($1) AND c.id = $2
         GROUP BY e.id, e.nome, c.nome`
      : `SELECT e.id, e.nome as evento, AVG(a.nota) as media
         FROM eventos e
         JOIN participacoes p ON e.id = p.evento_id
         JOIN avaliacoes a ON p.id = a.participacao_id
         WHERE e.id = ANY($1)
         GROUP BY e.id, e.nome`;
    
    const params = criterioId ? [ids, criterioId] : [ids];
    const result = await pool.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const compararCriterios = async (req, res) => {
  const { eventoId } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT c.nome as criterio, AVG(a.nota) as media
       FROM criterios c
       JOIN avaliacoes a ON c.id = a.criterio_id
       JOIN participacoes p ON a.participacao_id = p.id
       WHERE p.evento_id = $1
       GROUP BY c.id, c.nome
       ORDER BY c.ordem`,
      [eventoId]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listarEventos = async (req, res) => {
  const { dataInicio, dataFim, pregadorId } = req.query;
  
  try {
    let query = `SELECT DISTINCT e.id, e.nome, e.data_evento, e.status
                 FROM eventos e
                 JOIN participacoes p ON e.id = p.evento_id
                 WHERE 1=1`;
    const params = [];
    
    if (dataInicio) {
      params.push(dataInicio);
      query += ` AND e.data_evento >= $${params.length}`;
    }
    if (dataFim) {
      params.push(dataFim);
      query += ` AND e.data_evento <= $${params.length}`;
    }
    if (pregadorId) {
      params.push(pregadorId);
      query += ` AND p.pregador_id = $${params.length}`;
    }
    
    query += ' ORDER BY e.data_evento DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listarCriterios = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome FROM criterios WHERE ativo = true ORDER BY ordem');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
