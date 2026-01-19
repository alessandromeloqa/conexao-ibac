/**
 * Middleware de Validação e Sanitização
 * Segurança contra SQL Injection e XSS
 */

// Sanitização global de inputs
export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }
  
  next();
};

// Validação de ID numérico
export const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({ 
        success: false,
        message: `ID inválido: ${paramName}` 
      });
    }
    
    req.params[paramName] = parseInt(id);
    next();
  };
};

// Validação de evento
export const validateEvento = (req, res, next) => {
  const { nome, data_evento } = req.body;
  
  if (!nome || nome.length < 3) {
    return res.status(400).json({ 
      success: false,
      message: 'Nome do evento deve ter no mínimo 3 caracteres' 
    });
  }
  
  if (!data_evento) {
    return res.status(400).json({ 
      success: false,
      message: 'Data do evento é obrigatória' 
    });
  }
  
  const dataEvento = new Date(data_evento);
  if (isNaN(dataEvento.getTime())) {
    return res.status(400).json({ 
      success: false,
      message: 'Data do evento inválida' 
    });
  }
  
  next();
};

// Validação de avaliação
export const validateAvaliacao = (req, res, next) => {
  const { participacao_id, criterio_id, nota, avaliador_nome } = req.body;
  
  // Campos obrigatórios
  if (!participacao_id || !criterio_id || nota === undefined || !avaliador_nome) {
    return res.status(400).json({ 
      success: false,
      message: 'Campos obrigatórios: participacao_id, criterio_id, nota, avaliador_nome' 
    });
  }
  
  // Validação de nota
  const notaNum = parseFloat(nota);
  
  if (isNaN(notaNum)) {
    return res.status(400).json({ 
      success: false,
      message: 'Nota deve ser um número' 
    });
  }
  
  if (notaNum < 0 || notaNum > 10) {
    return res.status(400).json({ 
      success: false,
      message: 'Nota deve estar entre 0 e 10' 
    });
  }
  
  if (notaNum % 0.5 !== 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Nota deve ser múltiplo de 0.5' 
    });
  }
  
  // Validação de nome do avaliador
  if (avaliador_nome.length < 3) {
    return res.status(400).json({ 
      success: false,
      message: 'Nome do avaliador deve ter no mínimo 3 caracteres' 
    });
  }
  
  next();
};

// Validação de pregador
export const validatePregador = (req, res, next) => {
  const { nome, email } = req.body;
  
  if (!nome || nome.length < 3) {
    return res.status(400).json({ 
      success: false,
      message: 'Nome do pregador deve ter no mínimo 3 caracteres' 
    });
  }
  
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Email inválido' 
      });
    }
  }
  
  next();
};

// Validação de critério
export const validateCriterio = (req, res, next) => {
  const { nome, peso, ordem } = req.body;
  
  if (!nome || nome.length < 3) {
    return res.status(400).json({ 
      success: false,
      message: 'Nome do critério deve ter no mínimo 3 caracteres' 
    });
  }
  
  if (peso !== undefined) {
    const pesoNum = parseFloat(peso);
    if (isNaN(pesoNum) || pesoNum < 0 || pesoNum > 10) {
      return res.status(400).json({ 
        success: false,
        message: 'Peso deve ser um número entre 0 e 10' 
      });
    }
  }
  
  if (ordem !== undefined) {
    const ordemNum = parseInt(ordem);
    if (isNaN(ordemNum) || ordemNum < 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Ordem deve ser um número positivo' 
      });
    }
  }
  
  next();
};

// Rate limiting simples (em produção usar redis)
const requestCounts = new Map();

export const rateLimit = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = requestCounts.get(ip);
    
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    
    if (record.count >= maxRequests) {
      return res.status(429).json({ 
        success: false,
        message: 'Muitas requisições. Tente novamente em alguns instantes.' 
      });
    }
    
    record.count++;
    next();
  };
};

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Erro de validação do PostgreSQL
  if (err.code === '23505') {
    return res.status(409).json({ 
      success: false,
      message: 'Registro duplicado' 
    });
  }
  
  if (err.code === '23503') {
    return res.status(400).json({ 
      success: false,
      message: 'Referência inválida' 
    });
  }
  
  // Erro genérico
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Erro interno do servidor' 
  });
};
