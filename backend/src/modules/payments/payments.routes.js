import { Router } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware.js';

const router = Router();

// Estructura base de rutas para Pagos (se desarrollará en Sprint 2)
router.get('/', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Módulo de Pagos preparado (Sprint 2)', data: [] });
});

export default router;
