<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <TransitionGroup name="toast-list">
        <div
          v-for="t in toastState.toasts"
          :key="t.id"
          class="toast-item"
          :class="`toast-${t.type}`"
          @click="removeToast(t.id)"
        >
          <div class="toast-icon">
            <CheckCircle2 v-if="t.type === 'success'" class="icon icon-success" :size="20" />
            <AlertCircle v-else-if="t.type === 'error'" class="icon icon-error" :size="20" />
            <AlertTriangle v-else-if="t.type === 'warning'" class="icon icon-warning" :size="20" />
            <Info v-else class="icon icon-info" :size="20" />
          </div>

          <div class="toast-content">
            <p class="toast-message">{{ t.message }}</p>
          </div>

          <button
            type="button"
            class="toast-close"
            aria-label="Cerrar notificación"
            @click.stop="removeToast(t.id)"
          >
            <X :size="16" />
          </button>

          <div 
            v-if="t.duration > 0" 
            class="toast-progress" 
            :style="{ animationDuration: `${t.duration}ms` }"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { toastState, removeToast } from '../lib/toast'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  width: calc(100vw - 40px);
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(18, 18, 22, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 255, 255, 0.05);
  color: #f4f4f5;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.toast-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.5);
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-success {
  color: #34d399;
}
.icon-error {
  color: #f87171;
}
.icon-warning {
  color: #fbbf24;
}
.icon-info {
  color: #38bdf8;
}

.toast-success {
  border-left: 4px solid #34d399;
}
.toast-error {
  border-left: 4px solid #f87171;
}
.toast-warning {
  border-left: 4px solid #fbbf24;
}
.toast-info {
  border-left: 4px solid #38bdf8;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-message {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.4;
  word-break: break-word;
  color: #f4f4f5;
}

.toast-close {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.toast-close:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: rgba(255, 255, 255, 0.25);
  animation: shrinkProgress linear forwards;
}

.toast-success .toast-progress {
  background: #34d399;
}
.toast-error .toast-progress {
  background: #f87171;
}
.toast-warning .toast-progress {
  background: #fbbf24;
}
.toast-info .toast-progress {
  background: #38bdf8;
}

@keyframes shrinkProgress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Animations */
.toast-list-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-list-leave-active {
  transition: all 0.25s cubic-bezier(0.7, 0, 0.84, 0);
  position: relative;
}

.toast-list-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-list-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.9);
}

@media (max-width: 640px) {
  .toast-container {
    top: 16px;
    right: 50%;
    transform: translateX(50%);
    width: calc(100vw - 32px);
  }
}
</style>
