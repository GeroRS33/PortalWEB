import express from 'express';
import { 
  createPedido, 
  getPedidos, 
  getPedidoById, 
  cancelarPedido, 
  cambiarEstadoPedido,
  modificarItemsPedido 
} from '../controllers/pedidoController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('cliente'), createPedido)
  .get(getPedidos);

router.route('/:id')
  .get(getPedidoById);

router.route('/:id/cancelar')
  .post(cancelarPedido)
  .put(cancelarPedido);

router.route('/:id/estado')
  .put(authorize('admin'), cambiarEstadoPedido);

router.route('/:id/items')
  .put(authorize('admin'), modificarItemsPedido);

export default router;
