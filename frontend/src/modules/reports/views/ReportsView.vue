<template>
  <div class="module-placeholder card-modern">
    <div class="placeholder-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
      </svg>
    </div>
    <h2>Módulo de Reportes</h2>
    <p>Estructura modular preparada para generar reportes e informes de gestión.</p>
    <span class="badge badge-success">Preparado</span>
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
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
