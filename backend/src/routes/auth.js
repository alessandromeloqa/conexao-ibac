import express from 'express';
import { login, verificarToken, gerarTokenEvento, validarTokenEvento } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/auth/login', login);
router.get('/auth/verificar', authMiddleware, verificarToken);
router.post('/auth/evento/:eventoId/token', authMiddleware, gerarTokenEvento);
router.get('/auth/token/:token/validar', validarTokenEvento);

export default router;
