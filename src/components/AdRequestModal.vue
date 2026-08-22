<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card glass-card animate-fade-in">
      <div class="modal-header">
        <div>
          <h3><Megaphone class="header-icon color-berry" /> ¡Anúnciate en BR Events!</h3>
          <p class="subtitle-text">Completa los datos para solicitar la publicación de tu banner (1200x400 px)</p>
        </div>
        <button @click="$emit('close')" class="btn-close">✕</button>
      </div>

      <form @submit.prevent="submitAdRequest" class="admin-form">
        <div class="form-group">
          <label>Nombre del Negocio o Marca *</label>
          <input 
            v-model="adForm.businessName" 
            type="text" 
            placeholder="Ej. Boutique Tropical Fashion / Café Bella Vista" 
            required 
            class="form-input" 
          />
        </div>

        <div class="form-group">
          <label>Descripción de la Promoción o Negocio *</label>
          <textarea 
            v-model="adForm.description" 
            rows="3" 
            placeholder="Ej. Ropa deportiva y prendas exclusivas. ¡20% de descuento en tu primera compra con el código BREVENTS20!" 
            required 
            class="form-input"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Sitio Web o Redes Sociales (Instagram, Facebook, Web) *</label>
          <input 
            v-model="adForm.websiteUrl" 
            type="url" 
            placeholder="https://instagram.com/mi_marca" 
            required 
            class="form-input" 
          />
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <label>Fecha de Inicio *</label>
            <input 
              v-model="adForm.startDate" 
              type="date" 
              required 
              class="form-input" 
            />
          </div>

          <div class="form-group flex-1">
            <label>Fecha de Finalización *</label>
            <input 
              v-model="adForm.endDate" 
              type="date" 
              required 
              class="form-input" 
            />
          </div>
        </div>

        <!-- Banner Upload / URL -->
        <div class="form-group">
          <label>Banner Publicitario (Recomendado 1200x400 px)</label>

          <div class="banner-upload-box">
            <input 
              type="file" 
              accept="image/*" 
              ref="fileInputRef" 
              @change="handleFileUpload" 
              class="file-input-hidden" 
              id="banner-file"
            />

            <label for="banner-file" class="upload-dropzone">
              <UploadCloud class="upload-icon" />
              <span>Subir Imagen de Banner (1200x400)</span>
              <small>Formatos JPG, PNG, WEBP</small>
            </label>

            <div class="url-divider"><span>O ingresa el enlace URL de la imagen:</span></div>

            <input 
              v-model="adForm.bannerUrl" 
              type="url" 
              placeholder="https://midominio.com/banner-1200x400.jpg" 
              class="form-input" 
            />
          </div>

          <!-- Banner Preview -->
          <div v-if="adForm.bannerUrl" class="banner-preview-box">
            <small>Vista Previa del Banner (3:1):</small>
            <img :src="adForm.bannerUrl" alt="Vista previa del banner" class="banner-img-preview" />
          </div>
        </div>

        <!-- Términos y Condiciones de Publicidad -->
        <div class="terms-card">
          <div class="terms-header">
            <ShieldCheck class="terms-icon" />
            <span class="terms-title">Términos y Condiciones de Publicidad</span>
          </div>
          <ul class="terms-list">
            <li><strong>Derecho de Reserva:</strong> Nos reservamos el derecho exclusivo de aceptar, rechazar o dar de baja cualquier solicitud de publicidad.</li>
            <li><strong>Identidad Comunitaria:</strong> El contenido, producto o servicio anunciado debe estar alineado con la identidad, principios y valores de la comunidad BR Events.</li>
            <li><strong>Aprobación Previa:</strong> Toda solicitud requiere revisión y aprobación del equipo administrativo antes de ser publicada.</li>
          </ul>
          <label class="terms-checkbox-label">
            <input type="checkbox" v-model="acceptTerms" required class="terms-checkbox" />
            <span>Acepto los Términos y Condiciones de Publicidad</span>
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary">
            <span>Enviar Solicitud de Campaña</span>
            <Send class="btn-icon" />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { store } from '../lib/supabase.js'
