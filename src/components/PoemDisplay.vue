<template>
  <div class="poem-display" v-if="!isLoading && !loadError">
    <div class="poem-header">
      <h2 data-test="poem-title" class="poem-title">{{ currentPoem?.title }}</h2>
      <p data-test="poem-author" class="poem-author">{{ currentPoem?.author }}</p>
    </div>
    
    <div class="poem-content">
      <div class="poem-text">
        <p
          v-for="(line, index) in displayContent"
          :key="index"
          data-test="poem-line"
          class="poem-line"
          :class="{ 'translated-line': index === currentSentenceIndex }"
        >
          {{ line }}
        </p>
      </div>
      
      <div class="poem-image-wrapper">
        <PoemImage
          :imagePath="imagePath"
          :poemTitle="currentPoem?.title"
          :poemAuthor="currentPoem?.author"
          :hasImage="hasImage"
        />
      </div>
    </div>
  </div>
  
  <div v-else-if="isLoading" class="loading-state">
    <div data-test="loading-indicator" class="loading-indicator">
      <div class="spinner"></div>
      <p>正在加载诗歌...</p>
    </div>
  </div>
  
  <div v-else-if="loadError" class="error-state">
    <p data-test="error-message" class="error-message">{{ loadError }}</p>
    <button @click="initialize" class="retry-button">重试</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { usePoemStore } from '@/stores/poem'
import PoemImage from './PoemImage.vue'

// 获取诗歌状态管理
const poemStore = usePoemStore()

// 从 poemStore 解构出需要的状态和方法
const {
  currentPoem,
  currentSentenceIndex,
  displayContent,
  hasImage,
  imagePath,
  isLoading,
  loadError,
  initialize,
  selectRandomPoem
} = poemStore

// 组件挂载时初始化诗歌数据
onMounted(() => {
  initialize()
})
</script>

<style scoped>
.poem-display {
  @apply max-w-4xl mx-auto p-6 rounded-lg shadow-md bg-white dark:bg-gray-800;
}

.poem-header {
  @apply text-center mb-6;
}

.poem-title {
  @apply text-2xl font-bold text-gray-800 dark:text-white;
}

.poem-author {
  @apply text-lg text-gray-600 dark:text-gray-300 mt-2;
}

.poem-content {
  @apply flex flex-col md:flex-row gap-6 items-center;
}

.poem-text {
  @apply flex-1 w-full;
}

.poem-line {
  @apply text-lg text-gray-700 dark:text-gray-200 my-2 text-center;
}

.translated-line {
  @apply font-semibold text-indigo-600 dark:text-indigo-400;
}

.poem-image-wrapper {
  @apply w-full md:w-1/3;
}

.loading-state {
  @apply flex justify-center items-center min-h-[300px];
}

.loading-indicator {
  @apply flex flex-col items-center;
}

.spinner {
  @apply w-12 h-12 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin mb-4;
}

.error-state {
  @apply flex flex-col items-center justify-center min-h-[300px] p-6;
}

.error-message {
  @apply text-red-500 text-lg mb-4;
}

.retry-button {
  @apply px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors;
}
</style> 