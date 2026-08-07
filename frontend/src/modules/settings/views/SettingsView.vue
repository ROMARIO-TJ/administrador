<template>
  <div class="settings-page">
    <div class="settings-header">
      <div>
        <h2 class="page-title">Centro de Configuración</h2>
        <p class="page-subtitle">Administración integral de la academia — Unión Jaguera FC</p>
      </div>

      <div v-if="store.successMessage" class="alert-toast success-toast">
        <span>✓ {{ store.successMessage }}</span>
      </div>
      <div v-if="store.error" class="alert-toast error-toast">
        <span>⚠️ {{ store.error }}</span>
      </div>
    </div>

    <!-- NAVEGACIÓN 9 PESTAÑAS -->
    <div class="settings-tabs-bar card-modern">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        :class="['settings-tab-btn', activeTab === t.id ? 'active' : '']"
        @click="activeTab = t.id"
      >
        <span>{{ t.label }}</span>
      </button>
    </div>

    <!-- CONTENIDO DE PESTAÑAS -->
    <div class="settings-content-wrapper">

      <!-- 🏛 1. INFORMACIÓN GENERAL -->
      <div v-if="activeTab === 'general'" class="tab-panel card-modern">
        <h3 class="section-title">Información General de la Academia</h3>
        <p class="section-sub">Datos institucionales que se mostrarán en recibos, PDF y encabezados</p>

        <form @submit.prevent="saveInstitutional" class="form-grid">
          <div class="form-row-2">
            <div class="form-group">
              <label>Nombre Completo de la Academia</label>
              <input type="text" v-model="institutionalForm.academyName" class="form-control" required />
            </div>
            <div class="form-group">
              <label>Nombre Corto / Sigla</label>
              <input type="text" v-model="institutionalForm.shortName" class="form-control" />
            </div>
          </div>

          <div class="form-row-3">
            <div class="form-group">
              <label>NIT / Identificación Fiscal</label>
              <input type="text" v-model="institutionalForm.nit" class="form-control" />
            </div>
            <div class="form-group">
              <label>Representante Legal</label>
              <input type="text" v-model="institutionalForm.representative" class="form-control" />
            </div>
            <div class="form-group">
              <label>Correo Electrónico</label>
              <input type="email" v-model="institutionalForm.email" class="form-control" />
            </div>
          </div>

          <div class="form-row-3">
            <div class="form-group">
              <label>Teléfono Principal</label>
              <input type="text" v-model="institutionalForm.phone" class="form-control" />
            </div>
            <div class="form-group">
              <label>WhatsApp Oficial</label>
              <input type="text" v-model="institutionalForm.whatsapp" class="form-control" />
            </div>
            <div class="form-group">
              <label>Sitio Web</label>
              <input type="text" v-model="institutionalForm.website" class="form-control" />
            </div>
          </div>

          <div class="form-row-3">
            <div class="form-group">
              <label>Dirección</label>
              <input type="text" v-model="institutionalForm.address" class="form-control" />
            </div>
            <div class="form-group">
              <label>Ciudad / Municipio</label>
              <input type="text" v-model="institutionalForm.city" class="form-control" />
            </div>
            <div class="form-group">
              <label>Departamento</label>
              <input type="text" v-model="institutionalForm.department" class="form-control" />
            </div>
          </div>

          <div class="form-group">
            <label>Descripción / Misión Institucional</label>
            <textarea v-model="institutionalForm.description" class="form-control" rows="3"></textarea>
          </div>

          <!-- Logo Institucional -->
          <div class="logo-section">
            <h4 class="logo-section-title">Logo Institucional</h4>
            <p class="section-sub">Se mostrará en el Sidebar, Header, recibos y exportaciones</p>
            <div class="logo-manager">

              <!-- Previsualización -->
              <div class="logo-preview-wrap">
                <img
                  v-if="institutionalForm.logo"
                  :src="institutionalForm.logo"
                  alt="Logo institucional"
                  class="logo-preview-img"
                />
                <div v-else class="logo-preview-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span>Sin logo</span>
                </div>
              </div>

              <!-- Controles de carga -->
              <div class="logo-input-area">

                <!-- Botón seleccionar archivo desde PC -->
                <label class="logo-upload-btn" for="logo-file-input">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Seleccionar imagen desde mi PC
                </label>
                <input
                  id="logo-file-input"
                  type="file"
                  accept="image/png,image/jpg,image/jpeg,image/svg+xml"
                  class="logo-file-hidden"
                  @change="onLogoFileChange"
                />
                <small class="help-text">PNG, JPG, JPEG o SVG. La imagen se cargará automáticamente.</small>

                <!-- Separador -->
                <div class="logo-or-divider"><span>o</span></div>

                <!-- Campo URL manual -->
                <label class="logo-url-label">Pegar URL de imagen</label>
                <input
                  type="text"
                  v-model="institutionalForm.logo"
                  class="form-control"
                  placeholder="https://ejemplo.com/logo.png"
                />

                <!-- Botón quitar logo -->
                <button
                  v-if="institutionalForm.logo"
                  type="button"
                  class="btn-sm btn-outline-danger mt-2"
                  @click="removeLogo"
                >
                  ✕ Quitar Logo
                </button>

                <!-- Indicador de carga -->
                <span v-if="logoLoading" class="logo-loading-text">⏳ Cargando imagen...</span>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="store.loading">
              Guardar Información General
            </button>
          </div>
        </form>
      </div>

      <!-- 💰 2. CONFIGURACIÓN FINANCIERA -->
      <div v-else-if="activeTab === 'financial'" class="tab-panel card-modern">
        <h3 class="section-title">Configuración Financiera</h3>
        <p class="section-sub">Valores tarifarios que se cargarán automáticamente en el Módulo de Pagos</p>

        <form @submit.prevent="saveFinancial" class="form-grid">
          <div class="form-row-2">
            <div class="form-group">
              <label>Valor de Inscripción / Matrícula ($ COP)</label>
              <input type="number" v-model.number="financialForm.registrationFee" class="form-control font-bold" min="0" step="1000" required />
            </div>
            <div class="form-group">
              <label>Valor Mensualidad por Defecto ($ COP)</label>
              <input type="number" v-model.number="financialForm.monthlyFee" class="form-control font-bold" min="0" step="1000" required />
            </div>
          </div>

          <div class="form-row-3">
            <div class="form-group">
              <label>Día Límite de Pago Mensual</label>
              <input type="number" v-model.number="financialForm.dueDay" class="form-control" min="1" max="31" required />
              <small class="help-text">Día del mes después del cual se considera vencida (Ej. 10)</small>
            </div>
            <div class="form-group">
              <label>Moneda Base</label>
              <input type="text" v-model="financialForm.currency" class="form-control" disabled />
            </div>
            <div class="form-group">
              <label>Símbolo</label>
              <input type="text" v-model="financialForm.currencySymbol" class="form-control" disabled />
            </div>
          </div>

          <div class="form-row-2 border-top-box">
            <div class="checkbox-group">
              <label class="switch-label">
                <input type="checkbox" v-model="financialForm.allowDiscounts" />
                <span>Permitir Tarifas Especiales / Descuentos a Alumnos</span>
              </label>
            </div>
            <div class="checkbox-group">
              <label class="switch-label">
                <input type="checkbox" v-model="financialForm.allowPartialPayments" />
                <span>Permitir Abonos y Pagos Parciales (Estructura Sprint)</span>
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="store.loading">
              Guardar Configuración Financiera
            </button>
          </div>
        </form>
      </div>

      <!-- 🏆 3. TEMPORADAS DEPORTIVAS -->
      <div v-else-if="activeTab === 'seasons'" class="tab-panel card-modern">
        <div class="panel-header-action">
          <div>
            <h3 class="section-title">Temporadas Deportivas</h3>
            <p class="section-sub">Solo puede existir una temporada activa en el sistema</p>
          </div>
          <button type="button" class="btn btn-secondary" @click="openSeasonModal(null)">+ Nueva Temporada</button>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Temporada</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in store.seasons" :key="s.id">
              <td class="font-bold">{{ s.name }}</td>
              <td>{{ formatDate(s.startDate) }}</td>
              <td>{{ formatDate(s.endDate) }}</td>
              <td>
                <span :class="['badge', s.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary']">
                  {{ s.status === 'ACTIVE' ? '🟢 ACTIVA' : s.status }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button v-if="s.status !== 'ACTIVE'" type="button" class="btn-sm btn-outline-success" @click="setActiveSeason(s.id)">
                    Activar
                  </button>
                  <button type="button" class="btn-sm btn-outline-danger" @click="deleteSeason(s.id)" :disabled="s.status === 'ACTIVE'">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 👥 4. CATEGORÍAS -->
      <div v-else-if="activeTab === 'categories'" class="tab-panel card-modern">
        <div class="panel-header-action">
          <div>
            <h3 class="section-title">Administración de Categorías</h3>
            <p class="section-sub">Gestión de grupos y rangos de edad de la academia</p>
          </div>
          <button type="button" class="btn btn-secondary" @click="openCategoryModal(null)">+ Nueva Categoría</button>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Edades</th>
              <th>Alumnos Inscritos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in store.categories" :key="c.id">
              <td class="font-bold">
                <span class="color-dot" :style="{ backgroundColor: c.color || '#2563EB' }"></span>
                {{ c.name }}
              </td>
              <td class="text-muted">{{ c.description || '-' }}</td>
              <td>{{ c.minAge }} - {{ c.maxAge }} años</td>
              <td class="font-bold text-center">{{ c.studentCount || 0 }}</td>
              <td>
                <button type="button" class="btn-sm btn-outline-danger" @click="deleteCategory(c)" :title="c.studentCount > 0 ? 'No se puede eliminar con alumnos' : 'Eliminar'">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 💳 5. MÉTODOS DE PAGO -->
      <div v-else-if="activeTab === 'payments'" class="tab-panel card-modern">
        <div class="panel-header-action">
          <div>
            <h3 class="section-title">Métodos de Pago Habilitados</h3>
            <p class="section-sub">Los métodos activos se cargarán automáticamente en el módulo de Cobros</p>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Método de Pago</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pm in store.paymentMethods" :key="pm.id">
              <td class="font-bold">{{ pm.name }}</td>
              <td>
                <span :class="['badge', pm.active ? 'badge-success' : 'badge-danger']">
                  {{ pm.active ? 'Habilitado' : 'Inhabilitado' }}
                </span>
              </td>
              <td>
                <button type="button" :class="['btn-sm', pm.active ? 'btn-outline-danger' : 'btn-outline-success']" @click="togglePaymentMethod(pm.id)">
                  {{ pm.active ? 'Desactivar' : 'Activar' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 🔢 6. CONSECUTIVOS -->
      <div v-else-if="activeTab === 'consecutives'" class="tab-panel card-modern">
        <h3 class="section-title">Panel de Consecutivos y Códigos</h3>
        <p class="section-sub">Próximos folios que se generarán automáticamente</p>

        <div class="consecutives-grid">
          <div class="consecutive-card">
            <span class="prefix">ALU</span>
            <span class="label">Próximo Código Alumno</span>
            <h2 class="val">{{ store.consecutives.studentNext || 'ALU-0001' }}</h2>
            <small class="muted">Asignación correlativa</small>
          </div>

          <div class="consecutive-card">
            <span class="prefix">INS</span>
            <span class="label">Próxima Inscripción</span>
            <h2 class="val">{{ store.consecutives.registrationNext || 'INS-000001' }}</h2>
            <button type="button" class="btn-sm btn-outline-danger mt-2" @click="confirmResetConsecutive('INS')">Reiniciar (0)</button>
          </div>

          <div class="consecutive-card">
            <span class="prefix">MEN</span>
            <span class="label">Próxima Mensualidad</span>
            <h2 class="val">{{ store.consecutives.monthlyNext || 'MEN-000001' }}</h2>
            <button type="button" class="btn-sm btn-outline-danger mt-2" @click="confirmResetConsecutive('MEN')">Reiniciar (0)</button>
          </div>

          <div class="consecutive-card">
            <span class="prefix">REC</span>
            <span class="label">Próximo Recibo</span>
            <h2 class="val">{{ store.consecutives.receiptNext || 'REC-000001' }}</h2>
            <button type="button" class="btn-sm btn-outline-danger mt-2" @click="confirmResetConsecutive('REC')">Reiniciar (0)</button>
          </div>
        </div>
      </div>

      <!-- 🎨 7. APARIENCIA -->
      <div v-else-if="activeTab === 'appearance'" class="tab-panel card-modern">
        <h3 class="section-title">Apariencia y Colores Institucionales</h3>
        <p class="section-sub">Personalice la paleta visual del sistema de la academia</p>

        <form @submit.prevent="saveAppearance" class="form-grid">
          <div class="form-row-2">
            <div class="form-group">
              <label>Color Principal (Primario)</label>
              <div class="color-picker-box">
                <input type="color" v-model="appearanceForm.primaryColor" class="color-input" />
                <input type="text" v-model="appearanceForm.primaryColor" class="form-control" />
              </div>
            </div>
            <div class="form-group">
              <label>Modo de Color</label>
              <select v-model="appearanceForm.themeMode" class="form-control">
                <option value="LIGHT">Modo Claro (Recomendado)</option>
                <option value="DARK">Modo Oscuro</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="store.loading">
              Aplicar Apariencia
            </button>
          </div>
        </form>
      </div>

      <!-- 👤 8. USUARIOS (PREPARADO) -->
      <div v-else-if="activeTab === 'users'" class="tab-panel card-modern">
        <h3 class="section-title">Gestión de Usuarios del Sistema</h3>
        <p class="section-sub">Estructura preparada para asignación de roles y permisos</p>

        <table class="data-table">
          <thead>
            <tr>
              <th>Usuario / Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="font-bold">admin@unionjaguera.com</td>
              <td><span class="badge badge-primary">ADMINISTRADOR</span></td>
              <td><span class="badge badge-success">ACTIVO</span></td>
              <td>
                <button type="button" class="btn-sm btn-disabled" disabled>Próximamente</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 💾 9. COPIAS DE SEGURIDAD -->
      <div v-else-if="activeTab === 'backups'" class="tab-panel card-modern">
        <h3 class="section-title">Copias de Seguridad y Respaldo</h3>
        <p class="section-sub">Gestión de respaldos de la base de datos PostgreSQL</p>

        <div class="backup-actions-grid">
          <div class="backup-card">
            <h4>Crear Respaldo Local</h4>
            <p>Genera una copia de seguridad en formato SQL/JSON de toda la base de datos.</p>
            <button type="button" class="btn btn-secondary mt-2" @click="dummyBackup('Respaldo generado correctamente')">
              Crear Respaldo
            </button>
          </div>

          <div class="backup-card">
            <h4>Exportar Base de Datos</h4>
            <p>Descarga la información de alumnos y pagos en formato comprimido.</p>
            <button type="button" class="btn btn-secondary mt-2" @click="dummyBackup('Base de datos exportada')">
              Exportar DB
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- MODAL NUEVA TEMPORADA -->
    <Teleport to="body">
      <div v-if="showSeasonModal" class="modal-backdrop" @click.self="showSeasonModal = false">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Nueva Temporada Deportiva</h3>
            <button type="button" class="close-btn" @click="showSeasonModal = false">&times;</button>
          </div>
          <form @submit.prevent="saveNewSeason" class="modal-body">
            <div class="form-group">
              <label>Nombre de la Temporada</label>
              <input type="text" v-model="newSeasonForm.name" placeholder="Ej. Temporada 2027" class="form-control" required />
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Fecha Inicio</label>
                <input type="date" v-model="newSeasonForm.startDate" class="form-control" required />
              </div>
              <div class="form-group">
                <label>Fecha Fin</label>
                <input type="date" v-model="newSeasonForm.endDate" class="form-control" required />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showSeasonModal = false">Cancelar</button>
              <button type="submit" class="btn btn-primary">Crear Temporada</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- MODAL NUEVA CATEGORÍA -->
    <Teleport to="body">
      <div v-if="showCategoryModal" class="modal-backdrop" @click.self="showCategoryModal = false">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Nueva Categoría Deportiva</h3>
            <button type="button" class="close-btn" @click="showCategoryModal = false">&times;</button>
          </div>
          <form @submit.prevent="saveNewCategory" class="modal-body">
            <div class="form-group">
              <label>Nombre de la Categoría</label>
              <input type="text" v-model="newCategoryForm.name" placeholder="Ej. Sub-15" class="form-control" required />
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <input type="text" v-model="newCategoryForm.description" class="form-control" />
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label>Edad Mínima</label>
                <input type="number" v-model.number="newCategoryForm.minAge" class="form-control" min="3" max="30" required />
              </div>
              <div class="form-group">
                <label>Edad Máxima</label>
                <input type="number" v-model.number="newCategoryForm.maxAge" class="form-control" min="3" max="30" required />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showCategoryModal = false">Cancelar</button>
              <button type="submit" class="btn btn-primary">Crear Categoría</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useSettingsStore } from '../../../stores/settingsStore';

const store = useSettingsStore();
const activeTab = ref('general');

const tabs = [
  { id: 'general', label: '🏛 Información General' },
  { id: 'financial', label: '💰 Configuración Financiera' },
  { id: 'seasons', label: '🏆 Temporadas' },
  { id: 'categories', label: '👥 Categorías' },
  { id: 'payments', label: '💳 Métodos de Pago' },
  { id: 'consecutives', label: '🔢 Consecutivos' },
  { id: 'appearance', label: '🎨 Apariencia' },
  { id: 'users', label: '👤 Usuarios' },
  { id: 'backups', label: '💾 Copias de Seguridad' }
];

const institutionalForm = reactive({
  academyName: '', shortName: '', nit: '', representative: '',
  email: '', phone: '', whatsapp: '', website: '',
  address: '', city: '', department: '', description: '', logo: ''
});

const financialForm = reactive({
  registrationFee: 50000, monthlyFee: 50000, dueDay: 10,
  currency: 'COP', currencySymbol: '$',
  allowDiscounts: true, allowPartialPayments: true
});

const appearanceForm = reactive({
  primaryColor: '#2563EB', themeMode: 'LIGHT'
});

const showSeasonModal = ref(false);
const newSeasonForm = reactive({ name: '', startDate: '', endDate: '' });

const showCategoryModal = ref(false);
const newCategoryForm = reactive({ name: '', description: '', minAge: 4, maxAge: 20 });

onMounted(async () => {
  await store.fetchAllSettings();
  await store.fetchSeasons();
  await store.fetchCategories();
  await store.fetchPaymentMethods();
  await store.fetchConsecutives();

  // Rellenar formularios con la data del store
  Object.assign(institutionalForm, store.settings);
  Object.assign(financialForm, store.settings);
  Object.assign(appearanceForm, store.settings);
});

// Logo institucional — carga desde PC
const logoLoading = ref(false);

const onLogoFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validar tipo de archivo
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    alert('Formato no permitido. Solo se aceptan: PNG, JPG, JPEG, SVG.');
    event.target.value = '';
    return;
  }

  logoLoading.value = true;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      const maxSize = 300;

      // Calcular nuevas dimensiones conservando proporción
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Exportar (mantenemos PNG para transparencia si no es explícitamente JPEG)
      const outputType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
      const quality = outputType === 'image/jpeg' ? 0.9 : undefined;
      const resizedBase64 = canvas.toDataURL(outputType, quality);

      // Calcular peso aproximado en KB de la imagen optimizada (base64)
      const sizeInBytes = Math.round((resizedBase64.length * 3) / 4);
      
      if (sizeInBytes > 500 * 1024) {
        alert('La imagen optimizada supera los 500 KB. Por favor, utilice una imagen más pequeña.');
      } else {
        institutionalForm.logo = resizedBase64;
      }
      
      logoLoading.value = false;
    };
    
    img.onerror = () => {
      alert('Error al procesar la imagen.');
      logoLoading.value = false;
    };

    img.src = e.target.result;
  };
  
  reader.onerror = () => {
    alert('Error al leer el archivo. Intente de nuevo.');
    logoLoading.value = false;
  };
  
  reader.readAsDataURL(file);

  // Limpiar el input para permitir volver a seleccionar el mismo archivo
  event.target.value = '';
};

