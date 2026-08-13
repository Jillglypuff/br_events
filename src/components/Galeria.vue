<template>
  <div class="galeria-container animate-fade-in">
    <!-- Header -->
    <div class="galeria-header glass-card">
      <div class="header-info">
        <span class="badge-berry">
          <Image class="badge-icon" /> Álbum de Fotos Compartido
        </span>
        <h2>Galería de Recuerdos BR</h2>
        <p>Espacio exclusivo por evento donde todas suben sus fotos y las descargan en alta calidad.</p>
      </div>

      <button @click="showUploadModal = true" class="btn-primary">
        <UploadCloud class="btn-icon" />
        <span>Subir Foto HD</span>
      </button>
    </div>

    <!-- Photos Grid -->
    <div class="photos-grid">
      <div 
        v-for="photo in store.photos" 
        :key="photo.id" 
        class="photo-card glass-card"
        @click="openLightbox(photo)"
      >
        <img :src="photo.url" alt="Foto BR Event" class="photo-img" loading="lazy" />
        <div class="photo-overlay">
          <div class="photo-meta">
            <span class="uploader-name"><User class="inline-icon" /> {{ photo.uploader }}</span>
            <span class="photo-date">{{ photo.date }}</span>
          </div>
          <button class="download-btn-sm" @click.stop="downloadPhoto(photo)">
            <Download class="icon-sm" /> HD
          </button>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <div v-if="selectedPhoto" class="lightbox-overlay" @click="selectedPhoto = null">
      <div class="lightbox-content animate-fade-in" @click.stop>
        <button class="lightbox-close" @click="selectedPhoto = null">✕</button>
        <img :src="selectedPhoto.url" alt="Foto HD" class="lightbox-img" />
        
        <div class="lightbox-bar">
          <div class="lightbox-meta">
            <strong>Foto subida por {{ selectedPhoto.uploader }}</strong>
            <span>{{ selectedPhoto.date }}</span>
          </div>

          <button @click="downloadPhoto(selectedPhoto)" class="btn-emerald">
            <Download class="btn-icon" />
            <span>Descargar en Alta Calidad HD</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click.self="showUploadModal = false">
      <div class="modal-card glass-card animate-fade-in">
        <div class="modal-header">
          <h3>Subir Nueva Foto al Álbum</h3>
          <button @click="showUploadModal = false" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="uploadPhoto" class="modal-form">
          <div class="form-group">
            <label>Enlace / URL de la foto</label>
            <input 
              v-model="newPhotoUrl" 
              type="url" 
              placeholder="https://..." 
              required
              class="form-input"
            />
          </div>

          <div class="preset-photos">
            <span>Fotos sugeridas para probar:</span>
            <div class="preset-thumbnails">
              <img 
                v-for="(pUrl, idx) in presetPhotos" 
                :key="idx"
                :src="pUrl"
                @click="newPhotoUrl = pUrl"
                class="preset-thumb"
              />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showUploadModal = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Publicar Foto</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { store } from '../lib/supabase.js'
import { UploadCloud, Download, Image, User } from 'lucide-vue-next'

const showUploadModal = ref(false)
const selectedPhoto = ref(null)
const newPhotoUrl = ref('')

const presetPhotos = [
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800'
]

const openLightbox = (photo) => {
  selectedPhoto.value = photo
}

const uploadPhoto = () => {
  if (newPhotoUrl.value) {
    store.addPhoto(newPhotoUrl.value)
    showUploadModal.value = false
    newPhotoUrl.value = ''
  }
}

const downloadPhoto = (photo) => {
  const link = document.createElement('a')
  link.href = photo.url
  link.target = '_blank'
  link.download = `br_event_photo_${photo.id}.jpg`
  document.body.appendChild(link)
  link.click()
}
</script>

<style scoped>
.galeria-container {
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.galeria-header {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.header-info h2 {
  font-size: 1.8rem;
  margin-top: 6px;
}

.header-info p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.badge-icon {
  width: 12px;
  height: 12px;
}

/* Photos Grid */
.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

.photo-card {
  position: relative;
  height: 240px;
  overflow: hidden;
  border-radius: var(--radius-lg);
  cursor: pointer;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.photo-card:hover .photo-img {
  transform: scale(1.05);
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 40%, rgba(18,17,26,0.95) 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
  padding: 16px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.photo-card:hover .photo-overlay {
  opacity: 1;
}

.photo-meta {
  color: white;
  display: flex;
  flex-direction: column;
}

.uploader-name {
  font-weight: 700;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.inline-icon {
  width: 12px;
  height: 12px;
}

.photo-date {
  font-size: 0.75rem;
  opacity: 0.8;
}

.download-btn-sm {
  background: var(--gradient-emerald);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon-sm {
  width: 12px;
  height: 12px;
}

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.lightbox-content {
  max-width: 900px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.lightbox-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
}

.lightbox-img {
  max-height: 75vh;
  max-width: 100%;
  border-radius: var(--radius-md);
  object-fit: contain;
}

.lightbox-bar {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  color: white;
  background: rgba(255, 255, 255, 0.08);
  padding: 12px 20px;
  border-radius: var(--radius-md);
}

.lightbox-meta {
  display: flex;
  flex-direction: column;
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

.preset-photos {
  font-size: 0.82rem;
}

.preset-thumbnails {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.preset-thumb {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.preset-thumb:hover {
  border-color: var(--color-berry);
  transform: scale(1.05);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}
</style>
