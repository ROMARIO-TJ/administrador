<template>
  <div :class="['student-card card-modern', { 'card-inactive': student.status === 'INACTIVE' }]">
    <div class="card-header-banner">
      <span :class="['badge', student.status === 'ACTIVE' ? 'badge-success' : 'badge-danger']">
        {{ student.status === 'ACTIVE' ? 'Activo' : 'Inactivo' }}
      </span>
      <span class="category-tag">
        {{ student.category ? student.category.name : 'Sin cat.' }}
      </span>
    </div>

    <div class="card-body-content">
      <div class="card-avatar-wrapper">
        <img
          v-if="student.photo"
          :src="student.photo"
          :alt="student.firstName"
          class="card-avatar"
          @error="onImageError"
        />
        <div v-else class="card-avatar-fallback">
          {{ getInitials(student.firstName, student.lastName) }}
        </div>
        <span v-if="student.jerseyNumber" class="card-jersey-tag">
          #{{ student.jerseyNumber }}
        </span>
      </div>

      <div class="card-title-group">
        <h4 class="student-fullname">
          {{ student.firstName }} {{ student.lastName }}
        </h4>
        <p class="student-doc">Doc: {{ student.document }}</p>
      </div>

      <div class="card-info-grid">
        <div class="info-item">
          <span class="info-label">Edad</span>
          <span class="info-val">{{ student.age }} años</span>
        </div>
        <div class="info-item">
          <span class="info-label">Posición</span>
          <span class="info-val">{{ formatEnum(student.position) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Pie Dom.</span>
          <span class="info-val">{{ formatEnum(student.dominantFoot) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Mensualidad</span>
          <span class="info-val fee-val">
            {{ formatCurrency(student.effectiveMonthlyFee) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Barra de acciones con esquema de colores 🟢/🔵/🟡/🟢/🔴 -->
    <div class="card-actions-bar">
      <!-- 🟢 Ver -->
      <router-link :to="`/students/${student.id}`" class="card-btn btn-view" title="Ver perfil">
        Ver
      </router-link>

      <!-- 🔵 Editar -->
      <button type="button" class="card-btn btn-edit" title="Editar alumno" @click="$emit('edit', student)">
        Editar
      </button>

      <!-- 🟡 Inactivar / 🟢 Reactivar -->
      <button
        type="button"
        :class="['card-btn', student.status === 'ACTIVE' ? 'btn-deactivate' : 'btn-activate']"
        :title="student.status === 'ACTIVE' ? 'Inactivar alumno' : 'Reactivar alumno'"
        @click="$emit('toggle-status', student)"
      >
        {{ student.status === 'ACTIVE' ? 'Inactivar' : 'Reactivar' }}
      </button>

      <!-- 🔴 Eliminar -->
      <button
        type="button"
        class="card-btn btn-delete"
        title="Eliminar definitivamente"
        @click="$emit('delete-permanent', student)"
      >
        Eliminar
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  student: {
    type: Object,
    required: true
  }
});

defineEmits(['edit', 'toggle-status', 'delete-permanent']);

const getInitials = (firstName, lastName) => {
  const f = firstName ? firstName.charAt(0) : '';
  const l = lastName ? lastName.charAt(0) : '';
  return `${f}${l}`.toUpperCase() || 'AL';
};

const formatEnum = (val) => {
  if (!val) return '-';
  return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
};

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '$ 0 COP';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

const onImageError = (event) => {
  event.target.style.display = 'none';
};
</script>

<style scoped>
.student-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.25rem;
  position: relative;
}

.card-inactive {
  opacity: 0.85;
  border-style: dashed;
}

.card-header-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.category-tag {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-gray-600);
  background-color: var(--color-gray-100);
  padding: 0.2rem 0.6rem;
  border-radius: var(--border-radius-full);
}

.card-body-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.card-avatar-wrapper {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-bottom: 0.75rem;
}

.card-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-primary);
}

.card-avatar-fallback {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 700;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-primary);
}

.card-jersey-tag {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background-color: var(--color-primary);
  color: var(--color-white);
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.1rem 0.4rem;
  border-radius: var(--border-radius-full);
  box-shadow: var(--shadow-sm);
}

.card-title-group {
  margin-bottom: 1rem;
}

.student-fullname {
  font-size: 1.05rem;
  color: var(--color-dark);
  margin-bottom: 0.15rem;
}

.student-doc {
  font-size: 0.8rem;
  color: var(--color-gray-500);
  font-family: monospace;
}

.card-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
  width: 100%;
  background-color: var(--color-bg-light);
  padding: 0.75rem;
  border-radius: var(--border-radius-md);
  margin-bottom: 1.25rem;
  text-align: left;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 0.7rem;
  color: var(--color-gray-500);
  text-transform: uppercase;
}

.info-val {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-dark);
}

.fee-val {
  color: var(--color-primary);
}

.card-actions-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.35rem;
}

.card-btn {
  padding: 0.4rem 0.2rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: var(--border-radius-sm);
  text-align: center;
  cursor: pointer;
  transition: var(--transition-fast);
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 🟢 Ver */
.btn-view {
  background-color: #DCFCE7;
  color: #16A34A;
  border-color: rgba(34, 197, 94, 0.25);
  text-decoration: none;
}
.btn-view:hover {
  background-color: #22C55E;
  color: var(--color-white);
}

/* 🔵 Editar */
.btn-edit {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-color: rgba(37, 99, 235, 0.2);
}
.btn-edit:hover {
  background-color: var(--color-primary);
  color: var(--color-white);
}

/* 🟡 Inactivar */
.btn-deactivate {
  background-color: var(--color-warning-bg);
  color: #B45309;
  border-color: rgba(245, 158, 11, 0.25);
}
.btn-deactivate:hover {
  background-color: var(--color-warning);
  color: var(--color-white);
}

/* 🟢 Reactivar */
.btn-activate {
  background-color: var(--color-success-bg);
  color: var(--color-success);
  border-color: rgba(34, 197, 94, 0.2);
}
.btn-activate:hover {
  background-color: var(--color-success);
  color: var(--color-white);
}

/* 🔴 Eliminar */
.btn-delete {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
  border-color: rgba(239, 68, 68, 0.2);
}
.btn-delete:hover {
  background-color: var(--color-danger);
  color: var(--color-white);
}
</style>
