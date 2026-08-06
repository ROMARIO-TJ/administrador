import { Router } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware.js';
import { PaymentsController } from './payments.controller.js';

const router = Router();

// Todas las rutas del módulo de pagos requieren autenticación
router.use(authenticateToken);

// Tarifas dinámicas
router.get('/default-fees', PaymentsController.getDefaultFees);

// Listado general de pagos
router.get('/all', PaymentsController.getAllPayments);
router.get('/', PaymentsController.getAllPayments);

// Inscripciones
router.post('/registrations', PaymentsController.registerRegistration);

// Mensualidades
router.post('/monthly', PaymentsController.registerMonthlyPayment);

// Estado financiero de alumno
router.get('/student/:studentId/financial-status', PaymentsController.getStudentFinancialStatus);

export default router;
