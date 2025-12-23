import pool from '../db.js';
import { parse } from 'csv-parse/sync';

export const listarPregadores = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pregadores ORDER BY nome');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const criarPregador = async (req, res) => {
  const { nome, email, telefone } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO pregadores (nome, email, telefone) VALUES ($1, $2, $3) RETURNING *',
      [nome, email, telefone]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const atualizarPregador = async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone } = req.body;

  try {
    const result = await pool.query(
      `UPDATE pregadores 
       SET nome = COALESCE($1, nome),
           email = COALESCE($2, email),
           telefone = COALESCE($3, telefone)
       WHERE id = $4
       RETURNING *`,
      [nome, email, telefone, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletarPregador = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM pregadores WHERE id = $1', [id]);
    res.json({ message: 'Pregador deletado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const importarPregadores = async (req, res) => {
  const { evento_id } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: 'Arquivo CSV não enviado' });
  }

  if (!evento_id) {
    return res.status(400).json({ error: 'ID do evento é obrigatório' });
  }

  try {
    const csvContent = req.file.buffer.toString('utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    });

    const client = await pool.connect();
    const resultados = { sucesso: 0, erros: [] };

    try {
      await client.query('BEGIN');

      for (const [index, record] of records.entries()) {
        const linha = index + 2;
        
        if (!record.nome || record.nome.trim() === '') {
          resultados.erros.push(`Linha ${linha}: Nome é obrigatório`);
          continue;
        }

        try {
          // Inserir ou buscar pregador
          let pregadorResult = await client.query(
            'SELECT id FROM pregadores WHERE nome = $1',
            [record.nome.trim()]
          );

          let pregadorId;
          if (pregadorResult.rows.length === 0) {
            pregadorResult = await client.query(
              'INSERT INTO pregadores (nome) VALUES ($1) RETURNING id',
              [record.nome.trim()]
            );
            pregadorId = pregadorResult.rows[0].id;
          } else {
            pregadorId = pregadorResult.rows[0].id;
          }

          // Criar participação
          await client.query(
            'INSERT INTO participacoes (evento_id, pregador_id) VALUES ($1, $2) ON CONFLICT (evento_id, pregador_id) DO NOTHING',
            [evento_id, pregadorId]
          );

          resultados.sucesso++;
        } catch (err) {
          resultados.erros.push(`Linha ${linha}: ${err.message}`);
        }
      }

      await client.query('COMMIT');
      res.json(resultados);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
