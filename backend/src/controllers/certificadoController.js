import pool from '../db.js';
import { gerarCertificado, gerarDadosCertificado } from '../services/pdfService.js';

export const gerarCertificadoIndividual = async (req, res) => {
  const { participacaoId } = req.params;

  try {
    const result = await pool.query(
      `SELECT e.status FROM participacoes p
       JOIN eventos e ON p.evento_id = e.id
       WHERE p.id = $1`,
      [participacaoId]
    );

    if (result.rows[0]?.status !== 'encerrado') {
      return res.status(400).json({ error: 'Evento não encerrado' });
    }

    const participacao = await pool.query(
      `SELECT * FROM vw_historico_pregador vh
       JOIN participacoes p ON vh.pregador_id = p.pregador_id AND vh.evento_id = p.evento_id
       WHERE p.id = $1`,
      [participacaoId]
    );

    let cert = await pool.query(
      'SELECT codigo_validacao FROM certificados WHERE participacao_id = $1',
      [participacaoId]
    );

    let codigo;
    if (cert.rows.length === 0) {
      const insert = await pool.query(
        'INSERT INTO certificados (participacao_id) VALUES ($1) RETURNING codigo_validacao',
        [participacaoId]
      );
      codigo = insert.rows[0].codigo_validacao;
    } else {
      codigo = cert.rows[0].codigo_validacao;
    }

    const dados = gerarDadosCertificado(participacao.rows[0], codigo);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificado-${participacaoId}.pdf`);

    gerarCertificado(dados, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const gerarCertificadosLote = async (req, res) => {
  const { eventoId } = req.params;

  try {
    const evento = await pool.query(
      'SELECT status FROM eventos WHERE id = $1',
      [eventoId]
    );

    if (evento.rows[0]?.status !== 'encerrado') {
      return res.status(400).json({ error: 'Evento não encerrado' });
    }

    const participacoes = await pool.query(
      `SELECT p.id FROM participacoes p WHERE p.evento_id = $1`,
      [eventoId]
    );

    const ids = participacoes.rows.map(p => p.id);
    res.json({ message: 'Use os IDs para gerar individualmente', participacoes: ids });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const validarCertificado = async (req, res) => {
  const { codigo } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.codigo_validacao, p.pregador_nome, e.evento_nome, vh.media_geral, vh.ranking
       FROM certificados c
       JOIN participacoes part ON c.participacao_id = part.id
       JOIN vw_historico_pregador vh ON part.pregador_id = vh.pregador_id AND part.evento_id = vh.evento_id
       JOIN pregadores p ON vh.pregador_id = p.id
       JOIN eventos e ON vh.evento_id = e.id
       WHERE c.codigo_validacao = $1`,
      [codigo]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ valido: false });
    }

    res.json({ valido: true, dados: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
