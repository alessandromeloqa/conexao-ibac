export const validarEvento = async (req, res, next) => {
  const { eventoId } = req.params;
  
  if (!eventoId || isNaN(eventoId)) {
    return res.status(400).json({ error: 'ID de evento inválido' });
  }
  
  next();
};

export const validarParticipacao = async (req, res, next) => {
  const { participacaoId } = req.params;
  
  if (!participacaoId || isNaN(participacaoId)) {
    return res.status(400).json({ error: 'ID de participação inválido' });
  }
  
  next();
};

export const validarAvaliacao = (req, res, next) => {
  const { participacao_id, criterio_id, nota, avaliador_nome } = req.body;
  
  if (!avaliador_nome || avaliador_nome.trim() === '') {
    return res.status(400).json({ error: 'Nome do avaliador é obrigatório' });
  }
  
  if (!participacao_id || !criterio_id || nota === undefined) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }
  
  if (isNaN(nota) || nota < 0 || nota > 10) {
    return res.status(400).json({ error: 'Nota deve estar entre 0 e 10' });
  }
  
  if (nota % 0.5 !== 0) {
    return res.status(400).json({ error: 'Nota deve ser múltiplo de 0.5' });
  }
  
  next();
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};
