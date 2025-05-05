<template>
  <div 
    v-if="show" 
    class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity"
    @click.self="close"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-transform duration-300" 
      :class="{ 'scale-100 opacity-100': show, 'scale-90 opacity-0': !show }">
      <!-- 反馈头部 -->
      <div class="p-5 border-b" :class="isCorrect ? 'bg-green-50' : 'bg-red-50'">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold" :class="isCorrect ? 'text-green-700' : 'text-red-700'">
            {{ isCorrect ? '答对了！' : '答错了！' }}
          </h3>
          <button @click="close" class="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 反馈内容 -->
      <div class="p-5">
        <div v-if="isCorrect" class="mb-4">
          <p class="text-green-700 text-sm mb-2">太棒了！你选择了正确的诗句。</p>
          <div v-if="scoreChange" class="flex items-center text-sm text-green-600">
            <span>获得 +{{ scoreChange }} 分</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
        
        <div v-else class="mb-4">
          <p class="text-red-700 text-sm mb-2">别灰心，正确的诗句是：</p>
          <p class="font-bold text-gray-800 p-2 bg-gray-100 rounded">{{ correctAnswer }}</p>
          <div v-if="scoreChange" class="flex items-center text-sm text-red-600 mt-2">
            <span>扣除 {{ scoreChange }} 分</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
        
        <!-- 诗歌信息 -->
        <div class="bg-gray-50 p-3 rounded-lg mb-4">
          <h4 class="font-bold text-gray-700 mb-1">诗歌信息</h4>
          <div class="text-sm text-gray-600">
            <p>《{{ poemTitle }}》</p>
            <p>作者：{{ poemAuthor }}</p>
          </div>
        </div>
        
        <!-- 知识扩展 -->
        <div v-if="funFact" class="bg-blue-50 p-3 rounded-lg">
          <h4 class="font-bold text-blue-700 mb-1">诗词小知识</h4>
          <p class="text-sm text-blue-600">{{ funFact }}</p>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="p-4 border-t flex justify-end space-x-3">
        <button 
          @click="close" 
          class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
        >
          关闭
        </button>
        <button 
          @click="$emit('next')" 
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          下一首
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  isCorrect: boolean
  correctAnswer: string
  selectedAnswer: string
  poemTitle: string
  poemAuthor: string
  scoreChange?: number
  funFact?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'next'): void
}>()

function close() {
  emit('close')
}
</script> 