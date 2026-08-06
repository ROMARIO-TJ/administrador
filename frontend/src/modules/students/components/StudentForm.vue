<template>
  <form @submit.prevent="handleSubmit" class="student-form">
    <div v-if="serverError" class="alert alert-danger">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>{{ serverError }}</span>
    </div>

    <!-- SECCIÓN 1: INFORMACIÓN PERSONAL -->
    <div class="form-section card-modern">
      <div class="section-header">
        <div class="section-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="section-title-group">
          <h3>Sección 1: Información Personal</h3>
          <p>Datos de identificación del alumno</p>
        </div>
      </div>

      <div class="form-grid">
        <!-- URL de Foto -->
        <div class="form-group full-width">
          <label class="form-label">Foto del Alumno (URL o Ruta de Archivo)</label>
          <div class="photo-input-group">
            <input
              type="text"
              v-model="form.photo"
              class="form-control"
              placeholder="https://ejemplo.com/fotos/alumno.jpg o /assets/fotos/alumno.jpg"
            />
            <div class="photo-preview-box">
              <img v-if="form.photo" :src="form.photo" @error="onPhotoError" class="preview-img" alt="Vista previa" />
              <div v-else class="preview-placeholder">Sin Foto</div>
            </div>
          </div>
          <span class="field-help">Ingrese una URL de imagen válida o la ruta local de la fotografía.</span>
        </div>

        <!-- Nombres -->
        <div class="form-group">
          <label class="form-label required">Nombres</label>
          <input
            type="text"
            v-model="form.firstName"
            class="form-control"
            :class="{ 'is-invalid': errors.firstName }"
            placeholder="Ej. Nombres"
            required
          />
          <span v-if="errors.firstName" class="invalid-feedback">{{ errors.firstName }}</span>
        </div>

        <!-- Apellidos -->
        <div class="form-group">
          <label class="form-label required">Apellidos</label>
          <input
            type="text"
            v-model="form.lastName"
            class="form-control"
            :class="{ 'is-invalid': errors.lastName }"
            placeholder="Ej. Apellidos"
            required
          />
          <span v-if="errors.lastName" class="invalid-feedback">{{ errors.lastName }}</span>
        </div>

        <!-- Documento -->
        <div class="form-group">
          <label class="form-label required">Documento de Identidad (TI / CC / RC)</label>
          <input
            type="text"
            v-model="form.document"
            class="form-control"
            :class="{ 'is-invalid': errors.document }"
            placeholder="Ej. 1092837465"
            required
          />
          <span v-if="errors.document" class="invalid-feedback">{{ errors.document }}</span>
        </div>

        <!-- Fecha Nacimiento -->
        <div class="form-group">
          <label class="form-label required">Fecha de Nacimiento</label>
          <input
            type="date"
            v-model="form.birthDate"
            class="form-control"
            :class="{ 'is-invalid': errors.birthDate }"
            required
          />
          <span v-if="errors.birthDate" class="invalid-feedback">{{ errors.birthDate }}</span>
        </div>

        <!-- Edad (Calculada automáticamente) -->
        <div class="form-group">
          <label class="form-label">Edad (Calculada en tiempo real)</label>
          <div class="readonly-badge-input">
            <span class="age-calculated-text">{{ calculatedAge }} años</span>
            <span class="auto-tag">Auto</span>
          </div>
          <span class="field-help">No se guarda en BD; se calcula dinámicamente.</span>
        </div>

        <!-- Sexo -->
        <div class="form-group">
          <label class="form-label required">Sexo</label>
          <select v-model="form.gender" class="form-control" :class="{ 'is-invalid': errors.gender }" required>
            <option value="MASCULINO">Masculino</option>
            <option value="FEMENINO">Femenino</option>
            <option value="OTRO">Otro</option>
          </select>
          <span v-if="errors.gender" class="invalid-feedback">{{ errors.gender }}</span>
        </div>
      </div>
    </div>

    <!-- SECCIÓN 2: INFORMACIÓN DEPORTIVA -->
    <div class="form-section card-modern">
      <div class="section-header">
        <div class="section-icon sports-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20"></path>
          </svg>
        </div>
        <div class="section-title-group">
          <h3>Sección 2: Información Deportiva</h3>
          <p>Categoría y posición en el club Unión Jaguera FC</p>
        </div>
      </div>

      <div class="form-grid">
        <!-- Categoría -->
        <div class="form-group">
          <label class="form-label required">Categoría</label>
          <select v-model="form.categoryId" class="form-control" :class="{ 'is-invalid': errors.categoryId }" required>
            <option value="" disabled>Seleccione una categoría</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }} {{ cat.description ? `- ${cat.description}` : '' }}
            </option>
          </select>
          <span v-if="errors.categoryId" class="invalid-feedback">{{ errors.categoryId }}</span>
        </div>

        <!-- Fecha Ingreso -->
        <div class="form-group">
          <label class="form-label required">Fecha de Ingreso a la Academia</label>
          <input
            type="date"
            v-model="form.entryDate"
            class="form-control"
            :class="{ 'is-invalid': errors.entryDate }"
            required
          />
          <span v-if="errors.entryDate" class="invalid-feedback">{{ errors.entryDate }}</span>
        </div>

        <!-- Posición -->
        <div class="form-group">
          <label class="form-label required">Posición en el Campo</label>
          <select v-model="form.position" class="form-control" :class="{ 'is-invalid': errors.position }" required>
            <option value="PORTERO">Portero</option>
            <option value="DEFENSA">Defensa</option>
            <option value="MEDIOCAMPISTA">Mediocampista</option>
            <option value="DELANTERO">Delantero</option>
          </select>
          <span v-if="errors.position" class="invalid-feedback">{{ errors.position }}</span>
        </div>

        <!-- Pie Dominante -->
        <div class="form-group">
          <label class="form-label required">Pie Dominante</label>
          <select v-model="form.dominantFoot" class="form-control" :class="{ 'is-invalid': errors.dominantFoot }" required>
            <option value="DERECHO">Derecho</option>
            <option value="IZQUIERDO">Izquierdo</option>
            <option value="AMBIDIESTRO">Ambidiestro</option>
          </select>
          <span v-if="errors.dominantFoot" class="invalid-feedback">{{ errors.dominantFoot }}</span>
        </div>

        <!-- Dorsal / Jersey Number -->
        <div class="form-group">
          <label class="form-label">Número de Camiseta / Dorsal (Opcional)</label>
          <input
            type="number"
            min="1"
            max="99"
            v-model="form.jerseyNumber"
            class="form-control"
            placeholder="Ej. 10"
          />
        </div>
      </div>
    </div>

    <!-- SECCIÓN 3: ACUDIENTE -->
    <div class="form-section card-modern">
      <div class="section-header">
        <div class="section-icon guardian-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <div class="section-title-group">
          <h3>Sección 3: Información del Acudiente</h3>
          <p>Padre, madre o tutor legal responsable</p>
        </div>
      </div>

      <div class="form-grid">
        <!-- Nombre Acudiente -->
        <div class="form-group">
          <label class="form-label required">Nombre Completo del Acudiente</label>
          <input
            type="text"
            v-model="form.guardianName"
            class="form-control"
            :class="{ 'is-invalid': errors.guardianName }"
            placeholder="Ej. Nombre completo del acudiente"
            required
          />
          <span v-if="errors.guardianName" class="invalid-feedback">{{ errors.guardianName }}</span>
        </div>

        <!-- Parentesco -->
        <div class="form-group">
          <label class="form-label required">Parentesco</label>
          <input
            type="text"
            v-model="form.guardianRelationship"
            class="form-control"
            :class="{ 'is-invalid': errors.guardianRelationship }"
            placeholder="Ej. Padre, Madre, Abuelo/a"
            required
          />
          <span v-if="errors.guardianRelationship" class="invalid-feedback">{{ errors.guardianRelationship }}</span>
        </div>

        <!-- Teléfono -->
        <div class="form-group">
          <label class="form-label required">Teléfono de Contacto</label>
          <input
            type="tel"
            v-model="form.guardianPhone"
            class="form-control"
            :class="{ 'is-invalid': errors.guardianPhone }"
            placeholder="Ej. +57 310 123 4567"
            required
          />
          <span v-if="errors.guardianPhone" class="invalid-feedback">{{ errors.guardianPhone }}</span>
        </div>

        <!-- Dirección -->
        <div class="form-group">
          <label class="form-label required">Dirección de Residencia</label>
          <input
            type="text"
            v-model="form.guardianAddress"
            class="form-control"
            :class="{ 'is-invalid': errors.guardianAddress }"
            placeholder="Ej. Barrio La Palma, Calle 10 # 5-20"
            required
          />
          <span v-if="errors.guardianAddress" class="invalid-feedback">{{ errors.guardianAddress }}</span>
        </div>
      </div>
    </div>

    <!-- SECCIÓN 4: INFORMACIÓN MÉDICA & GENERAL -->
    <div class="form-section card-modern">
      <div class="section-header">
        <div class="section-icon medical-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
          </svg>
        </div>
        <div class="section-title-group">
          <h3>Sección 4: Información Médica & Observaciones</h3>
          <p>Datos de salud, EPS y notas generales</p>
        </div>
      </div>

      <div class="form-grid">
        <!-- EPS -->
        <div class="form-group">
          <label class="form-label required">EPS / Entidad de Salud</label>
          <input
            type="text"
            v-model="form.eps"
            class="form-control"
            :class="{ 'is-invalid': errors.eps }"
            placeholder="Ej. Nueva EPS, Sura, Coosalud"
            required
          />
          <span v-if="errors.eps" class="invalid-feedback">{{ errors.eps }}</span>
        </div>

        <!-- Alergias -->
        <div class="form-group">
          <label class="form-label">Alergias o Condición Médica</label>
          <input
            type="text"
            v-model="form.allergies"
            class="form-control"
            placeholder="Ej. Ninguna / Alérgico a la penicilina"
          />
        </div>

        <!-- Observaciones Médicas -->
        <div class="form-group full-width">
          <label class="form-label">Observaciones Médicas / Recomendaciones</label>
          <textarea
            v-model="form.medicalNotes"
            rows="2"
            class="form-control"
            placeholder="Notas sobre lesiones previas, medicamentos u observaciones físicas..."
          ></textarea>
        </div>

        <!-- Observaciones Generales -->
        <div class="form-group full-width">
          <label class="form-label">Observaciones Generales</label>
          <textarea
            v-model="form.generalNotes"
            rows="2"
            class="form-control"
            placeholder="Comentarios adicionales sobre el alumno..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- SECCIÓN 5: INFORMACIÓN ECONÓMICA -->
    <div class="form-section card-modern">
      <div class="section-header">
        <div class="section-icon economic-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div class="section-title-group">
          <h3>Sección 5: Información Económica</h3>
          <p>Configuración de tarifa y mensualidad del alumno</p>
        </div>
      </div>

      <div class="form-grid">
        <div class="form-group full-width">
          <label class="checkbox-container">
            <input
              type="checkbox"
              v-model="form.useCustomFee"
              class="checkbox-input"
            />
            <span class="checkbox-label">Usar mensualidad personalizada</span>
          </label>
          <span class="field-help">
            Si no se activa, el sistema aplicará automáticamente la tarifa general definida en la Configuración de la Academia ({{ formatCurrency(defaultAcademyFee) }}).
          </span>
        </div>

        <div v-if="form.useCustomFee" class="form-group">
          <label class="form-label required">Valor Mensualidad Personalizada (COP)</label>
          <input
            type="number"
            step="1000"
            min="0"
            v-model="form.customMonthlyFee"
            class="form-control"
            :class="{ 'is-invalid': errors.customMonthlyFee }"
            placeholder="Ej. 60000"
            required
          />
          <span v-if="errors.customMonthlyFee" class="invalid-feedback">{{ errors.customMonthlyFee }}</span>
        </div>
      </div>
    </div>

    <!-- BOTONES DE ACCIÓN DEL FORMULARIO -->
    <div class="form-actions-bar">
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
        Cancelar
      </button>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading" class="spinner-sm"></span>
        <span>{{ isEdit ? 'Guardar Cambios' : 'Registrar Alumno' }}</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  serverError: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['submit', 'cancel']);

