<template>
  <div class="login-wrapper">
    <div class="login-card card-modern">
      <div class="login-header">
        <div class="login-logo-circle">
          <span>UJ</span>
        </div>
        <h1 class="login-title">AcademiaPro</h1>
        <p class="login-subtitle">Unión Jaguera FC - Portal de Administración</p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit" autocomplete="off">
        <div v-if="authStore.error" class="login-error-banner">
          {{ authStore.error }}
        </div>

        <BaseInput
          v-model="email"
          label="Usuario / Correo Electrónico"
          type="text"
          placeholder="Ingrese su usuario o correo"
          autocomplete="username"
          required
        />

        <BaseInput
          v-model="password"
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          autocomplete="new-password"
          required
        />

        <BaseButton
          type="submit"
          variant="primary"
          :loading="authStore.loading"
        >
          Iniciar Sesión
        </BaseButton>
      </form>

      <div class="login-footer">
        <span>La Jagua de Ibirico, Cesar &copy; 2026</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import BaseInput from '../../../components/ui/BaseInput.vue';
import BaseButton from '../../../components/ui/BaseButton.vue';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

const handleSubmit = async () => {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push('/dashboard');
  }
};
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1F2937 0%, #111827 100%);
  padding: 1.5rem;
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2rem;
  background-color: var(--color-white);
  border-radius: var(--border-radius-lg);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo-circle {
  width: 60px;
  height: 60px;
  background-color: var(--color-primary);
  color: var(--color-white);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0 auto 1rem auto;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
}

.login-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-dark);
  letter-spacing: -0.025em;
}

.login-subtitle {
  font-size: 0.875rem;
  color: var(--color-gray-500);
  margin-top: 0.25rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.login-error-banner {
  padding: 0.75rem 1rem;
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
  border-radius: var(--border-radius-md);
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.775rem;
  color: var(--color-gray-400);
}
</style>
