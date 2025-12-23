import pool from '../db.js';

export const listarEventos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM eventos ORDER BY data_evento DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const criarEvento = async (req, res) => {
  const { nome, data_evento, local, status } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO eventos (nome, data_evento, local, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, data_evento, local, status || 'ativo']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const atualizarEvento = async (req, res) => {
  const { id } = req.params;
  const { nome, data_evento, local, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE eventos 
       SET nome = COALESCE($1, nome),
           data_evento = COALESCE($2, data_evento),
           local = COALESCE($3, local),
           status = COALESCE($4, status)
       WHERE id = $5
       RETURNING *`,
      [nome, data_evento, local, status, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletarEvento = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM eventos WHERE id = $1', [id]);
    res.json({ message: 'Evento deletado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
