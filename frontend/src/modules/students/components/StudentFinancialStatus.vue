<template>
  <div class="financial-status-container">
    <!-- SPINNER CARGANDO ESTADO FINANCIERO -->
    <div v-if="paymentStore.loading && !initialized" class="loading-box card-modern">
      <div class="spinner"></div>
      <p>Cargando estado financiero del alumno...</p>
    </div>

    <template v-else-if="statusData">
      <!-- TARJETAS RESUMEN DE SALDOS -->
      <div class="kpi-summary-grid">
        <div class="kpi-financial-card card-modern">
          <div class="kpi-icon-box total-paid">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-title">Total Pagado</span>
            <h3 class="kpi-value text-success">{{ formatCurrency(statusData.totalPaid) }}</h3>
            <span class="kpi-subtitle font-xs">
              M: {{ formatCurrency(statusData.totalPaidMensualidades) }} | I: {{ formatCurrency(statusData.totalPaidInscripciones) }}
            </span>
          </div>
        </div>

        <div class="kpi-financial-card card-modern">
          <div class="kpi-icon-box balance-pending" :class="{ 'has-pending': statusData.pendingBalance > 0 }">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-title">Saldo Pendiente</span>
            <h3 :class="['kpi-value', statusData.pendingBalance > 0 ? 'text-danger' : 'text-success']">
              {{ formatCurrency(statusData.pendingBalance) }}
            </h3>
            <span class="kpi-subtitle">
              {{ statusData.pendingBalance > 0 ? 'Inscripción o meses por cobrar' : 'Al día en sus pagos' }}
            </span>
          </div>
        </div>

        <div class="kpi-financial-card card-modern">
          <div class="kpi-icon-box reg-status" :class="{ 'is-paid': statusData.registrationStatus.isPaid }">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <polyline points="16 11 18 13 22 9"></polyline>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-title">Inscripción</span>
            <h3 class="kpi-value font-sm">
              <span :class="['badge', statusData.registrationStatus.isPaid ? 'badge-success' : 'badge-warning']">
                {{ statusData.registrationStatus.isPaid ? 'PAGADA' : 'PENDIENTE' }}
              </span>
            </h3>
            <span class="kpi-subtitle">
              {{ statusData.registrationStatus.isPaid ? `Consecutivo: ${statusData.registrationStatus.details.consecutive}` : 'Pago único de matrícula' }}
            </span>
          </div>
        </div>

        <div class="kpi-financial-card card-modern">
          <div class="kpi-icon-box fee-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-title">Tarifa Mensual</span>
            <h3 class="kpi-value text-dark">{{ formatCurrency(statusData.effectiveMonthlyFee) }}</h3>
            <span class="kpi-subtitle font-xs">
              {{ statusData.isCustomFee ? 'Tarifa Especial/Personalizada' : 'Tarifa General de Academia' }}
            </span>
          </div>
        </div>
      </div>

      <!-- BOTONES DE ACCIÓN RÁPIDA DE PAGO -->
      <div class="actions-bar card-modern">
        <div class="actions-left">
          <h3 class="section-title">Gestión de Pagos</h3>
          <p class="section-desc">Registre nuevos cobros o consulte el estado del alumno</p>
        </div>
        <div class="actions-buttons">
          <button
            type="button"
            class="btn btn-outline-primary"
            v-if="!statusData.registrationStatus.isPaid"
            @click="openRegistrationModal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
            Registrar Pago Inscripción
          </button>
          <button type="button" class="btn btn-success" @click="openMonthlyModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
            Registrar Mensualidad
          </button>
        </div>
      </div>

      <!-- SECCIÓN: MATRIZ DE MENSUALIDADES DEL AÑO -->
      <div class="months-card card-modern">
        <div class="months-header">
          <div>
            <h3>Mensualidades del Año {{ selectedYear }}</h3>
            <p class="subtext">Estado de cumplimiento de pagos por mes</p>
          </div>
          <div class="year-selector">
            <label class="year-label">Año:</label>
            <select v-model.number="selectedYear" @change="loadFinancialStatus" class="select-year">
              <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
        </div>

        <div class="months-grid">
          <div
            v-for="m in statusData.yearMonthlyGrid"
            :key="m.month"
            :class="['month-box', getMonthBoxClass(m)]"
          >
            <div class="month-top">
              <div class="month-name-group">
                <span class="month-name">{{ m.monthName }}</span>
                <span class="month-period-label" v-if="m.periodLabel && m.status !== 'NOT_APPLICABLE'">{{ m.periodLabel }}</span>
              </div>
              <span v-if="m.isPaid" class="month-badge paid">Pagado</span>
              <span v-else-if="m.status === 'OVERDUE'" class="month-badge overdue">Vencido</span>
              <span v-else-if="m.status === 'IN_PROGRESS'" class="month-badge in-progress">En curso</span>
              <span v-else-if="m.status === 'PENDING'" class="month-badge pending">Pendiente</span>
              <span v-else-if="m.status === 'NOT_APPLICABLE'" class="month-badge na">Inactivo</span>
              <span v-else class="month-badge future">Próximo</span>
            </div>

            <div class="month-body">
              <template v-if="m.isPaid && m.payment">
                <span v-if="m.payment.amount === 0 && m.payment.paymentMethod === 'EXONERADO'" class="month-amount text-muted">Exonerado</span>
                <span v-else class="month-amount">{{ formatCurrency(m.payment.amount) }}</span>
                <span class="month-date">{{ formatDateShort(m.payment.paymentDate) }}</span>
                <span class="month-consecutive">{{ m.payment.consecutive }}</span>
              </template>
              <template v-else-if="m.status === 'OVERDUE'">
                <span class="month-amount text-danger">{{ formatCurrency(statusData.effectiveMonthlyFee) }}</span>
                <button
                  type="button"
                  class="btn-pay-month btn-pay-overdue"
                  @click="openMonthlyModal(m.month, selectedYear)"
                >
                  Pagar {{ m.monthName }}
                </button>
              </template>
              <template v-else-if="m.status === 'IN_PROGRESS' || m.status === 'PENDING'">
                <span class="month-amount text-amber">{{ formatCurrency(statusData.effectiveMonthlyFee) }}</span>
                <button
                  type="button"
                  class="btn-pay-month btn-pay-in-progress"
                  @click="openMonthlyModal(m.month, selectedYear)"
                >
                  Pagar {{ m.monthName }}
                </button>
              </template>
              <template v-else-if="m.status === 'NOT_APPLICABLE'">
                <span class="month-amount text-muted">-</span>
                <span class="month-date text-muted">Previo a ingreso</span>
              </template>
              <template v-else>
                <span class="month-amount text-muted">{{ formatCurrency(statusData.effectiveMonthlyFee) }}</span>
                <span class="month-date text-muted">Aún no vence</span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN: HISTORIAL DE PAGOS DEL ALUMNO -->
      <div class="history-card card-modern">
        <div class="card-section-title">
          <div class="icon-box history">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          </div>
          <div>
            <h3>Historial de Pagos</h3>
            <p class="subtext">Listado detallado de todos los comprobantes y recaudos registrados</p>
          </div>
        </div>

        <div v-if="statusData.history.length === 0" class="empty-history-box">
          <p>No hay registros de pago vinculados a este alumno.</p>
        </div>

        <div v-else class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Consecutivo</th>
                <th>Tipo</th>
                <th>Concepto / Periodo</th>
                <th>Fecha de Pago</th>
                <th>Método</th>
                <th>Valor</th>
                <th>Registrado Por</th>
                <th>Observaciones</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in statusData.history" :key="item.id">
                <td class="font-mono font-bold text-primary">{{ item.consecutive }}</td>
                <td>
                  <span :class="['badge', item.type === 'INSCRIPCION' ? 'badge-primary' : 'badge-success']">
                    {{ item.type }}
                  </span>
                </td>
                <td class="font-semibold">{{ item.concept }}</td>
                <td>{{ formatDate(item.paymentDate) }}</td>
                <td>
                  <span class="method-tag">{{ formatMethod(item.paymentMethod) }}</span>
                </td>
                <td class="font-bold text-dark">{{ formatCurrency(item.amount) }}</td>
                <td class="text-sm text-gray">{{ item.registeredBy || 'Administrador' }}</td>
                <td class="notes-cell">{{ item.notes || '-' }}</td>
                <td class="action-cell">
                  <div class="action-buttons-cell">
                    <button
                      type="button"
                      class="btn-edit-action"
                      title="Editar este pago"
                      @click="openEditModal(item)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      class="btn-delete-action"
                      title="Eliminar este pago"
                      @click="handleDeletePayment(item)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      <span>Eliminar</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- MODALES DE REGISTRO -->
    <RegistrationModal
      :show="showRegistrationModal"
      :student="student"
      @close="showRegistrationModal = false"
      @success="handlePaymentSuccess"
    />

    <MonthlyPaymentModal
      :show="showMonthlyModal"
      :student="student"
      :pre-selected-month="selectedMonthForModal"
      :pre-selected-year="selectedYearForModal"
      @close="showMonthlyModal = false"
      @success="handlePaymentSuccess"
    />

    <!-- MODAL DE EDICIÓN DE PAGO -->
    <EditPaymentModal
      :show="showEditModal"
      :payment="selectedPaymentToEdit"
      @close="showEditModal = false"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { usePaymentStore } from '../../../stores/paymentStore';
