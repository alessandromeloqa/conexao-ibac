import pool from '../db.js';
import { gerarRankingPDF } from '../services/pdfService.js';

export const getRankingPublico = async (req, res) => {
  const { eventoId } = req.params;

  try {
    const ranking = await pool.query(
      `SELECT 
         ROW_NUMBER() OVER (ORDER BY AVG(a.nota) DESC) as posicao,
         pr.nome as pregador,
         AVG(a.nota) as media,
         COUNT(DISTINCT a.id) as total_avaliacoes
       FROM participacoes p
       JOIN pregadores pr ON p.pregador_id = pr.id
       JOIN avaliacoes a ON p.id = a.participacao_id
       WHERE p.evento_id = $1
       GROUP BY pr.id, pr.nome
       ORDER BY media DESC`,
      [eventoId]
    );

    const evento = await pool.query(
      'SELECT nome, data_evento FROM eventos WHERE id = $1',
      [eventoId]
    );

    res.json({
      evento: evento.rows[0],
      ranking: ranking.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRankingPDF = async (req, res) => {
  const { eventoId } = req.params;

  try {
    const ranking = await pool.query(
      `SELECT 
         ROW_NUMBER() OVER (ORDER BY AVG(a.nota) DESC) as posicao,
         pr.nome as pregador,
         AVG(a.nota) as media
       FROM participacoes p
       JOIN pregadores pr ON p.pregador_id = pr.id
       JOIN avaliacoes a ON p.id = a.participacao_id
       WHERE p.evento_id = $1
       GROUP BY pr.id, pr.nome
       ORDER BY media DESC`,
      [eventoId]
    );

    const evento = await pool.query(
      'SELECT nome, data_evento FROM eventos WHERE id = $1',
      [eventoId]
    );

    if (!evento.rows[0]) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    const dados = {
      evento: evento.rows[0],
      ranking: ranking.rows
    };

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ranking_${eventoId}.pdf`);

    gerarRankingPDF(dados, res);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ error: error.message });
  }
};
