import express from 'express';
import { getRelatorioGeralPDF, getRelatorioCandidatoPDF } from '../controllers/relatorioController.js';

const router = express.Router();

router.get('/relatorios/geral/pdf', getRelatorioGeralPDF);
router.get('/relatorios/candidato/:pregadorId/evento/:eventoId/pdf', getRelatorioCandidatoPDF);

export default router;
