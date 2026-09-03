<template>
  <Teleport to="body">
    <div v-if="show" class="modal-backdrop" @click.self="close">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title-box">
            <div class="modal-icon registration-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <polyline points="16 11 18 13 22 9"></polyline>
              </svg>
            </div>
            <div>
              <h3>Registrar Pago de Inscripción</h3>
              <p class="subtext">Pago único de matrícula para nuevo alumno</p>
            </div>
          </div>
          <button type="button" class="close-btn" @click="close">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-form-content">
          <div class="modal-body">
            <div v-if="errorMessage" class="alert alert-danger">
              {{ errorMessage }}
            </div>

            <!-- Selección de Alumno con Buscador Interactivo -->
            <div class="form-group" v-if="!student">
              <label class="form-label">Alumno <span class="required">*</span></label>
              <StudentSearchSelect
                v-model="form.studentId"
                :students="students"
                placeholder="Buscar por nombre, documento o categoría..."
                required
              />
            </div>

            <!-- Alumno Fijo (Si ya está seleccionado) -->
            <div class="student-info-badge" v-else>
              <span class="label">Alumno:</span>
              <strong>{{ student.firstName }} {{ student.lastName }}</strong>
              <span class="doc">Doc: {{ student.document }}</span>
            </div>

            <!-- Valor de la Inscripción -->
            <div class="form-group">
              <label class="form-label">Valor de Inscripción (COP) <span class="required">*</span></label>
              <div class="input-prefix-wrapper">
                <span class="prefix-symbol">$</span>
                <input
                  type="number"
                  v-model.number="form.amount"
                  class="form-control prefixed"
                  placeholder="50000"
                  min="0"
                  step="1000"
                  required
                />
              </div>
              <small class="hint-text">
                Tarifa sugerida por configuración del sistema. Se puede modificar si aplica un descuento o ajuste.
              </small>
            </div>

            <div class="form-row-2">
              <!-- Fecha de Pago -->
              <div class="form-group">
                <label class="form-label">Fecha de Pago <span class="required">*</span></label>
                <input type="date" v-model="form.paymentDate" class="form-control" required />
              </div>

              <!-- Método de Pago -->
              <div class="form-group">
                <label class="form-label">Método de Pago <span class="required">*</span></label>
                <select v-model="form.paymentMethod" class="form-control" required>
                  <option v-for="pm in activePaymentMethods" :key="pm.id" :value="pm.name.toUpperCase()">
                    {{ pm.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Observaciones -->
            <div class="form-group">
              <label class="form-label">Observaciones / Notas (Opcional)</label>
              <textarea
                v-model="form.notes"
                class="form-control textarea"
                rows="2"
                placeholder="Escriba aquí alguna nota relevante sobre el recibo..."
              ></textarea>
            </div>
          </div>

          <!-- Footer Botones -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="close" :disabled="submitting">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting">Guardando...</span>
              <span v-else>Guardar Inscripción</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { usePaymentStore } from '../../../stores/paymentStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import StudentSearchSelect from '../../../components/ui/StudentSearchSelect.vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  student: { type: Object, default: null },
  students: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'success']);

const paymentStore = usePaymentStore();
const settingsStore = useSettingsStore();

const activePaymentMethods = computed(() => {
  if (settingsStore.paymentMethods && settingsStore.paymentMethods.length > 0) {
    return settingsStore.paymentMethods.filter(pm => pm.active);
  }
  return [
    { id: 1, name: 'Efectivo' }, { id: 2, name: 'Transferencia' },
    { id: 3, name: 'Nequi' }, { id: 4, name: 'Daviplata' }
  ];
});

const submitting = ref(false);
const errorMessage = ref(null);

const getTodayString = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const form = reactive({
  studentId: '',
  amount: 50000,
  paymentDate: getTodayString(),
  paymentMethod: 'EFECTIVO',
  notes: ''
});

const resetForm = async () => {
  errorMessage.value = null;
  form.studentId = props.student ? props.student.id : '';
  form.paymentDate = getTodayString();
  form.paymentMethod = 'EFECTIVO';
  form.notes = '';

  await paymentStore.fetchDefaultFees();
  form.amount = paymentStore.defaultFees.registrationFee || 50000;
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm();
  }
});

watch(() => props.student, (newStudent) => {
  if (newStudent) {
    form.studentId = newStudent.id;
  }
});

onMounted(() => {
  if (props.show) {
    resetForm();
  }
});

const close = () => {
  emit('close');
};

const handleSubmit = async () => {
  submitting.value = true;
  errorMessage.value = null;

  try {
    const studentIdToUse = props.student ? props.student.id : form.studentId;
    if (!studentIdToUse) {
      errorMessage.value = 'Por favor seleccione un alumno';
      submitting.value = false;
      return;
    }

    const payload = {
      studentId: studentIdToUse,
      amount: form.amount,
      paymentDate: form.paymentDate,
      paymentMethod: form.paymentMethod,
      notes: form.notes
    };

    const res = await paymentStore.registerRegistration(payload);
    if (res.success) {
      emit('success', res.data);
      close();
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || err.message || 'Error al registrar el pago de inscripción';
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-card {
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  background: var(--color-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (max-width: 1024px) {
  .modal-card {
    width: 90%;
  }
}

@media (max-width: 768px) {
  .modal-card {
    width: 95%;
    max-height: 95vh;
  }
}

.modal-header {
  padding: 1.25rem 1.5rem;
  background-color: var(--color-gray-100);
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.modal-title-box {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.registration-icon {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.modal-header h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-dark);
}

.subtext {
  font-size: 0.8rem;
  color: var(--color-gray-500);
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

.modal-form-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  flex: 1;
  overflow-y: auto;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius-md);
  font-size: 0.88rem;
}

.alert-danger {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
  border: 1px solid #fecaca;
}

.student-info-badge {
  background-color: var(--color-gray-100);
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-gray-200);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.student-info-badge .label {
  color: var(--color-gray-500);
}

.student-info-badge .doc {
  margin-left: auto;
  font-size: 0.8rem;
  color: var(--color-gray-500);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-dark);
}

.required {
  color: var(--color-danger);
}

.form-control {
  width: 100%;
  padding: 0.65rem 0.85rem;
  font-size: 0.9rem;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  outline: none;
  transition: var(--transition-fast);
}

.form-control:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input-prefix-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.prefix-symbol {
  position: absolute;
  left: 0.85rem;
  font-weight: 700;
  color: var(--color-gray-500);
}

.prefixed {
  padding-left: 2rem;
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--color-primary);
}

.hint-text {
  font-size: 0.76rem;
  color: var(--color-gray-500);
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.textarea {
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background-color: var(--color-gray-100);
  border-top: 1px solid var(--color-gray-200);
  flex-shrink: 0;
}

.btn {
  padding: 0.65rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-secondary {
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
}

.btn-secondary:hover {
  background-color: var(--color-gray-200);
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}
</style>
