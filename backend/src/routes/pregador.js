import express from 'express';
import { listarPregadores, criarPregador, atualizarPregador, deletarPregador, importarPregadores } from '../controllers/pregadorController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/pregadores', listarPregadores);
router.post('/pregadores', criarPregador);
router.post('/pregadores/importar', upload.single('arquivo'), importarPregadores);
router.put('/pregadores/:id', atualizarPregador);
router.delete('/pregadores/:id', deletarPregador);

export default router;
