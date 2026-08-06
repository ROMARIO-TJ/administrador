<template>
  <div class="student-filters-card card-modern">
    <div class="filters-grid">
      <!-- Buscador en tiempo real -->
      <div class="filter-group search-group">
        <label class="filter-label">Buscar Alumno</label>
        <SearchInput
          v-model="searchQuery"
          placeholder="Nombre, apellido o documento..."
          @update:model-value="onSearchChange"
        />
      </div>

      <!-- Filtro por Categoría -->
      <div class="filter-group">
        <label class="filter-label">Categoría</label>
        <select
          v-model="selectedCategory"
          class="filter-select"
          @change="onCategoryChange"
        >
          <option value="">Todas las Categorías</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- Filtro por Estado -->
      <div class="filter-group">
        <label class="filter-label">Estado</label>
        <select
          v-model="selectedStatus"
          class="filter-select"
          @change="onStatusChange"
        >
          <option value="">Todos los Estados</option>
          <option value="ACTIVE">Activo</option>
          <option value="INACTIVE">Inactivo</option>
        </select>
      </div>

      <!-- Botón Limpiar Filtros -->
      <div class="filter-group button-group" v-if="hasActiveFilters">
        <button type="button" class="btn-clear-filters" @click="resetAllFilters">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          Limpiar Filtros
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import SearchInput from '../../../components/ui/SearchInput.vue';

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    default: () => ({ search: '', categoryId: '', status: '' })
  }
});

const emit = defineEmits(['update:filters', 'change']);

const searchQuery = ref(props.filters.search || '');
const selectedCategory = ref(props.filters.categoryId || '');
const selectedStatus = ref(props.filters.status || '');

watch(() => props.filters, (newVal) => {
  searchQuery.value = newVal.search || '';
  selectedCategory.value = newVal.categoryId || '';
  selectedStatus.value = newVal.status || '';
}, { deep: true });

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || selectedCategory.value !== '' || selectedStatus.value !== '';
});

const emitChanges = () => {
  const updated = {
    search: searchQuery.value,
    categoryId: selectedCategory.value,
    status: selectedStatus.value
  };
  emit('update:filters', updated);
  emit('change', updated);
};

const onSearchChange = (val) => {
  searchQuery.value = val;
  emitChanges();
};

const onCategoryChange = () => {
  emitChanges();
};

const onStatusChange = () => {
  emitChanges();
};

const resetAllFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = '';
  selectedStatus.value = '';
  emitChanges();
};
</script>

<style scoped>
.student-filters-card {
  padding: 1.2rem 1.5rem;
  margin-bottom: 1.5rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 1rem;
  align-items: flex-end;
}

@media (max-width: 992px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }
  .search-group {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
  .search-group {
    grid-column: span 1;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-gray-600);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.filter-select {
  padding: 0.6rem 0.9rem;
  font-size: 0.9rem;
  font-family: var(--font-family-base);
  color: var(--color-dark);
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  outline: none;
  cursor: pointer;
  transition: var(--transition-fast);
}

.filter-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.button-group {
  justify-content: flex-end;
}

.btn-clear-filters {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-gray-600);
  background-color: var(--color-gray-100);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-clear-filters:hover {
  background-color: var(--color-gray-200);
  color: var(--color-dark);
}
</style>
