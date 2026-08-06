<template>
  <div class="search-input-wrapper">
    <div class="search-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </div>
    <input
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      class="search-input"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <button
      v-if="modelValue"
      type="button"
      class="clear-btn"
      title="Limpiar búsqueda"
      @click="$emit('update:modelValue', '')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Buscar...'
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 0.85rem;
  color: var(--color-gray-400);
  display: flex;
  align-items: center;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.6rem 2.2rem 0.6rem 2.5rem;
  font-size: 0.9rem;
  font-family: var(--font-family-base);
  color: var(--color-dark);
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  outline: none;
  transition: var(--transition-fast);
}

.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: var(--color-gray-400);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem;
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition-fast);
}

.clear-btn:hover {
  color: var(--color-dark);
  background-color: var(--color-gray-100);
}
</style>
