import pool from '../db.js';

export const getStats = async (req, res) => {
  const { evento_id } = req.query;
  
  try {
    let query = 'SELECT COUNT(*) as total_avaliacoes FROM avaliacoes';
    const params = [];
    
    if (evento_id) {
      query += ' WHERE participacao_id IN (SELECT id FROM participacoes WHERE evento_id = $1)';
      params.push(evento_id);
    }
    
    const result = await pool.query(query, params);
    res.json({ total_avaliacoes: parseInt(result.rows[0].total_avaliacoes) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUltimasAvaliacoes = async (req, res) => {
  const { evento_id } = req.query;
  
  try {
    let query = `
      SELECT 
         a.created_at,
         a.nota,
         a.avaliador_nome,
         e.nome as evento_nome,
         pr.nome as pregador_nome
       FROM avaliacoes a
       JOIN participacoes p ON a.participacao_id = p.id
       JOIN eventos e ON p.evento_id = e.id
       JOIN pregadores pr ON p.pregador_id = pr.id`;
    
    const params = [];
    if (evento_id) {
      query += ' WHERE e.id = $1';
      params.push(evento_id);
    }
    
    query += ' ORDER BY a.created_at DESC LIMIT 10';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
