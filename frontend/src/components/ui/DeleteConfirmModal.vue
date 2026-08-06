<template>
  <Teleport to="body">
    <div v-if="show" class="modal-backdrop" @click.self="onCancel">
      <div class="delete-modal-card card-modern">
        <!-- Cabecera -->
        <div class="delete-modal-header">
          <div class="danger-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
              <path d="M10 11v6"></path>
              <path d="M14 11v6"></path>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
            </svg>
          </div>
          <div class="delete-modal-titles">
            <h3>Eliminar Definitivamente</h3>
            <p>Esta acción es <strong>irreversible</strong> y no puede deshacerse</p>
          </div>
          <button type="button" class="close-btn" @click="onCancel">&times;</button>
        </div>

        <!-- Descripción -->
        <div class="delete-modal-body">
          <div class="student-info-box">
            <p class="student-delete-name">{{ studentName }}</p>
            <p class="student-delete-doc">{{ studentDoc }}</p>
          </div>

          <div class="warning-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <p>
              Este registro será <strong>eliminado permanentemente de la base de datos</strong>.
              Solo proceda si se trata de un registro creado por error o un duplicado.
              Si desea conservar el historial, utilice la opción <strong>Inactivar</strong>.
            </p>
          </div>

          <!-- Segunda confirmación escribiendo ELIMINAR -->
          <div class="confirm-text-group">
            <label class="confirm-label">
              Para confirmar, escriba la palabra <strong class="keyword">ELIMINAR</strong> en el campo de abajo:
            </label>
            <input
              v-model="confirmText"
              type="text"
              class="confirm-input"
              :class="{ 'valid': isConfirmed }"
              placeholder="Escriba: ELIMINAR"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="none"
              spellcheck="false"
            />
            <span v-if="confirmText && !isConfirmed" class="confirm-hint">
              Debe escribir exactamente: ELIMINAR
            </span>
            <span v-if="isConfirmed" class="confirm-success">
              ✓ Confirmación válida. Puede proceder.
            </span>
          </div>
        </div>

        <!-- Acciones -->
        <div class="delete-modal-footer">
          <button type="button" class="btn btn-cancel" @click="onCancel">
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn-delete-permanent"
            :disabled="!isConfirmed || loading"
            @click="onConfirm"
          >
            <span v-if="loading" class="spinner-sm"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
            </svg>
            Eliminar Definitivamente
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  studentName: {
    type: String,
    default: 'Alumno'
  },
  studentDoc: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const confirmText = ref('');
const isConfirmed = computed(() => confirmText.value === 'ELIMINAR');

// Limpiar texto al cerrar el modal
watch(() => props.show, (val) => {
  if (!val) confirmText.value = '';
});

const onConfirm = () => {
  if (!isConfirmed.value) return;
  emit('confirm');
};

const onCancel = () => {
  confirmText.value = '';
  emit('cancel');
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
  z-index: 99999;
  padding: 1.5rem;
}

.delete-modal-card {
  width: 100%;
  max-width: 480px;
  background: var(--color-white);
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--color-danger);
  box-shadow: 0 20px 60px rgba(239, 68, 68, 0.25);
  overflow: hidden;
}

.delete-modal-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #FEF2F2, #FFF5F5);
  border-bottom: 1px solid rgba(239, 68, 68, 0.2);
}

.danger-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.delete-modal-titles {
  flex: 1;
}

.delete-modal-titles h3 {
  font-size: 1.1rem;
  color: var(--color-danger);
}

.delete-modal-titles p {
  font-size: 0.8rem;
  color: var(--color-gray-600);
  margin-top: 0.1rem;
}

.close-btn {
  font-size: 1.5rem;
  color: var(--color-gray-400);
  background: none;
  border: none;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover { color: var(--color-dark); }

.delete-modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.student-info-box {
  background-color: var(--color-gray-100);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  padding: 0.85rem 1rem;
  text-align: center;
}

.student-delete-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-dark);
}

.student-delete-doc {
  font-size: 0.82rem;
  color: var(--color-gray-500);
  font-family: monospace;
  margin-top: 0.2rem;
}

.warning-box {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.9rem 1rem;
  background-color: var(--color-warning-bg);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: var(--border-radius-md);
  color: #92400e;
  font-size: 0.85rem;
  line-height: 1.5;
}

.warning-box svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.confirm-text-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.confirm-label {
  font-size: 0.88rem;
  color: var(--color-gray-700);
  line-height: 1.5;
}

.keyword {
  color: var(--color-danger);
  font-size: 0.95rem;
}

.confirm-input {
  padding: 0.65rem 0.9rem;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: monospace;
  border: 2px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  outline: none;
  transition: var(--transition-fast);
  text-transform: none;
}

.confirm-input:focus {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.confirm-input.valid {
  border-color: var(--color-success);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
}

.confirm-hint {
  font-size: 0.78rem;
  color: var(--color-danger);
}

.confirm-success {
  font-size: 0.78rem;
  color: var(--color-success);
  font-weight: 600;
}

.delete-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.1rem 1.5rem;
  background-color: var(--color-gray-100);
  border-top: 1px solid var(--color-gray-200);
}

.btn {
  padding: 0.6rem 1.1rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: var(--transition-fast);
}

.btn-cancel {
  background-color: var(--color-gray-200);
  color: var(--color-gray-700);
}

.btn-cancel:hover {
  background-color: var(--color-gray-300);
}

.btn-delete-permanent {
  background-color: var(--color-danger);
  color: var(--color-white);
}

.btn-delete-permanent:hover:not(:disabled) {
  filter: brightness(0.9);
}

.btn-delete-permanent:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
