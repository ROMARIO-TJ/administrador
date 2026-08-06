<template>
  <div class="payments-container">
    <!-- CABECERA DE LA PÁGINA -->
    <div class="payments-header">
      <div>
        <h2 class="page-title">Gestión de Pagos</h2>
        <p class="page-subtitle">Control de inscripciones, mensualidades y recaudos — Unión Jaguera FC</p>
      </div>

      <div class="header-actions">
        <button type="button" class="btn btn-outline-primary" @click="openRegistrationModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
          Registrar Inscripción
        </button>
        <button type="button" class="btn btn-primary" @click="openMonthlyModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
          Registrar Mensualidad
        </button>
      </div>
    </div>

    <!-- TARJETAS DE INDICADORES FINANCIEROS (KPIS DEL MÓDULO) -->
    <div class="kpi-grid">
      <KpiCard
        title="Recaudo del Mes"
        :value="formatCurrency(dashboardStats.recaudoMes)"
        subtitle="Ingresos en el mes actual"
        iconBgColor="#DCFCE7"
        iconColor="#16A34A"
        isPositive
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </template>
      </KpiCard>

      <KpiCard
        title="Recaudo del Año"
        :value="formatCurrency(dashboardStats.recaudoAño)"
        subtitle="Ingresos en el año en curso"
        iconBgColor="#EFF6FF"
        iconColor="#2563EB"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
          </svg>
        </template>
      </KpiCard>

      <KpiCard
        title="Total Mensualidades"
        :value="formatCurrency(paymentStore.summary.totalAmountCollected)"
        :subtitle="`${paymentStore.summary.monthlyCount} mensualidades registradas`"
        iconBgColor="#FEF3C7"
        iconColor="#D97706"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </template>
      </KpiCard>

      <KpiCard
        title="Total Inscripciones"
        :value="`${paymentStore.summary.registrationCount} Inscripciones`"
        subtitle="Alumnos matriculados"
        iconBgColor="#F3E8FF"
        iconColor="#9333EA"
      >
        <template #icon>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <polyline points="16 11 18 13 22 9"></polyline>
          </svg>
        </template>
      </KpiCard>
    </div>

    <!-- SECCIÓN PRINCIPAL: FILTROS Y TABLA DE PAGOS -->
    <div class="payments-content card-modern">
      <!-- BARRA DE FILTROS -->
      <div class="filters-row">
        <!-- Búsqueda rápida -->
        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            v-model="filters.search"
            placeholder="Buscar por alumno, documento o consecutivo..."
            class="search-input"
            @input="debounceSearch"
          />
        </div>

        <!-- Filtro por Tipo -->
        <div class="filter-group">
          <label class="filter-label">Tipo:</label>
          <select v-model="filters.type" @change="applyFilters" class="filter-select">
            <option value="ALL">Todos los Pagos</option>
            <option value="INSCRIPCION">Inscripciones</option>
            <option value="MENSUALIDAD">Mensualidades</option>
          </select>
        </div>

        <!-- Filtro por Año -->
        <div class="filter-group">
          <label class="filter-label">Año:</label>
          <select v-model="filters.year" @change="applyFilters" class="filter-select">
            <option value="">Todos los años</option>
            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <!-- CARGANDO / TABLA DE DATOS -->
      <div v-if="paymentStore.loading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando registros de recaudos...</p>
      </div>

      <div v-else-if="paymentStore.payments.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <h3>No existen pagos registrados.</h3>
        <p>Utilice los botones superiores para registrar el primer pago o ajuste los filtros de búsqueda.</p>
      </div>

      <div v-else class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Consecutivo</th>
              <th>Tipo</th>
              <th>Alumno</th>
              <th>Documento</th>
              <th>Categoría</th>
              <th>Concepto / Periodo</th>
              <th>Fecha de Pago</th>
              <th>Método</th>
              <th>Valor</th>
              <th>Registrado Por</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paymentStore.payments" :key="item.id">
              <td class="font-mono font-bold text-primary">{{ item.consecutive }}</td>
              <td>
                <span :class="['badge', item.type === 'INSCRIPCION' ? 'badge-primary' : 'badge-success']">
                  {{ item.type }}
                </span>
              </td>
              <td>
                <router-link :to="`/students/${item.studentId}`" class="student-link font-semibold">
                  {{ item.studentName }}
                </router-link>
              </td>
              <td class="text-muted">{{ item.studentDocument }}</td>
              <td>
                <span class="category-pill">{{ item.categoryName }}</span>
              </td>
              <td>{{ item.period }}</td>
              <td>{{ formatDate(item.paymentDate) }}</td>
              <td>
                <span class="method-tag">{{ formatMethod(item.paymentMethod) }}</span>
              </td>
              <td class="font-bold text-dark">{{ formatCurrency(item.amount) }}</td>
              <td class="text-sm text-muted">{{ item.registeredBy || 'Administrador' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODALES DE REGISTRO DE PAGOS -->
    <RegistrationModal
      :show="showRegistrationModal"
      :students="studentsList"
      @close="showRegistrationModal = false"
      @success="handlePaymentSuccess"
    />

    <MonthlyPaymentModal
      :show="showMonthlyModal"
      :students="studentsList"
      @close="showMonthlyModal = false"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import KpiCard from '../../../components/ui/KpiCard.vue';
import { usePaymentStore } from '../../../stores/paymentStore';
import { useStudentStore } from '../../../stores/studentStore';
import { useDashboardStore } from '../../../stores/dashboardStore';
import RegistrationModal from '../components/RegistrationModal.vue';
import MonthlyPaymentModal from '../components/MonthlyPaymentModal.vue';

const paymentStore = usePaymentStore();
const studentStore = useStudentStore();
const dashboardStore = useDashboardStore();

const showRegistrationModal = ref(false);
const showMonthlyModal = ref(false);

const currentY = new Date().getFullYear();
const availableYears = [currentY - 1, currentY, currentY + 1];

const filters = reactive({
  search: '',
  type: 'ALL',
  year: ''
});

const dashboardStats = computed(() => dashboardStore.stats);
const studentsList = computed(() => studentStore.students);

let searchTimeout = null;
const debounceSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 350);
};

