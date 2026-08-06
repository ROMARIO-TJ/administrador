import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import studentsRoutes from '../modules/students/students.routes.js';
import categoriesRoutes from '../modules/categories/categories.routes.js';
import paymentsRoutes from '../modules/payments/payments.routes.js';
import reportsRoutes from '../modules/reports/reports.routes.js';
import settingsRoutes from '../modules/settings/settings.routes.js';

const router = Router();

// Registro de subrutas modulares
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/students', studentsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/payments', paymentsRoutes);
router.use('/reports', reportsRoutes);
router.use('/settings', settingsRoutes);

export default router;
