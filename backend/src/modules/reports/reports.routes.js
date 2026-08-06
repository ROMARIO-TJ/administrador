import { Router } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware.js';
import { ReportsController } from './reports.controller.js';

const router = Router();

// Todas las rutas de reportes requieren autenticación JWT
router.use(authenticateToken);

router.get('/students', ReportsController.getStudentsReport);
router.get('/monthly', ReportsController.getMonthlyReport);
router.get('/debtors', ReportsController.getDebtorsReport);
router.get('/income', ReportsController.getIncomeReport);
router.get('/categories', ReportsController.getCategoriesReport);
router.get('/registrations', ReportsController.getRegistrationsReport);
router.get('/movements', ReportsController.getMovementsReport);
router.get('/student/:id', ReportsController.getStudentIndividualReport);

export default router;
