import pool from '../db.js';

export const listarParticipacoesEvento = async (req, res) => {
  const { eventoId } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT p.id, p.pregador_id, pr.nome as pregador_nome, p.tema, e.nome as evento_nome
       FROM participacoes p
       JOIN pregadores pr ON p.pregador_id = pr.id
       JOIN eventos e ON p.evento_id = e.id
       WHERE p.evento_id = $1
       ORDER BY pr.nome`,
      [eventoId]
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const listarTodasParticipacoes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, pr.nome as pregador_nome, p.tema, e.nome as evento_nome
       FROM participacoes p
       JOIN pregadores pr ON p.pregador_id = pr.id
       JOIN eventos e ON p.evento_id = e.id
       ORDER BY e.data_evento DESC, pr.nome`
    );
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const criarParticipacao = async (req, res) => {
  const { evento_id, pregador_id, tema } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO participacoes (evento_id, pregador_id, tema) VALUES ($1, $2, $3) RETURNING *',
      [evento_id, pregador_id, tema]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const atualizarParticipacao = async (req, res) => {
  const { id } = req.params;
  const { tema } = req.body;
  
  try {
    const result = await pool.query(
      'UPDATE participacoes SET tema = $1 WHERE id = $2 RETURNING *',
      [tema, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletarParticipacao = async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM participacoes WHERE id = $1', [id]);
    res.json({ message: 'Participação deletada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
