<template>
  <div class="students-view-container">
    <!-- CABECERA PRINCIPAL DE LA VISTA -->
    <div class="view-header">
      <div class="header-titles">
        <h1 class="view-title">Gestión de Alumnos</h1>
        <p class="view-subtitle">Módulo principal de deportistas - Unión Jaguera FC</p>
      </div>

      <div class="header-actions">
        <!-- Selector de Vista (Tabla vs Tarjetas) -->
        <div class="view-mode-toggle">
          <button
            type="button"
            :class="['toggle-btn', { active: viewMode === 'table' }]"
            title="Vista de Tabla"
            @click="viewMode = 'table'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
          </button>
          <button
            type="button"
            :class="['toggle-btn', { active: viewMode === 'cards' }]"
            title="Vista de Tarjetas"
            @click="viewMode = 'cards'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </button>
        </div>

        <!-- Botón Nuevo Alumno -->
        <button type="button" class="btn btn-primary btn-add-student" @click="openCreateModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Nuevo Alumno</span>
        </button>
      </div>
    </div>

    <!-- TARJETAS RESUMEN DE INDICADORES (KPIs RÁPIDOS) -->
    <div class="kpi-mini-grid">
      <div class="kpi-mini-card card-modern">
        <div class="kpi-content">
          <span class="kpi-label">Total Alumnos</span>
          <span class="kpi-value">{{ studentStore.students.length }}</span>
        </div>
        <div class="kpi-icon primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
      </div>

      <div class="kpi-mini-card card-modern">
        <div class="kpi-content">
          <span class="kpi-label">Alumnos Activos</span>
          <span class="kpi-value success">{{ studentStore.activeStudentsCount }}</span>
        </div>
        <div class="kpi-icon success">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      </div>

      <div class="kpi-mini-card card-modern">
        <div class="kpi-content">
          <span class="kpi-label">Alumnos Inactivos</span>
          <span class="kpi-value danger">{{ studentStore.inactiveStudentsCount }}</span>
        </div>
        <div class="kpi-icon danger">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
        </div>
      </div>
    </div>

    <!-- COMPONENTE DE FILTROS Y BUSCADOR -->
    <StudentFilters
      :categories="studentStore.categories"
      :filters="studentStore.filters"
      @update:filters="onFiltersUpdate"
    />

    <!-- INDICADOR DE CARGA / ERROR -->
    <div v-if="studentStore.loading && studentStore.students.length === 0" class="loading-state card-modern">
      <div class="spinner"></div>
      <p>Cargando lista de alumnos...</p>
    </div>

    <div v-else-if="studentStore.error && studentStore.students.length === 0" class="error-banner card-modern">
      <p>{{ studentStore.error }}</p>
      <button type="button" class="btn btn-secondary" @click="studentStore.fetchStudents()">Reintentar</button>
    </div>

    <!-- LISTADO EN TABLA O TARJETAS -->
    <template v-else>
      <!-- VISTA EN TABLA -->
      <StudentTable
        v-if="viewMode === 'table'"
        :students="studentStore.filteredStudents"
        @edit="openEditModal"
        @toggle-status="promptToggleStatus"
        @delete-permanent="promptDeletePermanent"
      />

      <!-- VISTA EN TARJETAS -->
      <div v-else-if="viewMode === 'cards'" class="cards-grid">
        <StudentCard
          v-for="student in studentStore.filteredStudents"
          :key="student.id"
          :student="student"
          @edit="openEditModal"
          @toggle-status="promptToggleStatus"
          @delete-permanent="promptDeletePermanent"
        />

        <div v-if="studentStore.filteredStudents.length === 0" class="empty-cards-state card-modern">
          <h3>No se encontraron alumnos</h3>
          <p>No existen registros que coincidan con la búsqueda o filtros aplicados.</p>
        </div>
      </div>
    </template>

    <!-- MODAL DE FORMULARIO (NUEVO / EDITAR ALUMNO) -->
    <Teleport to="body">
      <div v-if="showFormModal" class="modal-backdrop" @click.self="closeFormModal">
        <div class="modal-form-card">
          <div class="modal-form-header">
            <h2>{{ selectedStudent ? 'Editar Alumno' : 'Registrar Nuevo Alumno' }}</h2>
            <button type="button" class="close-btn" @click="closeFormModal">&times;</button>
          </div>

          <div class="modal-form-body">
            <StudentForm
              :initial-data="selectedStudent"
              :categories="studentStore.categories"
              :loading="formSubmitting"
              :server-error="formError"
              @submit="handleFormSubmit"
              @cancel="closeFormModal"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- DIÁLOGO DE CONFIRMACIÓN PARA CAMBIO DE ESTADO -->
    <ConfirmDialog
      :show="showConfirmModal"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      :type="targetStudent && targetStudent.status === 'ACTIVE' ? 'warning' : 'info'"
      :confirm-text="targetStudent && targetStudent.status === 'ACTIVE' ? 'Sí, Inactivar' : 'Sí, Reactivar'"
      @confirm="executeToggleStatus"
      @cancel="closeConfirmModal"
    />

    <!-- MODAL ELIMINACIÓN DEFINITIVA -->
    <DeleteConfirmModal
      :show="showDeleteModal"
      :student-name="deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}` : ''"
      :student-doc="deleteTarget ? (deleteTarget.document || 'Sin documento') : ''"
      :loading="deleteProcessing"
      @confirm="executeDeletePermanent"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStudentStore } from '../../../stores/studentStore';
import StudentFilters from '../components/StudentFilters.vue';
import StudentTable from '../components/StudentTable.vue';
import StudentCard from '../components/StudentCard.vue';
import StudentForm from '../components/StudentForm.vue';
import ConfirmDialog from '../../../components/ui/ConfirmDialog.vue';
import DeleteConfirmModal from '../../../components/ui/DeleteConfirmModal.vue';

