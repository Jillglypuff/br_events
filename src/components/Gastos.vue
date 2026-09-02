<template>
  <div class="gastos-container animate-fade-in">
    <!-- Header -->
    <div class="gastos-header glass-card">
      <div class="header-info">
        <span class="badge-emerald">
          <ColonIcon size="14" /> Control de Gastos del Evento (CRC)
        </span>
        <h2>División de Cuenta (Splitwise BR)</h2>
        <p>Registra compras del evento en Colones (CRC ₡) y el sistema calcula quién le debe a quién automáticamente.</p>
      </div>

      <button v-if="canEdit" @click="showAddModal = true" class="btn-primary">
        <PlusCircle class="btn-icon" />
        <span>Agregar Gasto (₡)</span>
      </button>
    </div>

    <!-- Summary Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card glass-card">
        <span class="stat-label">Gasto Total del Evento</span>
        <strong class="stat-value">₡{{ totalExpense.toLocaleString() }} CRC</strong>
      </div>

      <div class="stat-card glass-card">
        <span class="stat-label">Cuota Igualitaria por Amiga</span>
        <strong class="stat-value">₡{{ Math.round(perPersonShare).toLocaleString() }} CRC</strong>
        <span class="stat-sub">({{ friendsCount }} amigas)</span>
      </div>

      <div class="stat-card glass-card">
        <span class="stat-label">Estado de Cuentas</span>
        <span :class="pendingExpensesCount > 0 ? 'badge-amber' : 'badge-emerald'">
          <Clock v-if="pendingExpensesCount > 0" class="icon-sm" />
          <CheckCircle2 v-else class="icon-sm" />
          {{ pendingExpensesCount > 0 ? `${pendingExpensesCount} gastos pendientes de comprobante` : 'Cuentas al día' }}
        </span>
      </div>
    </div>

    <!-- 2 Column Layout -->
    <div class="gastos-grid">
      <!-- Debt Settlement Balance Column ("Quién le debe a quién") -->
      <div class="settlement-col glass-card">
        <div class="col-header">
          <Receipt class="col-icon" />
          <h3>Cálculo Automático ("Quién le debe a quién")</h3>
        </div>

        <div v-if="settlements.length === 0" class="empty-settlements">
          <CheckCircle2 class="big-check" />
          <p>¡Todas las cuentas están saldadas en Colones!</p>
        </div>

        <div v-else class="settlement-list">
          <div v-for="(s, idx) in settlements" :key="idx" class="settlement-card">
            <div class="settlement-info">
              <span class="debtor"><strong>{{ s.from }}</strong> le debe a</span>
              <strong class="creditor">{{ s.to }}</strong>
            </div>

            <div class="settlement-action">
              <span class="settlement-amount">₡{{ Math.round(s.amount).toLocaleString() }} CRC</span>
            </div>
          </div>
        </div>

        <!-- Net Balances Breakdown -->
        <div class="balances-breakdown">
          <h4>Balance Neto por Amiga (₡ CRC):</h4>
          <div class="balance-bars">
            <div v-for="b in friendBalances" :key="b.name" class="balance-item">
              <span class="balance-name">{{ b.name }}</span>
              <span :class="['balance-amount', b.net >= 0 ? 'positive' : 'negative']">
                {{ b.net >= 0 ? '+' : '' }}₡{{ Math.round(b.net).toLocaleString() }} CRC
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Expense History Column -->
      <div class="history-col glass-card">
        <div class="col-header">
          <ListOrdered class="col-icon" />
          <h3>Historial de Pagos Registrados</h3>
        </div>

        <div class="expense-list">
          <div v-for="exp in eventExpenses" :key="exp.id" class="expense-item">
            <div class="expense-icon-box">
              <ColonIcon size="18" />
            </div>

            <div class="expense-details">
              <strong class="expense-desc">{{ exp.description }}</strong>
              <span class="expense-payer">Pagado por <strong>{{ exp.paidBy }}</strong> • {{ exp.date }}</span>
            </div>

            <div class="expense-price-box">
              <strong class="expense-price">₡{{ exp.amount.toLocaleString() }} CRC</strong>
              
              <!-- DYNAMIC BADGE (PENDING VS APPROVED) -->
              <span v-if="exp.status === 'approved' || exp.status === 'confirmed'" class="badge-emerald">
                <CheckCircle2 class="icon-xs" /> Verificado
              </span>
              <button 
                v-else-if="canEdit"
                @click="openVerifyModal(exp)"
                class="badge-amber btn-verify-action" 
                title="Subir comprobante para verificar"
              >
                <Clock class="icon-xs" /> Pendiente de comprobante
              </button>
              <span v-else class="badge-amber">
                <Clock class="icon-xs" /> Pendiente de comprobante
              </span>
            </div>
          </div>

          <div v-if="eventExpenses.length === 0" class="empty-expenses">
            <p>No hay gastos registrados para este evento aún.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Agregar Nuevo Gasto CRC -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-card glass-card animate-fade-in">
        <div class="modal-header">
          <h3>Registrar Nuevo Gasto en Colones (₡)</h3>
          <button @click="showAddModal = false" class="btn-close">✕</button>
        </div>

        <form @submit.prevent="submitExpense" class="modal-form">
          <div class="form-group">
            <label>Descripción del gasto</label>
            <input 
              v-model="newExpense.description" 
              type="text" 
              placeholder="Ej. Vinos tintos, Snacks, Decoración" 
              required
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>¿Quién pagó?</label>
            <select v-model="newExpense.paidBy" required class="form-select">
              <option v-for="f in store.friends" :key="f.id" :value="f.name">
                {{ f.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Monto total en Colones (₡ CRC)</label>
            <input 
              v-model="newExpense.amount" 
              type="number" 
              min="100" 
              step="100" 
              placeholder="Ej. 15000" 
              required
              class="form-input"
            />
          </div>

          <div class="modal-actions">
            <button type="button" @click="showAddModal = false" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary">Registrar Gasto (Pendiente)</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Subir Comprobante y Confirmar Gasto -->
    <div v-if="selectedExpenseForVerify" class="modal-overlay" @click.self="selectedExpenseForVerify = null">
      <div class="modal-card glass-card animate-fade-in">
        <div class="modal-header">
          <h3>Adjuntar Comprobante de Pago</h3>
          <button @click="selectedExpenseForVerify = null" class="btn-close">✕</button>
        </div>

        <div class="modal-form">
          <p class="verify-hint">
            Gasto: <strong>{{ selectedExpenseForVerify.description }}</strong> (₡{{ selectedExpenseForVerify.amount.toLocaleString() }} CRC pagado por {{ selectedExpenseForVerify.paidBy }})
          </p>

          <div class="form-group">
            <label>Subir foto del comprobante / factura / SINPE</label>
            <input type="file" ref="receiptInputRef" accept="image/*" class="form-input" />
          </div>

          <div class="modal-actions">
            <button type="button" @click="selectedExpenseForVerify = null" class="btn-secondary">Cancelar</button>
            <button type="button" @click="confirmVerify" class="btn-emerald">
              <CheckCircle2 class="btn-icon-sm" /> Verificación Completada
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { store } from '../lib/supabase.js'
import ColonIcon from './ColonIcon.vue'
import confetti from 'canvas-confetti'
import { PlusCircle, CheckCircle2, Receipt, ListOrdered, Clock, Check } from 'lucide-vue-next'

const props = defineProps({
  canEdit: {
    type: Boolean,
    default: true
  },
  eventId: {
    type: [String, Number],
    default: null
  }
})

const showAddModal = ref(false)
const selectedExpenseForVerify = ref(null)
const receiptInputRef = ref(null)

const newExpense = ref({
  description: '',
  paidBy: store.currentUser ? store.currentUser.name : '',
  amount: ''
})

const currentEventId = computed(() => props.eventId || (store.currentEvent ? (store.currentEvent.id || store.currentEvent.monthId) : null))

const eventExpenses = computed(() => {
  if (!currentEventId.value) return store.expenses
  return store.expenses.filter(e => !e.eventId || e.eventId === currentEventId.value || e.eventId === store.currentEvent?.monthId)
})

const friendsCount = computed(() => store.friends.length)

const totalExpense = computed(() => {
  return eventExpenses.value.reduce((acc, exp) => acc + Number(exp.amount), 0)
})

const perPersonShare = computed(() => {
  if (friendsCount.value === 0) return 0
  return totalExpense.value / friendsCount.value
})

const pendingExpensesCount = computed(() => {
  return eventExpenses.value.filter(e => e.status === 'pending').length
})

const friendBalances = computed(() => {
  const balances = {}
  store.friends.forEach(f => {
    balances[f.name] = 0
  })

  eventExpenses.value.forEach(exp => {
    if (balances[exp.paidBy] !== undefined) {
      balances[exp.paidBy] += Number(exp.amount)
    }
  })

  return store.friends.map(f => {
    const paid = balances[f.name] || 0
    const net = paid - perPersonShare.value
    return { name: f.name, paid, net }
  })
})

const settlements = computed(() => {
  const debtors = []
  const creditors = []

  friendBalances.value.forEach(b => {
    if (b.net < -1) {
      debtors.push({ name: b.name, amount: Math.abs(b.net) })
    } else if (b.net > 1) {
      creditors.push({ name: b.name, amount: b.net })
    }
  })

  const results = []
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const minAmount = Math.min(debtors[i].amount, creditors[j].amount)
    results.push({
      from: debtors[i].name,
      to: creditors[j].name,
      amount: minAmount
    })

    debtors[i].amount -= minAmount
    creditors[j].amount -= minAmount

    if (debtors[i].amount < 1) i++
    if (creditors[j].amount < 1) j++
  }

  return results
})

const submitExpense = () => {
  store.addExpense({
    ...newExpense.value,
    eventId: currentEventId.value
  })
  showAddModal.value = false
  newExpense.value = { description: '', paidBy: store.currentUser ? store.currentUser.name : '', amount: '' }
}

const openVerifyModal = (exp) => {
  selectedExpenseForVerify.value = exp
}

const confirmVerify = async () => {
  if (selectedExpenseForVerify.value) {
    let receiptUrl = ''
    const file = receiptInputRef.value?.files?.[0]
    if (file) {
      receiptUrl = await store.uploadImage(file)
    }
    store.confirmExpensePayment(selectedExpenseForVerify.value.id, receiptUrl)
    selectedExpenseForVerify.value = null
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } })
  }
}
</script>

