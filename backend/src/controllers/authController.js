import pool from '../db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'conexao-ibac-secret-key-2024';

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1 AND ativo = true',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(password, usuario.password_hash);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, username: usuario.username },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        nome: usuario.nome
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verificarToken = async (req, res) => {
  try {
    res.json({ valido: true, usuario: req.usuario });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const gerarTokenEvento = async (req, res) => {
  const { eventoId } = req.params;

  try {
    const token = crypto.randomBytes(32).toString('hex');
    
    await pool.query(
      'INSERT INTO evento_tokens (evento_id, token) VALUES ($1, $2)',
      [eventoId, token]
    );

    await pool.query(
      'UPDATE eventos SET token_acesso = $1 WHERE id = $2',
      [token, eventoId]
    );

    res.json({ token, url: `${process.env.BASE_URL || 'http://localhost:8081'}/avaliacao.html?token=${token}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const validarTokenEvento = async (req, res) => {
  const { token } = req.params;

  try {
    const result = await pool.query(
      `SELECT et.*, e.nome as evento_nome, e.status 
       FROM evento_tokens et
       JOIN eventos e ON et.evento_id = e.id
       WHERE et.token = $1 AND et.ativo = true AND e.status = 'ativo'`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ valido: false, error: 'Token inválido ou expirado' });
    }

    const tokenData = result.rows[0];

    if (tokenData.expira_em && new Date(tokenData.expira_em) < new Date()) {
      return res.status(401).json({ valido: false, error: 'Token expirado' });
    }

    res.json({
      valido: true,
      evento_id: tokenData.evento_id,
      evento_nome: tokenData.evento_nome
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
