import { defineStore } from 'pinia';
import { authService } from '../services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('academiapro_user')) || null,
    token: localStorage.getItem('academiapro_token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => (state.user ? state.user.name : 'Administrador'),
    userEmail: (state) => (state.user ? state.user.email : '')
  },

  actions: {
    /**
     * Acción para iniciar sesión
     */
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const response = await authService.login(email, password);
        
        if (response.success && response.data) {
          const { token, user } = response.data;
          this.token = token;
          this.user = user;
          
          localStorage.setItem('academiapro_token', token);
          localStorage.setItem('academiapro_user', JSON.stringify(user));
          
          return true;
        } else {
          this.error = response.message || 'Error al iniciar sesión';
          return false;
        }
      } catch (err) {
        console.error('Error de login en authStore:', err);
        this.error = err.response?.data?.message || 'Credenciales incorrectas o problema de conexión.';
        return false;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Acción para cerrar sesión
     */
    logout() {
      this.user = null;
      this.token = null;
      this.error = null;
      localStorage.removeItem('academiapro_token');
      localStorage.removeItem('academiapro_user');
    },

    /**
     * Carga el perfil del usuario actual desde la API
     */
    async fetchProfile() {
      if (!this.token) return;
      try {
        const response = await authService.getMe();
        if (response.success && response.data) {
          this.user = response.data;
          localStorage.setItem('academiapro_user', JSON.stringify(response.data));
        }
      } catch (err) {
        console.error('Error al cargar perfil:', err);
        this.logout();
      }
    }
  }
});
