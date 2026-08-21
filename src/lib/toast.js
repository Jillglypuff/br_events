import { reactive } from 'vue'

export const toastState = reactive({
  toasts: []
})

let nextId = 1

export const showToast = (message, type = 'info', duration = 4000) => {
  const id = nextId++
  const toast = {
    id,
    message,
    type, // 'success' | 'error' | 'warning' | 'info'
    duration
  }

  toastState.toasts.push(toast)

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

export const removeToast = (id) => {
  const index = toastState.toasts.findIndex(t => t.id === id)
  if (index !== -1) {
    toastState.toasts.splice(index, 1)
  }
}

export const toast = {
  show: showToast,
  success: (msg, duration) => showToast(msg, 'success', duration),
  error: (msg, duration) => showToast(msg, 'error', duration),
  info: (msg, duration) => showToast(msg, 'info', duration),
  warning: (msg, duration) => showToast(msg, 'warning', duration),
  remove: removeToast
}
