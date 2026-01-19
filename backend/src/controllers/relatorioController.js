import pool from '../db.js';
import { gerarRelatorioGeralPDF, gerarRelatorioCandidatoPDF } from '../services/pdfService.js';

export const getRelatorioGeralPDF = async (req, res) => {
  const { eventoId } = req.query;

  try {
    const whereClause = eventoId ? 'WHERE e.id = $1' : '';
    const params = eventoId ? [eventoId] : [];

    const result = await pool.query(
      `SELECT 
         pr.id as pregador_id,
         pr.nome as pregador_nome,
         e.id as evento_id,
         e.nome as evento_nome,
         e.data_evento,
         AVG(a.nota) as media_geral,
         COUNT(DISTINCT a.id) as total_avaliacoes,
         RANK() OVER (PARTITION BY e.id ORDER BY AVG(a.nota) DESC) as ranking
       FROM pregadores pr
       JOIN participacoes p ON pr.id = p.pregador_id
       JOIN eventos e ON p.evento_id = e.id
       JOIN avaliacoes a ON p.id = a.participacao_id
       ${whereClause}
       GROUP BY pr.id, pr.nome, e.id, e.nome, e.data_evento
       ORDER BY e.data_evento DESC, media_geral DESC`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nenhum dado encontrado' });
    }

    const pregadoresComDetalhes = [];
    for (const pregador of result.rows) {
      const detalhes = await pool.query(
        `SELECT 
           c.nome as criterio_nome,
           a.nota,
           a.avaliador_nome,
           c.ordem
         FROM avaliacoes a
         JOIN participacoes p ON a.participacao_id = p.id
         JOIN criterios c ON a.criterio_id = c.id
         WHERE p.pregador_id = $1 AND p.evento_id = $2
         ORDER BY c.ordem, a.avaliador_nome`,
        [pregador.pregador_id, pregador.evento_id]
      );

      pregadoresComDetalhes.push({
        ...pregador,
        detalhes: detalhes.rows
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio_geral.pdf');

    gerarRelatorioGeralPDF(pregadoresComDetalhes, res);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getRelatorioCandidatoPDF = async (req, res) => {
  const { pregadorId, eventoId } = req.params;

  try {
    const [info, detalhes] = await Promise.all([
      pool.query(
        `SELECT 
           pr.nome as pregador_nome,
           e.nome as evento_nome,
           e.data_evento,
           AVG(a.nota) as media_geral,
           COUNT(DISTINCT a.id) as total_avaliacoes,
           RANK() OVER (ORDER BY AVG(a.nota) DESC) as ranking
         FROM pregadores pr
         JOIN participacoes p ON pr.id = p.pregador_id
         JOIN eventos e ON p.evento_id = e.id
         JOIN avaliacoes a ON p.id = a.participacao_id
         WHERE pr.id = $1 AND e.id = $2
         GROUP BY pr.id, pr.nome, e.id, e.nome, e.data_evento`,
        [pregadorId, eventoId]
      ),
      pool.query(
        `SELECT 
           c.nome as criterio_nome,
           a.nota,
           a.avaliador_nome,
           c.ordem
         FROM avaliacoes a
         JOIN participacoes p ON a.participacao_id = p.id
         JOIN criterios c ON a.criterio_id = c.id
         WHERE p.pregador_id = $1 AND p.evento_id = $2
         ORDER BY c.ordem, a.avaliador_nome`,
        [pregadorId, eventoId]
      )
    ]);

    if (info.rows.length === 0) {
      return res.status(404).json({ error: 'Dados não encontrados' });
    }

    const dados = {
      ...info.rows[0],
      detalhes: detalhes.rows
    };

    const nomeArquivo = `relatorio_${dados.pregador_nome.replace(/\s+/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${nomeArquivo}`);

    gerarRelatorioCandidatoPDF(dados, res);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: error.message });
  }
};
