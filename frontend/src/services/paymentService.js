import api from './api';

export default {
  /**
   * Obtener las tarifas por defecto desde la base de datos
   */
  async getDefaultFees() {
    const response = await api.get('/payments/default-fees');
    return response.data;
  },

  /**
   * Registrar un pago de inscripción
   */
  async registerRegistration(data) {
    const response = await api.post('/payments/registrations', data);
    return response.data;
  },

  /**
   * Registrar un pago de mensualidad
   */
  async registerMonthlyPayment(data) {
    const response = await api.post('/payments/monthly', data);
    return response.data;
  },

  /**
   * Obtener el estado financiero completo de un alumno
   */
  async getStudentFinancialStatus(studentId, year) {
    const response = await api.get(`/payments/student/${studentId}/financial-status`, {
      params: { year }
    });
    return response.data;
  },

  /**
   * Listar todos los pagos con filtros opcionales
   */
  async getAllPayments(params = {}) {
    const response = await api.get('/payments/all', { params });
    return response.data;
  }
};
