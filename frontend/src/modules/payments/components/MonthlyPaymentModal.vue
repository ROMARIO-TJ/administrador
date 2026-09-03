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
              <p class="subtext">Abono o mensualidad periódica por ciclo de cobertura</p>
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
                @change="onStudentChange"
                required
              />
            </div>

            <!-- Alumno Fijo -->
            <div class="student-info-badge" v-else>
              <span class="label">Alumno:</span>
              <strong>{{ student.firstName }} {{ student.lastName }}</strong>
              <span class="doc">Doc: {{ student.document }}</span>
            </div>

            <!-- Alerta de Interrupción o Sugerencia de Ciclo -->
            <div v-if="cycleRecommendation && cycleRecommendation.hasInterruption" class="alert alert-warning-interruption">
              <div class="alert-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div>
                <strong>Se detectó una interrupción de asistencia</strong>
                <p>El periodo del {{ formatDateShort(cycleRecommendation.interruptionFrom) }} al {{ formatDateShort(cycleRecommendation.interruptionTo) }} no generó deuda.</p>
                <span class="cycle-tag">Nuevo ciclo sugerido: {{ formatDateShort(cycleRecommendation.recommendedStartDate) }} → {{ formatDateShort(cycleRecommendation.recommendedEndDate) }}</span>
              </div>
            </div>
            <div v-else-if="cycleRecommendation && cycleRecommendation.recommendedStartDate" class="alert alert-info-cycle">
              <span class="cycle-tag font-bold">Ciclo sugerido: {{ formatDateShort(cycleRecommendation.recommendedStartDate) }} → {{ formatDateShort(cycleRecommendation.recommendedEndDate) }}</span>
            </div>

            <!-- Fechas de Inicio y Fin de Ciclo de Cobertura -->
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Inicio del Ciclo <span class="required">*</span></label>
                <input type="date" v-model="form.cycleStartDate" class="form-control" required @change="onCycleStartDateChange" />
              </div>
              <div class="form-group">
                <label class="form-label">Fin del Ciclo <span class="required">*</span></label>
                <input type="date" v-model="form.cycleEndDate" class="form-control" required />
              </div>
            </div>

            <div class="form-row-2">
              <!-- Selección de Mes Referencial -->
              <div class="form-group">
                <label class="form-label">Mes Referencial <span class="required">*</span></label>
                <select v-model.number="form.month" class="form-control" required>
                  <option v-for="(mName, idx) in monthsList" :key="idx + 1" :value="idx + 1">
                    {{ mName }}
                  </option>
                </select>
              </div>

              <!-- Selección de Año Referencial -->
              <div class="form-group">
                <label class="form-label">Año <span class="required">*</span></label>
                <select v-model.number="form.year" class="form-control" required>
                  <option v-for="y in yearsList" :key="y" :value="y">
                    {{ y }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Opción de Exonerar (Inasistencia) -->
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.isExempt" @change="onExemptChange" />
                <span>Exonerar cobro por inasistencia (Sin costo)</span>
              </label>
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
                  :disabled="form.isExempt"
                />
              </div>
              <small class="hint-text">
                Tarifa mensual sugerida para este ciclo.
              </small>
            </div>

            <div class="form-row-2">
              <!-- Fecha de Pago -->
              <div class="form-group">
                <label class="form-label">Fecha de Pago <span class="required">*</span></label>
                <input type="date" v-model="form.paymentDate" class="form-control" required @change="onPaymentDateChange" />
              </div>

              <!-- Método de Pago -->
              <div class="form-group">
                <label class="form-label">Método de Pago <span class="required">*</span></label>
                <select v-model="form.paymentMethod" class="form-control" required :disabled="form.isExempt">
                  <option v-for="pm in activePaymentMethods" :key="pm.id" :value="pm.name.toUpperCase()">
                    {{ pm.name }}
                  </option>
                  <option v-if="form.isExempt" value="EXONERADO">Exonerado (Sin Costo)</option>
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
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { usePaymentStore } from '../../../stores/paymentStore';
import { useSettingsStore } from '../../../stores/settingsStore';
import StudentSearchSelect from '../../../components/ui/StudentSearchSelect.vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  student: { type: Object, default: null },
  students: { type: Array, default: () => [] },
  preSelectedMonth: { type: Number, default: null },
  preSelectedYear: { type: Number, default: null }
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
const cycleRecommendation = ref(null);

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

const formatDateShort = (dateVal) => {
  if (!dateVal) return '-';
  const cleanStr = String(dateVal).split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
    const [y, m, d] = cleanStr.split('-');
    return `${d}/${m}/${y}`;
  }
  const dateObj = new Date(dateVal);
  if (isNaN(dateObj.getTime())) return dateVal;
  return `${dateObj.getUTCDate()}/${dateObj.getUTCMonth() + 1}/${dateObj.getUTCFullYear()}`;
};

const form = reactive({
  studentId: '',
  month: new Date().getMonth() + 1,
  year: currentY,
  cycleStartDate: '',
  cycleEndDate: '',
  amount: 50000,
  paymentDate: getTodayString(),
  paymentMethod: 'EFECTIVO',
  notes: '',
  isExempt: false
});

