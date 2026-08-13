<template>
  <div class="event-card-container animate-fade-in">
    <!-- Active Event Hero Banner -->
    <div class="event-hero glass-card">
      <div class="banner-image" :style="{ backgroundImage: `url(${event.banner})` }">
        <div class="banner-overlay">
          <span class="badge-berry">
            <Sparkles class="badge-icon" /> Evento del Mes: Agosto
          </span>
          <h1 class="event-title">{{ event.title }}</h1>
        </div>
      </div>

      <div class="event-hero-body">
        <div class="organizer-header">
          <img :src="event.organizerAvatar" alt="Organizadora" class="organizer-img" />
          <div>
            <span class="organized-by">Organizado por</span>
            <strong class="organizer-name">{{ event.organizer }}</strong>
          </div>
        </div>

        <p class="event-description">{{ event.description }}</p>

        <!-- Confirmed Date Banner -->
        <div v-if="winningOption" class="winning-date-banner">
          <Trophy class="icon-trophy" />
          <div>
            <strong class="winning-label">Fecha Ganadora Confirmada:</strong>
            <p class="winning-text">{{ winningOption.dateText }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 2 Column Layout -->
    <div class="event-grid">
      <!-- Left Column: Voting & Calendar Sync -->
      <div class="left-col">
        <!-- Date Voting Module -->
        <div class="module-card glass-card">
          <div class="module-header">
            <Vote class="module-icon" />
            <h3>Encuesta & Votación de Fecha</h3>
          </div>
          
          <p class="poll-question">{{ event.poll.question }}</p>

          <div class="poll-options">
            <div 
              v-for="opt in event.poll.options" 
              :key="opt.id"
              :class="['poll-option', { voted: hasVoted(opt.id), winner: isWinner(opt.id) }]"
              @click="vote(opt.id)"
            >
              <div class="option-header">
                <div class="option-title">
                  <span class="radio-indicator"></span>
                  <strong>{{ opt.dateText }}</strong>
                </div>
                <span class="vote-count">{{ opt.votes.length }} votos</span>
              </div>

              <!-- Vote Bar -->
              <div class="vote-bar-bg">
                <div class="vote-bar-fill" :style="{ width: getPercentage(opt.votes.length) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Location & Calendar Sync Card -->
        <div class="module-card glass-card">
          <div class="module-header">
            <MapPin class="module-icon" />
            <h3>Ubicación & Calendario</h3>
          </div>

          <p class="location-text">
            <MapPin class="inline-icon" /> <strong>Lugar:</strong> {{ event.location }}
          </p>

          <div class="action-buttons-group">
            <a :href="event.mapsUrl" target="_blank" class="btn-secondary">
              <Navigation class="btn-icon" />
              <span>Google Maps</span>
            </a>

            <a :href="event.wazeUrl" target="_blank" class="btn-secondary">
              <Compass class="btn-icon" />
              <span>Waze</span>
            </a>

            <button @click="addToCalendar" class="btn-emerald">
              <CalendarPlus class="btn-icon" />
              <span>Agregar a mi Calendario</span>
            </button>
          </div>
        </div>

        <!-- Event Reviews & Ratings Module -->
        <EventReviews />
      </div>

      <!-- Right Column: Logistics, Carpooling & Checklist -->
      <div class="right-col">
        <!-- Checklist: Quién lleva qué (Organizer Configurable) -->
        <div class="module-card glass-card">
          <div class="module-header space-between">
            <div class="flex-align">
              <CheckSquare class="module-icon" />
              <h3>Lista de Compras del Evento</h3>
            </div>

            <!-- Toggle switch for organizer -->
            <button 
              v-if="store.currentUser.name === event.organizer"
              @click="store.toggleEventChecklistVisibility()"
              class="toggle-btn"
              :title="event.showChecklist ? 'Ocultar lista pública' : 'Mostrar lista pública'"
            >
              {{ event.showChecklist ? 'Pública ✓' : 'Lista Interna' }}
            </button>
          </div>

          <div v-if="event.showChecklist" class="checklist-items">
            <div 
              v-for="item in event.checklist" 
              :key="item.id"
              :class="['checklist-item', { completed: item.completed }]"
              @click="toggleChecklist(item.id)"
            >
              <input type="checkbox" :checked="item.completed" readOnly class="checkbox" />
              <div class="item-info">
                <span class="item-name">{{ item.item }}</span>
                <span class="item-assignee">Encargada: <strong>{{ item.assignedTo }}</strong></span>
              </div>
            </div>
          </div>

          <div v-else class="private-checklist-msg">
            <Lock class="lock-icon" />
            <p>La organizadora configuró la lista de compras como lista interna de trabajo.</p>
          </div>
        </div>

        <!-- Carpooling & Logistics -->
        <div class="module-card glass-card">
          <div class="module-header">
            <Car class="module-icon" />
            <h3>Coordinación de Transporte / Carpooling</h3>
          </div>

          <div class="carpool-cards">
            <div v-for="car in event.carpooling" :key="car.id" class="carpool-card">
              <div class="carpool-header">
                <div>
                  <strong class="driver-name"><Car class="inline-icon" /> {{ car.driver }}</strong>
                  <span class="car-model">{{ car.carModel }}</span>
                </div>
                <span class="badge-berry">
                  {{ car.seats - car.passengers.length }} / {{ car.seats }} lugares libres
                </span>
              </div>

              <div class="carpool-details">
                <p><MapPin class="inline-icon" /> <strong>Ruta / Zona:</strong> {{ car.pickupArea }}</p>
                <div class="passengers-list">
                  <span>Pasajeras en el auto:</span>
                  <div class="passenger-chips">
                    <span v-for="p in car.passengers" :key="p" class="passenger-chip">
                      <User class="chip-icon" /> {{ p }}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                v-if="car.passengers.length < car.seats && !car.passengers.includes(store.currentUser.name)"
                class="btn-secondary btn-full"
                @click="joinCarpool(car.id)"
              >
                <UserCheck class="btn-icon" />
                <span>Apartar mi lugar en este auto</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { store } from '../lib/supabase.js'
import EventReviews from './EventReviews.vue'
import confetti from 'canvas-confetti'
import { Vote, Trophy, MapPin, Navigation, Compass, CalendarPlus, CheckSquare, Car, Sparkles, User, UserCheck, Lock } from 'lucide-vue-next'

const event = computed(() => store.currentEvent)

const totalVotes = computed(() => {
  return event.value.poll.options.reduce((acc, opt) => acc + opt.votes.length, 0)
})

const winningOption = computed(() => {
  if (totalVotes.value === 0) return null
  return [...event.value.poll.options].sort((a, b) => b.votes.length - a.votes.length)[0]
})

const getPercentage = (count) => {
  if (totalVotes.value === 0) return 0
  return Math.round((count / totalVotes.value) * 100)
}

const hasVoted = (optionId) => {
  const opt = event.value.poll.options.find(o => o.id === optionId)
  return opt ? opt.votes.includes(store.currentUser.id) : false
}

const isWinner = (optionId) => {
  return winningOption.value && winningOption.value.id === optionId
}

const vote = (optionId) => {
  store.voteDate(optionId)
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#D81E5B', '#2A9D8F', '#FF69B4']
  })
}

