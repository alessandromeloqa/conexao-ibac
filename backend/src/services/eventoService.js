import pool from '../db.js';

class EventoService {
  async getAll() {
    const result = await pool.query(
      `SELECT id, nome, data_evento, local, status, created_at
       FROM eventos 
       ORDER BY data_evento DESC`
    );
    return result.rows;
  }

  async getById(eventoId) {
    const result = await pool.query(
      `SELECT id, nome, data_evento, local, status, created_at
       FROM eventos 
       WHERE id = $1`,
      [eventoId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Evento não encontrado');
    }
    
    return result.rows[0];
  }

  async getAtivos() {
    const result = await pool.query(
      `SELECT id, nome, data_evento, local, status
       FROM eventos 
       WHERE status = 'ativo' 
       ORDER BY data_evento DESC`
    );
    return result.rows;
  }

  async create(data) {
    const { nome, data_evento, local } = data;
    
    const result = await pool.query(
      `INSERT INTO eventos (nome, data_evento, local, status) 
       VALUES ($1, $2, $3, 'ativo') 
       RETURNING id, nome, data_evento, local, status`,
      [nome, data_evento, local]
    );
    
    return result.rows[0];
  }

  async update(eventoId, data) {
    const evento = await this.getById(eventoId);
    
    if (evento.status === 'encerrado') {
      throw new Error('Não é possível alterar evento encerrado');
    }
    
    const { nome, data_evento, local } = data;
    
    const result = await pool.query(
      `UPDATE eventos 
       SET nome = $1, data_evento = $2, local = $3 
       WHERE id = $4 
       RETURNING id, nome, data_evento, local, status`,
      [nome, data_evento, local, eventoId]
    );
    
    return result.rows[0];
  }

  async encerrar(eventoId) {
    const result = await pool.query(
      `UPDATE eventos 
       SET status = 'encerrado' 
       WHERE id = $1 
       RETURNING id, nome, status`,
      [eventoId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Evento não encontrado');
    }
    
    return result.rows[0];
  }

  async getParticipacoes(eventoId) {
    const result = await pool.query(
      `SELECT 
         p.id as participacao_id,
         p.tema,
         p.data_apresentacao,
         pr.id as pregador_id,
         pr.nome as pregador_nome,
         pr.email as pregador_email
       FROM participacoes p
       JOIN pregadores pr ON p.pregador_id = pr.id
       WHERE p.evento_id = $1
       ORDER BY pr.nome`,
      [eventoId]
    );
    
    return result.rows;
  }

  async getCriterios(eventoId) {
    // Primeiro tenta buscar critérios específicos do evento
    const criteriosEvento = await pool.query(
      `SELECT c.id, c.nome, c.peso, ec.ordem
       FROM evento_criterios ec
       JOIN criterios c ON ec.criterio_id = c.id
       WHERE ec.evento_id = $1
       ORDER BY ec.ordem`,
      [eventoId]
    );
    
    // Se não houver critérios específicos, retorna os ativos
    if (criteriosEvento.rows.length === 0) {
      const criteriosAtivos = await pool.query(
        `SELECT id, nome, peso, ordem
         FROM criterios
         WHERE ativo = true
         ORDER BY ordem`
      );
      return criteriosAtivos.rows;
    }
    
    return criteriosEvento.rows;
  }
}

export default new EventoService();
