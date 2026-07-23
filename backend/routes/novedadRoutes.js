import express from 'express';
import { getNovedad, updateNovedad } from '../controllers/novedadController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNovedad)
  .post(authorize('admin'), updateNovedad);

export default router;
