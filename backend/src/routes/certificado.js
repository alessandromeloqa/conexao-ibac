import express from 'express';
import { gerarCertificadoIndividual, gerarCertificadosLote, validarCertificado } from '../controllers/certificadoController.js';
import { validarParticipacao, validarEvento } from '../middleware/validation.js';

const router = express.Router();

router.get('/certificado/participacao/:participacaoId', validarParticipacao, gerarCertificadoIndividual);
router.get('/certificado/evento/:eventoId/lote', validarEvento, gerarCertificadosLote);
router.get('/certificado/validar/:codigo', validarCertificado);

export default router;
