import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// Estilos Globales (Pure CSS)
import './styles/main.css';
import './styles/layout.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
