import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { authenticateToken } from '../../middlewares/authMiddleware.js';

const router = Router();

router.get('/stats', authenticateToken, DashboardController.getStats);

export default router;
