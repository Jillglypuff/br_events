<template>
  <div class="admin-container animate-fade-in">
    <!-- Header -->
    <div class="admin-header glass-card">
      <div class="header-info">
        <span class="badge-berry">
          <ShieldCheck class="badge-icon" /> Panel Admin
        </span>
        <h2>Administración General de BR Events</h2>
        <p>Gestión de integrantes, asignación de turnos, revisión de gastos y métricas del sistema.</p>
      </div>

      <div class="admin-top-actions">
        <!-- Clean Data Button for Testing -->
        <button @click="resetTestData" class="btn-secondary btn-sm" title="Limpiar todos los datos almacenados para pruebas">
          <Trash2 class="btn-icon" />
          <span>Limpiar Datos para Pruebas</span>
        </button>

        <!-- Tab Buttons -->
        <div class="admin-tabs">
          <button 
            v-for="t in adminTabs" 
            :key="t.id"
            :class="['admin-tab-btn', { active: currentTab === t.id }]"
            @click="currentTab = t.id"
          >
            <component :is="t.icon" class="tab-icon" />
            <span>{{ t.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 1: Amigas & Integrantes -->
    <div v-if="currentTab === 'amigas'" class="tab-content glass-card">
      <div class="section-title-bar">
        <h3>👥 Directorio de Amigas ({{ store.friends.length }})</h3>
      </div>

      <div class="friends-table-wrapper">
        <table class="friends-table">
          <thead>
            <tr>
              <th>Amiga</th>
              <th>Contacto</th>
              <th>Talla</th>
              <th>Edad</th>
              <th>Ubicación</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in store.friends" :key="f.id">
              <td class="user-cell">
                <img v-if="f.avatar" :src="f.avatar" alt="Avatar" class="avatar-sm" />
                <div v-else class="initials-avatar-sm">{{ store.getInitials(f.name) }}</div>
                <strong>{{ f.name }}</strong>
              </td>
              <td>
                <div class="contact-box">
                  <span>{{ f.email }}</span>
                  <small>{{ f.phone }}</small>
                </div>
              </td>
              <td><span class="badge-gray">{{ f.shirtSize || 'M' }}</span></td>
              <td>{{ f.age ? f.age + ' años' : '-' }}</td>
              <td>{{ [f.province, f.canton].filter(Boolean).join(', ') || '-' }}</td>
              <td>
                <span :class="f.role === 'admin' ? 'badge-berry' : 'badge-emerald'">
                  {{ f.role === 'admin' ? 'Admin' : 'Integrante' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: Asignación de Turnero -->
    <div v-if="currentTab === 'turnero'" class="tab-content glass-card">
      <div class="section-title-bar">
        <h3>📅 Gestión Directa del Turnero de Meses</h3>
      </div>

      <div class="admin-months-grid">
        <div v-for="m in store.months" :key="m.id" class="admin-month-card">
          <div class="month-card-header">
            <strong>#{{ m.id < 10 ? '0' + m.id : m.id }} {{ m.name }}</strong>
            <span :class="m.organizerId ? 'badge-berry' : 'badge-gray'">
              {{ m.organizerName || 'Disponible' }}
            </span>
          </div>

          <div class="month-card-body">
            <p v-if="m.theme" class="theme-text">Temática: {{ m.theme }}</p>
            <p v-else class="empty-text">Sin temática ni organizadora asignada</p>

            <div class="admin-month-actions">
              <button 
                v-if="!m.organizerId"
                @click="openAssignModal(m)"
                class="btn-emerald btn-sm"
              >
                <UserPlus class="btn-icon" /> Asignar Amiga
              </button>

              <button 
                v-else
                @click="resetMonth(m.id)"
                class="btn-secondary btn-sm"
              >
                <RotateCcw class="btn-icon" /> Liberar Mes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: Gestión de Gastos CRC -->
    <div v-if="currentTab === 'gastos'" class="tab-content glass-card">
      <div class="section-title-bar">
        <h3>💰 Gastos Registrados en CRC (₡ Colones)</h3>
      </div>

      <div v-if="store.expenses.length === 0" class="empty-expenses-msg">
        <p>No hay gastos registrados aún. Agrega nuevos gastos desde la sección de Gastos.</p>
      </div>

      <div v-else class="expenses-admin-list">
        <div v-for="exp in store.expenses" :key="exp.id" class="expense-admin-item">
          <div class="exp-left">
            <strong>{{ exp.description }}</strong>
            <small>Pagado por {{ exp.paidBy }} el {{ exp.date }}</small>
          </div>
          <div class="exp-right">
            <strong class="price-crc">₡{{ exp.amount.toLocaleString() }} CRC</strong>
            <button @click="deleteExpense(exp.id)" class="btn-delete" title="Eliminar gasto">
              <Trash2 class="btn-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal for Admin Assigning Month -->
    <div v-if="showAssignModal" class="modal-overlay" @click.self="showAssignModal = false">
      <div class="modal-card glass-card animate-fade-in">
        <div class="modal-header">
          <h3>Asignar Organizadora a {{ selectedMonth?.name }}</h3>
          <button @click="showAssignModal = false" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="submitAssign" class="admin-form">
          <div class="form-group">
            <label>Seleccionar Amiga Organizadora</label>
            <select v-model="assignForm.organizerName" required class="form-select">
              <option v-for="f in store.friends" :key="f.id" :value="f.name">
                {{ f.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Título o Temática del Evento</label>
            <input v-model="assignForm.theme" type="text" placeholder="Ej. Noche de Cocteles & Karaoke" required class="form-input" />
          </div>

          <div class="modal-actions">
            <button type="button" @click="showAssignModal = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar Asignación</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { store } from '../lib/supabase.js'
import { toast } from '../lib/toast.js'
import { ShieldCheck, Users, Calendar, DollarSign, UserPlus, RotateCcw, Trash2 } from 'lucide-vue-next'

const currentTab = ref('amigas')
const showAssignModal = ref(false)
const selectedMonth = ref(null)

const assignForm = reactive({
  organizerName: '',
  theme: ''
})

const adminTabs = [
  { id: 'amigas', label: 'Integrantes', icon: Users },
  { id: 'turnero', label: 'Gestión Turnero', icon: Calendar },
  { id: 'gastos', label: 'Gastos CRC', icon: DollarSign }
]

const resetTestData = () => {
  if (confirm('¿Deseas limpiar todos los datos para realizar pruebas desde cero?')) {
    store.resetAllData()
    toast.success('¡Datos limpiados exitosamente! La aplicación está lista para tus pruebas.')
  }
}

const openAssignModal = (month) => {
  selectedMonth.value = month
  assignForm.organizerName = store.friends[0]?.name || ''
  assignForm.theme = ''
  showAssignModal.value = true
}

const submitAssign = () => {
  if (selectedMonth.value) {
    store.adminAssignMonth(selectedMonth.value.id, assignForm.organizerName, assignForm.theme)
    showAssignModal.value = false
    toast.success(`Mes ${selectedMonth.value.name} asignado exitosamente a ${assignForm.organizerName}`)
  }
}

const resetMonth = (monthId) => {
  if (confirm('¿Deseas liberar este mes y dejarlo disponible nuevamente?')) {
    store.adminResetMonth(monthId)
  }
}

const deleteExpense = (expId) => {
  if (confirm('¿Deseas eliminar este registro de gasto?')) {
    store.deleteExpense(expId)
  }
}
</script>

<style scoped>
.admin-container {
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.admin-header {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.admin-top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.badge-icon {
  width: 14px;
  height: 14px;
}

.admin-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.admin-tab-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-soft);
  color: var(--color-text-muted);
  padding: 8px 16px;
  border-radius: var(--radius-full);
  font-size: 0.88rem;
  font-family: var(--font-heading);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.admin-tab-btn.active {
  background: var(--gradient-berry);
  color: white;
  border-color: transparent;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(216, 30, 91, 0.3);
}

.tab-icon {
  width: 16px;
  height: 16px;
}

.tab-content {
  padding: 24px;
}

.section-title-bar {
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-glass);
  padding-bottom: 12px;
}

/* Table */
.friends-table-wrapper {
  overflow-x: auto;
}

.friends-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.88rem;
}

.friends-table th {
  padding: 12px;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--border-glass);
  font-family: var(--font-heading);
}

.friends-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border-glass);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.initials-avatar-sm {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gradient-berry);
  color: white;
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-box {
  display: flex;
  flex-direction: column;
}

.contact-box small {
  color: var(--color-text-dim);
}

/* Admin Months Grid */
.admin-months-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.admin-month-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-md);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.month-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.theme-text {
  font-size: 0.82rem;
  color: var(--color-berry);
}

.empty-text {
  font-size: 0.78rem;
  color: var(--color-text-dim);
  font-style: italic;
}

.admin-month-actions {
  margin-top: 6px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

/* Expenses Admin */
.empty-expenses-msg {
  text-align: center;
  padding: 30px;
  color: var(--color-text-muted);
}

.expenses-admin-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.expense-admin-item {
  background: rgba(255, 255, 255, 0.03);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--border-glass);
}

.exp-left {
  display: flex;
  flex-direction: column;
}

.exp-left small {
  color: var(--color-text-dim);
}

.exp-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.price-crc {
  font-family: var(--font-heading);
  color: var(--color-emerald);
}

.btn-delete {
  background: rgba(216, 30, 91, 0.2);
  color: var(--color-pink-vivid);
  border: 1px solid rgba(216, 30, 91, 0.3);
  padding: 6px;
  border-radius: 8px;
  cursor: pointer;
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

.admin-form {
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

.form-input, .form-select {
  background: var(--color-bg-input);
  color: var(--color-text-main);
  border: 1px solid var(--border-soft);
  padding: 10px 14px;
  border-radius: var(--radius-md);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}
</style>
