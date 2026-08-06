<template>
  <div class="settings-container">
    <div class="settings-header">
      <h2 class="page-title">Configuración de la Academia</h2>
      <p class="page-subtitle">Parámetros generales de Unión Jaguera FC</p>
    </div>

    <div class="settings-card card-modern">
      <form @submit.prevent="saveSettings" class="settings-form">
        <div class="form-row">
          <BaseInput
            v-model="settings.academyName"
            label="Nombre de la Academia"
            placeholder="Unión Jaguera FC"
            disabled
          />
          <BaseInput
            v-model="settings.email"
            label="Correo Electrónico"
            type="email"
            placeholder="contacto@unionjaguerafc.com"
          />
        </div>

        <div class="form-row">
          <BaseInput
            v-model="settings.address"
            label="Dirección"
            placeholder="La Jagua de Ibirico, Cesar, Colombia"
          />
          <BaseInput
            v-model="settings.phone"
            label="Teléfono"
            placeholder="+57 300 123 4567"
          />
        </div>

        <div class="form-row">
          <BaseInput
            v-model="settings.registrationFee"
            label="Valor de Inscripción ($ COP)"
            type="number"
            placeholder="50000"
          />
          <BaseInput
            v-model="settings.monthlyFee"
            label="Valor de Mensualidad ($ COP)"
            type="number"
            placeholder="80000"
          />
        </div>

        <div class="form-actions">
          <BaseButton type="submit" variant="primary" :loading="saving">
            Guardar Configuración
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BaseInput from '../../../components/ui/BaseInput.vue';
import BaseButton from '../../../components/ui/BaseButton.vue';

const settings = ref({
  academyName: 'Unión Jaguera FC',
  address: 'La Jagua de Ibirico, Cesar, Colombia',
  phone: '+57 300 123 4567',
  email: 'contacto@unionjaguerafc.com',
  registrationFee: 50000,
  monthlyFee: 80000
});

const saving = ref(false);

const saveSettings = () => {
  saving.value = true;
  setTimeout(() => {
    saving.value = false;
    alert('Configuración guardada exitosamente');
  }, 600);
};
</script>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-dark);
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--color-gray-500);
}

.settings-card {
  max-width: 800px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>
