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
        <!-- Notification Bell Button -->
        <div class="notifications-wrapper">
          <button 
            @click="showNotificationsPopover = !showNotificationsPopover" 
            class="btn-ghost-sm btn-bell-relative"
            title="Notificaciones"
          >
            <Bell class="btn-icon-sm" />
            <span v-if="unreadCount > 0" class="notif-badge-pill">{{ unreadCount }}</span>
          </button>

          <!-- Notifications Dropdown Popover -->
          <div v-if="showNotificationsPopover" class="notif-dropdown glass-card animate-fade-in">
            <div class="notif-header">
              <strong>Notificaciones ({{ store.notifications.length }})</strong>
              <button @click="showNotificationsPopover = false" class="btn-close-sm">✕</button>
            </div>

            <div v-if="store.notifications.length === 0" class="empty-notif">
              <p>No tienes notificaciones recientes.</p>
            </div>

            <div v-else class="notif-list">
              <div 
                v-for="n in store.notifications" 
                :key="n.id"
                :class="['notif-item', { unread: !n.read }]"
                @click="handleNotificationClick(n)"
              >
                <div class="notif-item-header">
                  <span class="notif-title">{{ stripEmojis(n.title) }}</span>
                  <span class="notif-time">{{ n.createdAt }}</span>
                </div>
                <p class="notif-message">{{ stripEmojis(n.message) }}</p>
              </div>
            </div>

            <div v-if="store.notifications.length > 0" class="notif-footer">
              <button @click="store.clearNotifications()" class="btn-clear-notif">
                Limpiar notificaciones
              </button>
            </div>
          </div>
        </div>

        <!-- Landing Page Toggle Button -->
        <button @click="$emit('open-landing')" class="btn-ghost-sm" title="Ver Landing Page">
          <Globe class="btn-icon-sm" />
          <span class="desktop-only">Inicio</span>
        </button>

        <!-- Theme Switcher Control -->
        <ThemeSwitcher />

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
import { ref, computed, onMounted } from 'vue'
import { store } from '../lib/supabase.js'
import { toast } from '../lib/toast.js'
import ColonIcon from './ColonIcon.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import { Calendar, Vote, Image, Award, Globe, LogIn, LogOut, Smartphone, Bell, ShieldCheck } from 'lucide-vue-next'

defineProps({
  activeTab: {
    type: String,
    default: 'turnero'
  }
})

const emit = defineEmits(['select-tab', 'open-profile', 'open-landing', 'open-auth'])

const showNotificationsPopover = ref(false)

const unreadCount = computed(() => {
  return store.notifications.filter(n => !n.read).length
})

const tabs = computed(() => {
  const list = [
    { id: 'turnero', label: 'Turnero', icon: Calendar },
    { id: 'evento', label: 'Evento', icon: Vote },
    { id: 'gastos', label: 'Gastos', icon: ColonIcon },
    { id: 'galeria', label: 'Fotos', icon: Image },
    { id: 'recap', label: 'Recap', icon: Award }
  ]

  const isAdmin = store.currentUser && (
    store.currentUser.role?.toLowerCase() === 'admin'
  )

  if (isAdmin) {
    list.push({ id: 'admin', label: 'Admin', icon: ShieldCheck })
  }

  return list
})

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

const stripEmojis = (str) => {
  if (!str) return ''
  return str.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, '').trim()
}

const handleNotificationClick = (n) => {
  store.markNotificationRead(n.id)
  emit('select-tab', 'evento')
  showNotificationsPopover.value = false
}

const installPwa = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      showPwaBanner.value = false
    }
  } else {
    toast.info('Para instalar en iPhone/Android, toca "Compartir" en tu navegador y luego "Agregar a pantalla de inicio".', 6000)
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
  max-width: 1400px;
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

.btn-bell-relative {
  position: relative;
}

.notif-badge-pill {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--gradient-berry);
  color: white;
  font-size: 0.65rem;
  font-weight: 900;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(216, 30, 91, 0.6);
  border: 1px solid var(--color-bg-card);
}

/* Notifications Popover */
.notifications-wrapper {
  position: relative;
}

.notif-dropdown {
  position: absolute;
  top: 42px;
  right: 0;
  width: 320px;
  max-height: 420px;
  background: var(--color-bg-card);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.notif-header {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-glass);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--color-berry);
}

.btn-close-sm {
  background: none;
  border: none;
  color: var(--color-text-dim);
  cursor: pointer;
  font-size: 0.9rem;
}

.empty-notif {
  padding: 24px;
  text-align: center;
  font-size: 0.82rem;
  color: var(--color-text-dim);
}

.notif-list {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 320px;
}

.notif-item {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-glass);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: background 0.2s ease;
}

.notif-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.notif-item.unread {
  background: rgba(216, 30, 91, 0.08);
  border-left: 3px solid var(--color-berry);
}

.notif-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notif-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.notif-time {
  font-size: 0.7rem;
  color: var(--color-text-dim);
}

.notif-message {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.notif-quick-rsvp {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rsvp-prompt {
  font-size: 0.72rem;
  color: var(--color-emerald);
  font-weight: 600;
}

.quick-rsvp-btns {
  display: flex;
  gap: 6px;
}

.btn-quick {
  flex: 1;
  padding: 4px 6px;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--border-soft);
  background: var(--color-bg-input);
  color: white;
}

.btn-q-yes:hover { background: var(--gradient-emerald); }
.btn-q-maybe:hover { background: #d97706; }
.btn-q-no:hover { background: #b91c1c; }

.notif-footer {
  padding: 8px;
  text-align: center;
  border-top: 1px solid var(--border-glass);
}

.btn-clear-notif {
  background: none;
  border: none;
  color: var(--color-text-dim);
  font-size: 0.75rem;
  cursor: pointer;
}

.btn-clear-notif:hover {
  color: var(--color-berry);
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

/* Header Avatar / Initials */
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
  background: rgba(42, 157, 143, 0.18);
  color: #3BCEAC;
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
  .app-header {
    padding: 8px 12px;
  }

  .header-content {
    gap: 8px;
  }

  .brand-logo-br, .brand-logo-events {
    font-size: 1.15rem;
  }

  .header-actions {
    gap: 6px;
  }

  .btn-ghost-sm {
    padding: 6px 8px;
    font-size: 0.78rem;
  }

  .header-avatar-img, .header-initials-badge {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .notif-dropdown {
    position: fixed;
    top: 54px;
    left: 12px;
    right: 12px;
    width: auto;
    max-height: 75vh;
  }

  .desktop-nav {
    display: none;
  }
  .mobile-bottom-nav {
    display: flex;
  }
  .desktop-only {
    display: none !important;
  }
}
</style>
