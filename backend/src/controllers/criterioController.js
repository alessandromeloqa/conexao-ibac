import pool from '../db.js';

export const listarCriteriosAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM criterios ORDER BY ordem, id'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const criarCriterio = async (req, res) => {
  const { nome, peso, ordem } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO criterios (nome, peso, ordem, ativo) 
       VALUES ($1, $2, $3, true) 
       RETURNING *`,
      [nome, peso || 1.0, ordem || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const atualizarCriterio = async (req, res) => {
  const { id } = req.params;
  const { nome, peso, ordem, ativo } = req.body;

  try {
    const result = await pool.query(
      `UPDATE criterios 
       SET nome = COALESCE($1, nome),
           peso = COALESCE($2, peso),
           ordem = COALESCE($3, ordem),
           ativo = COALESCE($4, ativo)
       WHERE id = $5
       RETURNING *`,
      [nome, peso, ordem, ativo, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const vincularCriteriosEvento = async (req, res) => {
  const { eventoId } = req.params;
  const { criterioIds } = req.body;

  try {
    await pool.query('DELETE FROM evento_criterios WHERE evento_id = $1', [eventoId]);

    for (let i = 0; i < criterioIds.length; i++) {
      await pool.query(
        'INSERT INTO evento_criterios (evento_id, criterio_id, ordem) VALUES ($1, $2, $3)',
        [eventoId, criterioIds[i], i]
      );
    }

    res.json({ message: 'Critérios vinculados' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCriteriosEvento = async (req, res) => {
  const { eventoId } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.* 
       FROM criterios c
       JOIN evento_criterios ec ON c.id = ec.criterio_id
       WHERE ec.evento_id = $1
       ORDER BY ec.ordem`,
      [eventoId]
    );

    if (result.rows.length === 0) {
      const ativos = await pool.query(
        'SELECT * FROM criterios WHERE ativo = true ORDER BY ordem'
      );
      return res.json(ativos.rows);
    }

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
