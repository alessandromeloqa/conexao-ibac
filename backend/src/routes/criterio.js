import express from 'express';
import { 
  listarCriteriosAdmin, 
  criarCriterio, 
  atualizarCriterio, 
  vincularCriteriosEvento,
  getCriteriosEvento 
} from '../controllers/criterioController.js';

const router = express.Router();

router.get('/criterios', listarCriteriosAdmin);
router.get('/admin/criterios', listarCriteriosAdmin);
router.post('/admin/criterios', criarCriterio);
router.put('/admin/criterios/:id', atualizarCriterio);
router.post('/admin/eventos/:eventoId/criterios', vincularCriteriosEvento);
router.get('/eventos/:eventoId/criterios', getCriteriosEvento);

export default router;
