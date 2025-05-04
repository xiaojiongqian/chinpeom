<template>
  <div class="poem-image-component" v-if="hasImage">
    <div class="image-container" :class="{ 'is-loading': isLoading }">
      <img
        :src="imagePath"
        :alt="altText"
        class="poem-image"
        @load="handleImageLoaded"
        @error="handleImageError"
        data-test="poem-image"
      />
      <div v-if="isLoading" class="loading-placeholder" data-test="image-loading">
        <div class="spinner"></div>
      </div>
      <div v-if="loadError" class="error-placeholder" data-test="image-error">
        <span class="error-icon">!</span>
        <p>图片加载失败</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 组件属性
const props = defineProps<{
  imagePath: string;
  poemTitle?: string;
  poemAuthor?: string;
  hasImage: boolean;
}>();

// 图片加载状态
const isLoading = ref(true);
const loadError = ref(false);

// 计算图片的替代文本
const altText = computed(() => {
  const title = props.poemTitle || '诗歌';
  const author = props.poemAuthor ? `（${props.poemAuthor}）` : '';
  return `${title}${author}配图`;
});

// 处理图片加载完成
function handleImageLoaded() {
  isLoading.value = false;
}

// 处理图片加载失败
function handleImageError() {
  isLoading.value = false;
  loadError.value = true;
}
</script>

<style scoped>
.poem-image-component {
  @apply w-full flex justify-center items-center;
}

.image-container {
  @apply relative overflow-hidden rounded-lg shadow-md max-w-xs;
  aspect-ratio: 4/3;
}

.poem-image {
  @apply w-full h-full object-cover transition-opacity duration-300;
}

.loading-placeholder, 
.error-placeholder {
  @apply absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700;
}

.spinner {
  @apply w-8 h-8 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin;
}

.error-icon {
  @apply flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-500 font-bold text-xl mb-2;
}

.is-loading .poem-image {
  @apply opacity-0;
}
</style> 