<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <div v-if="$slots['prefix']" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <slot name="prefix"></slot>
      </div>
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="[
          'w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
          { 'pl-10': $slots['prefix'], 'pr-10': $slots['suffix'], 'bg-gray-100': disabled },
          inputClasses
        ]"
        @input="handleInput"
      />
      <div v-if="$slots['suffix']" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <slot name="suffix"></slot>
      </div>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="helpText" class="mt-1 text-sm text-gray-500">{{ helpText }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id?: string
  label?: string
  modelValue: string
  type?: string
  placeholder?: string
  helpText?: string
  error?: string
  disabled?: boolean
  required?: boolean
  inputClasses?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

defineOptions({
  name: 'BaseInput'
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script> 