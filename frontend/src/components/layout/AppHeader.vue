<template>
  <header class="app-header">
    <div class="header-title-container">
      <div class="header-academy-brand">
        <div v-if="settingsStore.settings.logo" class="header-logo-img-wrap">
          <img :src="settingsStore.settings.logo" :alt="settingsStore.settings.academyName" class="header-logo-img" />
        </div>
        <div v-else class="header-logo-badge">{{ academyInitial }}</div>
        <div>
          <h1 class="header-academy-name">{{ settingsStore.settings.academyName }}</h1>
          <span class="header-location">{{ settingsStore.settings.address }}</span>
        </div>
      </div>
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
import { useSettingsStore } from '../../stores/settingsStore';

const router = useRouter();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();

const userInitial = computed(() => {
  const name = authStore.userName || 'A';
  return name.charAt(0).toUpperCase();
});

const academyInitial = computed(() => {
  const name = settingsStore.settings.academyName || 'A';
  return name.charAt(0).toUpperCase();
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
