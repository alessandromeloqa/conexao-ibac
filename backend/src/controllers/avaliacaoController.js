import pool from '../db.js';

export const criarAvaliacao = async (req, res) => {
  const { participacao_id, criterio_id, nota, avaliador_nome } = req.body;

  try {
    const duplicata = await pool.query(
      `SELECT id FROM avaliacoes 
       WHERE participacao_id = $1 AND criterio_id = $2 AND avaliador_nome = $3`,
      [participacao_id, criterio_id, avaliador_nome]
    );

    if (duplicata.rows.length > 0) {
      return res.status(409).json({ error: 'Avaliação duplicada' });
    }

    const result = await pool.query(
      `INSERT INTO avaliacoes (participacao_id, criterio_id, nota, avaliador_nome)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [participacao_id, criterio_id, nota, avaliador_nome]
    );

    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
