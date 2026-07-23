import express from 'express';
import { getMyNotifications, readNotification } from '../controllers/notificacionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('cliente'));

router.route('/')
  .get(getMyNotifications);

router.route('/:id/leer')
  .put(readNotification);

export default router;
