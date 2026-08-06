<template>
  <div class="dashboard-container">
    <!-- CABECERA -->
    <div class="dashboard-header">
      <div>
        <h2 class="page-title">Dashboard Principal</h2>
        <p class="page-subtitle">Resumen operacional en tiempo real — Unión Jaguera FC</p>
      </div>
      <div class="header-right">
        <span class="badge badge-success">Sistema Activo</span>
        <span class="last-updated">Actualizado: {{ lastUpdated }}</span>
      </div>
    </div>

    <!-- Spinner de carga inicial -->
    <div v-if="dashboardStore.loading && !initialized" class="loading-dashboard">
      <div class="spinner"></div>
      <p>Cargando indicadores...</p>
    </div>

    <template v-else>
      <!-- KPIs ALUMNOS -->
      <div class="kpi-section-label">Indicadores de Alumnos</div>
      <div class="kpi-grid">
        <KpiCard
          title="Total Registrados"
          :value="dashboardStore.stats.totalStudents"
          subtitle="Alumnos en el sistema"
          iconBgColor="#EFF6FF"
          iconColor="#2563EB"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </template>
        </KpiCard>

        <KpiCard
          title="Alumnos Activos"
          :value="dashboardStore.stats.activeStudents"
          subtitle="Participando actualmente"
          iconBgColor="#DCFCE7"
          iconColor="#22C55E"
          isPositive
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </template>
        </KpiCard>

        <KpiCard
          title="Alumnos Inactivos"
          :value="dashboardStore.stats.inactiveStudents"
          subtitle="Suspendidos o dados de baja"
          iconBgColor="#FEE2E2"
          iconColor="#EF4444"
          :isNegative="dashboardStore.stats.inactiveStudents > 0"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
          </template>
        </KpiCard>

        <KpiCard
          title="Total Categorías"
          :value="dashboardStore.stats.totalCategories"
          subtitle="Grupos deportivos activos"
          iconBgColor="#F3E8FF"
          iconColor="#9333EA"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20"></path>
            </svg>
          </template>
        </KpiCard>
      </div>

      <!-- KPIs FINANCIEROS (Sprint 3) -->
      <div class="kpi-section-label">
        Indicadores Financieros
        <span class="sprint-badge">Disponible en Sprint 3</span>
      </div>
      <div class="kpi-grid kpi-financial">
        <KpiCard
          title="Pagos del Mes"
          :value="dashboardStore.stats.monthlyPayments"
          subtitle="Mensualidades recibidas"
          iconBgColor="#ECFDF5"
          iconColor="#059669"
          disabled
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          </template>
        </KpiCard>

        <KpiCard
          title="Pendientes"
          :value="dashboardStore.stats.pendingMonthlyFees"
          subtitle="Mensualidades por cobrar"
          iconBgColor="#FEE2E2"
          iconColor="#EF4444"
          disabled
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </template>
        </KpiCard>

        <KpiCard
          title="Ingresos del Mes"
          :value="formatCurrency(dashboardStore.stats.monthlyIncome)"
          subtitle="Recaudo total mensual"
          iconBgColor="#FEF3C7"
          iconColor="#F59E0B"
          disabled
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </template>
        </KpiCard>
      </div>

      <!-- ACCIONES RÁPIDAS Y ESTADO DEL SISTEMA -->
      <div class="dashboard-content-grid">
        <div class="welcome-card card-modern">
          <h3 class="welcome-title">Acciones Rápidas</h3>
          <p class="welcome-desc">
            Gestione los módulos del sistema de la academia <strong>Unión Jaguera FC</strong> en La Jagua de Ibirico.
          </p>
          <div class="quick-actions-grid">
            <router-link to="/students" class="quick-action-btn students">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              Gestionar Alumnos
            </router-link>
            <router-link to="/settings" class="quick-action-btn settings">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              Configuración
            </router-link>
          </div>
        </div>

        <div class="system-status-card card-modern">
          <h3 class="welcome-title">Estado del Sistema</h3>
          <ul class="system-status-list">
            <li>
              <span class="status-dot green"></span>
              <span>PostgreSQL: <strong>Conectado</strong></span>
            </li>
            <li>
              <span class="status-dot green"></span>
              <span>API Backend: <strong>Activa</strong></span>
            </li>
            <li>
              <span class="status-dot green"></span>
              <span>Autenticación JWT: <strong>OK</strong></span>
            </li>
            <li>
              <span class="status-dot green"></span>
              <span>Vue 3 + Pinia: <strong>OK</strong></span>
            </li>
            <li>
              <span class="status-dot yellow"></span>
              <span>Módulo Pagos: <strong>Sprint 3</strong></span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import KpiCard from '../../../components/ui/KpiCard.vue';
import { useDashboardStore } from '../../../stores/dashboardStore';

const dashboardStore = useDashboardStore();
const initialized = ref(false);
const lastUpdated = ref('--');

const formatCurrency = (amount) => {
  if (!amount) return '$ 0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

const updateLastUpdated = () => {
  const now = new Date();
  lastUpdated.value = now.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

onMounted(async () => {
  await dashboardStore.fetchStats();
  initialized.value = true;
  updateLastUpdated();
});
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
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

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.last-updated {
  font-size: 0.78rem;
  color: var(--color-gray-400);
}

.kpi-section-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-gray-500);
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.sprint-badge {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
  border-radius: var(--border-radius-full);
  font-weight: 600;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.kpi-financial {
  opacity: 0.65;
}

.loading-dashboard {
  text-align: center;
  padding: 3rem 1.5rem;
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

.dashboard-content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .dashboard-content-grid {
    grid-template-columns: 1fr;
  }
}

.welcome-card, .system-status-card {
  padding: 1.5rem;
}

.welcome-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--color-dark);
}

.welcome-desc {
  font-size: 0.92rem;
  color: var(--color-gray-600);
  line-height: 1.6;
  margin-bottom: 1.25rem;
}

.quick-actions-grid {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.quick-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.1rem;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  font-size: 0.88rem;
  transition: var(--transition-fast);
}

.quick-action-btn.students {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.quick-action-btn.students:hover {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.quick-action-btn.settings {
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-200);
}

.quick-action-btn.settings:hover {
  background-color: var(--color-gray-200);
}

.system-status-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin-top: 0.5rem;
}

.system-status-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--color-gray-700);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.green {
  background-color: var(--color-success);
  box-shadow: 0 0 0 3px var(--color-success-bg);
}

.status-dot.yellow {
  background-color: var(--color-warning);
  box-shadow: 0 0 0 3px var(--color-warning-bg);
}
</style>
