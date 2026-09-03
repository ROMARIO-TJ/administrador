import { defineStore } from 'pinia';
import settingsService from '../services/settingsService';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: {
      academyName: 'Unión Jaguera FC',
      shortName: '',
      logo: null,
      favicon: null,
      address: 'La Jagua de Ibirico, Cesar, Colombia',
      city: 'La Jagua de Ibirico',
      department: 'Cesar',
      country: 'Colombia',
      phone: '+57 300 000 0000',
      whatsapp: '+57 300 000 0000',
      email: 'contacto@unionjaguerafc.com',
      website: 'https://unionjaguerafc.com',
      nit: '900.000.000-1',
      representative: 'Junta Directiva Unión Jaguera FC',
      description: '',
      registrationFee: 50000,
      monthlyFee: 50000,
      dueDay: 10,
      currency: 'COP',
      currencySymbol: '$',
      allowDiscounts: true,
      allowPartialPayments: true,
      primaryColor: '#2563EB',
      secondaryColor: '#64748B',
      buttonColor: '#2563EB',
      dashboardColor: '#0F172A',
      themeMode: 'LIGHT'
    },
    activeSeason: null,
    seasons: [],
    categories: [],
    paymentMethods: [],
    consecutives: {},
    loading: false,
    error: null,
    successMessage: null
  }),

  actions: {
    async fetchAllSettings() {
      this.loading = true;
      this.error = null;
      try {
        const res = await settingsService.getSettings();
        if (res.success) {
          this.settings = { ...this.settings, ...res.data };
          this.activeSeason = res.activeSeason;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar configuraciones';
      } finally {
        this.loading = false;
      }
    },

    async updateInstitutional(data) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;
      try {
        const res = await settingsService.updateInstitutional(data);
        if (res.success) {
          this.settings = { ...this.settings, ...res.data };
          this.successMessage = 'Información institucional guardada exitosamente';
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al guardar información institucional';
      } finally {
        this.loading = false;
      }
    },

    async updateFinancial(data) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;
      try {
        const res = await settingsService.updateFinancial(data);
        if (res.success) {
          this.settings = { ...this.settings, ...res.data };
          this.successMessage = 'Configuración financiera guardada exitosamente';
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al guardar configuración financiera';
      } finally {
        this.loading = false;
      }
    },

    async updateAppearance(data) {
      this.loading = true;
      this.error = null;
      this.successMessage = null;
      try {
        const res = await settingsService.updateAppearance(data);
        if (res.success) {
          this.settings = { ...this.settings, ...res.data };
          this.applyThemeColors();
          this.successMessage = 'Configuración de apariencia guardada exitosamente';
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al guardar apariencia';
      } finally {
        this.loading = false;
      }
    },

    applyThemeColors() {
      if (this.settings.primaryColor) {
        document.documentElement.style.setProperty('--color-primary', this.settings.primaryColor);
      }
    },

    // Temporadas
    async fetchSeasons() {
      try {
        const res = await settingsService.getSeasons();
        if (res.success) this.seasons = res.data;
      } catch (err) {
        this.error = 'Error al cargar temporadas';
      }
    },

    async createSeason(data) {
      this.loading = true;
      try {
        const res = await settingsService.createSeason(data);
        if (res.success) {
          await this.fetchSeasons();
          await this.fetchAllSettings();
          this.successMessage = 'Temporada creada exitosamente';
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al crear temporada';
      } finally {
        this.loading = false;
      }
    },

    async setActiveSeason(id) {
      this.loading = true;
      try {
        const res = await settingsService.setActiveSeason(id);
        if (res.success) {
          await this.fetchSeasons();
          await this.fetchAllSettings();
          this.successMessage = 'Temporada activa actualizada';
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al establecer temporada activa';
      } finally {
        this.loading = false;
      }
    },

    async deleteSeason(id) {
      this.loading = true;
      try {
        const res = await settingsService.deleteSeason(id);
        if (res.success) {
          await this.fetchSeasons();
          this.successMessage = 'Temporada eliminada';
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al eliminar temporada';
      } finally {
        this.loading = false;
      }
    },

    // Categorías
    async fetchCategories() {
      try {
        const res = await settingsService.getCategories();
        if (res.success) this.categories = res.data;
      } catch (err) {
        this.error = 'Error al cargar categorías';
      }
    },

    async createCategory(data) {
      this.loading = true;
      try {
        const res = await settingsService.createCategory(data);
        if (res.success) {
          await this.fetchCategories();
          this.successMessage = 'Categoría creada exitosamente';
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al crear categoría';
      } finally {
        this.loading = false;
      }
    },

    async updateCategory(id, data) {
      this.loading = true;
      try {
        const res = await settingsService.updateCategory(id, data);
        if (res.success) {
          await this.fetchCategories();
          this.successMessage = 'Categoría actualizada exitosamente';
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al actualizar categoría';
      } finally {
        this.loading = false;
      }
    },

    async deleteCategory(id) {
      this.loading = true;
      this.error = null;
      try {
        const res = await settingsService.deleteCategory(id);
        if (res.success) {
          await this.fetchCategories();
          this.successMessage = 'Categoría eliminada exitosamente';
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al eliminar categoría';
      } finally {
        this.loading = false;
      }
    },

    // Métodos de Pago
    async fetchPaymentMethods() {
      try {
        const res = await settingsService.getPaymentMethods();
        if (res.success) this.paymentMethods = res.data;
      } catch (err) {
        this.error = 'Error al cargar métodos de pago';
      }
    },

    async createPaymentMethod(data) {
      this.loading = true;
      try {
        const res = await settingsService.createPaymentMethod(data);
        if (res.success) {
          await this.fetchPaymentMethods();
          this.successMessage = 'Método de pago creado exitosamente';
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al crear método de pago';
      } finally {
        this.loading = false;
      }
    },

    async togglePaymentMethod(id) {
      this.loading = true;
      try {
        const res = await settingsService.togglePaymentMethod(id);
        if (res.success) {
          await this.fetchPaymentMethods();
          this.successMessage = 'Estado del método de pago actualizado';
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cambiar estado del método de pago';
      } finally {
        this.loading = false;
      }
    },

    // Consecutivos
    async fetchConsecutives() {
      try {
        const res = await settingsService.getConsecutives();
        if (res.success) this.consecutives = res.data;
      } catch (err) {
        this.error = 'Error al cargar consecutivos';
      }
    },

    async resetConsecutive(prefix) {
      this.loading = true;
      try {
        const res = await settingsService.resetConsecutive(prefix);
        if (res.success) {
          await this.fetchConsecutives();
          this.successMessage = `Consecutivo ${prefix} reiniciado exitosamente`;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al reiniciar consecutivo';
      } finally {
        this.loading = false;
      }
    }
  }
});