import RegistrationModal from '../../payments/components/RegistrationModal.vue';
import MonthlyPaymentModal from '../../payments/components/MonthlyPaymentModal.vue';
import EditPaymentModal from '../../payments/components/EditPaymentModal.vue';

const props = defineProps({
  student: {
    type: Object,
    required: true
  }
});

const paymentStore = usePaymentStore();

const initialized = ref(false);
const currentYear = new Date().getFullYear();
const selectedYear = ref(currentYear);

const availableYears = [currentYear - 1, currentYear, currentYear + 1];

const showRegistrationModal = ref(false);
const showMonthlyModal = ref(false);
const showEditModal = ref(false);
const selectedPaymentToEdit = ref(null);
const selectedMonthForModal = ref(null);
const selectedYearForModal = ref(currentYear);

const statusData = computed(() => paymentStore.studentFinancialStatus);

const loadFinancialStatus = async () => {
  if (props.student && props.student.id) {
    await paymentStore.fetchStudentFinancialStatus(props.student.id, selectedYear.value);
    initialized.value = true;
  }
};

onMounted(() => {
  loadFinancialStatus();
});

watch(() => props.student.id, () => {
  loadFinancialStatus();
});

const openRegistrationModal = () => {
  showRegistrationModal.value = true;
};

const openMonthlyModal = (month = null, year = selectedYear.value) => {
  selectedMonthForModal.value = month;
  selectedYearForModal.value = year;
  showMonthlyModal.value = true;
};