<style scoped>
.gastos-container {
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.gastos-header {
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

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.stat-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.stat-value {
  font-size: 1.6rem;
  font-family: var(--font-heading);
  color: var(--color-berry);
}

.stat-sub {
  font-size: 0.78rem;
  color: var(--color-text-dim);
}

.badge-amber {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.btn-verify-action {
  cursor: pointer;
  border: 1px solid rgba(245, 158, 11, 0.5);
  transition: transform 0.15s ease;
}

.btn-verify-action:hover {
  transform: scale(1.05);
}

.icon-sm {
  width: 14px;
  height: 14px;
}

.icon-xs {
  width: 12px;
  height: 12px;
}

/* Gastos Grid */
.gastos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.settlement-col, .history-col {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.col-header {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-berry);
}

.col-icon {
  width: 22px;
  height: 22px;
}

.empty-settlements, .empty-expenses {
  text-align: center;
  padding: 30px;
  color: #3BCEAC;
  font-style: italic;
  font-size: 0.88rem;
}

.big-check {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
}

.settlement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settlement-card {
  background: var(--color-bg-input);
  border: 1px solid rgba(42, 157, 143, 0.3);
  border-radius: var(--radius-md);
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.settlement-info {
  display: flex;
  flex-direction: column;
}

.debtor {
  font-size: 0.88rem;
}

.creditor {
  color: var(--color-pink-vivid);
  font-size: 0.98rem;
}

.settlement-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.settlement-amount {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--color-text-main);
}

/* Balances Breakdown */
.balances-breakdown {
  border-top: 1px solid var(--border-glass);
  padding-top: 16px;
}

.balances-breakdown h4 {
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.balance-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.balance-amount.positive {
  color: #3BCEAC;
  font-weight: 700;
}

.balance-amount.negative {
  color: var(--color-berry);
  font-weight: 700;
}

/* Expense History */
.expense-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.expense-item {
  background: var(--color-bg-input);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid var(--border-soft);
}

.expense-icon-box {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(216, 30, 91, 0.15);
  color: var(--color-berry);
  display: flex;
  align-items: center;
  justify-content: center;
}

.expense-details {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.expense-desc {
  font-size: 0.95rem;
}

.expense-payer {
  font-size: 0.78rem;
  color: var(--color-text-dim);
}

.expense-price-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.expense-price {
  font-family: var(--font-heading);
  color: var(--color-emerald);
}

.verify-hint {
  font-size: 0.88rem;
  color: var(--color-text-muted);
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

@media (max-width: 768px) {
  .gastos-grid {
    grid-template-columns: 1fr;
  }
}
</style>
