import express from 'express';
import { compararEventos, compararCriterios, listarEventos, listarCriterios } from '../controllers/comparativoController.js';
import { listarParticipacoesEvento } from '../controllers/participacaoController.js';

const router = express.Router();

router.get('/comparativo/eventos', compararEventos);
router.get('/comparativo/evento/:eventoId/criterios', compararCriterios);
router.get('/eventos', listarEventos);
router.get('/eventos/:eventoId/participacoes', listarParticipacoesEvento);
router.get('/criterios', listarCriterios);

export default router;
