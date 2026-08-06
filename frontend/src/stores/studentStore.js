import { defineStore } from 'pinia';
import studentService from '../services/studentService';
import categoryService from '../services/categoryService';

export const useStudentStore = defineStore('students', {
  state: () => ({
    students: [],
    categories: [],
    currentStudent: null,
    loading: false,
    error: null,
    filters: {
      search: '',
      categoryId: '',
      status: ''
    }
  }),

  getters: {
    activeStudentsCount: (state) => {
      return state.students.filter(s => s.status === 'ACTIVE').length;
    },
    inactiveStudentsCount: (state) => {
      return state.students.filter(s => s.status === 'INACTIVE').length;
    },
    filteredStudents: (state) => {
      return state.students.filter(student => {
        if (state.filters.search) {
          const query = state.filters.search.toLowerCase().trim();
          const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
          const doc = (student.document || '').toLowerCase();
          if (!fullName.includes(query) && !doc.includes(query)) return false;
        }
        if (state.filters.categoryId) {
          if (student.categoryId !== Number(state.filters.categoryId)) return false;
        }
        if (state.filters.status) {
          if (student.status !== state.filters.status) return false;
        }
        return true;
      });
    }
  },

  actions: {
    /**
     * Refresca el dashboardStore automáticamente tras cambios en alumnos
     */
    async _refreshDashboard() {
      try {
        const { useDashboardStore } = await import('./dashboardStore');
        const dashboardStore = useDashboardStore();
        await dashboardStore.fetchStats();
      } catch (e) {
        // No bloquear si el dashboard no está montado
      }
    },

    async fetchCategories() {
      try {
        const response = await categoryService.getAll();
        if (response.success) {
          this.categories = response.data;
        }
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      }
    },

    async fetchStudents() {
      this.loading = true;
      this.error = null;
      try {
        const params = {};
        if (this.filters.search) params.search = this.filters.search;
        if (this.filters.categoryId) params.categoryId = this.filters.categoryId;
        if (this.filters.status) params.status = this.filters.status;

        const response = await studentService.getAll(params);
        if (response.success) {
          this.students = response.data;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar los alumnos';
        console.error('Error fetching students:', err);
      } finally {
        this.loading = false;
      }
    },

    async fetchStudentById(id) {
      this.loading = true;
      this.error = null;
      try {
        const response = await studentService.getById(id);
        if (response.success) {
          this.currentStudent = response.data;
          return response.data;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al obtener el perfil del alumno';
        console.error('Error fetching student by ID:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async createStudent(studentData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await studentService.create(studentData);
        if (response.success) {
          await this.fetchStudents();
          await this._refreshDashboard();
          return response.data;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al crear el alumno';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async updateStudent(id, studentData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await studentService.update(id, studentData);
        if (response.success) {
          await this.fetchStudents();
          if (this.currentStudent && this.currentStudent.id === Number(id)) {
            this.currentStudent = response.data;
          }
          return response.data;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al actualizar el alumno';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async toggleStatus(id, currentStatus) {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      this.loading = true;
      try {
        const response = await studentService.updateStatus(id, newStatus);
        if (response.success) {
          await this.fetchStudents();
          if (this.currentStudent && this.currentStudent.id === Number(id)) {
            this.currentStudent = response.data;
          }
          await this._refreshDashboard();
          return response.data;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cambiar el estado';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteLogical(id) {
      this.loading = true;
      try {
        const response = await studentService.deleteLogical(id);
        if (response.success) {
          await this.fetchStudents();
          if (this.currentStudent && this.currentStudent.id === Number(id)) {
            this.currentStudent = response.data;
          }
          await this._refreshDashboard();
          return response.data;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al inhabilitar el alumno';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deletePhysical(id) {
      this.loading = true;
      try {
        const response = await studentService.deletePhysical(id);
        if (response.success) {
          this.students = this.students.filter(s => s.id !== Number(id));
          if (this.currentStudent && this.currentStudent.id === Number(id)) {
            this.currentStudent = null;
          }
          await this._refreshDashboard();
          return response.data;
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Error al eliminar definitivamente el alumno';
        this.error = msg;
        throw new Error(msg);
      } finally {
        this.loading = false;
      }
    },

    setSearchFilter(searchQuery) {
      this.filters.search = searchQuery;
    },

    setCategoryFilter(categoryId) {
      this.filters.categoryId = categoryId;
    },

    setStatusFilter(status) {
      this.filters.status = status;
    },

    resetFilters() {
      this.filters.search = '';
      this.filters.categoryId = '';
      this.filters.status = '';
    }
  }
});
