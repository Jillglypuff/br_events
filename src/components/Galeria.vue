<template>
  <div class="galeria-container animate-fade-in">
    <!-- Header -->
    <div class="galeria-header glass-card">
      <div class="header-info">
        <span class="badge-berry">
          <Image class="badge-icon" /> Álbum de Fotos Compartido
        </span>
        <h2>Galería de Recuerdos BR</h2>
        <p>Espacio exclusivo por evento donde todas suben sus fotos y recuerdos.</p>
      </div>

      <button @click="showUploadModal = true" class="btn-primary">
        <UploadCloud class="btn-icon" />
        <span>Subir Fotos</span>
      </button>
    </div>

    <!-- Photos Grid -->
    <div class="photos-grid">
      <template v-for="(photo, index) in store.photos" :key="photo.id">
        <div 
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
              <Download class="icon-sm" /> Descargar
            </button>
          </div>
        </div>

        <!-- Ad Banner inserted every 4 photos -->
        <div v-if="(index + 1) % 4 === 0" :key="`ad-${index}`" class="photo-grid-ad-full">
          <AdBanner location="galeria" @open-request-modal="showAdRequestModal = true" />
        </div>
      </template>

      <!-- Ad Banner when fewer than 4 photos exist -->
      <div v-if="store.photos.length < 4" class="photo-grid-ad-full">
        <AdBanner location="galeria" @open-request-modal="showAdRequestModal = true" />
      </div>

      <div v-if="store.photos.length === 0" class="empty-gallery">
        <Image class="empty-icon" />
        <p>No hay fotos en el álbum todavía. ¡Sé la primera en compartir recuerdos!</p>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <div v-if="selectedPhoto" class="lightbox-overlay" @click="selectedPhoto = null">
      <div class="lightbox-content animate-fade-in" @click.stop>
        <button class="lightbox-close" @click="selectedPhoto = null">✕</button>
        <img :src="selectedPhoto.url" alt="Foto Evento" class="lightbox-img" />
        
        <div class="lightbox-bar">
          <div class="lightbox-meta">
            <strong>Foto subida por {{ selectedPhoto.uploader }}</strong>
            <span>{{ selectedPhoto.date }}</span>
          </div>

          <button @click="downloadPhoto(selectedPhoto)" class="btn-emerald">
            <Download class="btn-icon" />
            <span>Descargar Foto</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Upload Modal (File Picker for Multiple Photos) -->
    <div v-if="showUploadModal" class="modal-overlay" @click.self="showUploadModal = false">
      <div class="modal-card glass-card animate-fade-in">
        <div class="modal-header">
          <h3>Subir Fotos al Álbum</h3>
          <button @click="showUploadModal = false" class="btn-close">✕</button>
        </div>

        <div class="modal-form">
          <div class="form-group">
            <label>Seleccionar Archivos de Foto (puedes elegir varias fotos a la vez)</label>
            <div class="file-upload-dropzone" @click="triggerFileInput">
              <UploadCloud class="dropzone-icon" />
              <span>{{ isUploading ? 'Subiendo fotos...' : 'Haz clic para seleccionar fotos desde tu dispositivo' }}</span>
              <input 
                type="file" 
                ref="fileInputRef" 
                multiple 
                accept="image/*" 
                @change="handleFileUpload" 
                style="display: none;" 
              />
            </div>
          </div>

          <div v-if="selectedFilePreviews.length > 0" class="previews-container">
            <span>Vista previa ({{ selectedFilePreviews.length }} fotos):</span>
            <div class="previews-grid">
              <img 
                v-for="(img, idx) in selectedFilePreviews" 
                :key="idx" 
                :src="img" 
                class="preview-thumb"
              />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showUploadModal = false" class="btn-secondary">Cancelar</button>
            <button 
              type="button" 
              @click="confirmUploadPhotos" 
              class="btn-emerald" 
              :disabled="selectedFilePreviews.length === 0 || isUploading"
            >
              {{ isUploading ? 'Guardando...' : 'Publicar Fotos' }}
            </button>
          </div>
        </div>
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
import { ref } from 'vue'
import { store } from '../lib/supabase.js'
import { toast } from '../lib/toast.js'
import { UploadCloud, Download, Image, User } from 'lucide-vue-next'
import AdBanner from './AdBanner.vue'
import AdRequestModal from './AdRequestModal.vue'

const showUploadModal = ref(false)
const showAdRequestModal = ref(false)
const selectedPhoto = ref(null)
const fileInputRef = ref(null)
const isUploading = ref(false)
const selectedFilePreviews = ref([])
const pendingFiles = ref([])

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileUpload = async (event) => {
  const files = Array.from(event.target.files || [])
  if (files.length === 0) return

  pendingFiles.value = files
  selectedFilePreviews.value = []

  const promises = files.map(file => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.readAsDataURL(file)
    })
  })

  selectedFilePreviews.value = await Promise.all(promises)
}

const confirmUploadPhotos = async () => {
  if (pendingFiles.value.length === 0 && selectedFilePreviews.value.length === 0) return

  isUploading.value = true
  try {
    const totalCount = pendingFiles.value.length
    for (let i = 0; i < totalCount; i++) {
      const file = pendingFiles.value[i]
      const previewDataUrl = selectedFilePreviews.value[i]
      
      let finalUrl = null
      try {
        finalUrl = await store.uploadImage(file)
      } catch (e) {
        console.warn('Upload image err:', e)
      }

      if (!finalUrl && previewDataUrl) {
        finalUrl = previewDataUrl
      }

      if (finalUrl) {
        await store.addPhoto(finalUrl)
      }
    }

    toast.success(`¡${totalCount} ${totalCount === 1 ? 'foto publicada' : 'fotos publicadas'} exitosamente!`)
    showUploadModal.value = false
    pendingFiles.value = []
    selectedFilePreviews.value = []
  } catch (err) {
    console.error('Error al subir fotos:', err)
    toast.error('Ocurrió un problema al subir las fotos.')
  } finally {
    isUploading.value = false
  }
}

const openLightbox = (photo) => {
  selectedPhoto.value = photo
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

.empty-gallery {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: var(--color-text-dim);
  font-style: italic;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.empty-icon {
  width: 40px;
  height: 40px;
}

/* Photos Grid */
.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

.photo-grid-ad-full {
  grid-column: 1 / -1;
  width: 100%;
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

/* Modal Dropzone */
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

.file-upload-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  background: var(--color-bg-input);
  border: 2px dashed var(--border-soft);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-muted);
  text-align: center;
  transition: all 0.2s ease;
}

.file-upload-dropzone:hover {
  border-color: var(--color-berry);
  color: var(--color-text-main);
  background: rgba(216, 30, 91, 0.05);
}

.dropzone-icon {
  width: 36px;
  height: 36px;
  color: var(--color-berry);
}

.previews-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.previews-container span {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.previews-grid {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.preview-thumb {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid var(--border-soft);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}
</style>
