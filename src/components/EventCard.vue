<template>
  <div class="event-card-container animate-fade-in">
    <!-- Active Event Hero Banner -->
    <div class="event-hero glass-card">
      <div class="banner-image" :style="{ backgroundImage: `url(${event.banner})` }">
        <div class="banner-overlay">
          <span class="badge-berry">
            <Sparkles class="badge-icon" /> Evento del Mes
          </span>
          <h1 class="event-title">{{ event.title }}</h1>
        </div>
      </div>

      <div class="event-hero-body">
        <div class="organizer-header">
          <img v-if="event.organizerAvatar" :src="event.organizerAvatar" alt="Organizadora" class="organizer-img" />
          <div v-else class="organizer-initials">
            {{ store.getInitials(event.organizer) }}
          </div>
          <div>
            <span class="organized-by">Organizado por</span>
            <strong class="organizer-name">{{ event.organizer }}</strong>
          </div>
        </div>

        <p class="event-description">{{ event.description }}</p>

        <!-- Confirmed Date & Time Range Banner -->
        <div v-if="event.confirmedDate" class="confirmed-date-banner glass-card animate-fade-in">
          <div class="calendar-badge-icon">
            <CalendarCheck class="cal-icon" />
            <span class="cal-label">OFICIAL</span>
          </div>
          <div class="date-details">
            <span class="winning-label">📅 Fecha & Horario Oficial Confirmado:</span>
            <strong class="winning-text">{{ event.confirmedDate }}</strong>
            <span v-if="event.confirmedTime" class="winning-time">
              <Clock class="icon-xs" /> Horario: <strong>{{ event.confirmedTime }}</strong>
            </span>
          </div>
          <div class="date-actions">
            <button @click="addToCalendar" class="btn-emerald btn-sm">
              <CalendarPlus class="btn-icon-sm" />
              <span>Sincronizar Calendario</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Publicidad Banner Before RSVP Confirmation Card -->
    <AdBanner 
      location="evento" 
      @open-request-modal="showAdRequestModal = true" 
    />

    <!-- Attendance Confirmation RSVP Module (ONLY SHOWN WHEN CONFIRMED DATE EXISTS) -->
    <div v-if="event.confirmedDate" class="module-card glass-card rsvp-module animate-fade-in">
      <div class="module-header space-between">
        <div class="flex-align">
          <UserCheck class="module-icon" />
          <h3>Confirmación de Asistencia (RSVP)</h3>
        </div>
        <span class="badge-emerald">Fecha Confirmada ✓</span>
      </div>

      <p class="rsvp-subtitle">
        El evento ha sido fijado para el <strong>"{{ event.confirmedDate }}"</strong> ({{ event.confirmedTime || 'Horario por confirmar' }}). Confirma tu asistencia:
      </p>

      <!-- Action Buttons for Attendance (Sin emojis) -->
      <div class="rsvp-buttons">
        <button 
          :class="['rsvp-btn', 'btn-yes', { active: currentRSVP === 'confirmed' }]"
          @click="handleRSVP('confirmed')"
        >
          <CheckCircle2 class="btn-icon" />
          <span>¡Sí, Asistiré!</span>
        </button>

        <button 
          :class="['rsvp-btn', 'btn-maybe', { active: currentRSVP === 'maybe' }]"
          @click="handleRSVP('maybe')"
        >
          <HelpCircle class="btn-icon" />
          <span>Tal Vez</span>
        </button>

        <button 
          :class="['rsvp-btn', 'btn-no', { active: currentRSVP === 'declined' }]"
          @click="handleRSVP('declined')"
        >
          <XCircle class="btn-icon" />
          <span>No Podré</span>
        </button>
      </div>

      <!-- Attendees Summary List -->
      <div v-if="attendanceList.length > 0" class="rsvp-summary">
        <div class="rsvp-stat">
          <strong class="stat-count count-yes">{{ attendanceCounts.confirmed }}</strong>
          <span>Confirmadas</span>
        </div>
        <div class="rsvp-stat">
          <strong class="stat-count count-maybe">{{ attendanceCounts.maybe }}</strong>
          <span>Por confirmar</span>
        </div>
        <div class="rsvp-stat">
          <strong class="stat-count count-no">{{ attendanceCounts.declined }}</strong>
          <span>No asisten</span>
        </div>

        <div class="attendees-avatars">
          <div 
            v-for="att in attendanceList" 
            :key="att.userId" 
            :class="['attendee-chip', att.status]"
            :title="`${att.userName} (${att.status === 'confirmed' ? 'Asistirá' : att.status === 'declined' ? 'No asistirá' : 'Tal vez'})`"
          >
            <span class="att-name">{{ att.userName }}</span>
            <span class="att-status-tag">{{ att.status === 'confirmed' ? '✓' : att.status === 'declined' ? '✕' : '?' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2 Column Layout -->
    <div class="event-grid">
      <!-- Left Column: Encuestas del Evento & Ubicación -->
      <div class="left-col">
        <!-- Multi-Poll Module Header & Actions -->
        <div class="module-card glass-card">
          <div class="module-header space-between">
            <div class="flex-align">
              <Vote class="module-icon" />
              <h3>Encuestas del Evento</h3>
            </div>
            
            <!-- ONLY SHOW CREATE POLL BUTTON IF ORGANIZER -->
            <button 
              v-if="isOrganizer"
              @click="showCreatePollModal = true" 
              class="btn-primary btn-sm"
            >
              <Plus class="btn-icon-sm" />
              <span>Crear Encuesta</span>
            </button>
          </div>

          <!-- Empty Polls State -->
          <div v-if="polls.length === 0" class="empty-polls-box">
            <Vote class="empty-poll-icon" />
            <p>No hay encuestas creadas en este momento.</p>
            <button v-if="isOrganizer" @click="showCreatePollModal = true" class="btn-add-option-modern">
              <Plus class="btn-icon-sm" /> Crear la primera encuesta
            </button>
          </div>

          <!-- Poll List -->
          <div v-else class="polls-list">
            <div 
              v-for="p in polls" 
              :key="p.id"
              class="single-poll-card"
            >
              <div class="poll-header-row">
                <h4 class="poll-question-title">{{ p.question }}</h4>

                <button 
                  v-if="isOrganizer"
                  @click="deletePoll(p.id)"
                  class="btn-icon-only"
                  title="Eliminar encuesta"
                >
                  <Trash2 class="trash-icon" />
                </button>
              </div>

              <!-- Poll Options -->
              <div class="poll-options">
                <div 
                  v-for="opt in p.options" 
                  :key="opt.id"
                  :class="['poll-option', { voted: hasVotedInPoll(p.id, opt.id), winner: isWinnerOption(p, opt.id) }]"
                >
                  <div class="option-clickable" @click="votePoll(p.id, opt.id)">
                    <div class="option-header">
                      <div class="option-title">
                        <span class="radio-indicator"></span>
                        <strong>{{ opt.dateText }}</strong>
                      </div>
                      <span class="vote-count">{{ opt.votes.length }} {{ opt.votes.length === 1 ? 'voto' : 'votos' }}</span>
                    </div>

                    <!-- Vote Bar -->
                    <div class="vote-bar-bg">
                      <div class="vote-bar-fill" :style="{ width: getOptionPercentage(p, opt.votes.length) + '%' }"></div>
                    </div>
                  </div>

                  <!-- Organizer Date Selection Action (HIGH CONTRAST & LEGIBLE) -->
                  <div v-if="isOrganizer" class="organizer-option-action">
                    <button 
                      v-if="event.confirmedDate === opt.dateText"
                      class="btn-date-selected" 
                      disabled
                    >
                      <CheckCircle2 class="icon-sm" /> Fecha Oficial Fijada
                    </button>
                    <button 
                      v-else
                      @click.stop="openConfirmDateModal(opt.dateText)"
                      class="btn-confirm-date-high-contrast"
                    >
                      <CalendarCheck class="icon-sm" /> Fijar como Fecha Oficial
                    </button>
                  </div>
                </div>
              </div>

              <!-- Add Option Inline Form -->
              <div class="add-option-box">
                <div v-if="addingOptionPollId === p.id" class="add-option-inline">
                  <input 
                    v-model="newOptionInput"
                    type="text" 
                    placeholder="Escribe una nueva opción..."
                    class="form-input-sm"
                    @keyup.enter="submitAddOption(p.id)"
                  />
                  <button @click="submitAddOption(p.id)" class="btn-emerald btn-sm">Guardar</button>
                  <button @click="addingOptionPollId = null" class="btn-secondary btn-sm">✕</button>
                </div>

                <button 
                  v-else 
                  @click="openAddOption(p.id)"
                  class="btn-add-option-modern"
                >
                  <Plus class="btn-icon-sm" /> Añadir opción
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Location Module with Editable Card for Organizer & Clean Card for Members -->
        <div class="module-card glass-card">
          <div class="module-header space-between">
            <div class="flex-align">
              <MapPin class="module-icon" />
              <h3>Ubicación del Evento</h3>
            </div>

            <button 
              v-if="isOrganizer"
              @click="isEditingLocation = !isEditingLocation"
              class="btn-icon-only"
              title="Editar ubicación del evento"
            >
              <Edit3 class="icon-sm" />
            </button>
          </div>

          <!-- Location Edit Form (ONLY SHOWN TO ORGANIZER WHEN EDITING) -->
          <div v-if="isOrganizer && isEditingLocation" class="location-form animate-fade-in">
            <div class="form-group">
              <label>Nombre del Lugar / Dirección</label>
              <input 
                v-model="locationForm.location"
                type="text" 
                placeholder="Ej. Casa de Ana, Escazú"
                class="form-input-sm legible-input"
              />
            </div>

            <div class="form-group">
              <label>Enlace de Google Maps</label>
              <input 
                v-model="locationForm.mapsUrl"
                type="text" 
                placeholder="https://maps.google.com/..."
                class="form-input-sm legible-input"
              />
            </div>

            <div class="form-group">
              <label>Enlace de Waze (Opcional)</label>
              <input 
                v-model="locationForm.wazeUrl"
                type="text" 
                placeholder="https://waze.com/..."
                class="form-input-sm legible-input"
              />
            </div>

            <button @click="saveLocation" class="btn-emerald btn-sm btn-self-start">
              Guardar Ubicación
            </button>
          </div>

          <!-- Clean Informative Location Card for Members & Organizer -->
          <div v-else class="location-display">
            <p class="location-text">
              <MapPin class="inline-icon" /> <strong>Lugar:</strong> {{ event.location || 'Por definir por la organizadora' }}
            </p>

            <div class="action-buttons-group">
              <a 
                v-if="event.mapsUrl && event.mapsUrl.trim().length > 0" 
                :href="event.mapsUrl" 
                target="_blank" 
                class="btn-secondary"
              >
                <Navigation class="btn-icon" />
                <span>Google Maps</span>
              </a>

              <!-- CONDITIONAL WAZE BUTTON: ONLY IF PROVIDED -->
              <a 
                v-if="event.wazeUrl && event.wazeUrl.trim().length > 0" 
                :href="event.wazeUrl" 
                target="_blank" 
                class="btn-secondary"
              >
                <Compass class="btn-icon" />
                <span>Waze</span>
              </a>

              <button v-if="event.confirmedDate" @click="addToCalendar" class="btn-emerald">
                <CalendarPlus class="btn-icon" />
                <span>Agregar a mi Calendario</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Event Reviews (ONLY RENDERED ON COMPLETED EVENTS) -->
        <EventReviews />
      </div>

      <!-- Right Column: Logistics, Carpooling & Dynamic Checklist -->
      <div class="right-col">
        <!-- Checklist: Lista de Compras Dinámica (DEFAULT PRIVATE) -->
        <div class="module-card glass-card">
          <div class="module-header space-between">
            <div class="flex-align">
              <CheckSquare class="module-icon" />
              <h3>Lista de Compras del Evento</h3>
            </div>

            <!-- Organizer Toggle Button (Estandarizado y Moderno) -->
            <button 
              v-if="isOrganizer"
              @click="store.toggleEventChecklistVisibility()"
              class="btn-secondary btn-sm"
            >
              <Eye v-if="!event.showChecklist" class="btn-icon-sm" />
              <EyeOff v-else class="btn-icon-sm" />
              <span>{{ event.showChecklist ? 'Ocultar Lista' : 'Hacer Lista Pública' }}</span>
            </button>
          </div>

          <!-- Add Checklist Item Form (Visible to Organizer or if Public) -->
          <div v-if="event.showChecklist || isOrganizer" class="add-checklist-box">
            <div class="add-checklist-row">
              <input 
                v-model="newChecklistItemText"
                type="text" 
                placeholder="Añadir artículo a la lista..."
                class="form-input-sm legible-input"
                @keyup.enter="submitAddChecklist"
              />
              <button @click="submitAddChecklist" class="btn-emerald btn-sm" title="Agregar artículo">
                <Plus class="btn-icon-sm" />
              </button>
            </div>
          </div>

          <!-- Public Checklist Items -->
          <div v-if="event.showChecklist || isOrganizer" class="checklist-items">
            <div 
              v-for="item in event.checklist" 
              :key="item.id"
              :class="['checklist-item', { completed: item.completed }]"
            >
              <input 
                type="checkbox" 
                :checked="item.completed" 
                @change="toggleChecklist(item.id)" 
                class="checkbox" 
              />
              <div class="item-info" @click="toggleChecklist(item.id)">
                <span class="item-name">{{ item.item }}</span>
                <span class="item-assignee">Encargada: <strong>{{ item.assignedTo }}</strong></span>
              </div>
              <button v-if="isOrganizer" @click="deleteChecklistItem(item.id)" class="btn-remove-item" title="Eliminar">
                <Trash2 class="icon-sm" />
              </button>
            </div>

            <div v-if="!event.checklist || event.checklist.length === 0" class="empty-checklist">
              <p>No hay artículos en la lista todavía.</p>
            </div>
          </div>

          <div v-else class="private-checklist-msg">
            <Lock class="lock-icon" />
            <p>La organizadora mantiene la lista de compras privada.</p>
          </div>
        </div>

        <!-- Carpooling & Logistics Module with "+ Ofrecer mi auto" -->
        <div class="module-card glass-card">
          <div class="module-header space-between">
            <div class="flex-align">
              <Car class="module-icon" />
              <h3>Coordinación de Transporte / Carpooling</h3>
            </div>

            <!-- BUTTON FOR ANY USER TO OFFER RIDE -->
            <button 
              @click="showAddCarpoolModal = true"
              class="btn-emerald btn-sm"
            >
              <Plus class="btn-icon-sm" />
              <span>Ofrecer mi auto</span>
            </button>
          </div>

          <p class="section-desc">
            Si tienes espacio en tu vehículo, publica tu ruta y hora de salida para compartir viaje.
          </p>

          <div class="carpool-cards">
            <div v-for="car in event.carpooling" :key="car.id" class="carpool-card">
              <div class="carpool-header">
                <div>
                  <strong class="driver-name"><Car class="inline-icon" /> Conductora: {{ car.driver }}</strong>
                  <span class="car-time"><Clock class="inline-icon" /> Salida: {{ car.time }}</span>
                </div>
                <span class="badge-berry">
                  {{ car.seats - car.passengers.length }} / {{ car.seats }} espacios libres
                </span>
              </div>

              <div class="carpool-details">
                <p><MapPin class="inline-icon" /> <strong>Ruta / Punto de salida:</strong> {{ car.pickupArea }}</p>
                <div class="passengers-list">
                  <span>Pasajeras anotadas:</span>
                  <div v-if="car.passengers.length > 0" class="passenger-chips">
                    <span v-for="p in car.passengers" :key="p" class="passenger-chip">
                      <User class="chip-icon" /> {{ p }}
                    </span>
                  </div>
                  <small v-else class="no-passengers">Sin pasajeras aún</small>
                </div>
              </div>

              <button 
                v-if="store.currentUser && car.passengers.length < car.seats && !car.passengers.includes(store.currentUser.name)"
                class="btn-emerald btn-full"
                @click="joinCarpool(car.id)"
              >
                <UserCheck class="btn-icon" />
                <span>Anotarme en este auto</span>
              </button>
            </div>

            <div v-if="!event.carpooling || event.carpooling.length === 0" class="empty-carpool">
              <p>No hay rutas de auto ofrecidas aún. ¡Usa el botón "+ Ofrecer mi auto" para agregar la tuya!</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Crear Nueva Encuesta -->
    <div v-if="showCreatePollModal" class="modal-overlay" @click.self="showCreatePollModal = false">
      <div class="modal-card glass-card animate-fade-in">
        <div class="modal-header">
          <h3>Crear Nueva Encuesta</h3>
          <button @click="showCreatePollModal = false" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="submitCreatePoll" class="create-poll-form">
          <div class="form-group">
            <label>Pregunta o Título de la Encuesta</label>
            <input 
              v-model="newPollForm.question"
              type="text" 
              placeholder="Ej. ¿Qué fechas prefieres? / ¿Qué temática elegimos?"
              class="form-input legible-input" 
              required
            />
          </div>

          <div class="form-group">
            <label>Opciones de Respuesta</label>
            <div v-for="(opt, idx) in newPollForm.options" :key="idx" class="option-field-row">
              <input 
                v-model="newPollForm.options[idx]"
                type="text" 
                :placeholder="`Opción ${idx + 1}`"
                class="form-input legible-input" 
                required
              />
              <button 
                v-if="newPollForm.options.length > 2"
                type="button" 
                @click="removeOptionField(idx)"
                class="btn-remove-opt"
              >
                ✕
              </button>
            </div>

            <!-- Modern Emerald Frameless Button -->
            <button type="button" @click="addOptionField" class="btn-add-option-modern">
              <Plus class="btn-icon-sm" /> Añadir opción
            </button>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showCreatePollModal = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Crear Encuesta</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Confirmar Fecha Oficial & Rango de Horas -->
    <div v-if="showConfirmDateModal" class="modal-overlay" @click.self="showConfirmDateModal = false">
      <div class="modal-card glass-card animate-fade-in">
        <div class="modal-header">
          <h3>Fijar Fecha Oficial del Evento</h3>
          <button @click="showConfirmDateModal = false" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="submitConfirmDate" class="create-poll-form">
          <div class="form-group">
            <label>Fecha Oficial Seleccionada</label>
            <input v-model="confirmDateForm.dateText" type="text" readonly class="form-input readonly-input" />
          </div>

          <div class="form-group">
            <label>Rango de Horario del Evento</label>
            <input 
              v-model="confirmDateForm.timeRange" 
              type="text" 
              placeholder="Ej. 9:00 AM - 12:00 MD / 6:00 PM - 10:00 PM" 
              required
              class="form-input legible-input"
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="showConfirmDateModal = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-emerald">
              <CalendarCheck class="btn-icon-sm" /> Confirmar & Notificar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Ofrecer mi auto (Carpooling) -->
    <div v-if="showAddCarpoolModal" class="modal-overlay" @click.self="showAddCarpoolModal = false">
      <div class="modal-card glass-card animate-fade-in">
        <div class="modal-header">
          <h3>Ofrecer mi Auto (Carpooling)</h3>
          <button @click="showAddCarpoolModal = false" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="submitAddCarpool" class="create-poll-form">
          <div class="form-group">
            <label>Nombre de la Conductora</label>
            <input v-model="carpoolForm.driver" type="text" required class="form-input legible-input" />
          </div>

          <div class="form-group">
            <label>Ruta / Punto de Salida</label>
            <input 
              v-model="carpoolForm.pickupArea" 
              type="text" 
              placeholder="Ej. Concasa, Alajuela / San Pedro" 
              required 
              class="form-input legible-input"
            />
          </div>

          <div class="form-group">
            <label>Hora de Salida</label>
            <input 
              v-model="carpoolForm.time" 
              type="text" 
              placeholder="Ej. 5:00 AM / 6:30 PM" 
              required 
              class="form-input legible-input"
            />
          </div>

          <div class="form-group">
            <label>Lugares Disponibles</label>
            <input v-model.number="carpoolForm.seats" type="number" min="1" max="8" required class="form-input legible-input" />
          </div>

          <div class="modal-actions">
            <button type="button" @click="showAddCarpoolModal = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-emerald">Publicar Ruta</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Ad Request Modal -->
    <AdRequestModal 
      v-if="showAdRequestModal" 
      @close="showAdRequestModal = false" 
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { store } from '../lib/supabase.js'
import { toast } from '../lib/toast.js'
import EventReviews from './EventReviews.vue'
import AdBanner from './AdBanner.vue'
import AdRequestModal from './AdRequestModal.vue'
import confetti from 'canvas-confetti'
import { 
  Vote, MapPin, Navigation, Compass, CalendarPlus, CalendarCheck, CheckSquare, 
  Car, Sparkles, User, UserCheck, Lock, Plus, Trash2, CheckCircle2, Clock, Edit3,
  Eye, EyeOff, HelpCircle, XCircle 
} from 'lucide-vue-next'

const showAdRequestModal = ref(false)

onMounted(() => {
  store.ensurePollsInit()
})

const event = computed(() => store.currentEvent)

const isOrganizer = computed(() => {
  if (!store.currentUser) return false
  return store.currentUser.name === event.value.organizer || store.currentUser.role === 'admin'
})

// Polls
const polls = computed(() => {
  store.ensurePollsInit()
  return event.value.polls || []
})

const getOptionPercentage = (poll, count) => {
  const total = poll.options.reduce((acc, opt) => acc + opt.votes.length, 0)
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

const hasVotedInPoll = (pollId, optionId) => {
  if (!store.currentUser) return false
  const poll = polls.value.find(p => p.id === pollId)
  const opt = poll?.options.find(o => o.id === optionId)
  return opt ? opt.votes.includes(store.currentUser.id) : false
}

const isWinnerOption = (poll, optionId) => {
  const total = poll.options.reduce((acc, opt) => acc + opt.votes.length, 0)
  if (total === 0) return false
  const sorted = [...poll.options].sort((a, b) => b.votes.length - a.votes.length)
  return sorted[0]?.id === optionId && sorted[0]?.votes.length > 0
}

const votePoll = (pollId, optionId) => {
  store.votePoll(pollId, optionId)
  confetti({
    particleCount: 40,
    spread: 50,
    origin: { y: 0.7 },
    colors: ['#D81E5B', '#2A9D8F', '#FF69B4']
  })
}

// Organizer Date Confirmation Modal & Time Range
const showConfirmDateModal = ref(false)
const confirmDateForm = reactive({
  dateText: '',
  timeRange: '9:00 AM - 12:00 MD'
})

const openConfirmDateModal = (dateText) => {
  confirmDateForm.dateText = dateText
  confirmDateForm.timeRange = event.value.confirmedTime || '9:00 AM - 12:00 MD'
  showConfirmDateModal.value = true
}

const submitConfirmDate = () => {
  store.confirmEventDate(confirmDateForm.dateText, confirmDateForm.timeRange)
  showConfirmDateModal.value = false
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.5 },
    colors: ['#D81E5B', '#2A9D8F', '#FFD166']
  })
}

