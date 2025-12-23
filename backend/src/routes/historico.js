import express from 'express';
import { getHistoricoPregador, getEvolucaoPregador, refreshHistorico } from '../controllers/historicoController.js';

const router = express.Router();

router.get('/pregador/:pregadorId/historico', getHistoricoPregador);
router.get('/pregador/:pregadorId/evolucao', getEvolucaoPregador);
router.post('/historico/refresh', refreshHistorico);

export default router;
