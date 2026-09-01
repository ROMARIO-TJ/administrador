<template>
  <Teleport to="body">
    <div v-if="show" class="modal-backdrop" @click.self="close">
      <div class="modal-card">
        <!-- CABECERA DEL MODAL -->
        <div class="modal-header">
          <div class="modal-title-box">
            <div class="modal-icon edit-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </div>
            <div>
              <h3>{{ isConfirmStep ? 'Confirmar Modificación de Pago' : 'Editar Pago Registrado' }}</h3>
              <p class="subtext">
                {{ isConfirmStep ? 'Verifique los cambios antes de actualizar la base de datos' : `Comprobante: ${originalData.consecutive || 'N/A'}` }}
              </p>
            </div>
          </div>
          <button type="button" class="close-btn" @click="close" :disabled="submitting">&times;</button>
        </div>

        <!-- MENSAJE DE ERROR -->
        <div v-if="errorMessage" class="alert alert-danger mx-6 mt-4">
          {{ errorMessage }}
        </div>

        <!-- PASO 1: FORMULARIO DE EDICIÓN -->
        <form v-if="!isConfirmStep" @submit.prevent="goToConfirm" class="modal-body">
          <!-- DATOS INMUTABLES (ALUMNO Y CONSECUTIVO) -->
          <div class="immutable-card">
            <div class="immutable-item">
              <span class="label">Alumno:</span>
              <strong class="value">{{ originalData.studentName || 'Alumno no especificado' }}</strong>
              <span class="doc" v-if="originalData.studentDocument">Doc: {{ originalData.studentDocument }}</span>
            </div>
            <div class="immutable-item">
              <span class="label">Consecutivo:</span>
              <strong class="font-mono text-primary">{{ originalData.consecutive }}</strong>
              <span :class="['badge-tag', isMonthly ? 'badge-monthly' : 'badge-registration']">
                {{ isMonthly ? 'MENSUALIDAD' : 'INSCRIPCIÓN' }}
              </span>
            </div>
          </div>

          <div class="edit-notice">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>El consecutivo, el alumno y el tipo de pago permanecen inalterados para preservar la integridad contable.</span>
          </div>

          <!-- SI ES MENSUALIDAD: CICLO DE COBERTURA Y MES/AÑO -->
          <div class="form-row-2" v-if="isMonthly">
            <div class="form-group">
              <label class="form-label">Inicio del Ciclo <span class="required">*</span></label>
              <input type="date" v-model="form.cycleStartDate" class="form-control" required />
            </div>
            <div class="form-group">
              <label class="form-label">Fin del Ciclo <span class="required">*</span></label>
              <input type="date" v-model="form.cycleEndDate" class="form-control" required />
            </div>
          </div>

          <div class="form-row-2" v-if="isMonthly">
            <div class="form-group">
              <label class="form-label">Mes Correspondiente <span class="required">*</span></label>
              <select v-model.number="form.month" class="form-control" required>
                <option v-for="(mName, idx) in monthsList" :key="idx + 1" :value="idx + 1">
                  {{ mName }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Año Correspondiente <span class="required">*</span></label>
              <select v-model.number="form.year" class="form-control" required>
                <option v-for="y in yearsList" :key="y" :value="y">
                  {{ y }}
                </option>
              </select>
            </div>
          </div>

          <!-- VALOR DEL PAGO -->
          <div class="form-group">
            <label class="form-label">Valor del Pago (COP) <span class="required">*</span></label>
            <div class="input-prefix-wrapper">
              <span class="prefix-symbol">$</span>
              <input
                type="number"
                v-model.number="form.amount"
                class="form-control prefixed"
                placeholder="50000"
                min="0"
                step="any"
                required
              />
            </div>
          </div>

          <div class="form-row-2">
            <!-- FECHA DE PAGO -->
            <div class="form-group">
              <label class="form-label">Fecha de Pago <span class="required">*</span></label>
              <input type="date" v-model="form.paymentDate" class="form-control" required />
            </div>

            <!-- MÉTODO DE PAGO -->
            <div class="form-group">
              <label class="form-label">Método de Pago <span class="required">*</span></label>
              <select v-model="form.paymentMethod" class="form-control" required>
                <option v-for="pm in activePaymentMethods" :key="pm.id" :value="pm.name.toUpperCase()">
                  {{ pm.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- OBSERVACIONES -->
          <div class="form-group">
            <label class="form-label">Observaciones / Notas (Opcional)</label>
            <textarea
              v-model="form.notes"
              class="form-control textarea"
              rows="2"
              placeholder="Detalles o motivo de la corrección..."
            ></textarea>
          </div>

          <!-- BOTONES PASO 1 -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="close">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary">
              Continuar a Confirmación &rarr;
            </button>
          </div>
        </form>

        <!-- PASO 2: CONFIRMACIÓN EXPLÍCITA DE SEGURIDAD -->
        <div v-else class="modal-body confirm-view">
          <div class="confirm-alert-box">
            <div class="confirm-alert-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div>
              <h4>¿Está seguro de modificar este pago?</h4>
              <p>Esta acción actualizará el registro real en PostgreSQL y recalculará automáticamente los reportes e indicadores financieros.</p>
            </div>
          </div>

          <!-- TARJETA RESUMEN DE COMPARACIÓN -->
          <div class="comparison-card">
            <div class="comparison-header">
              <div>
                <span class="sub">Alumno:</span>
                <strong>{{ originalData.studentName }}</strong>
              </div>
              <div>
                <span class="sub">Recibo:</span>
                <span class="font-mono font-bold text-primary">{{ originalData.consecutive }}</span>
              </div>
            </div>

            <table class="comparison-table">
              <thead>
                <tr>
                  <th>Campo</th>
                  <th>Valor Anterior</th>
                  <th></th>
                  <th>Valor Nuevo</th>
                </tr>
              </thead>
              <tbody>
                <!-- FECHA -->
                <tr :class="{ 'row-changed': form.paymentDate !== originalData.paymentDate }">
                  <td class="col-field">Fecha de Pago</td>
                  <td class="col-old">{{ formatDateShort(originalData.paymentDate) }}</td>
                  <td class="col-arrow">&rarr;</td>
                  <td class="col-new font-bold">{{ formatDateShort(form.paymentDate) }}</td>
                </tr>

                <!-- VALOR -->
                <tr :class="{ 'row-changed': form.amount !== originalData.amount }">
                  <td class="col-field">Valor</td>
                  <td class="col-old">{{ formatCurrency(originalData.amount) }}</td>
                  <td class="col-arrow">&rarr;</td>
                  <td class="col-new font-bold text-success">{{ formatCurrency(form.amount) }}</td>
                </tr>

                <!-- MÉTODO -->
                <tr :class="{ 'row-changed': form.paymentMethod !== originalData.paymentMethod }">
                  <td class="col-field">Método de Pago</td>
                  <td class="col-old">{{ formatMethod(originalData.paymentMethod) }}</td>
                  <td class="col-arrow">&rarr;</td>
                  <td class="col-new font-bold">{{ formatMethod(form.paymentMethod) }}</td>
                </tr>

                <!-- PERIODO (SI ES MENSUALIDAD) -->
                <tr v-if="isMonthly" :class="{ 'row-changed': form.month !== originalData.month || form.year !== originalData.year }">
                  <td class="col-field">Periodo / Mes</td>
                  <td class="col-old">{{ originalData.month ? `${monthsList[originalData.month - 1]} ${originalData.year}` : 'N/A' }}</td>
                  <td class="col-arrow">&rarr;</td>
                  <td class="col-new font-bold">{{ `${monthsList[form.month - 1]} ${form.year}` }}</td>
                </tr>

                <!-- OBSERVACIONES -->
                <tr :class="{ 'row-changed': (form.notes || '') !== (originalData.notes || '') }">
                  <td class="col-field">Observaciones</td>
                  <td class="col-old text-sm">{{ originalData.notes || 'Ninguna' }}</td>
                  <td class="col-arrow">&rarr;</td>
                  <td class="col-new text-sm">{{ form.notes || 'Ninguna' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- BOTONES PASO 2 -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="isConfirmStep = false" :disabled="submitting">
              &larr; Volver a Editar
            </button>
            <button type="button" class="btn btn-primary btn-save" @click="handleConfirmSave" :disabled="submitting">
              <span v-if="submitting">Guardando cambios...</span>
              <span v-else>Confirmar Modificación</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { usePaymentStore } from '../../../stores/paymentStore';
import { useSettingsStore } from '../../../stores/settingsStore';

const props = defineProps({
  show: { type: Boolean, default: false },
  payment: { type: Object, default: null }
});

const emit = defineEmits(['close', 'success']);

const paymentStore = usePaymentStore();
const settingsStore = useSettingsStore();

const isConfirmStep = ref(false);
const submitting = ref(false);
const errorMessage = ref(null);

const monthsList = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const currentY = new Date().getFullYear();
const yearsList = [currentY - 2, currentY - 1, currentY, currentY + 1, currentY + 2];

const activePaymentMethods = computed(() => {
  if (settingsStore.paymentMethods && settingsStore.paymentMethods.length > 0) {
    return settingsStore.paymentMethods.filter(pm => pm.active);
  }
  return [
    { id: 1, name: 'Efectivo' },
    { id: 2, name: 'Transferencia' },
    { id: 3, name: 'Nequi' },
    { id: 4, name: 'Daviplata' },
    { id: 5, name: 'Otro' }
  ];
});

// Datos originales del pago para trazabilidad y comparación
const originalData = reactive({
  id: null,
  rawId: null,
  consecutive: '',
  studentId: null,
  studentName: '',
  studentDocument: '',
  type: '',
  amount: 0,
  paymentDate: '',
  paymentMethod: 'EFECTIVO',
  month: null,
  year: null,
  cycleStartDate: '',
  cycleEndDate: '',
  notes: ''
});

// Formulario reactivo editable
const form = reactive({
  amount: 50000,
  paymentDate: '',
  paymentMethod: 'EFECTIVO',
  month: 1,
  year: currentY,
  cycleStartDate: '',
  cycleEndDate: '',
  notes: ''
});

const isMonthly = computed(() => {
  if (!props.payment) return false;
  const p = props.payment;
  return p.type === 'MENSUALIDAD' || p.type === 'MONTHLY' ||
         String(p.consecutive || '').startsWith('MEN-') ||
         String(p.id || '').startsWith('MEN-');
});

const formatIsoDate = (dateVal) => {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    const isoPart = dateVal.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoPart)) {
      return isoPart;
    }
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateShort = (dateVal) => {
  if (!dateVal) return '-';
  if (typeof dateVal === 'string') {
    const isoPart = dateVal.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoPart)) {
      const [y, m, d] = isoPart.split('-');
      return `${d}/${m}/${y}`;
    }
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(val || 0);
};

const formatMethod = (method) => {
  if (!method) return 'Efectivo';
  const map = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia Bancaria',
    NEQUI: 'Nequi',
    DAVIPLATA: 'Daviplata',
    OTRO: 'Otro Método',
    EXONERADO: 'Exonerado'
  };
  return map[method.toUpperCase()] || method;
};

const loadPaymentData = () => {
  isConfirmStep.value = false;
  errorMessage.value = null;

  if (!props.payment) return;

  const p = props.payment;
  const rawId = p.rawId || parseInt(String(p.id).replace(/^[A-Z]+-/, ''));
  const paymentDateIso = formatIsoDate(p.paymentDate);

  originalData.id = p.id;
  originalData.rawId = rawId;
  originalData.consecutive = p.consecutive || '';
  originalData.studentId = p.studentId || null;
  originalData.studentName = p.studentName || (p.student ? `${p.student.firstName} ${p.student.lastName}` : 'Alumno');
  originalData.studentDocument = p.studentDocument || (p.student ? p.student.document : '');
  originalData.type = p.type || (String(p.consecutive).startsWith('INS-') ? 'INSCRIPCION' : 'MENSUALIDAD');
  originalData.amount = Number(p.amount) || 0;
  originalData.paymentDate = paymentDateIso;
  originalData.paymentMethod = (p.paymentMethod || 'EFECTIVO').toUpperCase();
  originalData.month = p.month || null;
  originalData.year = p.year || (p.paymentDate ? new Date(p.paymentDate).getUTCFullYear() : currentY);
  originalData.cycleStartDate = p.cycleStartDate ? formatIsoDate(p.cycleStartDate) : '';
  originalData.cycleEndDate = p.cycleEndDate ? formatIsoDate(p.cycleEndDate) : '';
  originalData.notes = p.notes || '';

  // Inicializar formulario
  form.amount = originalData.amount;
  form.paymentDate = originalData.paymentDate;
  form.paymentMethod = originalData.paymentMethod;
  form.month = originalData.month || (new Date().getMonth() + 1);
  form.year = originalData.year || currentY;
  form.cycleStartDate = originalData.cycleStartDate;
  form.cycleEndDate = originalData.cycleEndDate;
  form.notes = originalData.notes;
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    loadPaymentData();
  }
});

