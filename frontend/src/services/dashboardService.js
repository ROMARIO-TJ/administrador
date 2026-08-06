import api from './api';

export const dashboardService = {
  /**
   * Obtener métricas estadísticas reales del Dashboard desde PostgreSQL
   */
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }
};

export default dashboardService;
