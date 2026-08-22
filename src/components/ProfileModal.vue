<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="profile-modal-card glass-card animate-fade-in">
      <div class="modal-header">
        <div class="header-title">
          <User class="header-icon" />
          <h3>Mi Perfil de Amiga BR</h3>
        </div>
        <button @click="$emit('close')" class="btn-close">✕</button>
      </div>

      <form @submit.prevent="saveProfile" class="profile-form">
        <!-- Avatar Section with File Upload -->
        <div class="avatar-section">
          <div class="avatar-preview-container">
            <img v-if="form.avatar" :src="form.avatar" alt="Avatar" class="avatar-preview" />
            <div v-else class="avatar-placeholder">
              {{ store.getInitials(form.name) }}
            </div>
          </div>

          <div class="avatar-upload-box">
            <label class="avatar-upload-label">Foto de Perfil</label>
            <div class="avatar-btn-group">
              <input 
                type="file" 
                ref="fileInput" 
                accept="image/*" 
                @change="handleFileUpload" 
                style="display: none;" 
              />
              <button 
                type="button" 
                @click="triggerFileInput" 
                class="btn-secondary btn-upload" 
                :disabled="isUploading"
              >
                <Upload class="btn-icon-sm" />
                <span>{{ isUploading ? 'Subiendo...' : 'Subir Foto' }}</span>
              </button>

              <button 
                type="button" 
                v-if="form.avatar" 
                @click="form.avatar = ''" 
                class="btn-remove-avatar" 
                title="Eliminar foto"
              >
                <Trash2 class="btn-icon-sm" />
                <span>Quitar</span>
              </button>
            </div>
            <p class="upload-hint">Haz clic en "Subir Foto" para elegir una imagen desde tu dispositivo.</p>
          </div>
        </div>

        <div class="form-grid">
          <!-- Nombre -->
          <div class="form-group">
            <label>Nombre Completo</label>
            <input v-model="form.name" type="text" required class="form-input" />
          </div>

          <!-- Correo -->
          <div class="form-group">
            <label>Correo Electrónico</label>
            <input v-model="form.email" type="email" required class="form-input" />
          </div>

          <!-- Celular -->
          <div class="form-group">
            <label>Número Celular</label>
            <input v-model="form.phone" type="tel" placeholder="+506 8888-8888" required class="form-input" />
          </div>

          <!-- Fecha de Nacimiento -->
          <div class="form-group">
            <label>Fecha de Nacimiento</label>
            <input 
              v-model="form.birthDate" 
              type="date" 
              class="form-input" 
              @change="updateAgeFromBirthDate"
            />
          </div>

          <!-- Edad (Sola se actualiza en cumpleaños) -->
          <div class="form-group">
            <label>Edad (Se calcula automáticamente)</label>
            <input 
              :value="calculatedAgeText" 
              type="text" 
              readonly
              placeholder="Selecciona fecha de nacimiento" 
              class="form-input readonly-input" 
            />
          </div>

          <!-- Talla de Camisa -->
          <div class="form-group">
            <label>Talla de Camisa</label>
            <select v-model="form.shirtSize" required class="form-select">
              <option value="XS">XS (Extra Small)</option>
              <option value="S">S (Small)</option>
              <option value="M">M (Medium)</option>
              <option value="L">L (Large)</option>
              <option value="XL">XL (Extra Large)</option>
              <option value="XXL">XXL (Double Extra Large)</option>
            </select>
          </div>

          <!-- Provincia -->
          <div class="form-group">
            <label>Provincia (Costa Rica)</label>
            <select v-model="form.province" class="form-select">
              <option value="">-- Seleccionar Provincia --</option>
              <option value="San José">San José</option>
              <option value="Alajuela">Alajuela</option>
              <option value="Cartago">Cartago</option>
              <option value="Heredia">Heredia</option>
              <option value="Guanacaste">Guanacaste</option>
              <option value="Puntarenas">Puntarenas</option>
              <option value="Limón">Limón</option>
            </select>
          </div>

          <!-- Cantón -->
          <div class="form-group">
            <label>Cantón</label>
            <input v-model="form.canton" type="text" placeholder="Ej. Escazú, Montes de Oca" class="form-input" />
          </div>

          <!-- Distrito -->
          <div class="form-group">
            <label>Distrito</label>
            <input v-model="form.district" type="text" placeholder="Ej. San Rafael, San Pedro" class="form-input" />
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-emerald">
            <Save class="btn-icon" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { store } from '../lib/supabase.js'
import { toast } from '../lib/toast.js'
import { User, Save, Upload, Trash2 } from 'lucide-vue-next'

const emit = defineEmits(['close'])

const fileInput = ref(null)
const isUploading = ref(false)

const form = reactive({
  name: store.currentUser?.name || '',
  email: store.currentUser?.email || '',
  phone: store.currentUser?.phone || '',
  shirtSize: store.currentUser?.shirtSize || 'M',
  avatar: store.currentUser?.avatar || '',
  birthDate: store.currentUser?.birthDate || '',
  age: store.currentUser?.age ?? '',
  province: store.currentUser?.province || '',
  canton: store.currentUser?.canton || '',
  district: store.currentUser?.district || ''
})

const calculateAge = (bDate) => {
  if (!bDate) return null
  const today = new Date()
  const birth = new Date(bDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age >= 0 ? age : null
}

const calculatedAgeText = computed(() => {
  const calculated = calculateAge(form.birthDate)
  if (calculated !== null) {
    return `${calculated} años`
  }
  return form.age ? `${form.age} años` : ''
})

const updateAgeFromBirthDate = () => {
  const calculated = calculateAge(form.birthDate)
  if (calculated !== null) {
    form.age = calculated
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  isUploading.value = true
  try {
    const uploadedUrl = await store.uploadImage(file)
    if (uploadedUrl) {
      form.avatar = uploadedUrl
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        form.avatar = e.target.result
        isUploading.value = false
      }
      reader.readAsDataURL(file)
      return
    }
  } catch (err) {
    console.error('Error al subir imagen:', err)
  } finally {
    isUploading.value = false
  }
}

const saveProfile = () => {
  store.updateUserProfile(form)
  toast.success('¡Tu perfil de amiga ha sido actualizado correctamente!')
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.profile-modal-card {
  width: 100%;
  max-width: 650px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 28px;
  background: var(--color-bg-card);
  border: 1px solid var(--border-soft);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-berry);
}

.header-icon {
  width: 24px;
  height: 24px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--color-text-muted);
  cursor: pointer;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.04);
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-glass);
}

.avatar-preview-container {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  flex-shrink: 0;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-berry);
  box-shadow: 0 4px 12px rgba(216, 30, 91, 0.25);
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--gradient-berry);
  color: white;
  font-weight: 800;
  font-family: var(--font-heading);
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border-soft);
}

.avatar-upload-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.avatar-upload-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.avatar-btn-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-upload {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-remove-avatar {
  background: rgba(216, 30, 91, 0.15);
  color: var(--color-pink-vivid);
  border: 1px solid rgba(216, 30, 91, 0.3);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-icon-sm {
  width: 16px;
  height: 16px;
}

.upload-hint {
  font-size: 0.76rem;
  color: var(--color-text-dim);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.form-input, .form-select {
  background: var(--color-bg-input);
  color: var(--color-text-main);
  border: 1px solid var(--border-soft);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 0.9rem;
  outline: none;
}

.form-input:focus, .form-select:focus {
  border-color: var(--color-berry);
  box-shadow: 0 0 0 3px var(--color-berry-glow);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  border-top: 1px solid var(--border-glass);
  padding-top: 16px;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
