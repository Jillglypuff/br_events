<template>
  <div class="recap-container animate-fade-in">
    <!-- Hero Banner -->
    <div class="recap-hero glass-card">
      <div class="recap-badge">
        <Award class="icon-award" />
        <span>Recap & Recuerdos {{ currentYear }}</span>
      </div>
      <h2>Nuestros Momentos Especiales</h2>
      <p>Un recorrido por todos los eventos organizados durante el año y las estadísticas del grupo.</p>

      <div class="progress-box">
        <div class="progress-label">
          <span>Eventos Realizados este Año</span>
          <strong>{{ completedCount }} de 12 meses ({{ Math.round((completedCount/12)*100) }}%)</strong>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" :style="{ width: (completedCount/12)*100 + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Awards & Stats Grid -->
    <div class="awards-grid">
      <div class="award-card glass-card">
        <div class="award-icon-box crown">
          <Crown class="award-icon" />
        </div>
        <div class="award-details">
          <span class="award-title">Reina de la Organización</span>
          <strong class="award-winner">María Celeste</strong>
          <p class="award-desc">2 eventos organizados con éxito.</p>
        </div>
      </div>

      <div class="award-card glass-card">
        <div class="award-icon-box camera">
          <Camera class="award-icon" />
        </div>
        <div class="award-details">
          <span class="award-title">Fiesta con Más Fotos</span>
          <strong class="award-winner">Noche Tropical (Enero)</strong>
          <p class="award-desc">Más de 45 fotos compartidas en alta calidad.</p>
        </div>
      </div>

      <div class="award-card glass-card">
        <div class="award-icon-box star">
          <Sparkles class="award-icon" />
        </div>
        <div class="award-details">
          <span class="award-title">Asistencia Perfecta</span>
          <strong class="award-winner">Sofía & Laura</strong>
          <p class="award-desc">Presentes en el 100% de las reuniones del año.</p>
        </div>
      </div>
    </div>

    <!-- Timeline of Completed Events -->
    <div class="timeline-section glass-card">
      <h3>Línea de Tiempo de Eventos {{ currentYear }}</h3>

      <div class="timeline-items">
        <div 
          v-for="m in completedMonths" 
          :key="m.id"
          class="timeline-item"
        >
          <div class="timeline-dot">
            <CheckCircle2 class="dot-icon" />
          </div>

          <div class="timeline-content">
            <div class="timeline-header">
              <h4>{{ m.name }} — {{ m.theme }}</h4>
              <span class="badge-emerald">Concluido</span>
            </div>

            <p class="timeline-organizer">Organizado por <strong>{{ m.organizerName }}</strong></p>

            <div class="timeline-preview" v-if="m.image">
              <img :src="m.image" alt="Preview Evento" class="preview-img" />
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
import { Award, Crown, Camera, Sparkles, CheckCircle2 } from 'lucide-vue-next'

const currentYear = new Date().getFullYear()

const completedMonths = computed(() => {
  return store.months.filter(m => m.status === 'completed')
})

const completedCount = computed(() => completedMonths.value.length)
</script>

<style scoped>
.recap-container {
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.recap-hero {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recap-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(216, 30, 91, 0.15);
  color: var(--color-magenta-vivid);
  padding: 4px 14px;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 0.85rem;
  width: fit-content;
}

.icon-award {
  width: 16px;
  height: 16px;
}

.recap-hero h2 {
  font-size: 1.8rem;
}

.recap-hero p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.progress-box {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.progress-bar-bg {
  height: 10px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--gradient-brand);
  transition: width 0.4s ease;
}

/* Awards Grid */
.awards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}

.award-card {
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.award-icon-box {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.award-icon-box.crown {
  background: rgba(216, 30, 91, 0.2);
  color: var(--color-magenta-vivid);
}

.award-icon-box.camera {
  background: rgba(42, 157, 143, 0.2);
  color: #3BCEAC;
}

.award-icon-box.star {
  background: rgba(244, 162, 97, 0.2);
  color: #F4A261;
}

.award-icon {
  width: 24px;
  height: 24px;
}

.award-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.award-title {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.award-winner {
  font-size: 1.1rem;
  font-family: var(--font-heading);
  color: var(--color-text-main);
}

.award-desc {
  font-size: 0.82rem;
  color: var(--color-text-dim);
}

/* Timeline */
.timeline-section {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timeline-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
  padding-left: 20px;
}

.timeline-items::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background: var(--border-soft);
}

.timeline-item {
  position: relative;
  display: flex;
  gap: 16px;
}

.timeline-dot {
  position: absolute;
  left: -20px;
  top: 2px;
  background: var(--color-bg-main);
  border-radius: 50%;
  color: #3BCEAC;
}

.dot-icon {
  width: 20px;
  height: 20px;
}

.timeline-content {
  background: var(--color-bg-input);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  width: 100%;
  border: 1px solid var(--border-soft);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timeline-organizer {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.timeline-preview {
  margin-top: 6px;
}

.preview-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}
</style>
