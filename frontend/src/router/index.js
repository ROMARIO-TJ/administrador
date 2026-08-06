import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

import MainLayout from '../components/layout/MainLayout.vue';
import LoginView from '../modules/auth/views/LoginView.vue';
import DashboardView from '../modules/dashboard/views/DashboardView.vue';
import StudentsView from '../modules/students/views/StudentsView.vue';
import StudentProfileView from '../modules/students/views/StudentProfileView.vue';
import PaymentsView from '../modules/payments/views/PaymentsView.vue';
import ReportsView from '../modules/reports/views/ReportsView.vue';
import SettingsView from '../modules/settings/views/SettingsView.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView
      },
      {
        path: 'students',
        name: 'Students',
        component: StudentsView
      },
      {
        path: 'students/:id',
        name: 'StudentProfile',
        component: StudentProfileView
      },
      {
        path: 'payments',
        name: 'Payments',
        component: PaymentsView
      },
      {
        path: 'reports',
        name: 'Reports',
        component: ReportsView
      },
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsView
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guard de Navegación Global para JWT Autenticación
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const token = localStorage.getItem('academiapro_token');

  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login' });
  } else if (to.meta.requiresGuest && token) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;
