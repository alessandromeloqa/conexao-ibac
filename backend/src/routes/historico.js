import express from 'express';
import { getHistoricoPregador, getHistoricoDetalhado, getHistoricoPDF, getEvolucaoPregador, refreshHistorico } from '../controllers/historicoController.js';

const router = express.Router();

router.get('/pregador/:pregadorId/historico', getHistoricoPregador);
router.get('/pregador/:pregadorId/historico/pdf', getHistoricoPDF);
router.get('/pregador/:pregadorId/evento/:eventoId/detalhes', getHistoricoDetalhado);
router.get('/pregador/:pregadorId/evolucao', getEvolucaoPregador);
router.post('/historico/refresh', refreshHistorico);

export default router;
