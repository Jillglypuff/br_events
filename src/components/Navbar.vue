<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Logo: BR in bold white + events in custom multi-color gradient -->
      <div class="brand-logo-container" @click="$emit('open-landing')" style="cursor: pointer;">
        <span class="brand-logo-br">BR</span>
        <span class="brand-logo-events">Events</span>
      </div>

      <!-- Header Action Group -->
      <div class="header-actions">
        <!-- Landing Page Toggle Button -->
        <button @click="$emit('open-landing')" class="btn-ghost-sm" title="Ver Landing Page">
          <Globe class="btn-icon-sm" />
          <span class="desktop-only">Inicio</span>
        </button>

        <!-- Logged In User Avatar / Initials Button -->
        <template v-if="store.currentUser">
          <button @click="$emit('open-profile')" class="header-profile-btn" title="Mi Perfil">
            <img v-if="store.currentUser.avatar" :src="store.currentUser.avatar" alt="Avatar" class="header-avatar-img" />
            <div v-else class="header-initials-badge">
              {{ store.getInitials(store.currentUser.name) }}
            </div>
          </button>

          <button @click="logout" class="btn-ghost-sm" title="Cerrar Sesión">
            <LogOut class="btn-icon-sm" />
            <span class="desktop-only">Salir</span>
          </button>
        </template>

        <!-- Guest / Unauthenticated Login Button -->
        <template v-else>
          <button @click="$emit('open-auth')" class="btn-ghost-sm active" title="Iniciar Sesión / Registro">
            <LogIn class="btn-icon-sm" />
            <span>Acceso</span>
          </button>
        </template>
      </div>
    </div>

    <!-- PWA Install Prompt Banner -->
    <div v-if="showPwaBanner" class="pwa-install-banner animate-fade-in">
      <div class="pwa-info">
        <Smartphone class="pwa-icon" />
        <div>
          <strong>Instala BR Events en tu celular</strong>
          <p>Agrégala a la pantalla de inicio para acceso directo sin tiendas</p>
        </div>
      </div>
      <div class="pwa-actions">
        <button @click="installPwa" class="btn-emerald btn-sm">Instalar</button>
        <button @click="dismissPwa" class="btn-close">✕</button>
      </div>
    </div>

    <!-- Desktop Navigation Tabs -->
    <nav class="desktop-nav">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['nav-item', { active: activeTab === tab.id }]"
        @click="$emit('select-tab', tab.id)"
      >
        <component :is="tab.icon" class="nav-icon" />
        <span>{{ tab.label }}</span>
      </button>
    </nav>
  </header>

  <!-- Mobile Bottom Navigation Bar -->
  <nav class="mobile-bottom-nav">
    <button 
      v-for="tab in tabs" 
      :key="tab.id"
      :class="['mobile-nav-item', { active: activeTab === tab.id }]"
      @click="$emit('select-tab', tab.id)"
    >
      <component :is="tab.icon" class="mobile-nav-icon" />
      <span class="mobile-nav-label">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { store } from '../lib/supabase.js'
import ColonIcon from './ColonIcon.vue'
import { Calendar, Vote, Image, Award, Globe, LogIn, LogOut, Smartphone } from 'lucide-vue-next'

defineProps({
  activeTab: {
    type: String,
    default: 'turnero'
  }
})

const emit = defineEmits(['select-tab', 'open-profile', 'open-landing', 'open-auth'])

const tabs = [
  { id: 'turnero', label: 'Turnero', icon: Calendar },
  { id: 'evento', label: 'Evento', icon: Vote },
  { id: 'gastos', label: 'Gastos ₡', icon: ColonIcon },
  { id: 'galeria', label: 'Fotos HD', icon: Image },
  { id: 'recap', label: 'Recap', icon: Award }
]

const showPwaBanner = ref(true)
const deferredPrompt = ref(null)

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    showPwaBanner.value = true
  })
})

const logout = () => {
  store.logout()
  emit('open-landing')
}

const installPwa = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      showPwaBanner.value = false
    }
  } else {
    alert('Para instalar en iPhone/Android, toca "Compartir" en tu navegador y luego "Agregar a pantalla de inicio".')
    showPwaBanner.value = false
  }
}

const dismissPwa = () => {
  showPwaBanner.value = false
}
</script>

<style scoped>
.app-header {
  background: var(--color-bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-soft);
  color: white;
  padding: 14px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.header-content {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-ghost-sm {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-soft);
  color: var(--color-text-main);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-family: var(--font-heading);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-ghost-sm:hover, .btn-ghost-sm.active {
  background: var(--gradient-berry);
  color: white;
  border-color: transparent;
}

.btn-icon-sm {
  width: 15px;
  height: 15px;
}

/* Header Avatar / Initials ONLY (No full name text rendered) */
.header-profile-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.header-profile-btn:hover {
  transform: scale(1.08);
}

.header-avatar-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-berry);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.header-initials-badge {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gradient-berry);
  color: white;
  font-weight: 800;
  font-family: var(--font-heading);
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  border: 2px solid var(--border-soft);
}

/* PWA Banner */
.pwa-install-banner {
  background: var(--color-bg-input);
  color: var(--color-text-main);
  max-width: 1100px;
  margin: 10px auto 0;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-soft);
}

.pwa-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.82rem;
}

.pwa-icon {
  width: 24px;
  height: 24px;
  color: var(--color-berry);
}

.pwa-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-sm {
  padding: 6px 14px;
  font-size: 0.8rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: var(--color-text-muted);
  cursor: pointer;
}

/* Nav Desktop */
.desktop-nav {
  display: flex;
  gap: 8px;
  justify-content: center;
  max-width: 1100px;
  margin: 12px auto 0;
}

.nav-item {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: white;
}

.nav-item.active {
  background: var(--gradient-berry);
  color: white;
  box-shadow: 0 4px 12px rgba(216, 30, 91, 0.35);
}

.nav-icon {
  width: 18px;
  height: 18px;
}

/* Mobile Nav Bottom */
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(18, 17, 26, 0.96);
  backdrop-filter: blur(16px);
  border-top: 1px solid var(--border-soft);
  padding: 6px 12px 10px;
  z-index: 999;
  justify-content: space-around;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
}

.mobile-nav-item {
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.mobile-nav-item.active {
  color: var(--color-berry);
  font-weight: 700;
}

.mobile-nav-icon {
  width: 22px;
  height: 22px;
}

.mobile-nav-label {
  font-size: 0.72rem;
  font-family: var(--font-heading);
}

@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }
  .mobile-bottom-nav {
    display: flex;
  }
  .desktop-only {
    display: none;
  }
}
</style>