const removeLogo = () => {
  institutionalForm.logo = '';
};

const saveInstitutional = async () => {
  await store.updateInstitutional(institutionalForm);
};

const saveFinancial = async () => {
  await store.updateFinancial(financialForm);
};

const saveAppearance = async () => {
  await store.updateAppearance(appearanceForm);
};

// Acciones Temporadas
const openSeasonModal = () => {
  newSeasonForm.name = '';
  newSeasonForm.startDate = `${new Date().getFullYear()}-01-01`;
  newSeasonForm.endDate = `${new Date().getFullYear()}-12-31`;
  showSeasonModal.value = true;
};

const saveNewSeason = async () => {
  await store.createSeason({ ...newSeasonForm, status: 'ACTIVE' });
  showSeasonModal.value = false;
};

const setActiveSeason = async (id) => {
  await store.setActiveSeason(id);
};

const deleteSeason = async (id) => {
  if (confirm('¿Está seguro de eliminar esta temporada?')) {
    await store.deleteSeason(id);
  }
};

// Acciones Categorías
const openCategoryModal = () => {
  newCategoryForm.name = '';
  newCategoryForm.description = '';
  newCategoryForm.minAge = 4;
  newCategoryForm.maxAge = 20;
  showCategoryModal.value = true;
};

const saveNewCategory = async () => {
  await store.createCategory(newCategoryForm);
  showCategoryModal.value = false;
};

