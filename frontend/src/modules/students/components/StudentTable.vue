<template>
  <div class="card-modern table-responsive">
    <table class="students-table" v-if="students && students.length > 0">
      <thead>
        <tr>
          <th>Foto</th>
          <th>Nombre Completo</th>
          <th>Documento</th>
          <th>Categoría</th>
          <th>Estado</th>
          <th>Mensualidad</th>
          <th class="text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student.id" :class="{ 'row-inactive': student.status === 'INACTIVE' }">
          <!-- Foto -->
          <td>
            <div class="student-avatar-wrapper">
              <img
                v-if="student.photo"
                :src="student.photo"
                :alt="student.firstName"
                class="student-avatar"
                @error="onImageError"
              />
              <div v-else class="student-avatar-fallback">
                {{ getInitials(student.firstName, student.lastName) }}
              </div>
            </div>
          </td>

          <!-- Nombre Completo & Dorsal -->
          <td>
            <div class="student-name-group">
              <router-link :to="`/students/${student.id}`" class="student-name">
                {{ student.firstName }} {{ student.lastName }}
              </router-link>
              <div class="student-subtext">
                <span v-if="student.jerseyNumber" class="jersey-badge" title="Número de Camiseta">
                  #{{ student.jerseyNumber }}
                </span>
                <span>{{ student.age }} años</span>
              </div>
            </div>
          </td>

          <!-- Documento -->
          <td>
            <span class="document-text">{{ student.document }}</span>
          </td>

          <!-- Categoría -->
          <td>
            <span class="category-pill">
              {{ student.category ? student.category.name : 'Sin categoría' }}
            </span>
          </td>

          <!-- Estado -->
          <td>
            <span :class="['badge', student.status === 'ACTIVE' ? 'badge-success' : 'badge-danger']">
              {{ student.status === 'ACTIVE' ? 'Activo' : 'Inactivo' }}
            </span>
          </td>

          <!-- Mensualidad -->
          <td>
            <div class="fee-group">
              <span class="fee-amount">
                {{ formatCurrency(student.effectiveMonthlyFee) }}
              </span>
              <span v-if="student.isCustomFee" class="badge badge-warning custom-fee-tag" title="Tarifa personalizada">
                Personalizada
              </span>
              <span v-else class="fee-default-tag" title="Tarifa general de academia">
                General
              </span>
            </div>
          </td>

          <!-- Acciones -->
          <td class="actions-cell">
            <div class="actions-group">
              <!-- 🟢 Ver -->
              <router-link
                :to="`/students/${student.id}`"
                class="action-btn view-btn"
                title="Ver perfil completo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span class="btn-text">Ver</span>
              </router-link>

              <!-- 🔵 Editar -->
              <button
                type="button"
                class="action-btn edit-btn"
                title="Editar alumno"
                @click="$emit('edit', student)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <span class="btn-text">Editar</span>
              </button>

              <!-- 🟡 Inactivar / 🟢 Reactivar -->
              <button
                type="button"
                :class="['action-btn', student.status === 'ACTIVE' ? 'status-deactivate-btn' : 'status-activate-btn']"
                :title="student.status === 'ACTIVE' ? 'Inactivar alumno' : 'Reactivar alumno'"
                @click="$emit('toggle-status', student)"
              >
                <svg v-if="student.status === 'ACTIVE'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span class="btn-text">
                  {{ student.status === 'ACTIVE' ? 'Inactivar' : 'Reactivar' }}
                </span>
              </button>

              <!-- 🔴 Eliminar definitivamente -->
              <button
                type="button"
                class="action-btn delete-permanent-btn"
                title="Eliminar definitivamente del sistema"
                @click="$emit('delete-permanent', student)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                  <path d="M10 11v6"></path>
                  <path d="M14 11v6"></path>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                </svg>
                <span class="btn-text">Eliminar</span>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h3>No existen alumnos registrados.</h3>
      <p>No hay alumnos registrados que coincidan con la búsqueda o los filtros aplicados.</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  students: {
    type: Array,
    default: () => []
  }
});

