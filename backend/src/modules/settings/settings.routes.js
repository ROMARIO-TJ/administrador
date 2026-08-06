import { Router } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware.js';
import prisma from '../../config/db.js';

const router = Router();

// Obtener la configuración general de la academia
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    let settings = await prisma.academySetting.findFirst();
    if (!settings) {
      settings = {
        academyName: 'Unión Jaguera FC',
        address: 'La Jagua de Ibirico, Cesar, Colombia',
        phone: '+57 300 123 4567',
        email: 'contacto@unionjaguerafc.com',
        registrationFee: 50000.0,
        monthlyFee: 80000.0
      };
    }
    return res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
});

export default router;
