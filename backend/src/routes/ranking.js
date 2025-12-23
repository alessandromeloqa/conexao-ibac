import express from 'express';
import { getRankingPublico } from '../controllers/rankingController.js';
import { validarEvento } from '../middleware/validation.js';

const router = express.Router();

router.get('/ranking/:eventoId', validarEvento, getRankingPublico);

export default router;