const defaultAcademyFee = ref(80000);

const form = ref({
  photo: '',
  firstName: '',
  lastName: '',
  document: '',
  birthDate: '',
  gender: 'MASCULINO',
  categoryId: '',
  entryDate: new Date().toISOString().split('T')[0],
  position: 'MEDIOCAMPISTA',
  dominantFoot: 'DERECHO',
  jerseyNumber: '',
  guardianName: '',
  guardianRelationship: 'Padre',
  guardianPhone: '',
  guardianAddress: '',
  eps: '',
  allergies: '',
  medicalNotes: '',
  generalNotes: '',
  useCustomFee: false,
  customMonthlyFee: ''
});

const errors = ref({});

const isEdit = computed(() => !!props.initialData && !!props.initialData.id);

// Edad calculada automáticamente en tiempo real
const calculatedAge = computed(() => {
  if (!form.value.birthDate) return 0;
  const today = new Date();
  const birth = new Date(form.value.birthDate);
  if (isNaN(birth.getTime())) return 0;
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
});

const populateForm = (data) => {
  if (!data) return;
  form.value.photo = data.photo || '';
  form.value.firstName = data.firstName || '';
  form.value.lastName = data.lastName || '';
  form.value.document = data.document || '';
  
  if (data.birthDate) {
    form.value.birthDate = new Date(data.birthDate).toISOString().split('T')[0];
  }
  
  form.value.gender = data.gender || 'MASCULINO';
  form.value.categoryId = data.categoryId || '';
  
  if (data.entryDate) {
    form.value.entryDate = new Date(data.entryDate).toISOString().split('T')[0];
  }

  form.value.position = data.position || 'MEDIOCAMPISTA';
  form.value.dominantFoot = data.dominantFoot || 'DERECHO';
  form.value.jerseyNumber = data.jerseyNumber !== undefined && data.jerseyNumber !== null ? data.jerseyNumber : '';
  form.value.guardianName = data.guardianName || '';
  form.value.guardianRelationship = data.guardianRelationship || '';
  form.value.guardianPhone = data.guardianPhone || '';
  form.value.guardianAddress = data.guardianAddress || '';
  form.value.eps = data.eps || '';
  form.value.allergies = data.allergies || '';
  form.value.medicalNotes = data.medicalNotes || '';
  form.value.generalNotes = data.generalNotes || '';

  const isCustom = data.customMonthlyFee !== null && data.customMonthlyFee !== undefined;
  form.value.useCustomFee = isCustom;
  form.value.customMonthlyFee = isCustom ? data.customMonthlyFee : '';

  if (data.defaultMonthlyFee) {
    defaultAcademyFee.value = data.defaultMonthlyFee;
  }
};

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    populateForm(newVal);
  }
}, { immediate: true });

