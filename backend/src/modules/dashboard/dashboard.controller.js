import { DashboardService } from './dashboard.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class DashboardController {
  /**
   * GET /api/dashboard/stats
   */
  static async getStats(req, res, next) {
    try {
      const stats = await DashboardService.getStats();
      return successResponse(res, stats, 'Estadísticas del Dashboard obtenidas correctamente');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }
}
