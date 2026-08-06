import api from './api';

export const studentService = {
  /**
   * Obtener lista de alumnos con filtros (search, categoryId, status)
   */
  async getAll(params = {}) {
    const response = await api.get('/students', { params });
    return response.data;
  },

  /**
   * Obtener detalle de alumno por ID
   */
  async getById(id) {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  /**
   * Registrar nuevo alumno
   */
  async create(studentData) {
    const response = await api.post('/students', studentData);
    return response.data;
  },

  /**
   * Actualizar alumno existente
   */
  async update(id, studentData) {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  /**
   * Cambiar estado del alumno (ACTIVE / INACTIVE)
   */
  async updateStatus(id, status) {
    const response = await api.patch(`/students/${id}/status`, { status });
    return response.data;
  },

  /**
   * Borrado lógico (cambiar estado a INACTIVE)
   */
  async deleteLogical(id) {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  /**
   * Eliminación definitiva física de PostgreSQL (verificación de integridad en backend)
   */
  async deletePhysical(id) {
    const response = await api.delete(`/students/${id}/permanent`);
    return response.data;
  }
};

export default studentService;
