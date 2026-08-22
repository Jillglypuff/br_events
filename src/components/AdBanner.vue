<template>
  <div v-if="activeAd" class="ad-banner-wrapper animate-fade-in">
    <a 
      :href="activeAd.websiteUrl || '#'" 
      target="_blank" 
      rel="noopener noreferrer" 
      class="ad-banner-clickable-card glass-card"
      :title="`Visitar ${activeAd.businessName || 'patrocinador'}`"
    >
      <div class="ad-banner-media">
        <img :src="activeAd.bannerUrl" :alt="activeAd.businessName || 'Publicidad BR Events'" class="ad-banner-img" />
      </div>
    </a>
  </div>

  <!-- Fallback CTA Banner when no active ads for location -->
  <div v-else-if="showFallback" class="ad-banner-wrapper animate-fade-in">
    <div class="ad-fallback-card glass-card">
      <div class="fallback-content">
        <div class="fallback-icon-box">
          <Megaphone class="fallback-icon color-berry" />
        </div>
        <div class="fallback-text">
          <strong>¡Promociona tu Negocio o Marca en BR Events!</strong>
          <p>Llega a cientos de amigas y participantes activas en toda Costa Rica. Banner panorámico HD 1200x400 px.</p>
        </div>
      </div>
      <button @click="$emit('open-request-modal')" class="btn-emerald btn-sm">
        <span>¡Anúnciate con Nosotras!</span>
        <ExternalLink class="btn-icon" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { store } from '../lib/supabase.js'
import { Megaphone, ExternalLink } from 'lucide-vue-next'

const props = defineProps({
  location: {
    type: String,
    default: 'all'
  },
  showFallback: {
    type: Boolean,
    default: true
  }
})

defineEmits(['open-request-modal'])

const activeAd = computed(() => {
  if (!store.ads || store.ads.length === 0) return null
  const filtered = store.ads.filter(a => a.active && (a.location === 'all' || a.location === props.location))
  if (filtered.length === 0) return null
  // Return random or first active ad
  return filtered[0]
})
</script>

<style scoped>
.ad-banner-wrapper {
  width: 100%;
  margin: 20px 0;
  box-sizing: border-box;
}

.ad-banner-clickable-card {
  display: block;
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-md);
  background: var(--color-bg-card);
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.ad-banner-clickable-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg), 0 0 20px var(--color-berry-glow);
  border-color: var(--color-berry);
}

.ad-banner-media {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 1; /* 1200x400 px ratio */
  max-height: 380px;
  min-height: 140px;
  overflow: hidden;
}

.ad-banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.4s ease;
}

.ad-banner-clickable-card:hover .ad-banner-img {
  transform: scale(1.02);
}

.ad-banner-content {
  position: relative;
  z-index: 2;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 800px;
}

.ad-brand-name {
  font-size: 1.35rem;
  font-weight: 800;
  font-family: var(--font-heading);
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
}

.ad-description {
  font-size: 0.9rem;
  color: var(--color-text-main);
  line-height: 1.4;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ad-cta-btn {
  align-self: flex-start;
  margin-top: 6px;
}

.btn-icon {
  width: 14px;
  height: 14px;
}

/* Fallback Card Styles */
.ad-fallback-card {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border-soft);
  background: rgba(216, 30, 91, 0.05);
}

@media (max-width: 768px) {
  .ad-fallback-card {
    flex-direction: column;
    text-align: center;
  }
}

.fallback-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

@media (max-width: 480px) {
  .fallback-content {
    flex-direction: column;
  }
}

.fallback-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(216, 30, 91, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fallback-icon {
  width: 24px;
  height: 24px;
}

.fallback-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fallback-text strong {
  font-size: 0.95rem;
  color: var(--color-text-main);
}

.fallback-text p {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}
</style>
