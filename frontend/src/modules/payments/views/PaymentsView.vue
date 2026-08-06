<template>
  <div class="module-placeholder card-modern">
    <div class="placeholder-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    </div>
    <h2>Módulo de Pagos</h2>
    <p>Estructura modular preparada. El control de mensualidades e inscripciones se implementará en el próximo Sprint.</p>
    <span class="badge badge-warning">Sprint 2</span>
  </div>
</template>

<style scoped>
.module-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  gap: 1rem;
}
.placeholder-icon {
  width: 80px;
  height: 80px;
  background-color: var(--color-success-bg);
  color: var(--color-success);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