const applyFilters = async () => {
  const params = {};
  if (filters.search) params.search = filters.search;
  if (filters.type && filters.type !== 'ALL') params.type = filters.type;
  if (filters.year) params.year = filters.year;

  await paymentStore.fetchPayments(params);
};

const openRegistrationModal = () => {
  showRegistrationModal.value = true;
};

const openMonthlyModal = () => {
  showMonthlyModal.value = true;
};

const handlePaymentSuccess = async () => {
  await Promise.all([
    applyFilters(),
    dashboardStore.fetchStats()
  ]);
};

onMounted(async () => {
  await Promise.all([
    paymentStore.fetchPayments(),
    studentStore.fetchStudents(),
    dashboardStore.fetchStats()
  ]);
});

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '$ 0';
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
    year: 'numeric'
  }).format(d);
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
.payments-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.payments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-dark);
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--color-gray-500);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-outline-primary {
  background-color: var(--color-white);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-outline-primary:hover {
  background-color: var(--color-primary-light);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
}

.payments-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 260px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--color-gray-400);
}

.search-input {
  width: 100%;
  padding: 0.65rem 0.85rem 0.65rem 2.4rem;
  font-size: 0.9rem;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  outline: none;
  transition: var(--transition-fast);
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-gray-600);
}

.filter-select {
  padding: 0.65rem 0.85rem;
  font-size: 0.9rem;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  outline: none;
  background-color: var(--color-white);
  color: var(--color-dark);
}

.loading-state, .empty-state {
  padding: 3.5rem 1.5rem;
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

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--color-gray-100);
  color: var(--color-gray-400);
  display: flex;
  align-items: center;
  justify-content: center;
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
  padding: 0.85rem 1rem;
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
.text-dark { color: var(--color-dark); }
.text-muted { color: var(--color-gray-500); }
.text-sm { font-size: 0.8rem; }

.student-link {
  color: var(--color-dark);
  text-decoration: none;
  transition: var(--transition-fast);
}

.student-link:hover {
  color: var(--color-primary);
}

.category-pill {
  font-size: 0.76rem;
  padding: 0.2rem 0.55rem;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--border-radius-full);
  font-weight: 600;
}

.method-tag {
  font-size: 0.78rem;
  padding: 0.2rem 0.5rem;
  background-color: var(--color-gray-100);
  border-radius: var(--border-radius-md);
  font-weight: 600;
}
</style>
