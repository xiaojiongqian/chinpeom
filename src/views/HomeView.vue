<template>
  <div class="max-w-3xl mx-auto">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- 诗歌标题和作者 -->
      <div v-if="poemStore.currentPoem" class="bg-blue-700 text-white p-4 text-center">
        <h1 class="text-2xl font-bold mb-1">{{ poemStore.currentPoem.title }}</h1>
        <p class="text-lg">{{ poemStore.currentPoem.author }}</p>
      </div>
      
      <!-- 诗歌内容 -->
      <div v-if="poemStore.currentPoem" class="p-6 text-center">
        <div class="space-y-4 text-xl">
          <div v-for="(line, index) in poemStore.displayContent" :key="index" class="leading-relaxed">
            <template v-if="index === poemStore.currentSentenceIndex">
              <!-- 选择答案区域 -->
              <div class="my-6 p-4 bg-gray-100 rounded-lg">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    v-for="(option, optIndex) in poemStore.options" 
                    :key="optIndex"
                    @click="checkAnswer(option.value)"
                    class="p-3 text-left border rounded-lg hover:bg-blue-50 transition-colors"
                    :class="{'bg-green-100 border-green-500': selectedIndex === optIndex && isCorrect, 
                             'bg-red-100 border-red-500': selectedIndex === optIndex && !isCorrect && selectedIndex !== null}"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>
            </template>
            <template v-else>
              {{ line }}
            </template>
          </div>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="poemStore.isLoading" class="p-12 text-center">
        <div class="spinner"></div>
        <p class="mt-4">加载诗歌中...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-if="poemStore.loadError" class="p-8 text-center text-red-500">
        {{ poemStore.loadError }}
        <button @click="poemStore.initialize()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          重试
        </button>
      </div>
      
      <!-- 操作按钮 -->
      <div v-if="poemStore.currentPoem" class="bg-gray-100 p-4 flex justify-center">
        <button 
          @click="nextPoem" 
          class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          :disabled="!hasAnswered"
        >
          下一首
        </button>
      </div>
    </div>
    
    <!-- 配图展示 -->
    <div v-if="poemStore.hasImage" class="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
      <PoemImage
        :imagePath="poemStore.imagePath"
        :poemTitle="poemStore.currentPoem?.title"
        :poemAuthor="poemStore.currentPoem?.author"
        :hasImage="poemStore.hasImage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { usePoemStore } from '../stores/poem'
import PoemImage from '../components/PoemImage.vue'
import type { PoemOption } from '@/types'

const userStore = useUserStore()
const poemStore = usePoemStore()

// 状态
const selectedIndex = ref<number | null>(null)
const isCorrect = ref(false)
const hasAnswered = ref(false)

// 方法
// 检查答案
const checkAnswer = (selected: string) => {
  const index = poemStore.options.findIndex((opt: PoemOption) => opt.value === selected)
  
  selectedIndex.value = index
  isCorrect.value = poemStore.checkAnswer(selected)
  hasAnswered.value = true
  
  // 如果用户已登录，更新分数
  if (userStore.isLoggedIn) {
    userStore.updateScore(isCorrect.value ? 1 : -1)
  }
}

// 下一首诗
const nextPoem = () => {
  poemStore.selectRandomPoem()
  selectedIndex.value = null
  isCorrect.value = false
  hasAnswered.value = false
}

// 组件挂载时初始化诗歌数据
onMounted(() => {
  poemStore.initialize()
})
</script>

<style scoped>
.spinner {
  @apply w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto;
}
</style> 