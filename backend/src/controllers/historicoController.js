import pool from '../db.js';

export const getHistoricoPregador = async (req, res) => {
  const { pregadorId } = req.params;

  try {
    const historico = await pool.query(
      `SELECT * FROM vw_historico_pregador 
       WHERE pregador_id = $1 
       ORDER BY data_evento DESC`,
      [pregadorId]
    );

    const mediaCriterios = await pool.query(
      `SELECT evento_id, criterio_nome, media_criterio 
       FROM vw_media_criterio_pregador 
       WHERE pregador_id = $1`,
      [pregadorId]
    );

    const resumo = await pool.query(
      `SELECT 
         COUNT(DISTINCT evento_id) as total_eventos,
         AVG(media_geral) as media_geral_historica,
         SUM(total_avaliacoes) as total_avaliacoes
       FROM vw_historico_pregador 
       WHERE pregador_id = $1`,
      [pregadorId]
    );

    res.json({
      eventos: historico.rows,
      criterios: mediaCriterios.rows,
      resumo: resumo.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEvolucaoPregador = async (req, res) => {
  const { pregadorId } = req.params;

  try {
    const evolucao = await pool.query(
      `SELECT 
         TO_CHAR(data_evento, 'MM/YYYY') as periodo,
         media_geral,
         evento_nome
       FROM vw_historico_pregador 
       WHERE pregador_id = $1 
       ORDER BY data_evento ASC`,
      [pregadorId]
    );

    res.json(evolucao.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const refreshHistorico = async (req, res) => {
  try {
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY vw_historico_pregador');
    await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY vw_media_criterio_pregador');
    res.json({ message: 'Histórico atualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
