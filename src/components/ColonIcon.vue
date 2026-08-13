<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    :width="size || 18" 
    :height="size || 18" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2.2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    class="colon-icon-svg"
  >
    <!-- Outer C curve -->
    <path d="M17 5.5A8 8 0 1 0 17 18.5" />
    <!-- Horizontal strike lines for Colón ₡ -->
    <line x1="5" y1="10" x2="19" y2="10" />
    <line x1="5" y1="14" x2="19" y2="14" />
  </svg>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 18
  }
})
</script>

<style scoped>
.colon-icon-svg {
  display: inline-block;
  vertical-align: middle;
}
</style>