const deleteCategory = async (cat) => {
  if (cat.studentCount > 0) {
    alert(`No es posible eliminar la categoría "${cat.name}" porque tiene ${cat.studentCount} alumno(s) asignado(s).`);
    return;
  }
  if (confirm(`¿Confirma eliminar la categoría ${cat.name}?`)) {
    await store.deleteCategory(cat.id);
  }
};

// Acciones Métodos de Pago
const togglePaymentMethod = async (id) => {
  await store.togglePaymentMethod(id);
};

// Acciones Consecutivos
const confirmResetConsecutive = async (prefix) => {
  if (confirm(`⚠️ ATENCIÓN: ¿Está absolutamente seguro de reiniciar el consecutivo de ${prefix} a 000000?`)) {
    if (confirm('DOBLE CONFIRMACIÓN: Esta acción cambiará el correlativo de próximos comprobantes. ¿Proceder?')) {
      await store.resetConsecutive(prefix);
    }
  }
};

const dummyBackup = (msg) => {
  alert(msg + ' (Módulo de respaldo preparado para versión de despliegue).');
};

const formatDate = (dStr) => {
  if (!dStr) return '-';
  const d = new Date(dStr);
  if (isNaN(d.getTime())) return dStr;
  return new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
};
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
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

.alert-toast {
  padding: 0.6rem 1.1rem;
  border-radius: var(--border-radius-md);
  font-size: 0.88rem;
  font-weight: 700;
}

