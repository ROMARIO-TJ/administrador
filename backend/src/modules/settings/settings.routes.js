import { Router } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware.js';
import { SettingsController } from './settings.controller.js';

const router = Router();

// Todas las rutas de configuración requieren autenticación
router.use(authenticateToken);

// General & Secciones
router.get('/', SettingsController.getSettings);
router.put('/institutional', SettingsController.updateInstitutional);
router.put('/financial', SettingsController.updateFinancial);
router.put('/appearance', SettingsController.updateAppearance);

// Temporadas
router.get('/seasons', SettingsController.getSeasons);
router.post('/seasons', SettingsController.createSeason);
router.put('/seasons/:id', SettingsController.updateSeason);
router.delete('/seasons/:id', SettingsController.deleteSeason);
router.post('/seasons/:id/active', SettingsController.setActiveSeason);

// Categorías
router.get('/categories', SettingsController.getCategories);
router.post('/categories', SettingsController.createCategory);
router.put('/categories/:id', SettingsController.updateCategory);
router.delete('/categories/:id', SettingsController.deleteCategory);

// Métodos de Pago
router.get('/payment-methods', SettingsController.getPaymentMethods);
router.post('/payment-methods', SettingsController.createPaymentMethod);
router.put('/payment-methods/:id', SettingsController.updatePaymentMethod);
router.patch('/payment-methods/:id/toggle', SettingsController.togglePaymentMethod);

// Consecutivos
router.get('/consecutives', SettingsController.getConsecutives);
router.post('/consecutives/reset', SettingsController.resetConsecutive);

export default router;
