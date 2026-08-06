import { Router } from 'express';
import { StudentsController } from './students.controller.js';
import { authenticateToken } from '../../middlewares/authMiddleware.js';

const router = Router();

// Rutas de Gestión de Alumnos (Sprint 2 - Unión Jaguera FC)
router.get('/', authenticateToken, StudentsController.getAll);
router.get('/:id', authenticateToken, StudentsController.getById);
router.post('/', authenticateToken, StudentsController.create);
router.put('/:id', authenticateToken, StudentsController.update);
router.patch('/:id/status', authenticateToken, StudentsController.updateStatus);
router.delete('/:id', authenticateToken, StudentsController.deleteLogical);
router.delete('/:id/permanent', authenticateToken, StudentsController.deletePhysical);

export default router;
