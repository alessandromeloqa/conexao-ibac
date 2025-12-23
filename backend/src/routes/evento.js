import express from 'express';
import { listarEventos, criarEvento, atualizarEvento, deletarEvento } from '../controllers/eventoController.js';

const router = express.Router();

router.get('/eventos', listarEventos);
router.post('/eventos', criarEvento);
router.put('/eventos/:id', atualizarEvento);
router.delete('/eventos/:id', deletarEvento);

export default router;
