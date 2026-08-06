import api from './api';

export const authService = {
  /**
   * Envia las credenciales de inicio de sesión al backend
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Obtiene los datos del usuario autenticado
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  }
};
