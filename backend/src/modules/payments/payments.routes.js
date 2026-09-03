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
router.put('/registration/:id', PaymentsController.updateRegistration);
router.put('/registrations/:id', PaymentsController.updateRegistration);
router.delete('/registration/:id', PaymentsController.deleteRegistration);

// Mensualidades
router.post('/monthly', PaymentsController.registerMonthlyPayment);
router.put('/monthly/:id', PaymentsController.updateMonthlyPayment);
router.delete('/monthly/:id', PaymentsController.deleteMonthlyPayment);

// Estado financiero y recomendación de ciclo de alumno
router.get('/student/:studentId/financial-status', PaymentsController.getStudentFinancialStatus);
router.get('/student/:studentId/recommended-cycle', PaymentsController.getRecommendedPaymentCycle);

export default router;