const openEditModal = (payment) => {
  selectedPaymentToEdit.value = {
    ...payment,
    studentId: props.student.id,
    studentName: `${props.student.firstName} ${props.student.lastName}`,
    studentDocument: props.student.document
  };
  showEditModal.value = true;
};

const handleDeletePayment = async (payment) => {
  if (!confirm(`¿Estás seguro de que deseas eliminar este pago (${payment.consecutive})?\nEsta acción no se puede deshacer.`)) {
    return;
  }
  
  try {
    const targetId = payment.rawId || payment.id;
    if (payment.type === 'INSCRIPCION') {
      await paymentStore.deleteRegistration(targetId);
    } else {
      await paymentStore.deleteMonthlyPayment(targetId);
    }
    loadFinancialStatus();
  } catch (error) {
    alert(error.response?.data?.message || error.message || 'Ocurrió un error al intentar eliminar el pago');
  }
};

const handlePaymentSuccess = () => {
  loadFinancialStatus();
};

const getMonthBoxClass = (m) => {
  if (m.isPaid) return 'box-paid';
  if (m.status === 'OVERDUE') return 'box-overdue';
  if (m.status === 'IN_PROGRESS') return 'box-in-progress';
  if (m.status === 'PENDING') return 'box-pending';
  if (m.status === 'NOT_APPLICABLE') return 'box-na';
  return 'box-future';
};

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '$ 0 COP';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(d);
};

