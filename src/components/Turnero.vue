<template>
  <div class="turnero-container animate-fade-in">
    <!-- Hero Banner on Dashboard -->
    <div class="dashboard-hero-banner">
      <div class="hero-logo-header">
        <div class="brand-logo-container">
          <span class="brand-logo-br">BR</span>
          <span class="brand-logo-events">Events</span>
        </div>

        <!-- Year Switcher (2026 / 2027) -->
        <div class="year-switcher">
          <span class="year-label">Año:</span>
          <div class="year-buttons">
            <button 
              :class="['year-btn', { active: selectedYear === 2026 }]"
              @click="selectedYear = 2026"
            >
              2026
            </button>
            <button 
              :class="['year-btn', { active: selectedYear === 2027 }]"
              @click="selectedYear = 2027"
            >
              2027
            </button>
          </div>
        </div>
      </div>

      <div class="hero-content">
        <h2 class="hero-welcome-title">
          ¡Hola, {{ store.currentUser ? store.currentUser.name : 'Amiga' }}!
        </h2>
        <p class="hero-welcome-subtitle">
          Tablero interactivo de organizadoras para el año {{ selectedYear }}. Cada amiga se postula para su mes y define la temática de su reunión.
        </p>
      </div>

      <!-- Quick Filter Pills -->
      <div class="filter-pills">
        <button 
          v-for="filter in filters" 
          :key="filter.id"
          :class="['filter-btn', { active: currentFilter === filter.id }]"
          @click="currentFilter = filter.id"
        >
          {{ filter.label }} ({{ getFilterCount(filter.id) }})
        </button>
      </div>
    </div>

    <!-- Months Grid (Hides past months of current year) -->
    <div class="months-grid">
      <div 
        v-for="month in filteredMonths" 
        :key="month.id"
        :class="['month-card', 'glass-card', month.status]"
      >
        <!-- Card Header Cover Image -->
        <div class="card-cover" :style="{ backgroundImage: month.image ? `url(${month.image})` : 'none' }">
          <div class="cover-overlay">
            <span class="month-number">#{{ month.id < 10 ? '0' + month.id : month.id }}</span>
            <span :class="getStatusBadgeClass(month.status)">
              <component :is="getStatusIcon(month.status)" class="badge-icon-sm" />
              {{ getStatusText(month.status) }}
            </span>
          </div>
        </div>

        <!-- Card Details -->
        <div class="card-body">
          <h3 class="month-title">{{ month.name }} {{ selectedYear }}</h3>
          
          <p class="theme-text" v-if="month.theme">
            <Sparkles class="inline-icon" /> {{ month.theme }}
          </p>
          <p class="theme-placeholder" v-else>
            <Sparkles class="inline-icon" /> Temática a definir por la organizadora
          </p>

          <!-- Organizer Info -->
          <div class="organizer-info" v-if="month.organizerName">
            <div class="organizer-avatar">
              <User class="user-icon" />
            </div>
            <div>
              <span class="organizer-label">Organizadora:</span>
              <strong class="organizer-name">{{ month.organizerName }}</strong>
            </div>
          </div>

          <div class="unassigned-box" v-else>
            <CalendarCheck class="unassigned-icon" />
            <span>Mes disponible para postulación</span>
          </div>

          <!-- Actions -->
          <div class="card-footer">
            <button 
              v-if="!month.organizerId"
              class="btn-primary btn-full"
              @click="openPostulateModal(month)"
            >
              <HeartHandshake class="btn-icon" />
              <span>Postularme para {{ month.name }}</span>
            </button>

            <button 
              v-else
              class="btn-emerald btn-full"
              @click="selectMonthEvent(month)"
            >
              <Sparkles class="btn-icon" />
              <span>Ver Evento (Organiza {{ month.organizerName }})</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Postulation -->
    <div v-if="selectedMonthForPostulate" class="modal-overlay" @click.self="selectedMonthForPostulate = null">
      <div class="modal-card glass-card animate-fade-in">
        <div class="modal-header">
          <h3>Postularme para organizar {{ selectedMonthForPostulate.name }} {{ selectedYear }}</h3>
          <button @click="selectedMonthForPostulate = null" class="btn-close" aria-label="Cerrar">
            <X class="btn-icon-sm" />
          </button>
        </div>

        <form @submit.prevent="submitPostulation" class="postulate-form">
          <div class="form-group">
            <label>Nombre o Temática de la Reunión</label>
            <input 
              v-model="postulateForm.theme" 
              type="text" 
              placeholder="Ej. Noche Retro, BBQ Sunset, Cata de Vinos" 
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Imagen Temática (Opcional)</label>
            <div class="image-upload-wrapper">
              <input 
                type="file" 
                ref="fileInputRef" 
                accept="image/*" 
                @change="handleFileUpload" 
                style="display: none;" 
              />
              <div v-if="!postulateForm.image" class="upload-trigger" @click="triggerFileInput">
                <Upload class="upload-icon" />
                <span>{{ isUploading ? 'Subiendo imagen...' : 'Subir imagen desde tu dispositivo' }}</span>
              </div>
              <div v-else class="image-preview-container">
                <img :src="postulateForm.image" alt="Vista previa de temática" class="image-preview" />
                <button type="button" @click="removeImage" class="btn-remove-image" title="Eliminar imagen">
                  <Trash2 class="btn-icon-sm" /> Quitar imagen
                </button>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="selectedMonthForPostulate = null" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="isUploading">
              {{ isUploading ? 'Subiendo...' : 'Confirmar Postulación' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { store } from '../lib/supabase.js'
import { toast } from '../lib/toast.js'
import confetti from 'canvas-confetti'
import { CalendarCheck, HeartHandshake, Sparkles, User, Check, CheckCircle2, Clock, Upload, Trash2, X } from 'lucide-vue-next'

const emit = defineEmits(['view-active-event'])

const selectMonthEvent = (month) => {
  store.currentEvent.organizer = month.organizerName || 'Sin Asignar'
  store.currentEvent.organizerId = month.organizerId || null
  store.currentEvent.title = month.theme ? month.theme : `Evento de ${month.name}`
  if (month.image) store.currentEvent.banner = month.image
  store.currentEvent.monthId = month.id
  store.currentEvent.status = month.status || 'upcoming'
  emit('view-active-event')
}

const selectedYear = ref(2026)
const currentFilter = ref('all')
const selectedMonthForPostulate = ref(null)
const fileInputRef = ref(null)
const isUploading = ref(false)

const postulateForm = reactive({
  theme: '',
  image: ''
})

const filters = [
  { id: 'all', label: 'Meses Disponibles' },
  { id: 'unassigned', label: 'Sin Asignar' },
  { id: 'assigned', label: 'Asignados' }
]

// Date check to filter out past months of the current year
const now = new Date()
const currentYearNum = now.getFullYear()
const currentMonthNum = now.getMonth() + 1 // 1-indexed (August = 8)

const availableMonthsForYear = computed(() => {
  let list = store.months
  // If current year (2026), filter out past months (months prior to current month)
  if (selectedYear.value === currentYearNum) {
    list = list.filter(m => m.id >= currentMonthNum)
  }
  return list
})

const filteredMonths = computed(() => {
  const list = availableMonthsForYear.value
  if (currentFilter.value === 'unassigned') {
    return list.filter(m => !m.organizerId)
  }
  if (currentFilter.value === 'assigned') {
    return list.filter(m => m.organizerId)
  }
  return list
})

const getFilterCount = (filterId) => {
  const list = availableMonthsForYear.value
  if (filterId === 'unassigned') return list.filter(m => !m.organizerId).length
  if (filterId === 'assigned') return list.filter(m => m.organizerId).length
  return list.length
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'completed': return 'badge-emerald'
    case 'active': return 'badge-berry'
    case 'upcoming': return 'badge-berry'
    default: return 'badge-gray'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed': return CheckCircle2
    case 'active': return Sparkles
    case 'upcoming': return Clock
    default: return CalendarCheck
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'completed': return 'Realizado'
    case 'active': return 'En Curso'
    case 'upcoming': return 'Confirmado'
    default: return 'Disponible'
  }
}

const openPostulateModal = (month) => {
  selectedMonthForPostulate.value = month
  postulateForm.theme = ''
  postulateForm.image = ''
  isUploading.value = false
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  isUploading.value = true
  try {
    const uploadedUrl = await store.uploadImage(file)
    if (uploadedUrl) {
      postulateForm.image = uploadedUrl
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        postulateForm.image = e.target.result
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

const removeImage = () => {
  postulateForm.image = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const submitPostulation = () => {
  if (selectedMonthForPostulate.value && postulateForm.theme) {
    store.claimMonthWithDetails(
      selectedMonthForPostulate.value.id, 
      postulateForm.theme, 
      postulateForm.image
    )
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#D81E5B', '#2A9D8F', '#FF69B4']
    })
    toast.success(`¡Te has registrado como organizadora de ${selectedMonthForPostulate.value.name} ${selectedYear.value}!`)
    selectedMonthForPostulate.value = null
  }
}
</script>

<style scoped>
.turnero-container {
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Year Switcher */
.year-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-bg-input);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-soft);
}

.year-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.year-buttons {
  display: flex;
  gap: 4px;
}

.year-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.year-btn.active {
  background: var(--gradient-berry);
  color: white;
  box-shadow: 0 2px 8px rgba(216, 30, 91, 0.4);
}

.filter-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.filter-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-soft);
  color: var(--color-text-muted);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-family: var(--font-heading);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn.active {
  background: var(--gradient-berry);
  color: white;
  border-color: transparent;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(216, 30, 91, 0.3);
}

