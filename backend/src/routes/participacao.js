import express from 'express';
import { listarParticipacoesEvento, listarTodasParticipacoes, criarParticipacao, atualizarParticipacao, deletarParticipacao } from '../controllers/participacaoController.js';

const router = express.Router();

router.get('/participacoes', listarTodasParticipacoes);
router.get('/eventos/:eventoId/participacoes', listarParticipacoesEvento);
router.post('/participacoes', criarParticipacao);
router.put('/participacoes/:id', atualizarParticipacao);
router.delete('/participacoes/:id', deletarParticipacao);

export default router;
