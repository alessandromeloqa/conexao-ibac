import express from 'express';
import { getRankingPublico, getRankingPDF } from '../controllers/rankingController.js';
import { validarEvento } from '../middleware/validation.js';

const router = express.Router();

router.get('/ranking/:eventoId', validarEvento, getRankingPublico);
router.get('/ranking/:eventoId/pdf', validarEvento, getRankingPDF);

export default router;
