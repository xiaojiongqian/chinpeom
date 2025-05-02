<template>
  <button
    :class="[
      'px-4 py-2 rounded-md transition-colors',
      disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  disabled?: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script> 