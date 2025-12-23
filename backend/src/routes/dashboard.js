import express from 'express';
import { getStats, getUltimasAvaliacoes } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/dashboard/stats', getStats);
router.get('/dashboard/ultimas-avaliacoes', getUltimasAvaliacoes);

export default router;
