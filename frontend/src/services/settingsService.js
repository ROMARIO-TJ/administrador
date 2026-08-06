import api from './api';

export default {
  // General & Secciones
  async getSettings() {
    const response = await api.get('/settings');
    return response.data;
  },

  async updateInstitutional(data) {
    const response = await api.put('/settings/institutional', data);
    return response.data;
  },

  async updateFinancial(data) {
    const response = await api.put('/settings/financial', data);
    return response.data;
  },

  async updateAppearance(data) {
    const response = await api.put('/settings/appearance', data);
    return response.data;
  },

  // Temporadas
  async getSeasons() {
    const response = await api.get('/settings/seasons');
    return response.data;
  },

  async createSeason(data) {
    const response = await api.post('/settings/seasons', data);
    return response.data;
  },

  async updateSeason(id, data) {
    const response = await api.put(`/settings/seasons/${id}`, data);
    return response.data;
  },

  async deleteSeason(id) {
    const response = await api.delete(`/settings/seasons/${id}`);
    return response.data;
  },

  async setActiveSeason(id) {
    const response = await api.post(`/settings/seasons/${id}/active`);
    return response.data;
  },

  // Categorías
  async getCategories() {
    const response = await api.get('/settings/categories');
    return response.data;
  },

  async createCategory(data) {
    const response = await api.post('/settings/categories', data);
    return response.data;
  },

  async updateCategory(id, data) {
    const response = await api.put(`/settings/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id) {
    const response = await api.delete(`/settings/categories/${id}`);
    return response.data;
  },

  // Métodos de Pago
  async getPaymentMethods() {
    const response = await api.get('/settings/payment-methods');
    return response.data;
  },

  async createPaymentMethod(data) {
    const response = await api.post('/settings/payment-methods', data);
    return response.data;
  },

  async updatePaymentMethod(id, data) {
    const response = await api.put(`/settings/payment-methods/${id}`, data);
    return response.data;
  },

  async togglePaymentMethod(id) {
    const response = await api.patch(`/settings/payment-methods/${id}/toggle`);
    return response.data;
  },

  // Consecutivos
  async getConsecutives() {
    const response = await api.get('/settings/consecutives');
    return response.data;
  },

  async resetConsecutive(prefix) {
    const response = await api.post('/settings/consecutives/reset', { prefix });
    return response.data;
  }
};
