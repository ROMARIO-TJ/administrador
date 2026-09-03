<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="app-main">
      <AppHeader />
      <main class="app-content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useSettingsStore } from '../../stores/settingsStore';
import AppSidebar from './AppSidebar.vue';
import AppHeader from './AppHeader.vue';

const settingsStore = useSettingsStore();

onMounted(() => {
  settingsStore.fetchAllSettings();
});
</script>
