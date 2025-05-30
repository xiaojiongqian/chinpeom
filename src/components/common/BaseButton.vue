<template>
  <button
    :class="[
      'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
      variantClasses,
      sizeClasses,
      disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
      block ? 'w-full' : ''
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-center">
      <slot name="icon-left"></slot>
      <span :class="{ 'ml-2': $slots['icon-left'], 'mr-2': $slots['icon-right'] }">
        <slot>{{ label }}</slot>
      </span>
      <slot name="icon-right"></slot>
    </div>
  </button>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = defineProps<{
    label?: string
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    block?: boolean
  }>()

  defineEmits<{
    (e: 'click'): void
  }>()

  defineOptions({
    name: 'BaseButton'
  })

  const variantClasses = computed(() => {
    const classes = {
      primary: 'bg-primary hover:bg-primary-dark text-white',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
      success: 'bg-success-500 hover:bg-success-600 text-white',
      danger: 'bg-red-500 hover:bg-red-600 text-white',
      warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      info: 'bg-blue-500 hover:bg-blue-600 text-white'
    }
    return classes[props.variant || 'primary']
  })

  const sizeClasses = computed(() => {
    const classes = {
      sm: 'text-sm py-1 px-3',
      md: 'text-base py-2 px-4',
      lg: 'text-lg py-3 px-6'
    }
    return classes[props.size || 'md']
  })
</script>
