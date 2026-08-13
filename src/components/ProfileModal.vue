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
        <!-- Avatar Preview Header -->
        <div class="avatar-section">
          <img :src="form.avatar || store.currentUser.avatar" alt="Avatar" class="avatar-preview" />
          <div class="avatar-input-box">
            <label>URL Foto de Perfil</label>
            <input v-model="form.avatar" type="url" placeholder="https://..." class="form-input" />
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

          <!-- Edad -->
          <div class="form-group">
            <label>Edad</label>
            <input v-model.number="form.age" type="number" min="15" max="100" required class="form-input" />
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
            <select v-model="form.province" required class="form-select">
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
            <input v-model="form.canton" type="text" placeholder="Ej. Escazú, Montes de Oca" required class="form-input" />
          </div>

          <!-- Distrito -->
          <div class="form-group">
            <label>Distrito</label>
            <input v-model="form.district" type="text" placeholder="Ej. San Rafael, San Pedro" required class="form-input" />
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
import { reactive } from 'vue'
import { store } from '../lib/supabase.js'
import { User, Save } from 'lucide-vue-next'

const emit = defineEmits(['close'])

const form = reactive({
  name: store.currentUser.name || '',
  email: store.currentUser.email || '',
  phone: store.currentUser.phone || '',
  shirtSize: store.currentUser.shirtSize || 'M',
  avatar: store.currentUser.avatar || '',
  age: store.currentUser.age || 25,
  province: store.currentUser.province || 'San José',
  canton: store.currentUser.canton || '',
  district: store.currentUser.district || ''
})

const saveProfile = () => {
  store.updateUserProfile(form)
  alert('¡Tu perfil de amiga ha sido actualizado correctamente!')
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
  padding: 14px;
  border-radius: var(--radius-md);
}

.avatar-preview {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-berry);
}

.avatar-input-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.avatar-input-box label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
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