const studentStore = useStudentStore();

const viewMode = ref('table');

// Modal de formulario
const showFormModal = ref(false);
const selectedStudent = ref(null);
const formSubmitting = ref(false);
const formError = ref(null);

// Modal de confirmación
const showConfirmModal = ref(false);
const targetStudent = ref(null);
const confirmModalTitle = ref('');
const confirmModalMessage = ref('');

onMounted(async () => {
  await Promise.all([
    studentStore.fetchCategories(),
    studentStore.fetchStudents()
  ]);
});

const onFiltersUpdate = (newFilters) => {
  studentStore.setSearchFilter(newFilters.search);
  studentStore.setCategoryFilter(newFilters.categoryId);
  studentStore.setStatusFilter(newFilters.status);
};

const openCreateModal = () => {
  selectedStudent.value = null;
  formError.value = null;
  showFormModal.value = true;
};

const openEditModal = (student) => {
  selectedStudent.value = student;
  formError.value = null;
  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
  selectedStudent.value = null;
  formError.value = null;
};

const handleFormSubmit = async (formData) => {
  formSubmitting.value = true;
  formError.value = null;
  try {
    if (selectedStudent.value && selectedStudent.value.id) {
      await studentStore.updateStudent(selectedStudent.value.id, formData);
    } else {
      await studentStore.createStudent(formData);
    }
    closeFormModal();
  } catch (err) {
    formError.value = err.response?.data?.message || err.message || 'Error al guardar el alumno';
  } finally {
    formSubmitting.value = false;
  }
};

const promptToggleStatus = (student) => {
  targetStudent.value = student;
  if (student.status === 'ACTIVE') {
    confirmModalTitle.value = 'Inactivar Alumno';
    confirmModalMessage.value = `¿Está seguro de cambiar el estado de ${student.firstName} ${student.lastName} a INACTIVO? (Borrado lógico: No se eliminarán datos del sistema).`;
  } else {
    confirmModalTitle.value = 'Activar Alumno';
    confirmModalMessage.value = `¿Desea reactivar a ${student.firstName} ${student.lastName} en el sistema?`;
  }
  showConfirmModal.value = true;
};

const closeConfirmModal = () => {
  showConfirmModal.value = false;
  targetStudent.value = null;
};

const executeToggleStatus = async () => {
  if (!targetStudent.value) return;
  try {
    await studentStore.toggleStatus(targetStudent.value.id, targetStudent.value.status);
    closeConfirmModal();
  } catch (err) {
    alert(err.response?.data?.message || 'Error al cambiar estado');
  }
};

// Eliminación definitiva
const showDeleteModal = ref(false);
const deleteTarget = ref(null);
const deleteProcessing = ref(false);

const promptDeletePermanent = (student) => {
  deleteTarget.value = student;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deleteTarget.value = null;
};

const executeDeletePermanent = async () => {
  if (!deleteTarget.value) return;
  deleteProcessing.value = true;
  try {
    await studentStore.deletePhysical(deleteTarget.value.id);
    closeDeleteModal();
  } catch (err) {
    // Error mostrado en el modal o como alerta
    alert(err.message || 'Error al eliminar el alumno definitivamente');
  } finally {
    deleteProcessing.value = false;
  }
};
</script>

<style scoped>
.students-view-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.view-title {
  font-size: 1.6rem;
  color: var(--color-dark);
}

.view-subtitle {
  font-size: 0.88rem;
  color: var(--color-gray-500);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Toggle mode */
.view-mode-toggle {
  display: flex;
  background-color: var(--color-gray-100);
  padding: 0.2rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-gray-200);
}

.toggle-btn {
  padding: 0.45rem 0.75rem;
  border-radius: var(--border-radius-sm);
  color: var(--color-gray-500);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
}

.toggle-btn.active {
  background-color: var(--color-white);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

/* Mini KPIs */
.kpi-mini-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
}

@media (max-width: 768px) {
  .kpi-mini-grid {
    grid-template-columns: 1fr;
  }
}

.kpi-mini-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
}

.kpi-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.kpi-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-gray-500);
  text-transform: uppercase;
}

.kpi-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-dark);
}

.kpi-value.success { color: var(--color-success); }
.kpi-value.danger { color: var(--color-danger); }

.kpi-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-icon.primary { background-color: var(--color-primary-light); color: var(--color-primary); }
.kpi-icon.success { background-color: var(--color-success-bg); color: var(--color-success); }
.kpi-icon.danger { background-color: var(--color-danger-bg); color: var(--color-danger); }

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.empty-cards-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem 1.5rem;
  color: var(--color-gray-500);
}

/* Loading & Error */
.loading-state, .error-banner {
  padding: 3rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-gray-200);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal Form */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1.5rem;
}

.modal-form-card {
  width: 100%;
  max-width: 850px;
  max-height: 90vh;
  background: var(--color-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .modal-form-card {
    width: 90%;
  }
}

@media (max-width: 768px) {
  .modal-form-card {
    width: 95%;
    max-height: 95vh;
  }
}

.modal-form-header {
  padding: 1.25rem 1.5rem;
  background-color: var(--color-gray-100);
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-form-header h2 {
  font-size: 1.25rem;
  color: var(--color-dark);
}

.close-btn {
  font-size: 1.6rem;
  line-height: 1;
  color: var(--color-gray-400);
  background: none;
  border: none;
  cursor: pointer;
}

.close-btn:hover {
  color: var(--color-dark);
}

.modal-form-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.btn {
  padding: 0.65rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: var(--transition-fast);
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-secondary {
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
}

.btn-secondary:hover {
  background-color: var(--color-gray-200);
}
</style>
