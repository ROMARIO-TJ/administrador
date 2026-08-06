import api from './api';

export const categoryService = {
  /**
   * Obtener todas las categorías de alumnos
   */
  async getAll() {
    const response = await api.get('/categories');
    return response.data;
  },

  /**
   * Obtener categoría por ID
   */
  async getById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  /**
   * Crear nueva categoría
   */
  async create(categoryData) {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  /**
   * Actualizar categoría
   */
  async update(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  /**
   * Eliminar categoría
   */
  async delete(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export default categoryService;
