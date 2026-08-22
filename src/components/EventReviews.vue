<template>
  <!-- Card de reseña SOLAMENTE se renderiza el día del evento al finalizar (status === 'completed') -->
  <div v-if="isEventCompleted" class="reviews-module glass-card animate-fade-in">
    <div class="module-header space-between">
      <div class="flex-align">
        <Star class="module-icon text-gold" />
        <h3>Reseñas & Opiniones Anónimas</h3>
      </div>

      <button @click="showAddModal = true" class="btn-emerald btn-sm">
        <MessageSquarePlus class="btn-icon" />
        <span>Escribir Reseña Anónima</span>
      </button>
    </div>

    <!-- Rating Summary Bar -->
    <div class="rating-summary-box">
      <div class="score-display">
        <strong class="score-number">{{ averageRating }}</strong>
        <div class="stars-row">
          <Star 
            v-for="i in 5" 
            :key="i" 
            :class="['star-icon-sm', { filled: i <= Math.round(averageRating) }]" 
          />
        </div>
        <span class="reviews-count">({{ reviewsList.length }} reseñas)</span>
      </div>
    </div>

    <!-- Reviews List (Anonymous Display) -->
    <div class="reviews-list">
      <div v-for="rev in reviewsList" :key="rev.id" class="review-item">
        <div class="review-header">
          <div class="author-info">
            <div class="anonymous-avatar">
              <User class="icon-user-sm" />
            </div>
            <div>
              <strong class="author-name">Amiga Anónima</strong>
              <small class="review-date">{{ rev.date }}</small>
            </div>
          </div>

          <div class="stars-row">
            <Star 
              v-for="i in 5" 
              :key="i" 
              :class="['star-icon-sm', { filled: i <= rev.rating }]" 
            />
          </div>
        </div>

        <p class="review-comment">"{{ rev.comment }}"</p>
      </div>

      <div v-if="reviewsList.length === 0" class="empty-reviews">
        <p>No hay reseñas publicadas para este evento todavía.</p>
      </div>
    </div>

    <!-- Add Anonymous Review Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-card glass-card animate-fade-in">
        <div class="modal-header">
          <h3>Escribir Reseña Anónima del Evento</h3>
          <button @click="showAddModal = false" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="submitReview" class="modal-form">
          <p class="anon-disclaimer">
            <Lock class="icon-xs inline-icon" /> <strong>Reseña Anónima:</strong> Tu nombre e identidad no se mostrarán al publicar.
          </p>

          <div class="form-group">
            <label>Puntuación (1 a 5 Estrellas)</label>
            <div class="star-picker">
              <Star 
                v-for="i in 5" 
                :key="i" 
                :class="['star-picker-icon', { active: i <= newReview.rating }]"
                @click="newReview.rating = i"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Tu Opinión Anónima</label>
            <textarea 
              v-model="newReview.comment" 
              rows="3"
              placeholder="¿Qué te pareció la música, comida, temática y atención del evento?" 
              required
              class="form-textarea"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showAddModal = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-emerald">Publicar Reseña Anónima</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../lib/supabase.js'
import { Star, MessageSquarePlus, Lock, User } from 'lucide-vue-next'

const showAddModal = ref(false)

const newReview = ref({
  rating: 5,
  comment: ''
})

const isEventCompleted = computed(() => {
  return store.currentEvent?.status === 'completed'
})

const reviewsList = computed(() => store.reviews)

const averageRating = computed(() => {
  if (reviewsList.value.length === 0) return 5
  const sum = reviewsList.value.reduce((acc, r) => acc + r.rating, 0)
  return (sum / reviewsList.value.length).toFixed(1)
})

const submitReview = () => {
  if (newReview.value.comment) {
    store.addReview(newReview.value.rating, newReview.value.comment)
    showAddModal.value = false
    newReview.value = { rating: 5, comment: '' }
  }
}
</script>

<style scoped>
.reviews-module {
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

.text-gold {
  color: #F4A261;
}

.rating-summary-box {
  background: var(--color-bg-input);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.score-number {
  font-size: 1.6rem;
  font-family: var(--font-heading);
  color: var(--color-text-main);
}

.stars-row {
  display: flex;
  gap: 2px;
}

.star-icon-sm {
  width: 16px;
  height: 16px;
  color: rgba(255,255,255,0.2);
}

.star-icon-sm.filled {
  color: #F4A261;
  fill: #F4A261;
}

.reviews-count {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.btn-sm {
  padding: 6px 14px;
  font-size: 0.8rem;
}

/* Reviews List */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-item {
  background: var(--color-bg-input);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.anonymous-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-user-sm {
  width: 16px;
  height: 16px;
}

.author-name {
  font-size: 0.9rem;
  color: var(--color-text-main);
}

.review-date {
  display: block;
  font-size: 0.75rem;
  color: var(--color-text-dim);
}

.review-comment {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  font-style: italic;
}

.empty-reviews {
  font-size: 0.82rem;
  color: var(--color-text-dim);
  font-style: italic;
  padding: 10px;
}

.anon-disclaimer {
  background: rgba(42, 157, 143, 0.1);
  border: 1px solid rgba(42, 157, 143, 0.3);
  color: #3BCEAC;
  padding: 10px;
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.inline-icon {
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

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.star-picker {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.star-picker-icon {
  width: 28px;
  height: 28px;
  color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: transform 0.15s ease;
}

.star-picker-icon:hover {
  transform: scale(1.2);
}

.star-picker-icon.active {
  color: #F4A261;
  fill: #F4A261;
}

.form-textarea {
  background: var(--color-bg-input);
  color: var(--color-text-main);
  border: 1px solid var(--border-soft);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 0.9rem;
  outline: none;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}
</style>