// Adding Options Inline
const addingOptionPollId = ref(null)
const newOptionInput = ref('')

const openAddOption = (pollId) => {
  addingOptionPollId.value = pollId
  newOptionInput.value = ''
}

const submitAddOption = (pollId) => {
  if (newOptionInput.value.trim()) {
    store.addPollOption(pollId, newOptionInput.value)
    addingOptionPollId.value = null
    newOptionInput.value = ''
  }
}

const deletePoll = (pollId) => {
  if (confirm('¿Eliminar esta encuesta?')) {
    store.deletePoll(pollId)
  }
}

// Modal Create Poll
const showCreatePollModal = ref(false)
const newPollForm = reactive({
  question: '',
  options: ['', '']
})

const addOptionField = () => {
  newPollForm.options.push('')
}

const removeOptionField = (idx) => {
  newPollForm.options.splice(idx, 1)
}

const submitCreatePoll = () => {
  if (newPollForm.question.trim()) {
    store.createPoll(newPollForm.question, newPollForm.options)
    showCreatePollModal.value = false
    newPollForm.question = ''
    newPollForm.options = ['', '']
  }
}

// Location Form (3 Inputs: Nombre, Maps, Waze)
const isEditingLocation = ref(false)
const locationForm = reactive({
  location: event.value.location || '',
  mapsUrl: event.value.mapsUrl || '',
  wazeUrl: event.value.wazeUrl || ''
})