.success-toast { background-color: #DCFCE7; color: #15803D; }
.error-toast { background-color: #FEE2E2; color: #B91C1C; }

/* Tabs Navigation */
.settings-tabs-bar {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  padding: 0.5rem;
  gap: 0.35rem;
}

.settings-tab-btn {
  padding: 0.65rem 1rem;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-gray-600);
  background: none;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  white-space: nowrap;
  transition: var(--transition-fast);
}

.settings-tab-btn:hover {
  background-color: var(--color-gray-100);
  color: var(--color-primary);
}

.settings-tab-btn.active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.tab-panel {
  padding: 1.75rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-dark);
}

.section-sub {
  font-size: 0.88rem;
  color: var(--color-gray-500);
  margin-bottom: 1.5rem;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.25rem; }

@media (max-width: 768px) {
  .form-row-2, .form-row-3 { grid-template-columns: 1fr; }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-gray-700);
}

.form-control {
  padding: 0.65rem 0.85rem;
  font-size: 0.9rem;
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  outline: none;
}

.form-control:focus { border-color: var(--color-primary); }

.help-text { font-size: 0.78rem; color: var(--color-gray-500); }

.border-top-box {
  padding-top: 1rem;
  border-top: 1px solid var(--color-gray-200);
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn {
  padding: 0.65rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 700;
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
}

.btn-primary { background-color: var(--color-primary); color: var(--color-white); }
.btn-secondary { background-color: var(--color-gray-100); color: var(--color-dark); border: 1px solid var(--color-gray-300); }

.panel-header-action {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.88rem;
}

.data-table th {
  padding: 0.75rem 0.9rem;
  background-color: var(--color-gray-100);
  color: var(--color-gray-600);
  font-weight: 700;
  border-bottom: 2px solid var(--color-gray-200);
}

.data-table td {
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid var(--color-gray-200);
}

.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 700;
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
}