defineEmits(['edit', 'toggle-status', 'delete-permanent']);

const getInitials = (firstName, lastName) => {
  const f = firstName ? firstName.charAt(0) : '';
  const l = lastName ? lastName.charAt(0) : '';
  return `${f}${l}`.toUpperCase() || 'AL';
};

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '$ 0 COP';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const onImageError = (event) => {
  event.target.style.display = 'none';
};
</script>

<style scoped>
.table-container {
  padding: 0;
  overflow-x: auto;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.students-table th {
  background-color: var(--color-gray-100);
  color: var(--color-gray-600);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding: 0.9rem 1.2rem;
  border-bottom: 1px solid var(--color-gray-200);
}

.students-table td {
  padding: 0.9rem 1.2rem;
  border-bottom: 1px solid var(--color-gray-200);
  vertical-align: middle;
}

.students-table tbody tr {
  transition: var(--transition-fast);
}

.students-table tbody tr:hover {
  background-color: var(--color-primary-light);
}

.row-inactive {
  opacity: 0.75;
  background-color: #fcfcfc;
}

/* Avatar */
.student-avatar-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--color-gray-200);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-gray-300);
}

.student-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.student-avatar-fallback {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Nombre & Subtext */
.student-name-group {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.student-name {
  font-weight: 600;
  color: var(--color-dark);
  font-size: 0.95rem;
}

.student-name:hover {
  color: var(--color-primary);
}

.student-subtext {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: var(--color-gray-500);
}

.jersey-badge {
  background-color: var(--color-primary);
  color: var(--color-white);
  padding: 0.05rem 0.35rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.7rem;
  font-weight: 700;
}

/* Documento */
.document-text {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--color-gray-700);
  background-color: var(--color-gray-100);
  padding: 0.2rem 0.5rem;
  border-radius: var(--border-radius-sm);
}

/* Categoría */
.category-pill {
  display: inline-block;
  background-color: var(--color-gray-100);
  color: var(--color-gray-800);
  padding: 0.2rem 0.65rem;
  border-radius: var(--border-radius-full);
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid var(--color-gray-200);
}

/* Mensualidad */
.fee-group {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.fee-amount {
  font-weight: 600;
  color: var(--color-dark);
}

.custom-fee-tag {
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem;
  width: fit-content;
}

.fee-default-tag {
  font-size: 0.68rem;
  color: var(--color-gray-500);
}

/* Acciones */
.actions-cell {
  text-align: right;
}

.actions-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.4rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.65rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: var(--border-radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  transition: var(--transition-fast);
}

.view-btn {
  background-color: #DCFCE7;
  color: #16A34A;
  border-color: rgba(34, 197, 94, 0.25);
}

.view-btn:hover {
  background-color: #22C55E;
  color: var(--color-white);
}

.edit-btn {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border-color: rgba(37, 99, 235, 0.2);
}

.edit-btn:hover {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.status-deactivate-btn {
  background-color: var(--color-warning-bg);
  color: #B45309;
  border-color: rgba(245, 158, 11, 0.25);
}

.status-deactivate-btn:hover {
  background-color: var(--color-warning);
  color: var(--color-white);
}

.status-activate-btn {
  background-color: var(--color-success-bg);
  color: var(--color-success);
  border-color: rgba(34, 197, 94, 0.2);
}

.status-activate-btn:hover {
  background-color: var(--color-success);
  color: var(--color-white);
}

.delete-permanent-btn {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
  border-color: rgba(239, 68, 68, 0.2);
}

.delete-permanent-btn:hover {
  background-color: var(--color-danger);
  color: var(--color-white);
}

.empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-gray-500);
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--color-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-400);
}

@media (max-width: 768px) {
  .btn-text {
    display: none;
  }
  .action-btn {
    padding: 0.4rem;
  }
}
</style>