const saveLocation = () => {
  store.updateEventLocation(locationForm.location, locationForm.mapsUrl, locationForm.wazeUrl)
  isEditingLocation.value = false
}

// Checklist Management
const newChecklistItemText = ref('')

const submitAddChecklist = () => {
  if (newChecklistItemText.value.trim()) {
    store.addChecklistItem(newChecklistItemText.value)
    newChecklistItemText.value = ''
  }
}

const deleteChecklistItem = (itemId) => {
  store.deleteChecklistItem(itemId)
}

// Carpooling Form
const showAddCarpoolModal = ref(false)
const carpoolForm = reactive({
  driver: store.currentUser?.name || '',
  pickupArea: '',
  time: '5:00 AM',
  seats: 4
})

const submitAddCarpool = () => {
  if (carpoolForm.pickupArea.trim()) {
    store.addCarpoolRoute(carpoolForm.driver, carpoolForm.pickupArea, carpoolForm.time, carpoolForm.seats)
    showAddCarpoolModal.value = false
    carpoolForm.pickupArea = ''
    carpoolForm.time = '5:00 AM'
  }
}

// RSVP Attendance
const currentRSVP = computed(() => {
  if (!store.currentUser) return null
  const record = (event.value.attendance || []).find(a => a.userId === store.currentUser.id)
  return record ? record.status : null
})