.btn-outline-success { background: #DCFCE7; color: #16A34A; }
.btn-outline-danger { background: #FEE2E2; color: #DC2626; }
.btn-disabled { background: var(--color-gray-200); color: var(--color-gray-500); cursor: not-allowed; }

.color-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}

/* Consecutivos */
.consecutives-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
}

.consecutive-card {
  background: var(--color-gray-100);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.consecutive-card .prefix {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--color-primary);
  background: var(--color-primary-light);
  padding: 0.2rem 0.6rem;
  border-radius: var(--border-radius-full);
}

.consecutive-card .label {
  font-size: 0.82rem;
  color: var(--color-gray-600);
  margin: 0.5rem 0;
}

.consecutive-card .val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-dark);
  font-family: monospace;
}

.color-picker-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.color-input {
  width: 44px;
  height: 40px;
  border: none;
  cursor: pointer;
  background: none;
}

.backup-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.backup-card {
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
  padding: 1.25rem;
}

.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
}

.modal-card {
  width: 100%; max-width: 480px; background: white; border-radius: var(--border-radius-lg); overflow: hidden;
}

.modal-header {
  padding: 1rem 1.25rem; background: var(--color-gray-100); border-bottom: 1px solid var(--color-gray-200);
  display: flex; justify-content: space-between; align-items: center;
}

