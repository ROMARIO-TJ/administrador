<template>
  <div class="input-group">
    <label v-if="label" :for="id" class="input-label">{{ label }}</label>
    <div class="input-wrapper">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        class="base-input"
        :class="{ 'has-error': error }"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </div>
    <span v-if="error" class="input-error-msg">{{ error }}</span>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  autocomplete: {
    type: String,
    default: 'on'
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gray-700);
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.base-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  font-family: var(--font-family-base);
  border: 1.5px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  background-color: var(--color-white);
  color: var(--color-dark);
  transition: var(--transition-fast);
  outline: none;
}

.base-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.base-input.has-error {
  border-color: var(--color-danger);
}

.input-error-msg {
  font-size: 0.775rem;
  color: var(--color-danger);
  font-weight: 500;
}
</style>
