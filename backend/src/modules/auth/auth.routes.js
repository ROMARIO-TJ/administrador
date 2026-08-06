import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authenticateToken } from '../../middlewares/authMiddleware.js';

const router = Router();

// Rutas públicas
router.post('/login', AuthController.login);

// Rutas protegidas por JWT
router.get('/me', authenticateToken, AuthController.getMe);

export default router;
