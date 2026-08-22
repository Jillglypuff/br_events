import { ref, computed } from 'vue'

const STORAGE_KEY = 'br_events_theme'

// 'system' | 'dark' | 'light'
export const themePreference = ref(localStorage.getItem(STORAGE_KEY) || 'system')

// Reactive system dark preference
const systemIsDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

// Compute resolved theme: 'dark' | 'light'
export const activeTheme = computed(() => {
  if (themePreference.value === 'system') {
    return systemIsDark.value ? 'dark' : 'light'
  }
  return themePreference.value
})

const applyTheme = () => {
  const theme = activeTheme.value
  document.documentElement.setAttribute('data-theme', theme)
  
  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#12111A' : '#F4F6F9')
  }
}

// Set theme preference and persist
export const setThemePreference = (mode) => {
  themePreference.value = mode
  if (mode === 'system') {
    localStorage.removeItem(STORAGE_KEY)
  } else {
    localStorage.setItem(STORAGE_KEY, mode)
  }
  applyTheme()
}

// Initialize theme state & listeners
export const initTheme = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleMediaChange = (e) => {
    systemIsDark.value = e.matches
    if (themePreference.value === 'system') {
      applyTheme()
    }
  }

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleMediaChange)
  } else {
    mediaQuery.addListener(handleMediaChange)
  }

  applyTheme()
}
