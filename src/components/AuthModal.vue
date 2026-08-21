<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="auth-modal-card glass-card animate-fade-in">
      <div class="modal-header">
        <div class="brand-logo-container">
          <span class="brand-logo-br">BR</span>
          <span class="brand-logo-events">Events</span>
        </div>
        <button @click="$emit('close')" class="btn-close">✕</button>
      </div>

      <!-- Auth Mode Switcher -->
      <div class="auth-tabs">
        <button 
          :class="['auth-tab', { active: authMode === 'login' }]"
          @click="authMode = 'login'"
        >
          Iniciar Sesión
        </button>
        <button 
          :class="['auth-tab', { active: authMode === 'register' }]"
          @click="authMode = 'register'"
        >
          Registrarme
        </button>
      </div>

      <!-- Login Form -->
      <form v-if="authMode === 'login'" @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label>Correo Electrónico</label>
          <input v-model="loginForm.email" type="email" placeholder="amiga@brevents.cr" required class="form-input" />
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <input v-model="loginForm.password" type="password" placeholder="••••••••" required class="form-input" />
        </div>

        <button type="submit" class="btn-primary btn-full">
          <LogIn class="btn-icon" />
          <span>Ingresar a mi Cuenta</span>
        </button>
      </form>

      <!-- Register Form -->
      <form v-else @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label>Nombre Completo</label>
          <input v-model="registerForm.name" type="text" placeholder="Ej. Mariana Jiménez" required class="form-input" />
        </div>

        <div class="form-group">
          <label>Correo Electrónico</label>
          <input v-model="registerForm.email" type="email" placeholder="mariana@brevents.cr" required class="form-input" />
        </div>

        <div class="form-group">
          <label>Número Celular</label>
          <input v-model="registerForm.phone" type="tel" placeholder="+506 8888-8888" required class="form-input" />
        </div>

        <div class="form-group">
          <label>Talla de Camisa</label>
          <select v-model="registerForm.shirtSize" required class="form-select">
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <input v-model="registerForm.password" type="password" placeholder="••••••••" required class="form-input" />
        </div>

        <button type="submit" class="btn-emerald btn-full">
          <UserPlus class="btn-icon" />
          <span>Crear mi Cuenta de Amiga</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { store } from '../lib/supabase.js'
import { toast } from '../lib/toast.js'
import { LogIn, UserPlus } from 'lucide-vue-next'

const emit = defineEmits(['close', 'auth-success'])

const authMode = ref('login')

const loginForm = reactive({
  email: '',
  password: ''
})

const registerForm = reactive({
  name: '',
  email: '',
  phone: '',
  shirtSize: 'M',
  password: ''
})

const handleLogin = () => {
  if (loginForm.email) {
    store.login(loginForm.email, loginForm.password)
    toast.success(`¡Bienvenida a BR Events, ${store.currentUser.name}!`)
    emit('auth-success')
    emit('close')
  }
}

const handleRegister = async () => {
  if (registerForm.name && registerForm.email) {
    await store.register(registerForm)
    toast.success(`¡Cuenta creada con éxito! Bienvenida a BR Events, ${registerForm.name}.`)
    emit('auth-success')
    emit('close')
  }
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

.auth-modal-card {
  width: 100%;
  max-width: 440px;
  padding: 28px;
  background: var(--color-bg-card);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--color-text-muted);
  cursor: pointer;
}

.auth-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-glass);
  margin-bottom: 20px;
}

.auth-tab {
  flex: 1;
  background: none;
  border: none;
  color: var(--color-text-muted);
  padding: 10px;
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.auth-tab.active {
  color: var(--color-berry);
  border-bottom-color: var(--color-berry);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.form-input, .form-select {
  background: var(--color-bg-input);
  color: var(--color-text-main);
  border: 1px solid var(--border-soft);
  padding: 10px 14px;
  border-radius: var(--radius-md);
}

.btn-full {
  width: 100%;
  justify-content: center;
  text-align: center;
}
</style>
