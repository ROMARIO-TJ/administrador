<template>
  <Teleport to="body">
    <div v-if="show" class="modal-backdrop" @click.self="close">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title-box">
            <div class="modal-icon monthly-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div>
              <h3>Registrar Pago de Mensualidad</h3>
              <p class="subtext">Abono o mensualidad periódica del alumno</p>
            </div>
          </div>
          <button type="button" class="close-btn" @click="close">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <div v-if="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <!-- Selección de Alumno -->
          <div class="form-group" v-if="!student">
            <label class="form-label">Alumno <span class="required">*</span></label>
            <select v-model="form.studentId" class="form-control" @change="onStudentChange" required>
              <option value="" disabled>Seleccione un alumno...</option>
              <option v-for="st in students" :key="st.id" :value="st.id">
                {{ st.firstName }} {{ st.lastName }} — {{ st.document }} ({{ st.category ? st.category.name : 'Sin categoría' }})
              </option>
            </select>
          </div>

          <!-- Alumno Fijo (Si ya está seleccionado) -->
          <div class="student-info-badge" v-else>
            <span class="label">Alumno:</span>
            <strong>{{ student.firstName }} {{ student.lastName }}</strong>
            <span class="doc">Doc: {{ student.document }}</span>
          </div>

          <div class="form-row-2">
            <!-- Selección de Mes -->
            <div class="form-group">
              <label class="form-label">Mes a Pagar <span class="required">*</span></label>
              <select v-model.number="form.month" class="form-control" required>
                <option v-for="(mName, idx) in monthsList" :key="idx + 1" :value="idx + 1">
                  {{ mName }}
                </option>
              </select>
            </div>

            <!-- Selección de Año -->
            <div class="form-group">
              <label class="form-label">Año <span class="required">*</span></label>
              <select v-model.number="form.year" class="form-control" required>
                <option v-for="y in yearsList" :key="y" :value="y">
                  {{ y }}
                </option>
              </select>
            </div>
          </div>

          <!-- Valor de la Mensualidad -->
          <div class="form-group">
            <label class="form-label">Valor de Mensualidad (COP) <span class="required">*</span></label>
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
              Tarifa mensual sugerida. Se lee dinámicamente según las reglas del sistema o tarifa del alumno.
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
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                <option value="NEQUI">Nequi</option>
                <option value="DAVIPLATA">Daviplata</option>
                <option value="OTRO">Otro</option>
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
              placeholder="Detalles sobre el pago o número de transacción..."
            ></textarea>
          </div>

          <!-- Footer Botones -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="close" :disabled="submitting">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting">Guardando...</span>
              <span v-else>Guardar Mensualidad</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import { usePaymentStore } from '../../../stores/paymentStore';

const props = defineProps({
  show: { type: Boolean, default: false },
  student: { type: Object, default: null },
  students: { type: Array, default: () => [] },
  preSelectedMonth: { type: Number, default: null },
  preSelectedYear: { type: Number, default: null }
});

const emit = defineEmits(['close', 'success']);

const paymentStore = usePaymentStore();

const submitting = ref(false);
const errorMessage = ref(null);

const monthsList = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const currentY = new Date().getFullYear();
const yearsList = [currentY - 1, currentY, currentY + 1];

const getTodayString = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const form = reactive({
  studentId: '',
  month: new Date().getMonth() + 1,
  year: currentY,
  amount: 50000,
  paymentDate: getTodayString(),
  paymentMethod: 'EFECTIVO',
  notes: ''
});

const updateSuggestedAmount = () => {
  let targetStudent = props.student;
  if (!targetStudent && form.studentId) {
    targetStudent = props.students.find(s => s.id === form.studentId);
  }

  if (targetStudent && targetStudent.effectiveMonthlyFee !== undefined && targetStudent.effectiveMonthlyFee !== null) {
    form.amount = targetStudent.effectiveMonthlyFee;
  } else if (targetStudent && targetStudent.customMonthlyFee !== undefined && targetStudent.customMonthlyFee !== null) {
    form.amount = targetStudent.customMonthlyFee;
  } else {
    form.amount = paymentStore.defaultFees.monthlyFee || 50000;
  }
};

const onStudentChange = () => {
  updateSuggestedAmount();
};

const resetForm = async () => {
  errorMessage.value = null;
  form.studentId = props.student ? props.student.id : '';
  form.month = props.preSelectedMonth || (new Date().getMonth() + 1);
  form.year = props.preSelectedYear || currentY;
  form.paymentDate = getTodayString();
  form.paymentMethod = 'EFECTIVO';
  form.notes = '';

  await paymentStore.fetchDefaultFees();
  updateSuggestedAmount();
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm();
  }
});

watch(() => props.student, () => {
  updateSuggestedAmount();
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
      month: form.month,
      year: form.year,
      amount: form.amount,
      paymentDate: form.paymentDate,
      paymentMethod: form.paymentMethod,
      notes: form.notes
    };

    const res = await paymentStore.registerMonthlyPayment(payload);
    if (res.success) {
      emit('success', res.data);
      close();
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || err.message || 'Error al registrar la mensualidad';
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
  background: var(--color-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  background-color: var(--color-gray-100);
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.monthly-icon {
  background-color: var(--color-success-bg);
  color: var(--color-success);
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

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
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
  color: var(--color-success);
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
  margin-top: 0.5rem;
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
  background-color: var(--color-success);
  color: var(--color-white);
}

.btn-primary:hover {
  background-color: var(--color-success-hover);
}
</style>
