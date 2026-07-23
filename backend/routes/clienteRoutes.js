import express from 'express';
import { getClientes, getClienteDetail, createCliente, updateCliente } from '../controllers/clienteController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getClientes)
  .post(createCliente);

router.route('/:id')
  .get(getClienteDetail)
  .put(updateCliente);

export default router;
