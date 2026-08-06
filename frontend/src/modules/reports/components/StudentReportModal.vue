<template>
  <Teleport to="body">
    <div v-if="show" class="modal-backdrop" @click.self="close">
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title-box">
            <div class="modal-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <div>
              <h3>Reporte Individual del Alumno</h3>
              <p class="subtext">Ficha técnica y resumen financiero consolidado</p>
            </div>
          </div>
          <button type="button" class="close-btn" @click="close">&times;</button>
        </div>

        <div class="modal-body" v-if="reportData">
          <div id="printable-student-report">
            <!-- Header Alumno -->
            <div class="student-header-box">
              <div class="student-main">
                <h2 class="student-name">{{ reportData.studentInfo.fullName }}</h2>
                <div class="student-badges">
                  <span :class="['badge', reportData.studentInfo.status === 'ACTIVE' ? 'badge-success' : 'badge-danger']">
                    {{ reportData.studentInfo.status === 'ACTIVE' ? 'ACTIVO' : 'INACTIVO' }}
                  </span>
                  <span class="badge badge-primary">Código: {{ reportData.studentInfo.code }}</span>
                </div>
              </div>
              <p class="doc-text">Documento de Identidad: <strong>{{ reportData.studentInfo.document }}</strong></p>
            </div>

            <!-- Grilla 2 Columnas Info -->
            <div class="info-grid-2">
              <div class="info-card-box">
                <h4>Información Deportiva & Personal</h4>
                <ul class="info-list">
                  <li><span>Categoría:</span> <strong>{{ reportData.studentInfo.categoryName }}</strong></li>
                  <li><span>Edad:</span> <strong>{{ reportData.studentInfo.age }} Años</strong></li>
                  <li><span>Posición:</span> <strong>{{ reportData.studentInfo.position }}</strong></li>
                  <li><span>Pie Dominante:</span> <strong>{{ reportData.studentInfo.dominantFoot }}</strong></li>
                  <li><span>Dorsal:</span> <strong>{{ reportData.studentInfo.jerseyNumber ? `#${reportData.studentInfo.jerseyNumber}` : 'N/A' }}</strong></li>
                  <li><span>Fecha de Ingreso:</span> <strong>{{ formatDate(reportData.studentInfo.entryDate) }}</strong></li>
                </ul>
              </div>

              <div class="info-card-box">
                <h4>Acudiente & Salud</h4>
                <ul class="info-list">
                  <li><span>Acudiente:</span> <strong>{{ reportData.studentInfo.guardianName }}</strong></li>
                  <li><span>Parentesco:</span> <strong>{{ reportData.studentInfo.guardianRelationship }}</strong></li>
                  <li><span>Teléfono:</span> <strong>{{ reportData.studentInfo.guardianPhone }}</strong></li>
                  <li><span>Dirección:</span> <strong>{{ reportData.studentInfo.guardianAddress }}</strong></li>
                  <li><span>EPS:</span> <strong>{{ reportData.studentInfo.eps }}</strong></li>
                  <li><span>Alergias:</span> <strong>{{ reportData.studentInfo.allergies || 'Ninguna' }}</strong></li>
                </ul>
              </div>
            </div>

            <!-- Resumen Financiero -->
            <div class="financial-summary-box card-modern">
              <h4>Estado Financiero Actual</h4>
              <div class="fin-kpis">
                <div class="fin-kpi">
                  <span class="label">Inscripción</span>
                  <span :class="['badge', reportData.financialStatus.registrationStatus.isPaid ? 'badge-success' : 'badge-warning']">
                    {{ reportData.financialStatus.registrationStatus.isPaid ? 'PAGADA' : 'PENDIENTE' }}
                  </span>
                </div>
                <div class="fin-kpi">
                  <span class="label">Total Pagado</span>
                  <span class="val text-success">{{ formatCurrency(reportData.financialStatus.totalPaid) }}</span>
                </div>
                <div class="fin-kpi">
                  <span class="label">Saldo Pendiente</span>
                  <span :class="['val', reportData.financialStatus.pendingBalance > 0 ? 'text-danger' : 'text-success']">
                    {{ formatCurrency(reportData.financialStatus.pendingBalance) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Historial Reciente de Pagos -->
            <div class="history-section">
              <h4>Historial de Comprobantes</h4>
              <table class="data-table" v-if="reportData.financialStatus.history.length > 0">
                <thead>
                  <tr>
                    <th>Consecutivo</th>
                    <th>Tipo</th>
                    <th>Concepto</th>
                    <th>Fecha</th>
                    <th>Método</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="h in reportData.financialStatus.history" :key="h.id">
                    <td class="font-mono">{{ h.consecutive }}</td>
                    <td>{{ h.type }}</td>
                    <td>{{ h.concept }}</td>
                    <td>{{ formatDate(h.paymentDate) }}</td>
                    <td>{{ h.paymentMethod }}</td>
                    <td class="font-bold">{{ formatCurrency(h.amount) }}</td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="text-muted">Sin registros de pago vinculados.</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Cerrar</button>
          <button type="button" class="btn btn-primary" @click="handlePrint">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Imprimir Ficha Individual
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { printReport } from '../../../utils/exportUtils';

const props = defineProps({
  show: { type: Boolean, default: false },
  reportData: { type: Object, default: null }
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};

const handlePrint = () => {
  if (!props.reportData) return;
  const elem = document.getElementById('printable-student-report');
  if (elem) {
    printReport(`Ficha del Alumno - ${props.reportData.studentInfo.fullName}`, elem.innerHTML);
  }
};

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '$ 0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(val);
};

const formatDate = (dStr) => {
  if (!dStr) return '-';
  const d = new Date(dStr);
  if (isNaN(d.getTime())) return dStr;
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(d);
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-card {
  width: 100%;
  max-width: 780px;
  max-height: 90vh;
  background: var(--color-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
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
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.student-header-box {
  background-color: var(--color-gray-100);
  padding: 1.25rem;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-gray-200);
  margin-bottom: 1rem;
}

.student-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.student-name {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--color-dark);
  margin: 0;
}

.student-badges {
  display: flex;
  gap: 0.5rem;
}

.doc-text {
  font-size: 0.9rem;
  color: var(--color-gray-600);
  margin: 0;
}

.info-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.info-card-box {
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  padding: 1rem;
}

.info-card-box h4, .financial-summary-box h4, .history-section h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: 0.75rem;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-size: 0.88rem;
}

.info-list li {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed var(--color-gray-200);
  padding-bottom: 0.35rem;
}

.info-list li span {
  color: var(--color-gray-500);
}

.financial-summary-box {
  padding: 1rem 1.25rem;
  margin-bottom: 1.25rem;
}

.fin-kpis {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.fin-kpi {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.fin-kpi .label {
  font-size: 0.78rem;
  color: var(--color-gray-500);
  text-transform: uppercase;
  font-weight: 700;
}

.fin-kpi .val {
  font-size: 1.2rem;
  font-weight: 800;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.data-table th {
  padding: 0.6rem 0.75rem;
  background-color: var(--color-gray-100);
  color: var(--color-gray-600);
  font-weight: 700;
  border-bottom: 2px solid var(--color-gray-200);
  text-align: left;
}

.data-table td {
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid var(--color-gray-200);
}

.text-success { color: var(--color-success); }
.text-danger { color: var(--color-danger); }
.font-mono { font-family: monospace; }
.font-bold { font-weight: 700; }
.text-muted { color: var(--color-gray-500); }

.modal-footer {
  padding: 1rem 1.5rem;
  background-color: var(--color-gray-100);
  border-top: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
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
}

.btn-secondary {
  background-color: var(--color-white);
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}
</style>