watch(() => props.payment, () => {
  if (props.show) {
    loadPaymentData();
  }
});

const close = (force = false) => {
  if (submitting.value && !force) return;
  emit('close');
};

const goToConfirm = () => {
  errorMessage.value = null;
  if (form.amount === undefined || form.amount === null || form.amount <= 0) {
    errorMessage.value = 'El valor del pago debe ser mayor a 0';
    return;
  }
  if (!form.paymentDate) {
    errorMessage.value = 'Debe indicar una fecha de pago válida';
    return;
  }
  if (isMonthly.value && (!form.month || !form.year)) {
    errorMessage.value = 'Debe indicar el mes y año de la mensualidad';
    return;
  }
  isConfirmStep.value = true;
};

const handleConfirmSave = async () => {
  submitting.value = true;
  errorMessage.value = null;

  try {
    const rawId = originalData.rawId;
    let res = null;

    if (isMonthly.value) {
      const payload = {
        month: form.month,
        year: form.year,
        cycleStartDate: form.cycleStartDate,
        cycleEndDate: form.cycleEndDate,
        amount: form.amount,
        paymentDate: form.paymentDate,
        paymentMethod: form.paymentMethod,
        notes: form.notes
      };
      res = await paymentStore.updateMonthlyPayment(rawId, payload);
    } else {
      const payload = {
        amount: form.amount,
        paymentDate: form.paymentDate,
        paymentMethod: form.paymentMethod,
        notes: form.notes
      };
      res = await paymentStore.updateRegistration(rawId, payload);
    }

    if (res && res.success) {
      submitting.value = false;
      emit('success', res.data);
      close(true);
    } else {
      errorMessage.value = res?.message || 'Error al actualizar el pago';
      isConfirmStep.value = false;
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || err.message || 'Error al comunicarse con el servidor';
    isConfirmStep.value = false;
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
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-card {
  background: #ffffff;
  border-radius: 1rem;
  width: 100%;
  max-width: 560px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  background-color: #ffffff;
}

.modal-title-box {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.modal-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon.edit-icon {
  background-color: #eff6ff;
  color: #2563eb;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.modal-header .subtext {
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0.125rem 0 0 0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
}

/* Immutable Card */
.immutable-card {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.immutable-item {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.immutable-item .label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.immutable-item .value {
  font-size: 0.9375rem;
  color: #0f172a;
}

.immutable-item .doc {
  font-size: 0.75rem;
  color: #64748b;
}

.badge-tag {
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  margin-top: 0.25rem;
  width: fit-content;
}

.badge-monthly {
  background-color: #dcfce7;
  color: #166534;
}

.badge-registration {
  background-color: #eff6ff;
  color: #1d4ed8;
}

.edit-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f1f5f9;
  border-left: 3px solid #64748b;
  padding: 0.625rem 0.875rem;
  border-radius: 0 0.5rem 0.5rem 0;
  font-size: 0.75rem;
  color: #475569;
}

.edit-notice svg {
  flex-shrink: 0;
  color: #475569;
}

/* Forms */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
}

.form-label .required {
  color: #ef4444;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 0.875rem;
  color: #0f172a;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.form-control:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.textarea {
  resize: vertical;
  min-height: 4.5rem;
}

.input-prefix-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.prefix-symbol {
  position: absolute;
  left: 0.875rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #64748b;
  pointer-events: none;
}

.form-control.prefixed {
  padding-left: 2rem;
  font-weight: 600;
  font-size: 0.9375rem;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  line-height: 1.4;
}

.alert-danger {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
  margin-top: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.btn-primary {
  background-color: #2563eb;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-save {
  background-color: #16a34a;
  color: #ffffff;
}

.btn-save:hover:not(:disabled) {
  background-color: #15803d;
}

.btn-secondary {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e2e8f0;
  color: #0f172a;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Confirm Step Styles */
.confirm-alert-box {
  background-color: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
}

.confirm-alert-icon {
  color: #d97706;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.confirm-alert-box h4 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #92400e;
}

.confirm-alert-box p {
  margin: 0.25rem 0 0 0;
  font-size: 0.8125rem;
  color: #b45309;
}

.comparison-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  overflow: hidden;
}

.comparison-header {
  background-color: #f8fafc;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
}

.comparison-header .sub {
  color: #64748b;
  margin-right: 0.375rem;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}

.comparison-table th {
  text-align: left;
  padding: 0.625rem 0.875rem;
  background-color: #f8fafc;
  color: #64748b;
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e2e8f0;
}

.comparison-table td {
  padding: 0.625rem 0.875rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.comparison-table tr:last-child td {
  border-bottom: none;
}

.col-field {
  font-weight: 600;
  color: #334155;
  width: 30%;
}

.col-old {
  color: #64748b;
  text-decoration: line-through;
  opacity: 0.85;
  width: 30%;
}

.col-arrow {
  color: #94a3b8;
  text-align: center;
  width: 5%;
  font-weight: bold;
}

.col-new {
  color: #0f172a;
  width: 35%;
}

.row-changed {
  background-color: #f0fdf4;
}

.row-changed .col-new {
  color: #166534;
}

.text-success {
  color: #16a34a;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.text-primary {
  color: #2563eb;
}

.font-bold {
  font-weight: 700;
}
</style>
