<template>
  <div class="profile-view-wrapper">
    <!-- BARRA SUPERIOR DE NAVEGACIÓN -->
    <div class="nav-bar">
      <router-link to="/students" class="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Volver a Gestión de Alumnos</span>
      </router-link>
    </div>

    <!-- ESTADO DE CARGA Y ERROR -->
    <div v-if="studentStore.loading" class="loading-box card-modern">
      <div class="spinner"></div>
      <p>Cargando información del alumno...</p>
    </div>

    <div v-else-if="studentStore.error" class="error-box card-modern">
      <h3>Error</h3>
      <p>{{ studentStore.error }}</p>
      <router-link to="/students" class="btn btn-primary">Regresar al listado</router-link>
    </div>

    <!-- COMPONENTE PERFIL DEL ALUMNO -->
    <StudentProfile
      v-else-if="studentStore.currentStudent"
      :student="studentStore.currentStudent"
      @edit="openEditModal"
      @toggle-status="promptToggleStatus"
    />

    <!-- MODAL PARA EDITAR -->
    <Teleport to="body">
      <div v-if="showFormModal" class="modal-backdrop" @click.self="closeFormModal">
        <div class="modal-form-card">
          <div class="modal-form-header">
            <h2>Editar Alumno</h2>
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

    <!-- DIÁLOGO DE CONFIRMACIÓN -->
    <ConfirmDialog
      :show="showConfirmModal"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      :type="targetStudent && targetStudent.status === 'ACTIVE' ? 'warning' : 'info'"
      :confirm-text="targetStudent && targetStudent.status === 'ACTIVE' ? 'Sí, Inactivar' : 'Sí, Activar'"
      @confirm="executeToggleStatus"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStudentStore } from '../../../stores/studentStore';
import StudentProfile from '../components/StudentProfile.vue';
import StudentForm from '../components/StudentForm.vue';
import ConfirmDialog from '../../../components/ui/ConfirmDialog.vue';

const route = useRoute();
const studentStore = useStudentStore();

const showFormModal = ref(false);
const selectedStudent = ref(null);
const formSubmitting = ref(false);
const formError = ref(null);

const showConfirmModal = ref(false);
const targetStudent = ref(null);
const confirmModalTitle = ref('');
const confirmModalMessage = ref('');

const loadData = async () => {
  const studentId = route.params.id;
  if (studentId) {
    await Promise.all([
      studentStore.fetchCategories(),
      studentStore.fetchStudentById(studentId)
    ]);
  }
};

onMounted(() => {
  loadData();
});

watch(() => route.params.id, (newId) => {
  if (newId) {
    loadData();
  }
});

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
    await studentStore.updateStudent(selectedStudent.value.id, formData);
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
    alert(err.response?.data?.message || 'Error al cambiar el estado del alumno');
  }
};
</script>

<style scoped>
.profile-view-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.nav-bar {
  display: flex;
  align-items: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-gray-600);
  background-color: var(--color-white);
  padding: 0.55rem 1rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-gray-200);
  transition: var(--transition-fast);
}

.back-link:hover {
  color: var(--color-primary);
  border-color: var(--color-primary-light);
  background-color: var(--color-primary-light);
}

.loading-box, .error-box {
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
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}
</style>
