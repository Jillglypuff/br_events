import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import { initTheme } from './lib/theme.js'

initTheme()

createApp(App).mount('#app')
