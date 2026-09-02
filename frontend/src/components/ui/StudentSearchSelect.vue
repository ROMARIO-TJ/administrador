<template>
  <div class="student-search-select" ref="containerRef">
    <!-- VISTA: ALUMNO SELECCIONADO -->
    <div v-if="selectedStudent" class="selected-student-badge">
      <div class="student-avatar-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>

      <div class="selected-info">
        <span class="selected-name">{{ selectedStudent.firstName }} {{ selectedStudent.lastName }}</span>
        <div class="selected-meta">
          <span class="meta-item">Doc: {{ selectedStudent.document || 'S/N' }}</span>
          <span class="meta-divider">•</span>
          <span class="meta-tag">{{ selectedStudent.category ? selectedStudent.category.name : 'Sin categoría' }}</span>
        </div>
      </div>

      <button type="button" class="change-btn" @click="clearSelection" title="Cambiar alumno">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span>Cambiar</span>
      </button>
    </div>

    <!-- VISTA: CAMPO DE BÚSQUEDA -->
    <div v-else class="search-input-box">
      <div class="input-wrapper">
        <div class="search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        <input
          type="text"
          v-model="searchQuery"
          :placeholder="placeholder"
          class="search-field"
          @focus="openDropdown"
          @input="openDropdown"
          @keydown.esc="closeDropdown"
          :required="required && !modelValue"
        />

        <button
          v-if="searchQuery"
          type="button"
          class="clear-text-btn"
          @click="searchQuery = ''; focusInput()"
          title="Limpiar texto"
        >
          &times;
        </button>
      </div>

      <!-- DESPLEGABLE CON RESULTADOS -->
      <transition name="fade-slide">
        <div v-if="isOpen" class="dropdown-panel">
          <div class="dropdown-header" v-if="filteredStudents.length > 0">
            <span>{{ filteredStudents.length }} alumno(s) encontrado(s)</span>
          </div>

          <ul v-if="filteredStudents.length > 0" class="student-list">
            <li
              v-for="st in filteredStudents"
              :key="st.id"
              class="student-item"
              @click="selectStudent(st)"
            >
              <div class="item-avatar">
                {{ getInitials(st) }}
              </div>
              <div class="item-details">
                <div class="item-name">
                  {{ st.firstName }} {{ st.lastName }}
                </div>
                <div class="item-sub">
                  <span class="doc-badge">Doc: {{ st.document || 'Sin doc.' }}</span>
                  <span class="cat-badge" v-if="st.category">{{ st.category.name }}</span>
                </div>
              </div>
            </li>
          </ul>

          <div v-else class="empty-results">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <p>No se encontraron alumnos que coincidan con <strong>"{{ searchQuery }}"</strong></p>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  students: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Buscar por nombre, documento o categoría...'
  },
  required: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const containerRef = ref(null);
const searchQuery = ref('');
const isOpen = ref(false);

const selectedStudent = computed(() => {
  if (!props.modelValue) return null;
  return props.students.find(s => String(s.id) === String(props.modelValue)) || null;
});

const filteredStudents = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.students;
  }
  const q = searchQuery.value.toLowerCase().trim();
  return props.students.filter(st => {
    const fullName = `${st.firstName || ''} ${st.lastName || ''}`.toLowerCase();
    const doc = String(st.document || '').toLowerCase();
    const catName = String(st.category?.name || '').toLowerCase();
    return fullName.includes(q) || doc.includes(q) || catName.includes(q);
  });
});

const openDropdown = () => {
  isOpen.value = true;
};

const closeDropdown = () => {
  isOpen.value = false;
};

const focusInput = () => {
  const inputEl = containerRef.value?.querySelector('.search-field');
  if (inputEl) inputEl.focus();
};

const selectStudent = (student) => {
  emit('update:modelValue', student.id);
  emit('change', student);
  searchQuery.value = '';
  closeDropdown();
};

const clearSelection = () => {
  emit('update:modelValue', '');
  emit('change', null);
  searchQuery.value = '';
  setTimeout(() => focusInput(), 50);
};

const getInitials = (st) => {
  const f = st.firstName ? st.firstName.charAt(0).toUpperCase() : '';
  const l = st.lastName ? st.lastName.charAt(0).toUpperCase() : '';
  return `${f}${l}` || 'AL';
};

const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.student-search-select {
  position: relative;
  width: 100%;
}

/* Badge Alumno Seleccionado */
.selected-student-badge {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.65rem 0.9rem;
  background-color: var(--color-gray-100, #f1f5f9);
  border: 1.5px solid var(--color-primary-light, #bfdbfe);
  border-radius: var(--border-radius-md, 8px);
}

.student-avatar-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--color-primary, #2563eb);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.selected-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
  min-width: 0;
}

.selected-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-dark, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: var(--color-gray-500, #64748b);
}

.meta-divider {
  color: var(--color-gray-300, #cbd5e1);
}

.meta-tag {
  background-color: #dbeafe;
  color: #1d4ed8;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.72rem;
}

.change-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-gray-600, #475569);
  background-color: white;
  border: 1px solid var(--color-gray-300, #cbd5e1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.change-btn:hover {
  background-color: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

/* Campo Búsqueda */
.search-input-box {
  position: relative;
  width: 100%;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--color-gray-400, #94a3b8);
  display: flex;
  align-items: center;
  pointer-events: none;
}

.search-field {
  width: 100%;
  padding: 0.65rem 2.2rem 0.65rem 2.5rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: var(--color-dark, #0f172a);
  background-color: white;
  border: 1px solid var(--color-gray-300, #cbd5e1);
  border-radius: var(--border-radius-md, 8px);
  outline: none;
  transition: all 0.15s ease;
}

.search-field:focus {
  border-color: var(--color-primary, #2563eb);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.clear-text-btn {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--color-gray-400, #94a3b8);
  cursor: pointer;
  line-height: 1;
}

.clear-text-btn:hover {
  color: var(--color-dark, #0f172a);
}

/* Panel Desplegable */
.dropdown-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  width: 100%;
  max-height: 250px;
  background-color: white;
  border: 1px solid var(--color-gray-200, #e2e8f0);
  border-radius: var(--border-radius-md, 8px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dropdown-header {
  padding: 0.45rem 0.85rem;
  background-color: var(--color-gray-100, #f8fafc);
  border-bottom: 1px solid var(--color-gray-200, #e2e8f0);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-gray-500, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.student-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
}

.student-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  cursor: pointer;
  border-bottom: 1px solid var(--color-gray-100, #f1f5f9);
  transition: background-color 0.15s ease;
}

.student-item:last-child {
  border-bottom: none;
}

.student-item:hover {
  background-color: #eff6ff;
}

.item-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #dbeafe;
  color: #1e40af;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-dark, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-sub {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.76rem;
}

.doc-badge {
  color: var(--color-gray-500, #64748b);
}

.cat-badge {
  background-color: #f1f5f9;
  color: #334155;
  padding: 0.05rem 0.35rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.7rem;
}

.empty-results {
  padding: 1.5rem 1rem;
  text-align: center;
  color: var(--color-gray-500, #64748b);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-results p {
  font-size: 0.85rem;
  margin: 0;
}

/* Transición */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.15s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
