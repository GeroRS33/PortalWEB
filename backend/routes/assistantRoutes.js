import express from 'express';
import { getResumenAbastecimiento, analizarConIA, preguntarAlAsistente } from '../controllers/assistantController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('cliente'));

router.get('/resumen', getResumenAbastecimiento);
router.post('/analizar', analizarConIA);
router.post('/preguntar', preguntarAlAsistente);

export default router;
