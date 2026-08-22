<template>
  <div class="theme-switcher-container" ref="containerRef">
    <button 
      @click="toggleDropdown" 
      class="theme-btn" 
      :title="`Tema actual: ${currentLabel}`"
      aria-label="Cambiar tema"
    >
      <component :is="currentIcon" class="theme-btn-icon" />
    </button>

    <Transition name="fade-slide">
      <div v-if="isOpen" class="theme-dropdown glass-card">
        <div class="theme-dropdown-header">Tema</div>
        <button 
          v-for="option in options" 
          :key="option.value"
          @click="selectTheme(option.value)"
          :class="['theme-option-btn', { active: themePreference === option.value }]"
        >
          <div class="option-label-group">
            <component :is="option.icon" class="option-icon" />
            <span>{{ option.label }}</span>
          </div>
          <Check v-if="themePreference === option.value" class="check-icon" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Sun, Moon, Monitor, Check } from 'lucide-vue-next'
import { themePreference, setThemePreference } from '../lib/theme.js'

const isOpen = ref(false)
const containerRef = ref(null)

const options = [
  { value: 'system', label: 'Sistema', icon: Monitor },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'light', label: 'Claro', icon: Sun }
]

const currentIcon = computed(() => {
  if (themePreference.value === 'dark') return Moon
  if (themePreference.value === 'light') return Sun
  return Monitor
})

const currentLabel = computed(() => {
  const found = options.find(o => o.value === themePreference.value)
  return found ? found.label : 'Sistema'
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectTheme = (value) => {
  setThemePreference(value)
  isOpen.value = false
}

const handleClickOutside = (event) => {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.theme-switcher-container {
  position: relative;
  display: inline-block;
}

.theme-btn {
  background: var(--color-bg-input);
  border: 1px solid var(--border-soft);
  color: var(--color-text-main);
  width: 34px;
  height: 34px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.theme-btn:hover {
  background: rgba(216, 30, 91, 0.15);
  border-color: var(--color-berry);
  transform: scale(1.05);
}

.theme-btn-icon {
  width: 16px;
  height: 16px;
  color: var(--color-text-main);
}

.theme-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 150px;
  background: var(--color-bg-card);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  padding: 6px;
  z-index: 1000;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.theme-dropdown-header {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  padding: 6px 10px 4px;
}

.theme-option-btn {
  background: transparent;
  border: none;
  color: var(--color-text-main);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  transition: all 0.15s ease;
}

.theme-option-btn:hover {
  background: rgba(216, 30, 91, 0.12);
  color: var(--color-text-main);
}

.theme-option-btn.active {
  background: var(--color-emerald-light);
  color: var(--color-emerald);
  font-weight: 700;
}

.option-label-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-icon {
  width: 15px;
  height: 15px;
}

.check-icon {
  width: 14px;
  height: 14px;
  color: var(--color-emerald);
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.96);
}
</style>
