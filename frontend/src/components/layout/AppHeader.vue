<template>
  <header class="app-header">
    <div class="header-title-container">
      <h1 class="header-academy-name">Unión Jaguera FC</h1>
      <span class="header-location">La Jagua de Ibirico, Cesar, Colombia</span>
    </div>

    <div class="header-user-info">
      <div class="user-badge">
        <div class="user-avatar">
          {{ userInitial }}
        </div>
        <div class="user-details">
          <span class="user-name">{{ authStore.userName }}</span>
          <span class="user-role">Administrador Único</span>
        </div>
      </div>

      <button class="btn-logout" @click="handleLogout" title="Cerrar sesión">
        Cerrar Sesión
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const userInitial = computed(() => {
  const name = authStore.userName || 'A';
  return name.charAt(0).toUpperCase();
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
