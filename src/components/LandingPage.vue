<template>
  <div class="landing-container animate-fade-in">
    <!-- Single Unified Hero & Manifiesto Card -->
    <section class="hero-unified-card glass-card" ref="heroRef">
      <div class="hero-glow-bg"></div>

      <!-- Top Header inside the single Hero Card -->
      <div class="hero-card-header">
        <div class="brand-logo-container">
          <span class="brand-logo-br">BR</span>
          <span class="brand-logo-events">Events</span>
        </div>
        <ThemeSwitcher />
      </div>

      <!-- Hero Main Content -->
      <div class="hero-card-body">
        <h1 class="hero-main-title">
          Más que un grupo, nuestro espacio seguro
        </h1>

        <div class="heart-icon-wrapper">
          <Heart class="title-heart-icon" />
        </div>

        <blockquote class="hero-quote">
          "No se trata de ser las más rápidas, ni de ser expertas en nada. Se trata de estar, de escucharnos y de movernos juntas."
        </blockquote>

        <button @click="$emit('open-auth')" class="btn-primary btn-hero">
          <span>INICIAR</span>
          <ArrowRight class="btn-icon" />
        </button>
      </div>
    </section>

    <!-- Sección Nuestra Esencia -->
    <section class="esencia-section" ref="esenciaRef">
      <h2 class="esencia-title">Nuestra Esencia:</h2>

      <div class="esencia-grid">
        <!-- Card 1: Compromiso & Lealtad -->
        <div class="esencia-card glass-card">
          <div class="esencia-icon-box">
            <HeartHandshake class="esencia-icon" />
          </div>
          <div class="esencia-content">
            <h3>Compromiso & Lealtad</h3>
            <p>Un pacto implícito de estar presentes mes a mes.</p>
          </div>
        </div>

        <!-- Card 2: Pasión por el Deporte -->
        <div class="esencia-card glass-card">
          <div class="esencia-icon-box">
            <Activity class="esencia-icon" />
          </div>
          <div class="esencia-content">
            <h3>Pasión por el Deporte</h3>
            <p>No importa el ritmo, nos mueve la energía de compartir.</p>
          </div>
        </div>

        <!-- Card 3: Escuchar sin Juzgar -->
        <div class="esencia-card glass-card">
          <div class="esencia-icon-box">
            <Heart class="esencia-icon" />
          </div>
          <div class="esencia-content">
            <h3>Escuchar sin Juzgar</h3>
            <p>Saber escuchar con el corazón abierto.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer: Desarrollado por Teji link -->
    <footer class="landing-footer">
      <p>
        BR Events &copy; {{ new Date().getFullYear() }} — Desarrollado por 
        <a href="https://www.tejidev.com/" target="_blank" rel="noopener noreferrer" class="footer-link">Teji</a>
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ArrowRight, Heart, HeartHandshake, Activity } from 'lucide-vue-next'
import ThemeSwitcher from './ThemeSwitcher.vue'

defineEmits(['open-auth'])

const heroRef = ref(null)
const esenciaRef = ref(null)

onMounted(() => {
  if (heroRef.value) {
    gsap.from(heroRef.value, {
      duration: 0.8,
      y: 30,
      opacity: 0,
      ease: 'power3.out'
    })
  }

  if (esenciaRef.value) {
    gsap.from(esenciaRef.value.querySelectorAll('.esencia-card'), {
      duration: 0.6,
      y: 20,
      opacity: 0,
      stagger: 0.15,
      delay: 0.3,
      ease: 'power2.out'
    })
  }
})
</script>

<style scoped>
.landing-container {
  width: 100%;
  max-width: 100%;
  padding: 32px 32px;
  display: flex;
  flex-direction: column;
  gap: 36px;
  box-sizing: border-box;
}

/* Single Unified Hero Card spanning full widescreen width */
.hero-unified-card {
  width: 100%;
  padding: 40px 48px 56px;
  text-align: center;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  border: 1px solid var(--border-soft);
  background: var(--gradient-dark-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  box-sizing: border-box;
}

.hero-glow-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  background: var(--color-berry);
  filter: blur(140px);
  opacity: 0.22;
  border-radius: 50%;
  pointer-events: none;
}

.hero-card-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-glass);
}

.hero-card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 1100px;
}

.hero-main-title {
  font-size: 2.8rem;
  line-height: 1.2;
  color: var(--color-text-main);
  width: 100%;
  max-width: 1000px;
  font-weight: 800;
}

.heart-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-heart-icon {
  width: 36px;
  height: 36px;
  color: var(--color-pink-vivid);
  fill: var(--color-pink-vivid);
}

.hero-quote {
  font-size: 1.25rem;
  font-style: italic;
  color: var(--color-text-muted);
  width: 100%;
  max-width: 900px;
  line-height: 1.6;
}

.btn-hero {
  padding: 16px 54px;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-top: 12px;
  box-shadow: 0 6px 26px rgba(216, 30, 91, 0.55);
}

.btn-icon {
  width: 20px;
  height: 20px;
}

/* Sección Nuestra Esencia */
.esencia-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.esencia-title {
  font-size: 1.6rem;
  color: var(--color-text-main);
}

.esencia-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.esencia-card {
  padding: 28px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.25s ease, border-color 0.25s ease;
  height: 100%;
}

.esencia-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-berry);
}

.esencia-icon-box {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(216, 30, 91, 0.15);
  color: var(--color-pink-vivid);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--border-soft);
}

.esencia-icon {
  width: 28px;
  height: 28px;
}

.esencia-content h3 {
  font-size: 1.2rem;
  margin-bottom: 6px;
}

.esencia-content p {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.landing-footer {
  text-align: center;
  font-size: 0.95rem;
  color: var(--color-text-dim);
  border-top: 1px solid var(--border-glass);
  padding-top: 28px;
  margin-top: 10px;
  width: 100%;
}

@media (max-width: 1024px) {
  .hero-main-title {
    font-size: 2.2rem;
  }
  .esencia-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
}

@media (max-width: 768px) {
  .landing-container {
    padding: 16px 12px;
  }
  .hero-unified-card {
    padding: 28px 16px 36px;
  }
  .hero-main-title {
    font-size: 1.8rem;
  }
  .hero-quote {
    font-size: 1rem;
  }
  .esencia-grid {
    grid-template-columns: 1fr;
  }
}
</style>
