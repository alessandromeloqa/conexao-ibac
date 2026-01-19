import pool from '../db.js';

class HistoricoService {
  async getHistoricoPregador(pregadorId) {
    const [historico, mediaCriterios, resumo] = await Promise.all([
      pool.query(
        `SELECT pregador_id, pregador_nome, evento_id, evento_nome, 
                data_evento, tema, media_geral, total_avaliacoes, ranking
         FROM vw_historico_pregador 
         WHERE pregador_id = $1 
         ORDER BY data_evento DESC`,
        [pregadorId]
      ),
      pool.query(
        `SELECT evento_id, criterio_nome, media_criterio 
         FROM vw_media_criterio_pregador 
         WHERE pregador_id = $1`,
        [pregadorId]
      ),
      pool.query(
        `SELECT 
           COUNT(DISTINCT evento_id) as total_eventos,
           ROUND(AVG(media_geral)::numeric, 2) as media_geral_historica,
           SUM(total_avaliacoes) as total_avaliacoes
         FROM vw_historico_pregador 
         WHERE pregador_id = $1`,
        [pregadorId]
      )
    ]);

    return {
      eventos: historico.rows,
      criterios: mediaCriterios.rows,
      resumo: resumo.rows[0] || { total_eventos: 0, media_geral_historica: null, total_avaliacoes: 0 }
    };
  }

  async getEvolucaoPregador(pregadorId) {
    const result = await pool.query(
      `SELECT 
         TO_CHAR(data_evento, 'MM/YYYY') as periodo,
         ROUND(media_geral::numeric, 2) as media_geral,
         evento_nome
       FROM vw_historico_pregador 
       WHERE pregador_id = $1 
       ORDER BY data_evento ASC`,
      [pregadorId]
    );

    return result.rows;
  }

  async getHistoricoDetalhado(pregadorId, eventoId) {
    const result = await pool.query(
      `SELECT 
         e.nome as evento_nome,
         e.data_evento,
         pr.nome as pregador_nome,
         c.nome as criterio_nome,
         a.nota,
         a.avaliador_nome,
         a.created_at as data_avaliacao
       FROM avaliacoes a
       JOIN participacoes p ON a.participacao_id = p.id
       JOIN eventos e ON p.evento_id = e.id
       JOIN pregadores pr ON p.pregador_id = pr.id
       JOIN criterios c ON a.criterio_id = c.id
       WHERE pr.id = $1 AND e.id = $2
       ORDER BY c.ordem, a.avaliador_nome`,
      [pregadorId, eventoId]
    );

    return result.rows;
  }

  async refreshMaterializedViews() {
    await Promise.all([
      pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY vw_historico_pregador'),
      pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY vw_media_criterio_pregador')
    ]);
  }
}

export default new HistoricoService();
