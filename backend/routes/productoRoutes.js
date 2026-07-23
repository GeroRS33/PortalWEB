import express from 'express';
import { getProductos } from '../controllers/productoController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProductos);

export default router;