const toggleChecklist = (itemId) => {
  store.toggleChecklist(itemId)
}

const joinCarpool = (carId) => {
  store.joinCarpool(carId)
  alert('¡Te has registrado en el auto!')
}

const addToCalendar = () => {
  const title = encodeURIComponent(event.value.title)
  const details = encodeURIComponent(event.value.description)
  const location = encodeURIComponent(event.value.location)
  
  const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`
  
  const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BR Events//NONSGML Event//ES
BEGIN:VEVENT
SUMMARY:${event.value.title}
DESCRIPTION:${event.value.description}
LOCATION:${event.value.location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'evento_br.ics')
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

.winning-date-banner {
  background: var(--color-emerald-light);
  border: 1px solid var(--color-emerald);
  padding: 14px 18px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 14px;
}

.icon-trophy {
  width: 28px;
  height: 28px;
  color: #3BCEAC;
}

.winning-label {
  color: #3BCEAC;
  font-size: 0.85rem;
}

.winning-text {
  color: var(--color-text-main);
  font-weight: 700;
  font-size: 1.05rem;
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

.toggle-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-soft);
  color: var(--color-text-muted);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  cursor: pointer;
}

.module-icon {
  width: 22px;
  height: 22px;
}

.badge-icon {
  width: 12px;
  height: 12px;
}

/* Poll */
.poll-question {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text-main);
}

.poll-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.poll-option {
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  cursor: pointer;
  background: var(--color-bg-input);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.poll-option:hover {
  border-color: var(--color-berry);
}

.poll-option.voted {
  border-color: var(--color-berry);
  background: rgba(216, 30, 91, 0.15);
}

.poll-option.winner {
  border-color: var(--color-emerald);
}

.option-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
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
  background: var(--gradient-brand);
  transition: width 0.3s ease;
}

.poll-option.winner .vote-bar-fill {
  background: var(--gradient-emerald);
}

/* Location */
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

/* Checklist */
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
  cursor: pointer;
  transition: all 0.2s ease;
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
}

.item-name {
  font-size: 0.92rem;
  font-weight: 600;
}

.item-assignee {
  font-size: 0.78rem;
  color: var(--color-text-dim);
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
}

.car-model {
  display: block;
  font-size: 0.8rem;
  color: var(--color-text-dim);
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

@media (max-width: 768px) {
  .event-grid {
    grid-template-columns: 1fr;
  }
}
</style>
