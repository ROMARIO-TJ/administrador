import { defineStore } from 'pinia';
import dashboardService from '../services/dashboardService';

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: {
      totalStudents: 0,
      activeStudents: 0,
      inactiveStudents: 0,
      totalCategories: 0,
      monthlyPayments: 0,
      pendingMonthlyFees: 0,
      monthlyIncome: 0
    },
    loading: false,
    error: null
  }),

  actions: {
    async fetchStats() {
      this.loading = true;
      this.error = null;
      try {
        const response = await dashboardService.getStats();
        if (response.success) {
          this.stats = response.data;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar las estadísticas del Dashboard';
        console.error('Error fetching dashboard stats:', err);
      } finally {
        this.loading = false;
      }
    }
  }
});
