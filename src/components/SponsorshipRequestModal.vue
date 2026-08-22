<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card glass-card animate-fade-in">
      <div class="modal-header">
        <div>
          <h3><Handshake class="header-icon color-berry" /> Formulario para Nuevos Patrocinadores</h3>
          <p class="subtitle-text">Completa los datos de tu empresa o marca para formar parte de nuestros eventos</p>
        </div>
        <button @click="$emit('close')" class="btn-close">✕</button>
      </div>

      <form @submit.prevent="submitSponsorshipRequest" class="admin-form">
        <div class="form-group">
          <label>Nombre de la Empresa / Marca Patrocinadora *</label>
          <input 
            v-model="form.sponsorName" 
            type="text" 
            placeholder="Ej. Spa Serenidad / Boutique Tropical / Distribuidora San José" 
            required 
            class="form-input" 
          />
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <label>Nombre del Contacto *</label>
            <input 
              v-model="form.contactName" 
              type="text" 
              placeholder="Ej. Ana Lucía Mora" 
              required 
              class="form-input" 
            />
          </div>

          <div class="form-group flex-1">
            <label>Teléfono de Contacto *</label>
            <input 
              v-model="form.contactPhone" 
              type="tel" 
              placeholder="+506 8888-8888" 
              required 
              class="form-input" 
            />
          </div>
        </div>

        <div class="form-group">
          <label>Tipo de Patrocinio *</label>
          <select v-model="form.type" class="form-select">
            <option value="Regalías y Productos">Regalías y Productos / Servicios</option>
            <option value="Monto">Monto Económico (CRC)</option>
          </select>
        </div>

        <div v-if="form.type === 'Regalías y Productos'" class="form-group animate-fade-in">
          <label>Descripción de los Productos / Regalías *</label>
          <input 
            v-model="form.productDescription" 
            type="text" 
            placeholder="Ej. 20 kits de cuidado facial para las participantes + 5 certificados de regalo" 
            required 
            class="form-input" 
          />
        </div>

        <div v-else-if="form.type === 'Monto'" class="form-group animate-fade-in">
          <label>Monto del Aporte (CRC ₡) *</label>
          <input 
            v-model.number="form.amount" 
            type="number" 
            min="1000" 
            placeholder="Ej. 100000" 
            required 
            class="form-input" 
          />
        </div>

        <div class="form-group">
          <label>Mes de Interés o Evento Específico</label>
          <select v-model="form.monthName" class="form-select">
            <option value="General">General / Cualquiera</option>
            <option v-for="m in store.months" :key="m.id" :value="m.name">
              {{ m.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Notas Adicionales / Mensaje para la Administración</label>
          <textarea 
            v-model="form.notes" 
            rows="3" 
            placeholder="Detalles sobre entregas, condiciones o sugerencias para la colaboración..." 
            class="form-input"
          ></textarea>
        </div>

        <!-- Términos y Condiciones de Patrocinio -->
        <div class="terms-card">
          <div class="terms-header">
            <ShieldCheck class="terms-icon" />
            <span class="terms-title">Términos y Condiciones de Patrocinio</span>
          </div>
          <ul class="terms-list">
            <li><strong>Derecho de Reserva:</strong> Nos reservamos el derecho de evaluar, aceptar o declinar cualquier oferta de patrocinio.</li>
            <li><strong>Identidad Comunitaria:</strong> La marca, regalía o producto ofrecido debe estar alineado con la identidad, principios y valores de BR Events.</li>
            <li><strong>Evaluación Previa:</strong> Toda propuesta será revisada por el equipo administrativo antes de confirmar la alianza.</li>
          </ul>
          <label class="terms-checkbox-label">
            <input type="checkbox" v-model="acceptTerms" required class="terms-checkbox" />
            <span>Acepto los Términos y Condiciones de Patrocinio</span>
          </label>
        </div>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancelar</button>
          <button type="submit" class="btn-primary">
            <span>Enviar Propuesta de Patrocinio</span>
            <Send class="btn-icon" />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { store } from '../lib/supabase.js'
import { toast } from '../lib/toast.js'
import { Handshake, Send, ShieldCheck } from 'lucide-vue-next'

const emit = defineEmits(['close', 'submitted'])

const acceptTerms = ref(false)

const form = reactive({
  sponsorName: '',
  contactName: '',
  contactPhone: '',
  monthName: 'General',
  type: 'Regalías y Productos',
  productDescription: '',
  amount: 0,
  status: 'Pendiente', // Pending admin approval!
  notes: ''
})

const submitSponsorshipRequest = async () => {
  if (!form.sponsorName.trim() || !form.contactName.trim()) {
    toast.warning('Por favor completa el nombre de la empresa y del contacto.')
    return
  }

  if (!acceptTerms.value) {
    toast.warning('Debes aceptar los Términos y Condiciones de Patrocinio.')
    return
  }

  await store.addSponsorship(form)
  toast.success('¡Propuesta enviada con éxito! La administración la revisará en el Panel Admin.')
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
  font-size: 1.12rem;
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

.form-input, .form-select {
  background: var(--color-bg-input);
  color: var(--color-text-main);
  border: 1px solid var(--border-soft);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  width: 100%;
  box-sizing: border-box;
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
