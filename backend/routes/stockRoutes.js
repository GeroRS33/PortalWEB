import express from 'express';
import { getMyStock, getClienteStock, updateStock } from '../controllers/stockController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('cliente'), getMyStock)
  .put(authorize('cliente'), updateStock);

router.route('/cliente/:clienteId')
  .get(authorize('admin'), getClienteStock);

export default router;