const updateSuggestedAmount = () => {
  let targetStudent = props.student;
  if (!targetStudent && form.studentId) {
    targetStudent = props.students.find(s => s.id === form.studentId);
  }

  if (form.isExempt) {
    form.amount = 0;
    return;
  }

  if (targetStudent && targetStudent.effectiveMonthlyFee !== undefined && targetStudent.effectiveMonthlyFee !== null) {
    form.amount = targetStudent.effectiveMonthlyFee;
  } else if (targetStudent && targetStudent.customMonthlyFee !== undefined && targetStudent.customMonthlyFee !== null) {
    form.amount = targetStudent.customMonthlyFee;
  } else {
    form.amount = paymentStore.defaultFees.monthlyFee || 50000;
  }
};

const loadCycleRecommendation = async () => {
  const studentIdToUse = props.student ? props.student.id : form.studentId;
  if (!studentIdToUse) return;

  const res = await paymentStore.fetchRecommendedCycle(studentIdToUse, form.paymentDate);
  if (res && res.success && res.data) {
    cycleRecommendation.value = res.data;
    if (res.data.recommendedStartDate) {
      form.cycleStartDate = String(res.data.recommendedStartDate).split('T')[0];
    }
    if (res.data.recommendedEndDate) {
      form.cycleEndDate = String(res.data.recommendedEndDate).split('T')[0];
    }
    if (res.data.month) form.month = res.data.month;
    if (res.data.year) form.year = res.data.year;
  }
};

const onStudentChange = () => {
  updateSuggestedAmount();
  loadCycleRecommendation();
};

const onPaymentDateChange = () => {
  loadCycleRecommendation();
};

const onCycleStartDateChange = () => {
  if (form.cycleStartDate) {
    const start = new Date(`${form.cycleStartDate}T12:00:00.000Z`);
    const y = start.getUTCFullYear();
    const m = start.getUTCMonth();
    const d = start.getUTCDate();

    let nextM = m + 1;
    let nextY = y;
    if (nextM > 11) { nextM = 0; nextY = y + 1; }

    const daysInNextM = new Date(Date.UTC(nextY, nextM + 1, 0)).getUTCDate();
    let endDay = d > daysInNextM ? daysInNextM : d - 1;
    let endMonth = nextM;
    let endYear = nextY;

    if (d <= daysInNextM) {
      const anniversary = new Date(Date.UTC(nextY, nextM, d, 12, 0, 0, 0));
      anniversary.setUTCDate(anniversary.getUTCDate() - 1);
      endYear = anniversary.getUTCFullYear();
      endMonth = anniversary.getUTCMonth();
      endDay = anniversary.getUTCDate();
    }

    const endFormatted = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
    form.cycleEndDate = endFormatted;
    form.month = start.getUTCMonth() + 1;
    form.year = start.getUTCFullYear();
  }
};

const onExemptChange = () => {
  if (form.isExempt) {
    form.amount = 0;
    form.paymentMethod = 'EXONERADO';
    if (!form.notes) {
      form.notes = 'Exonerado por inasistencia';
    }
  } else {
    form.paymentMethod = 'EFECTIVO';
    if (form.notes === 'Exonerado por inasistencia') {
      form.notes = '';
    }
    updateSuggestedAmount();
  }
};

const resetForm = async () => {
  errorMessage.value = null;
  cycleRecommendation.value = null;
  form.studentId = props.student ? props.student.id : '';
  form.month = props.preSelectedMonth || (new Date().getMonth() + 1);
  form.year = props.preSelectedYear || currentY;
  form.paymentDate = getTodayString();
  form.paymentMethod = 'EFECTIVO';
  form.notes = '';
  form.isExempt = false;

  await paymentStore.fetchDefaultFees();
  updateSuggestedAmount();
  await loadCycleRecommendation();
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    resetForm();
  }
});

watch(() => props.student, () => {
  updateSuggestedAmount();
  loadCycleRecommendation();
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
      cycleStartDate: form.cycleStartDate,
      cycleEndDate: form.cycleEndDate,
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

.alert-warning-interruption {
  background-color: #fffbeb;
  border: 1px solid #fef3c7;
  color: #92400e;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: var(--border-radius-md);
}

.alert-warning-interruption p {
  font-size: 0.82rem;
  margin: 0.2rem 0;
  color: #b45309;
}

.alert-info-cycle {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius-md);
  font-size: 0.85rem;
}

.cycle-tag {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #1d4ed8;
  background-color: #dbeafe;
  padding: 0.2rem 0.6rem;
  border-radius: var(--border-radius-md);
  margin-top: 0.3rem;
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

.form-control:disabled {
  background-color: var(--color-gray-100);
  color: var(--color-gray-500);
  cursor: not-allowed;
}

.checkbox-group {
  margin: 0.5rem 0;
  padding: 0.75rem;
  background-color: #F8FAFC;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-gray-200);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-dark);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--color-primary);
  cursor: pointer;
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
  background-color: var(--color-success);
  color: var(--color-white);
}

.btn-primary:hover {
  background-color: var(--color-success-hover);
}
</style>