const attendanceList = computed(() => {
  return event.value.attendance || []
})

const attendanceCounts = computed(() => {
  const list = attendanceList.value
  return {
    confirmed: list.filter(a => a.status === 'confirmed').length,
    declined: list.filter(a => a.status === 'declined').length,
    maybe: list.filter(a => a.status === 'maybe').length
  }
})

const handleRSVP = (status) => {
  store.respondAttendance(status)
  if (status === 'confirmed') {
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } })
  }
}

const toggleChecklist = (itemId) => {
  store.toggleChecklist(itemId)
}

const joinCarpool = (carId) => {
  store.joinCarpool(carId)
}

const addToCalendar = () => {
  const currentEv = store.currentEvent
  const eventTitle = currentEv.title || 'Evento de Amigas BR'
  const eventLocation = currentEv.location || 'Ubicación por definir'
  const dateConfirmed = currentEv.confirmedDate || 'Fecha por confirmar'
  const timeConfirmed = currentEv.confirmedTime || 'Horario por confirmar'
  const organizerName = currentEv.organizer || 'Organizadora BR'

  const titleParam = encodeURIComponent(`${eventTitle} (Organizado por ${organizerName})`)
  const detailsParam = encodeURIComponent(`Reunión oficial de Amigas BR.\n\nOrganizado por: ${organizerName}\nFecha: ${dateConfirmed}\nHorario: ${timeConfirmed}\nUbicación: ${eventLocation}`)
  const locationParam = encodeURIComponent(eventLocation)

  const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titleParam}&details=${detailsParam}&location=${locationParam}`

  const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BR Events//Amigas BR//ES
BEGIN:VEVENT
SUMMARY:${eventTitle} - ${organizerName}
DESCRIPTION:Organizado por: ${organizerName}\\nFecha: ${dateConfirmed}\\nHorario: ${timeConfirmed}
LOCATION:${eventLocation}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `evento_${eventTitle.toLowerCase().replace(/\s+/g, '_')}.ics`)
  document.body.appendChild(link)
  link.click()

  window.open(gCalUrl, '_blank')
}
</script>

<style scoped>
.event-card-container {
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.event-hero {
  overflow: hidden;
}

.banner-image {
  height: 220px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(18,17,26,0.95) 100%);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
}

.event-title {
  color: white;
  font-size: 1.8rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
}

.event-hero-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.organizer-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.organizer-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-berry);
}

.organizer-initials {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--gradient-berry);
  color: white;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.organized-by {
  display: block;
  font-size: 0.8rem;
  color: var(--color-text-dim);
}

.organizer-name {
  font-size: 1.05rem;
  color: var(--color-text-main);
}

.event-description {
  color: var(--color-text-muted);
  font-size: 0.98rem;
  line-height: 1.6;
}

/* Confirmed Date Banner */
.confirmed-date-banner {
  background: linear-gradient(135deg, rgba(42, 157, 143, 0.2) 0%, rgba(216, 30, 91, 0.15) 100%);
  border: 1px solid var(--color-emerald);
  padding: 16px 20px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.calendar-badge-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--gradient-emerald);
  color: white;
  padding: 8px 14px;
  border-radius: var(--radius-md);
}

.cal-icon {
  width: 22px;
  height: 22px;
}

.cal-label {
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 1px;
}

.date-details {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.winning-label {
  color: var(--color-emerald);
  font-size: 0.85rem;
  font-weight: 600;
}

.winning-text {
  color: var(--color-text-main);
  font-weight: 800;
  font-size: 1.25rem;
}

.winning-time {
  font-size: 0.88rem;
  color: var(--color-pink-vivid);
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.icon-xs {
  width: 14px;
  height: 14px;
}

/* RSVP Module */
.rsvp-module {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-soft);
}

.rsvp-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.rsvp-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.rsvp-btn {
  flex: 1;
  min-width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: var(--radius-md);
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  border: 1px solid var(--border-soft);
  background: var(--color-bg-input);
  color: var(--color-text-main);
  transition: all 0.2s ease;
}

.rsvp-btn:hover {
  transform: translateY(-2px);
}

.rsvp-btn.btn-yes.active {
  background: var(--gradient-emerald);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(42, 157, 143, 0.4);
}

.rsvp-btn.btn-maybe.active {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
}

.rsvp-btn.btn-no.active {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
}

.rsvp-summary {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 6px;
  padding-top: 14px;
  border-top: 1px solid var(--border-glass);
  flex-wrap: wrap;
}

.rsvp-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.stat-count {
  font-size: 1.1rem;
  font-family: var(--font-heading);
}

.count-yes { color: var(--color-emerald); }
.count-maybe { color: #f59e0b; }
.count-no { color: #ef4444; }

.attendees-avatars {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-left: auto;
}

.attendee-chip {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.78rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid transparent;
}

.attendee-chip.confirmed {
  background: rgba(42, 157, 143, 0.15);
  color: #3BCEAC;
  border-color: rgba(42, 157, 143, 0.3);
}

.attendee-chip.maybe {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.3);
}

.attendee-chip.declined {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
}

/* Grid Layout */
.event-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.left-col, .right-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.module-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-berry);
}

.module-header.space-between {
  justify-content: space-between;
}

.flex-align {
  display: flex;
  align-items: center;
  gap: 10px;
}

.empty-polls-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed var(--border-soft);
  border-radius: var(--radius-md);
  color: var(--color-text-dim);
  text-align: center;
}

.empty-poll-icon {
  width: 32px;
  height: 32px;
  color: var(--color-text-dim);
}

/* Polls List */
.polls-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.single-poll-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.poll-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.poll-question-title {
  font-size: 0.98rem;
  color: var(--color-text-main);
  font-weight: 700;
}

.btn-icon-only {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--color-text-dim);
}

.btn-icon-only:hover {
  color: #ef4444;
}

.trash-icon {
  width: 16px;
  height: 16px;
}

.poll-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.poll-option {
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  background: var(--color-bg-input);
  transition: all 0.2s ease;
  overflow: hidden;
}

.option-clickable {
  padding: 12px 14px;
  cursor: pointer;
}

.poll-option:hover {
  border-color: var(--color-berry);
}

.poll-option.voted {
  border-color: var(--color-berry);
  background: rgba(216, 30, 91, 0.12);
}

.poll-option.winner {
  border-color: var(--color-emerald);
}

.option-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.radio-indicator {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--color-berry);
  margin-right: 8px;
}

.poll-option.voted .radio-indicator {
  background: var(--color-berry);
}

.vote-count {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.vote-bar-bg {
  height: 6px;
  background: rgba(255,255,255,0.08);
  border-radius: 3px;
  overflow: hidden;
}

.vote-bar-fill {
  height: 100%;
  background: var(--gradient-berry);
  transition: width 0.3s ease;
}

.poll-option.winner .vote-bar-fill {
  background: var(--gradient-emerald);
}

.organizer-option-action {
  padding: 8px 14px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px dashed var(--border-soft);
  display: flex;
  justify-content: flex-end;
}

/* HIGH CONTRAST SOLID EMERALD BUTTON FOR CONFIRMING DATE (REQUISITO 2) */
.btn-confirm-date-high-contrast {
  background: var(--gradient-emerald);
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 10px rgba(42, 157, 143, 0.4);
  transition: all 0.2s ease;
}

.btn-confirm-date-high-contrast:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 14px rgba(42, 157, 143, 0.6);
}

.btn-date-selected {
  background: var(--gradient-emerald);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.icon-sm {
  width: 14px;
  height: 14px;
}

.add-option-box {
  margin-top: 4px;
}

.add-option-inline {
  display: flex;
  gap: 8px;
}

.form-input-sm {
  flex: 1;
  background: var(--color-bg-input);
  color: white;
  border: 1px solid var(--border-soft);
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}

/* LEGIBLE PLACEHOLDERS (REQUISITO 3) */
.legible-input::placeholder, .form-input::placeholder {
  color: #9ca3af !important;
  opacity: 1;
}

.readonly-input {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Modern Emerald Frameless Button */
.btn-add-option-modern {
  background: none;
  border: none;
  color: #3BCEAC;
  font-weight: 700;
  font-size: 0.86rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  transition: all 0.2s ease;
}

.btn-add-option-modern:hover {
  color: #2A9D8F;
  text-decoration: underline;
}

/* Location Module */
.location-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(0, 0, 0, 0.15);
  padding: 14px;
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-soft);
}

.btn-self-start {
  align-self: flex-start;
  margin-top: 4px;
}

.location-display {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.location-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.inline-icon {
  width: 16px;
  height: 16px;
  color: var(--color-berry);
}

.action-buttons-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* Checklist Section */
.add-checklist-box {
  margin-bottom: 8px;
}

.add-checklist-row {
  display: flex;
  gap: 8px;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--color-bg-input);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-glass);
}

.checklist-item.completed {
  opacity: 0.5;
  text-decoration: line-through;
}

.checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--color-berry);
  cursor: pointer;
}

.item-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  cursor: pointer;
}

.item-name {
  font-size: 0.92rem;
  font-weight: 600;
}

.item-assignee {
  font-size: 0.78rem;
  color: var(--color-text-dim);
}

.btn-remove-item {
  background: none;
  border: none;
  color: var(--color-text-dim);
  cursor: pointer;
  padding: 4px;
}

.btn-remove-item:hover {
  color: #ef4444;
}

.empty-checklist, .empty-carpool {
  font-size: 0.82rem;
  color: var(--color-text-dim);
  font-style: italic;
}

.private-checklist-msg {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.03);
  padding: 14px;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.lock-icon {
  width: 20px;
  height: 20px;
  color: var(--color-berry);
}

/* Carpooling */
.section-desc {
  font-size: 0.84rem;
  color: var(--color-text-dim);
}

.carpool-cards {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.carpool-card {
  background: var(--color-bg-input);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.carpool-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.driver-name {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-main);
  font-size: 0.95rem;
}

.car-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: var(--color-emerald);
  font-weight: 600;
  margin-top: 2px;
}

.carpool-details p {
  font-size: 0.85rem;
}

.passengers-list {
  font-size: 0.8rem;
  margin-top: 6px;
  color: var(--color-text-muted);
}

.passenger-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.passenger-chip {
  background: rgba(216, 30, 91, 0.15);
  color: var(--color-pink-vivid);
  padding: 3px 8px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.no-passengers {
  display: block;
  font-size: 0.76rem;
  color: var(--color-text-dim);
  font-style: italic;
  margin-top: 2px;
}

.chip-icon {
  width: 12px;
  height: 12px;
}

.btn-full {
  width: 100%;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.btn-icon-sm {
  width: 14px;
  height: 14px;
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

.create-poll-form {
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

.option-field-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-remove-opt {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .event-grid {
    grid-template-columns: 1fr;
  }
}
</style>
