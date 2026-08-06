import { Router } from 'express';
import { CategoriesController } from './categories.controller.js';
import { authenticateToken } from '../../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, CategoriesController.getAll);
router.get('/:id', authenticateToken, CategoriesController.getById);
router.post('/', authenticateToken, CategoriesController.create);
router.put('/:id', authenticateToken, CategoriesController.update);
router.delete('/:id', authenticateToken, CategoriesController.delete);

export default router;