onMounted(() => {
  if (props.categories && props.categories.length > 0 && !form.value.categoryId) {
    form.value.categoryId = props.categories[0].id;
  }
});

const validate = () => {
  const errs = {};
  if (!form.value.firstName.trim()) errs.firstName = 'El nombre es obligatorio';
  if (!form.value.lastName.trim()) errs.lastName = 'El apellido es obligatorio';
  if (!form.value.document.trim()) errs.document = 'El número de documento es obligatorio';
  if (!form.value.birthDate) errs.birthDate = 'La fecha de nacimiento es obligatoria';
  if (!form.value.categoryId) errs.categoryId = 'Debe seleccionar una categoría';
  if (!form.value.entryDate) errs.entryDate = 'La fecha de ingreso es obligatoria';
  if (!form.value.guardianName.trim()) errs.guardianName = 'El acudiente es obligatorio';
  if (!form.value.guardianRelationship.trim()) errs.guardianRelationship = 'El parentesco es obligatorio';
  if (!form.value.guardianPhone.trim()) errs.guardianPhone = 'El teléfono es obligatorio';
  if (!form.value.guardianAddress.trim()) errs.guardianAddress = 'La dirección es obligatoria';
  if (!form.value.eps.trim()) errs.eps = 'La EPS es obligatoria';

  if (form.value.useCustomFee) {
    if (form.value.customMonthlyFee === '' || isNaN(form.value.customMonthlyFee) || Number(form.value.customMonthlyFee) < 0) {
      errs.customMonthlyFee = 'Ingrese un monto mensual válido';
    }
  }

  errors.value = errs;
  return Object.keys(errs).length === 0;
};

