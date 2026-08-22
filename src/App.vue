<template>
  <div class="app-root">
    <!-- Main Content Area -->
    <main class="app-main app-max-container">
      <!-- Public Landing Page (Default Initial View) -->
      <LandingPage 
        v-if="showLanding"
        @open-auth="showAuthModal = true"
        @open-profile="showProfileModal = true"
        @enter-dashboard="showLanding = false"
      />

      <!-- App Dashboard Views (Visible after login / registration) -->
      <template v-else>
        <!-- Navbar Header & Navigation -->
        <Navbar 
          :active-tab="activeTab"
          @select-tab="handleSelectTab"
          @open-profile="showProfileModal = true"
          @open-landing="showLanding = true"
          @open-auth="showAuthModal = true"
        />

        <Turnero 
          v-if="activeTab === 'turnero'"
          @view-active-event="activeTab = 'evento'"
        />

        <EventCard 
          v-else-if="activeTab === 'evento'"
        />

        <Gastos 
          v-else-if="activeTab === 'gastos'"
        />

        <Galeria 
          v-else-if="activeTab === 'galeria'"
        />

        <Recap 
          v-else-if="activeTab === 'recap'"
        />

        <AdminPanel 
          v-else-if="activeTab === 'admin'"
        />
      </template>
    </main>

    <!-- Global Footer for Dashboard with Teji link -->
    <footer v-if="!showLanding" class="app-footer">
      <p>
        BR Events &copy; {{ new Date().getFullYear() }} — Desarrollado por 
        <a href="https://www.tejidev.com/" target="_blank" rel="noopener noreferrer" class="footer-link">Teji</a>
      </p>
    </footer>

    <!-- Profile Edit Modal -->
    <ProfileModal 
      v-if="showProfileModal"
      @close="showProfileModal = false"
    />

    <!-- Auth Login / Register Modal -->
    <AuthModal 
      v-if="showAuthModal"
      @close="showAuthModal = false"
      @auth-success="handleAuthSuccess"
    />

    <!-- Global Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navbar from './components/Navbar.vue'
import LandingPage from './components/LandingPage.vue'
import Turnero from './components/Turnero.vue'
import EventCard from './components/EventCard.vue'
import Gastos from './components/Gastos.vue'
import Galeria from './components/Galeria.vue'
import Recap from './components/Recap.vue'
import AdminPanel from './components/AdminPanel.vue'
import ProfileModal from './components/ProfileModal.vue'
import AuthModal from './components/AuthModal.vue'
import ToastContainer from './components/ToastContainer.vue'

// Landing Page is the DEFAULT initial view when opening the application
const showLanding = ref(true)
const showProfileModal = ref(false)
const showAuthModal = ref(false)
const activeTab = ref('turnero')

const handleAuthSuccess = () => {
  showLanding.value = false
  activeTab.value = 'turnero'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSelectTab = (tabId) => {
  showLanding.value = false
  activeTab.value = tabId
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  width: 100%;
}

.app-footer {
  text-align: center;
  padding: 24px;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  border-top: 1px solid var(--border-glass);
  margin-top: 40px;
}
</style>
