<template>
  <div class="student-profile-container" v-if="student">
    <!-- BANNER Y HEADER DEL PERFIL -->
    <div class="profile-header-card card-modern">
      <div class="header-main-info">
        <div class="avatar-container">
          <img
            v-if="student.photo"
            :src="student.photo"
            :alt="student.firstName"
            class="big-avatar"
            @error="onImageError"
          />
          <div v-else class="big-avatar-fallback">
            {{ getInitials(student.firstName, student.lastName) }}
          </div>
          <span v-if="student.jerseyNumber" class="big-jersey-badge" title="Número de Camiseta">
            #{{ student.jerseyNumber }}
          </span>
        </div>

        <div class="title-details">
          <div class="name-status-row">
            <h1 class="profile-name">{{ student.firstName }} {{ student.lastName }}</h1>
            <span :class="['badge', student.status === 'ACTIVE' ? 'badge-success' : 'badge-danger']">
              {{ student.status === 'ACTIVE' ? 'Activo' : 'Inactivo' }}
            </span>
          </div>

          <p class="doc-text">Documento: <strong>{{ student.document }}</strong></p>

          <div class="pills-row">
            <span class="profile-pill">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              {{ student.age }} Años
            </span>
            <span class="profile-pill highlight-pill">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20"></path></svg>
              Categoría: {{ student.category ? student.category.name : 'Sin asignación' }}
            </span>
            <span class="profile-pill">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Ingreso: {{ formatDate(student.entryDate) }}
            </span>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <button type="button" class="btn btn-secondary" @click="$emit('edit', student)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Editar Perfil
        </button>
        <button
          type="button"
          :class="['btn', student.status === 'ACTIVE' ? 'btn-danger-outline' : 'btn-success-outline']"
          @click="$emit('toggle-status', student)"
        >
          {{ student.status === 'ACTIVE' ? 'Inactivar Alumno' : 'Activar Alumno' }}
        </button>
      </div>
    </div>

    <!-- BARRA NAVEGACIÓN DE PESTAÑAS -->
    <div class="profile-tabs-bar">
      <button
        type="button"
        :class="['tab-btn', activeTab === 'general' ? 'active' : '']"
        @click="activeTab = 'general'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        Perfil General
      </button>

      <button
        type="button"
        :class="['tab-btn', activeTab === 'financial' ? 'active' : '']"
        @click="activeTab = 'financial'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
        Estado Financiero
      </button>
    </div>

    <!-- PESTAÑA 1: PERFIL GENERAL -->
    <div v-if="activeTab === 'general'" class="profile-grid">
      <!-- 1. INFORMACIÓN DEPORTIVA -->
      <div class="info-card card-modern">
        <div class="card-section-title">
          <div class="icon-box sports">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20"></path></svg>
          </div>
          <h3>Información Deportiva</h3>
        </div>
        <div class="details-list">
          <div class="detail-item">
            <span class="detail-label">Categoría</span>
            <span class="detail-value">{{ student.category ? student.category.name : 'N/A' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Posición</span>
            <span class="detail-value">{{ formatEnum(student.position) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Pie Dominante</span>
            <span class="detail-value">{{ formatEnum(student.dominantFoot) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Dorsal / Camiseta</span>
            <span class="detail-value">{{ student.jerseyNumber ? `#${student.jerseyNumber}` : 'Sin asignar' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Fecha de Ingreso</span>
            <span class="detail-value">{{ formatDate(student.entryDate) }}</span>
          </div>
        </div>
      </div>

      <!-- 2. INFORMACIÓN DEL ACUDIENTE -->
      <div class="info-card card-modern">
        <div class="card-section-title">
          <div class="icon-box guardian">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <h3>Información del Acudiente</h3>
        </div>
        <div class="details-list">
          <div class="detail-item">
            <span class="detail-label">Nombre del Acudiente</span>
            <span class="detail-value">{{ student.guardianName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Parentesco</span>
            <span class="detail-value">{{ student.guardianRelationship }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Teléfono</span>
            <span class="detail-value tel-link">{{ student.guardianPhone }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Dirección</span>
            <span class="detail-value">{{ student.guardianAddress }}</span>
          </div>
        </div>
      </div>

      <!-- 3. INFORMACIÓN MÉDICA & OBSERVACIONES -->
      <div class="info-card card-modern">
        <div class="card-section-title">
          <div class="icon-box medical">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
          </div>
          <h3>Información Médica & Observaciones</h3>
        </div>
        <div class="details-list">
          <div class="detail-item">
            <span class="detail-label">EPS</span>
            <span class="detail-value">{{ student.eps }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Alergias / Condiciones</span>
            <span class="detail-value">{{ student.allergies || 'Ninguna reportada' }}</span>
          </div>
          <div class="detail-item full">
            <span class="detail-label">Observaciones Médicas</span>
            <p class="detail-text-block">{{ student.medicalNotes || 'Sin observaciones registradas.' }}</p>
          </div>
          <div class="detail-item full" v-if="student.generalNotes">
            <span class="detail-label">Observaciones Generales</span>
            <p class="detail-text-block">{{ student.generalNotes }}</p>
          </div>
        </div>
      </div>

      <!-- 4. INFORMACIÓN ECONÓMICA -->
      <div class="info-card card-modern">
        <div class="card-section-title">
          <div class="icon-box economic">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <h3>Información Económica</h3>
        </div>
        <div class="details-list">
          <div class="detail-item">
            <span class="detail-label">Valor Mensualidad</span>
            <span class="detail-value fee-highlight">
              {{ formatCurrency(student.effectiveMonthlyFee) }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Tipo de Tarifa</span>
            <span v-if="student.isCustomFee" class="badge badge-warning">
              Tarifa Personalizada
            </span>
            <span v-else class="badge badge-secondary">
              Tarifa General ({{ formatCurrency(student.defaultMonthlyFee) }})
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- PESTAÑA 2: ESTADO FINANCIERO -->
    <div v-else-if="activeTab === 'financial'">
      <StudentFinancialStatus :student="student" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import StudentFinancialStatus from './StudentFinancialStatus.vue';

defineProps({
  student: {
    type: Object,
    default: null
  }
});

defineEmits(['edit', 'toggle-status']);

const activeTab = ref('general');


const getInitials = (firstName, lastName) => {
  const f = firstName ? firstName.charAt(0) : '';
  const l = lastName ? lastName.charAt(0) : '';
  return `${f}${l}`.toUpperCase() || 'AL';
};

const formatEnum = (val) => {
  if (!val) return 'No especificado';
  return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(d);
};

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '$ 0 COP';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

const onImageError = (e) => {
  e.target.style.display = 'none';
};
</script>

<style scoped>
.student-profile-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Tabs Bar */
.profile-tabs-bar {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid var(--color-gray-200);
  padding-bottom: 0.25rem;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-gray-500);
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: var(--transition-fast);
  margin-bottom: -0.25rem;
}

.tab-btn:hover {
  color: var(--color-primary);
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

/* Header Card */
.profile-header-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 2rem;
  flex-wrap: wrap;
}

.header-main-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.avatar-container {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
}

.big-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-primary);
  box-shadow: var(--shadow-md);
}

.big-avatar-fallback {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 2.2rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--color-primary);
}

.big-jersey-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: var(--color-primary);
  color: var(--color-white);
  font-size: 0.85rem;
  font-weight: 800;
  padding: 0.2rem 0.5rem;
  border-radius: var(--border-radius-full);
  box-shadow: var(--shadow-md);
}

.title-details {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.name-status-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.profile-name {
  font-size: 1.6rem;
  color: var(--color-dark);
}

.doc-text {
  font-size: 0.9rem;
  color: var(--color-gray-600);
}

.pills-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.35rem;
  flex-wrap: wrap;
}

.profile-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
  border-radius: var(--border-radius-full);
  font-size: 0.8rem;
  font-weight: 600;
}

.highlight-pill {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* Rejilla de Información */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
  .profile-header-card {
    flex-direction: column;
    align-items: flex-start;
  }
}

.info-card {
  padding: 1.5rem;
}

.card-section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-gray-200);
}

.icon-box {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-box.sports { background-color: #f0fdf4; color: var(--color-success); }
.icon-box.guardian { background-color: #fef3c7; color: #d97706; }
.icon-box.medical { background-color: #fef2f2; color: var(--color-danger); }
.icon-box.economic { background-color: #eff6ff; color: var(--color-primary); }
.icon-box.history { background-color: var(--color-gray-100); color: var(--color-gray-700); }

.card-section-title h3 {
  font-size: 1.05rem;
  color: var(--color-dark);
}

.details-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.detail-item.full {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-gray-500);
  text-transform: uppercase;
}

.detail-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-dark);
}

.fee-highlight {
  font-size: 1.1rem;
  color: var(--color-primary);
  font-weight: 700;
}

.badge-secondary {
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
}

.detail-text-block {
  font-size: 0.9rem;
  color: var(--color-gray-700);
  background-color: var(--color-bg-light);
  padding: 0.65rem 0.85rem;
  border-radius: var(--border-radius-md);
  margin-top: 0.2rem;
}

/* Historial de Pagos Placeholder */
.history-placeholder-card {
  padding: 1.5rem;
}

.subtext {
  font-size: 0.8rem;
  color: var(--color-gray-500);
}

.prepared-tag {
  margin-left: auto;
}

.empty-history-box {
  padding: 2.5rem 1.5rem;
  text-align: center;
  background-color: var(--color-bg-light);
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--border-radius-md);
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-history-icon {
  color: var(--color-gray-400);
}

.empty-history-box h4 {
  font-size: 1rem;
  color: var(--color-dark);
}

.empty-history-box p {
  font-size: 0.85rem;
  color: var(--color-gray-500);
  max-width: 400px;
}

.btn {
  padding: 0.6rem 1.1rem;
  font-size: 0.88rem;
  font-weight: 600;
  border-radius: var(--border-radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: var(--transition-fast);
}

.btn-secondary {
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
  border-color: var(--color-gray-200);
}

.btn-secondary:hover {
  background-color: var(--color-gray-200);
}

.btn-danger-outline {
  background-color: transparent;
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.btn-danger-outline:hover {
  background-color: var(--color-danger-bg);
}

.btn-success-outline {
  background-color: transparent;
  color: var(--color-success);
  border-color: var(--color-success);
}

.btn-success-outline:hover {
  background-color: var(--color-success-bg);
}
</style>
