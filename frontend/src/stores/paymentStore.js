import { defineStore } from 'pinia';
import paymentService from '../services/paymentService';

export const usePaymentStore = defineStore('payments', {
  state: () => ({
    payments: [],
    summary: {
      totalPayments: 0,
      totalAmountCollected: 0,
      registrationCount: 0,
      monthlyCount: 0
    },
    defaultFees: {
      registrationFee: 50000,
      monthlyFee: 50000
    },
    studentFinancialStatus: null,
    loading: false,
    error: null,
    submitting: false
  }),

  actions: {
    async fetchDefaultFees() {
      try {
        const response = await paymentService.getDefaultFees();
        if (response.success && response.data) {
          this.defaultFees = response.data;
        }
      } catch (err) {
        console.error('Error fetching default fees:', err);
      }
    },

    async fetchPayments(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const response = await paymentService.getAllPayments(params);
        if (response.success) {
          this.payments = response.data || [];
          this.summary = response.summary || {
            totalPayments: 0,
            totalAmountCollected: 0,
            registrationCount: 0,
            monthlyCount: 0
          };
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar el historial de pagos';
        console.error('Error fetching payments:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchStudentFinancialStatus(studentId, year) {
      this.loading = true;
      this.error = null;
      try {
        const response = await paymentService.getStudentFinancialStatus(studentId, year);
        if (response.success) {
          this.studentFinancialStatus = response.data;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al obtener el estado financiero del alumno';
        console.error('Error fetching student financial status:', err);
      } finally {
        this.loading = false;
      }
    },

    async registerRegistration(data) {
      this.submitting = true;
      try {
        const response = await paymentService.registerRegistration(data);
        return response;
      } finally {
        this.submitting = false;
      }
    },

    async registerMonthlyPayment(data) {
      this.submitting = true;
      try {
        const response = await paymentService.registerMonthlyPayment(data);
        return response;
      } finally {
        this.submitting = false;
      }
    }
  }
});