const formatDateShort = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`;
};

const formatMethod = (method) => {
  if (!method) return 'Efectivo';
  const map = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
    NEQUI: 'Nequi',
    DAVIPLATA: 'Daviplata',
    OTRO: 'Otro'
  };
  return map[method] || method;
};
</script>

<style scoped>
.financial-status-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.loading-box {
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

/* KPI Summary Grid */
.kpi-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.kpi-financial-card {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.kpi-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-icon-box.total-paid {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

.kpi-icon-box.balance-pending {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

.kpi-icon-box.balance-pending.has-pending {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
}

.kpi-icon-box.reg-status {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
}

.kpi-icon-box.reg-status.is-paid {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.kpi-icon-box.fee-info {
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
}

.kpi-info {
  display: flex;
  flex-direction: column;
}

.kpi-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--color-gray-500);
  text-transform: uppercase;
}

.kpi-value {
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 0.15rem 0;
}

.font-sm {
  font-size: 1rem;
}

.font-xs {
  font-size: 0.75rem;
}

.kpi-subtitle {
  font-size: 0.76rem;
  color: var(--color-gray-500);
}

.text-success { color: var(--color-success); }
.text-danger { color: var(--color-danger); }
.text-dark { color: var(--color-dark); }
.text-gray { color: var(--color-gray-500); }

/* Actions Bar */
.actions-bar {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-dark);
}

.section-desc {
  font-size: 0.85rem;
  color: var(--color-gray-500);
}

.actions-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.2rem;
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-outline-primary {
  background-color: var(--color-white);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-outline-primary:hover {
  background-color: var(--color-primary-light);
}

.btn-success {
  background-color: var(--color-success);
  color: var(--color-white);
}

.btn-success:hover {
  background-color: var(--color-success-hover);
}

/* Months Card & Grid */
.months-card {
  padding: 1.5rem;
}

.months-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.months-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-dark);
}

.year-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.year-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-gray-600);
}

.select-year {
  padding: 0.4rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 700;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-gray-300);
  background-color: var(--color-white);
  color: var(--color-primary);
  outline: none;
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

.month-box {
  padding: 1rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-gray-200);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.75rem;
  transition: var(--transition-fast);
}

.box-paid {
  background-color: #F0FDF4;
  border-color: #BBF7D0;
}

.box-overdue,
.box-pending {
  background-color: #FEF2F2;
  border-color: #FECACA;
}

.box-in-progress {
  background-color: #FFFBEB;
  border-color: #FDE68A;
}

.box-na {
  background-color: var(--color-gray-50);
  border-color: var(--color-gray-200);
  opacity: 0.6;
}

.box-future {
  background-color: var(--color-gray-100);
  border-color: var(--color-gray-200);
  opacity: 0.75;
}

.month-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.month-name-group {
  display: flex;
  flex-direction: column;
}

.month-name {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--color-dark);
}

.month-period-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-gray-500);
  margin-top: 2px;
}

.month-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: var(--border-radius-full);
}

.month-badge.paid {
  background-color: #DCFCE7;
  color: #15803D;
}

.month-badge.overdue,
.month-badge.pending {
  background-color: #FEE2E2;
  color: #B91C1C;
}

.month-badge.in-progress {
  background-color: #FEF3C7;
  color: #D97706;
}

.month-badge.na {
  background-color: var(--color-gray-200);
  color: var(--color-gray-500);
}

.month-badge.future {
  background-color: var(--color-gray-200);
  color: var(--color-gray-600);
}

.month-body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.month-amount {
  font-weight: 800;
  font-size: 1rem;
}

.text-amber {
  color: #D97706;
}

.month-date {
  font-size: 0.75rem;
  color: var(--color-gray-500);
}

.month-consecutive {
  font-size: 0.7rem;
  font-family: monospace;
  font-weight: 700;
  color: var(--color-primary);
}

.btn-pay-month {
  margin-top: 0.25rem;
  padding: 0.35rem 0.6rem;
  font-size: 0.76rem;
  font-weight: 700;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-pay-overdue {
  background-color: var(--color-danger);
  color: var(--color-white);
}

.btn-pay-overdue:hover {
  background-color: var(--color-danger-hover);
}

.btn-pay-in-progress {
  background-color: #D97706;
  color: var(--color-white);
}

.btn-pay-in-progress:hover {
  background-color: #B45309;
}

/* History Card & Data Table */
.history-card {
  padding: 1.5rem;
}

.card-section-title {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
}

.icon-box.history {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-section-title h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-dark);
}

.empty-history-box {
  padding: 2rem;
  text-align: center;
  color: var(--color-gray-500);
  background-color: var(--color-gray-100);
  border-radius: var(--border-radius-md);
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.88rem;
}

.data-table th {
  padding: 0.75rem 1rem;
  background-color: var(--color-gray-100);
  color: var(--color-gray-600);
  font-weight: 700;
  border-bottom: 2px solid var(--color-gray-200);
  white-space: nowrap;
}

.data-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--color-gray-200);
}

.font-mono { font-family: monospace; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.text-primary { color: var(--color-primary); }
.text-sm { font-size: 0.8rem; }

.method-tag {
  font-size: 0.78rem;
  padding: 0.2rem 0.5rem;
  background-color: var(--color-gray-100);
  border-radius: var(--border-radius-md);
  font-weight: 600;
}

.notes-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-gray-500);
}

.action-cell {
  text-align: center;
  white-space: nowrap;
}

.text-center {
  text-align: center;
}

.btn-edit-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #2563eb;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-edit-action:hover {
  background-color: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.action-buttons-cell {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-delete-action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #dc2626;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-delete-action:hover {
  background-color: #dc2626;
  color: #ffffff;
  border-color: #dc2626;
}
</style>
