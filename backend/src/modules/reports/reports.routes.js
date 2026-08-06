import { Router } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware.js';

const router = Router();

// Estructura base de rutas para Reportes
router.get('/', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Módulo de Reportes preparado', data: {} });
});

export default router;
