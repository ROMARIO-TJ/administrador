<template>
  <div class="kpi-card card-modern" :class="{ 'kpi-disabled': disabled }">
    <div class="kpi-top-row">
      <div class="kpi-icon-wrap" :style="{ backgroundColor: iconBgColor, color: iconColor }">
        <slot name="icon" />
      </div>
      <span v-if="isPositive" class="kpi-trend positive">▲</span>
      <span v-else-if="isNegative" class="kpi-trend negative">▼</span>
    </div>
    <div class="kpi-metric-value">{{ value }}</div>
    <div class="kpi-metric-title">{{ title }}</div>
    <div class="kpi-metric-subtitle">{{ subtitle }}</div>
    <span v-if="disabled" class="kpi-soon-badge">Próximamente</span>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], default: 0 },
  subtitle: { type: String, default: '' },
  iconBgColor: { type: String, default: '#EFF6FF' },
  iconColor: { type: String, default: '#2563EB' },
  isPositive: { type: Boolean, default: false },
  isNegative: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
});
</script>

<style scoped>
.kpi-card {
  padding: 1.4rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  position: relative;
  transition: var(--transition-fast);
}

.kpi-card:hover:not(.kpi-disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.kpi-disabled {
  cursor: default;
}

.kpi-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.6rem;
}

.kpi-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-trend {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: var(--border-radius-sm);
}

.kpi-trend.positive {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

.kpi-trend.negative {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
}

.kpi-metric-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-dark);
  line-height: 1;
}

.kpi-metric-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-gray-700);
}

.kpi-metric-subtitle {
  font-size: 0.78rem;
  color: var(--color-gray-500);
}

.kpi-soon-badge {
  display: inline-block;
  margin-top: 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-warning);
  background-color: var(--color-warning-bg);
  padding: 0.15rem 0.5rem;
  border-radius: var(--border-radius-full);
}
</style>
