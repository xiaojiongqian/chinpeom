<template>
  <div 
    class="bg-white rounded-lg overflow-hidden" 
    :class="[
      elevationClass,
      { 'shadow-md': elevation !== 'none' },
      { 'border border-gray-200': bordered }
    ]"
  >
    <div v-if="$slots.header" class="px-4 py-3 border-b border-gray-200">
      <slot name="header"></slot>
    </div>
    <div class="p-4">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="px-4 py-3 bg-gray-50 border-t border-gray-200">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  elevation?: 'none' | 'sm' | 'md' | 'lg'
  bordered?: boolean
}>()

defineOptions({
  name: 'BaseCard'
})

const elevationClass = computed(() => {
  if (props.elevation === 'none') {
    return ''
  }
  
  const classes = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  }
  return classes[props.elevation || 'md']
})
</script> 