import express from 'express';
import { criarAvaliacao } from '../controllers/avaliacaoController.js';
import { validarAvaliacao, sanitizeInput } from '../middleware/validation.js';

const router = express.Router();

router.post('/avaliacoes', sanitizeInput, validarAvaliacao, criarAvaliacao);

export default router;