/* Grid */
.months-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.month-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card-cover {
  height: 120px;
  background-size: cover;
  background-position: center;
  background-color: var(--color-bg-input);
  position: relative;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(18,17,26,0.9) 100%);
  padding: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.month-number {
  color: white;
  font-family: var(--font-heading);
  font-weight: 900;
  font-size: 1.4rem;
}

.badge-icon-sm {
  width: 12px;
  height: 12px;
}

.card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
}

.month-title {
  font-size: 1.25rem;
}

.theme-text {
  font-size: 0.88rem;
  color: var(--color-berry);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.theme-placeholder {
  font-size: 0.82rem;
  color: var(--color-text-dim);
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 6px;
}

.inline-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.organizer-info {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(216, 30, 91, 0.08);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
}

.organizer-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--gradient-berry);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-icon {
  width: 16px;
  height: 16px;
}

.organizer-label {
  display: block;
  font-size: 0.72rem;
  color: var(--color-text-dim);
}

.organizer-name {
  font-size: 0.85rem;
  color: var(--color-text-main);
}

.unassigned-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(42, 157, 143, 0.1);
  color: #3BCEAC;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  font-weight: 600;
}

.unassigned-icon {
  width: 18px;
  height: 18px;
}

.card-footer {
  margin-top: auto;
  padding-top: 8px;
}

.btn-full {
  width: 100%;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.assigned-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #3BCEAC;
  font-weight: 600;
  padding: 6px;
}

/* Modal */
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

.modal-card {
  width: 100%;
  max-width: 480px;
  padding: 24px;
  background: var(--color-bg-card);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.postulate-form {
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

.form-input {
  background: var(--color-bg-input);
  color: var(--color-text-main);
  border: 1px solid var(--border-soft);
  padding: 10px 14px;
  border-radius: var(--radius-md);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.image-upload-wrapper {
  margin-top: 4px;
}

.upload-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  background: var(--color-bg-input);
  border: 1px dashed var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 0.88rem;
  transition: all 0.2s ease;
}

.upload-trigger:hover {
  border-color: var(--color-berry);
  color: var(--color-text-main);
  background: rgba(216, 30, 91, 0.05);
}

.upload-icon {
  width: 18px;
  height: 18px;
  color: var(--color-berry);
}

.image-preview-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.image-preview {
  width: 100%;
  max-height: 160px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
}

.btn-remove-image {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 6px 12px;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-remove-image:hover {
  background: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
}
</style>
