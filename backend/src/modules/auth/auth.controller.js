import { AuthService } from './auth.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

/**
 * Controlador de solicitudes del módulo de autenticación
 */
export class AuthController {
  /**
   * POST /api/auth/login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return successResponse(res, result, 'Inicio de sesión exitoso');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   */
  static async getMe(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await AuthService.getMe(userId);
      return successResponse(res, result, 'Datos de perfil obtenidos correctamente');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }
}
