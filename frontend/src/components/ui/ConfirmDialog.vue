<template>
  <Teleport to="body">
    <div v-if="show" class="modal-backdrop" @click.self="onCancel">
      <div class="modal-card card-modern">
        <div class="modal-header">
          <div class="modal-title-group">
            <div :class="['modal-icon', type]">
              <svg v-if="type === 'danger'" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <svg v-else-if="type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <h3>{{ title }}</h3>
          </div>
          <button type="button" class="close-btn" @click="onCancel">&times;</button>
        </div>

        <div class="modal-body">
          <p>{{ message }}</p>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="onCancel">
            {{ cancelText }}
          </button>
          <button type="button" :class="['btn', confirmButtonClass]" @click="onConfirm">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirmar acción'
  },
  message: {
    type: String,
    default: '¿Está seguro de realizar esta acción?'
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  type: {
    type: String,
    default: 'warning' // 'info', 'warning', 'danger'
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const confirmButtonClass = computed(() => {
  if (props.type === 'danger') return 'btn-danger';
  if (props.type === 'warning') return 'btn-warning';
  return 'btn-primary';
});

const onConfirm = () => emit('confirm');
const onCancel = () => emit('cancel');
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-card {
  width: 100%;
  max-width: 440px;
  background: var(--color-white);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-icon.danger {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
}

.modal-icon.warning {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
}

.modal-icon.info {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.close-btn {
  font-size: 1.5rem;
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
  font-size: 0.95rem;
  color: var(--color-gray-600);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn {
  padding: 0.55rem 1.1rem;
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
}

.btn-secondary:hover {
  background-color: var(--color-gray-200);
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn-warning {
  background-color: var(--color-warning);
  color: var(--color-white);
}

.btn-warning:hover {
  filter: brightness(0.9);
}

.btn-danger {
  background-color: var(--color-danger);
  color: var(--color-white);
}

.btn-danger:hover {
  filter: brightness(0.9);
}
</style>
