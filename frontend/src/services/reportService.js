import api from './api';

export default {
  /**
   * Reporte General de Alumnos
   */
  async getStudentsReport(params = {}) {
    const response = await api.get('/reports/students', { params });
    return response.data;
  },

  /**
   * Reporte de Mensualidades (Matriz Anual)
   */
  async getMonthlyReport(params = {}) {
    const response = await api.get('/reports/monthly', { params });
    return response.data;
  },

  /**
   * Reporte de Morosos
   */
  async getDebtorsReport(params = {}) {
    const response = await api.get('/reports/debtors', { params });
    return response.data;
  },

  /**
   * Reporte de Ingresos
   */
  async getIncomeReport(params = {}) {
    const response = await api.get('/reports/income', { params });
    return response.data;
  },

  /**
   * Reporte por Categorías
   */
  async getCategoriesReport() {
    const response = await api.get('/reports/categories');
    return response.data;
  },

  /**
   * Reporte de Inscripciones
   */
  async getRegistrationsReport(params = {}) {
    const response = await api.get('/reports/registrations', { params });
    return response.data;
  },

  /**
   * Reporte General de Movimientos (Libro Diario)
   */
  async getMovementsReport(params = {}) {
    const response = await api.get('/reports/movements', { params });
    return response.data;
  },

  /**
   * Reporte Individual de Alumno
   */
  async getStudentReport(studentId) {
    const response = await api.get(`/reports/student/${studentId}`);
    return response.data;
  }
};
