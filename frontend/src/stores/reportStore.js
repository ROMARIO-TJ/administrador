import { defineStore } from 'pinia';
import reportService from '../services/reportService';

export const useReportStore = defineStore('reports', {
  state: () => ({
    activeTab: 'students',
    loading: false,
    error: null,
    
    // Datos por reporte
    studentsReport: { data: [], summary: {} },
    monthlyReport: { matrix: [], summary: {}, year: new Date().getFullYear() },
    debtorsReport: { debtors: [], summary: {} },
    incomeReport: { kpis: {}, filteredPeriod: {} },
    categoriesReport: { categories: [], summary: {} },
    registrationsReport: { registrations: [], summary: {} },
    movementsReport: { movements: [], summary: {} },
    selectedStudentReport: null
  }),

  actions: {
    setActiveTab(tab) {
      this.activeTab = tab;
    },

    async fetchStudentsReport(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const res = await reportService.getStudentsReport(params);
        if (res.success) {
          this.studentsReport = { data: res.data || [], summary: res.summary || {} };
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar reporte de alumnos';
      } finally {
        this.loading = false;
      }
    },

    async fetchMonthlyReport(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const res = await reportService.getMonthlyReport(params);
        if (res.success) {
          this.monthlyReport = { matrix: res.data || [], summary: res.summary || {}, year: res.summary?.targetYear || new Date().getFullYear() };
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar reporte de mensualidades';
      } finally {
        this.loading = false;
      }
    },

    async fetchDebtorsReport(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const res = await reportService.getDebtorsReport(params);
        if (res.success) {
          this.debtorsReport = { debtors: res.data || [], summary: res.summary || {} };
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar reporte de morosos';
      } finally {
        this.loading = false;
      }
    },

    async fetchIncomeReport(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const res = await reportService.getIncomeReport(params);
        if (res.success) {
          this.incomeReport = { kpis: res.kpis || {}, filteredPeriod: res.filteredPeriod || {} };
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar reporte de ingresos';
      } finally {
        this.loading = false;
      }
    },

    async fetchCategoriesReport() {
      this.loading = true;
      this.error = null;
      try {
        const res = await reportService.getCategoriesReport();
        if (res.success) {
          this.categoriesReport = { categories: res.data || [], summary: res.summary || {} };
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar reporte por categorías';
      } finally {
        this.loading = false;
      }
    },

    async fetchRegistrationsReport(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const res = await reportService.getRegistrationsReport(params);
        if (res.success) {
          this.registrationsReport = { registrations: res.data || [], summary: res.summary || {} };
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar reporte de inscripciones';
      } finally {
        this.loading = false;
      }
    },

    async fetchMovementsReport(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const res = await reportService.getMovementsReport(params);
        if (res.success) {
          this.movementsReport = { movements: res.data || [], summary: res.summary || {} };
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar reporte de movimientos';
      } finally {
        this.loading = false;
      }
    },

    async fetchStudentIndividualReport(studentId) {
      this.loading = true;
      this.error = null;
      try {
        const res = await reportService.getStudentReport(studentId);
        if (res.success) {
          this.selectedStudentReport = res.data;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar el reporte individual del alumno';
      } finally {
        this.loading = false;
      }
    }
  }
});