import { toast } from '../lib/toast.js'
import { Megaphone, UploadCloud, Send, ShieldCheck } from 'lucide-vue-next'

const props = defineProps({
  isAdmin: {
    type: Boolean,
    default: false
  },
  adToEdit: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'submitted'])

const fileInputRef = ref(null)
const acceptTerms = ref(false)

const adForm = reactive({
  businessName: '',
  description: '',
  websiteUrl: '',
  bannerUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=1200&h=400&fit=crop',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  location: 'all',
  status: props.isAdmin ? 'approved' : 'pending',
  active: props.isAdmin ? true : false
})

onMounted(() => {
  if (props.adToEdit) {
    Object.assign(adForm, {
      businessName: props.adToEdit.businessName || '',
      description: props.adToEdit.description || '',
      websiteUrl: props.adToEdit.websiteUrl || '',
      bannerUrl: props.adToEdit.bannerUrl || '',
      startDate: props.adToEdit.startDate || new Date().toISOString().split('T')[0],
      endDate: props.adToEdit.endDate || '',
      location: props.adToEdit.location || 'all',
      status: props.adToEdit.status || 'approved',
      active: props.adToEdit.active !== undefined ? props.adToEdit.active : true
    })
  }
})

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  toast.info('Subiendo imagen de banner...')
  const uploadedUrl = await store.uploadImage(file)
  if (uploadedUrl) {
    adForm.bannerUrl = uploadedUrl
    toast.success('¡Banner cargado con éxito!')
  } else {
    const reader = new FileReader()
    reader.onload = (e) => {
      adForm.bannerUrl = e.target.result
      toast.success('¡Imagen lista para vista previa!')
    }
    reader.readAsDataURL(file)
  }
}

const submitAdRequest = async () => {
  if (!adForm.businessName.trim() || !adForm.description.trim()) {
    toast.warning('Por favor completa el nombre del negocio y la descripción.')
    return
  }

  if (!acceptTerms.value && !props.isAdmin) {
    toast.warning('Debes aceptar los Términos y Condiciones de Publicidad.')
    return
  }

  if (props.adToEdit && props.adToEdit.id) {
    await store.updateAdCampaign(props.adToEdit.id, adForm)
  } else {
    await store.addAdCampaign(adForm)
    if (!props.isAdmin) {
      toast.success('¡Solicitud enviada con éxito! Queda en estado pendiente para revisión y aprobación del Admin.')
    }
  }
  emit('submitted')
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 540px;
  padding: 24px;
  background: var(--color-bg-card);
  box-sizing: border-box;
  overflow-y: auto;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--border-glass);
  padding-bottom: 12px;
}

.modal-header h3 {
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  width: 20px;
  height: 20px;
}

.subtitle-text {
  font-size: 0.8rem;
  color: var(--color-text-dim);
  margin-top: 2px;
}

.admin-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

.form-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

@media (max-width: 480px) {
  .form-row {
    flex-direction: column;
  }
}

.flex-1 {
  flex: 1;
  min-width: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  min-width: 0;
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
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
}

.banner-upload-box {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(255, 255, 255, 0.02);
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-glass);
}

.file-input-hidden {
  display: none;
}

.upload-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  border: 2px dashed var(--border-soft);
  border-radius: var(--radius-md);
  cursor: pointer;
  background: rgba(216, 30, 91, 0.04);
  transition: all 0.2s ease;
}

.upload-dropzone:hover {
  background: rgba(216, 30, 91, 0.1);
  border-color: var(--color-berry);
}

.upload-icon {
  width: 24px;
  height: 24px;
  color: var(--color-berry);
}

.upload-dropzone span {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-main);
}

.upload-dropzone small {
  font-size: 0.72rem;
  color: var(--color-text-dim);
}

.url-divider {
  font-size: 0.75rem;
  color: var(--color-text-dim);
  text-align: center;
}

.banner-preview-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 6px;
}

.banner-preview-box small {
  font-size: 0.75rem;
  color: var(--color-text-dim);
}

.banner-img-preview {
  width: 100%;
  aspect-ratio: 3 / 1;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-soft);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.btn-icon {
  width: 14px;
  height: 14px;
}
</style>
