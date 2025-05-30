<template>
  <div class="answer-options">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        v-for="(option, index) in options"
        :key="index"
        :disabled="answered"
        class="p-3 text-left border rounded-lg transition-colors"
        :class="getButtonClass(index)"
        @click="selectOption(index)"
      >
        {{ option.label }}
        <span v-if="answered && option.isCorrect" class="ml-2 text-success-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 inline"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
      </button>
    </div>

    <!-- 答题反馈提示 -->
    <div
      v-if="answered"
      class="mt-4 p-3 rounded-lg"
      :class="isCorrect ? 'bg-success-50' : 'bg-red-50'"
    >
      <p v-if="isCorrect" class="text-success-700">
        <span class="font-bold">正确!</span> 你选择了正确的诗句。
      </p>
      <p v-else class="text-red-700">
        <span class="font-bold">错误!</span> 正确的诗句是:
        <span class="font-bold">{{ correctAnswer }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { PoemOption } from '@/types'

  const props = defineProps<{
    options: PoemOption[]
    answered: boolean
    selectedIndex: number | null
    isCorrect: boolean | null
  }>()

  const emit = defineEmits<{
    (e: 'select', index: number): void
  }>()

  // 获取正确答案文本
  const correctAnswer = computed(() => {
    const correctOption = props.options.find(opt => opt.isCorrect)
    return correctOption ? correctOption.label : ''
  })

  // 选择选项
  function selectOption(index: number) {
    if (!props.answered) {
      emit('select', index)
    }
  }

  // 获取按钮样式
  function getButtonClass(index: number) {
    if (!props.answered) {
      return 'hover:bg-blue-50'
    }

    // 已回答
    const option = props.options[index]

    // 当前选中项
    if (index === props.selectedIndex) {
      // 选择正确
      if (props.isCorrect) {
        return 'bg-success-100 border-success-500'
      }
      // 选择错误
      return 'bg-red-100 border-red-500'
    }

    // 非选中项但是正确答案（用户选错了，显示正确答案）
    if (option.isCorrect && !props.isCorrect) {
      return 'bg-success-50 border-success-300'
    }

    // 其他未选中项
    return 'opacity-60'
  }
</script>