const handleSubmit = () => {
  if (!validate()) return;

  const payload = {
    ...form.value,
    customMonthlyFee: form.value.useCustomFee ? Number(form.value.customMonthlyFee) : null
  };

  emit('submit', payload);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
};

const onPhotoError = (e) => {
  e.target.style.display = 'none';
};
</script>

<style scoped>
.student-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.alert {
  padding: 0.9rem 1.2rem;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.alert-danger {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.form-section {
  padding: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--color-gray-200);
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sports-icon {
  background-color: #f0fdf4;
  color: var(--color-success);
}

.guardian-icon {
  background-color: #fef3c7;
  color: #d97706;
}

.medical-icon {
  background-color: #fef2f2;
  color: var(--color-danger);
}

.economic-icon {
  background-color: #eff6ff;
  color: var(--color-primary);
}

.section-title-group h3 {
  font-size: 1.1rem;
  color: var(--color-dark);
}

.section-title-group p {
  font-size: 0.8rem;
  color: var(--color-gray-500);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.2rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.full-width {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-gray-700);
}

.form-label.required::after {
  content: ' *';
  color: var(--color-danger);
}

.form-control {
  padding: 0.65rem 0.85rem;
  font-size: 0.9rem;
  font-family: var(--font-family-base);
  color: var(--color-dark);
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  outline: none;
  transition: var(--transition-fast);
}

.form-control:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.form-control.is-invalid {
  border-color: var(--color-danger);
}

.invalid-feedback {
  font-size: 0.78rem;
  color: var(--color-danger);
}

.field-help {
  font-size: 0.75rem;
  color: var(--color-gray-500);
}

/* Photo Input Group */
.photo-input-group {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.photo-preview-box {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1px solid var(--color-gray-300);
  overflow: hidden;
  flex-shrink: 0;
  background-color: var(--color-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  font-size: 0.65rem;
  color: var(--color-gray-400);
  text-align: center;
}

/* Readonly Age Badge Input */
.readonly-badge-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.85rem;
  background-color: var(--color-bg-light);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--border-radius-md);
}

.age-calculated-text {
  font-weight: 700;
  color: var(--color-primary);
  font-size: 0.95rem;
}

.auto-tag {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-gray-500);
  background-color: var(--color-gray-200);
  padding: 0.1rem 0.4rem;
  border-radius: var(--border-radius-sm);
  text-transform: uppercase;
}

/* Checkbox */
.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.checkbox-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-dark);
}

/* Form Actions */
.form-actions-bar {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 0;
}

.btn {
  padding: 0.65rem 1.4rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: var(--border-radius-md);
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary {
  background-color: var(--color-gray-100);
  color: var(--color-gray-700);
}

.btn-secondary:hover {
  background-color: var(--color-gray-200);
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-sm {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