.modal-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
.mt-2 { margin-top: 0.5rem; }

/* Logo Institucional */
.logo-section {
  padding-top: 1.25rem;
  border-top: 1px solid var(--color-gray-200);
}

.logo-section-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-dark);
  margin-bottom: 0.2rem;
}

.logo-manager {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.logo-preview-wrap {
  width: 110px;
  height: 110px;
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-100);
  flex-shrink: 0;
  overflow: hidden;
}

.logo-preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

.logo-preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  color: var(--color-gray-400);
  font-size: 0.78rem;
}

.logo-input-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Input file oculto */
.logo-file-hidden {
  display: none;
}

/* Botón estilizado para seleccionar archivo */
.logo-upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  border: 1.5px dashed var(--color-primary);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  width: fit-content;
}

.logo-upload-btn:hover {
  background-color: var(--color-primary);
  color: var(--color-white);
}

/* Separador "o" */
.logo-or-divider {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.25rem 0;
  color: var(--color-gray-400);
  font-size: 0.8rem;
}

.logo-or-divider::before,
.logo-or-divider::after {
  content: '';
  flex: 1;
  max-width: 60px;
  height: 1px;
  background-color: var(--color-gray-200);
}

/* Label URL */
.logo-url-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-gray-600);
}

/* Indicador de carga */
.logo-loading-text {
  font-size: 0.82rem;
  color: var(--color-primary);
  font-weight: 600;
}
</style>
