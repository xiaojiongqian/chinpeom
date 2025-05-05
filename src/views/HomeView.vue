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
                <AnswerOptions
                  :options="poemStore.options"
                  :answered="hasAnswered"
                  :selectedIndex="selectedIndex"
                  :isCorrect="isCorrect"
                  @select="checkAnswer"
                />
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
      <div v-if="poemStore.currentPoem" class="bg-gray-100 p-4 flex justify-center space-x-4">
        <button 
          @click="nextPoem" 
          class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          :disabled="!hasAnswered"
        >
          下一首
        </button>
        
        <button
          v-if="!hasAnswered && !poemStore.isLoading"
          @click="changeDifficulty"
          class="px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
        >
          <span class="mr-2">{{ difficultyLabels[difficulty] }}</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
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
    
    <!-- 反馈弹窗 -->
    <FeedbackDialog
      v-if="poemStore.currentPoem"
      :show="showFeedback"
      :is-correct="isCorrect === true"
      :correct-answer="correctAnswer"
      :selected-answer="selectedAnswer"
      :poem-title="poemStore.currentPoem.title"
      :poem-author="poemStore.currentPoem.author"
      :score-change="userStore.isLoggedIn ? (isCorrect ? 1 : -1) : undefined"
      :fun-fact="getPoemFunFact()"
      @close="showFeedback = false"
      @next="nextPoem"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { usePoemStore } from '../stores/poem'
import PoemImage from '../components/PoemImage.vue'
import AnswerOptions from '../components/AnswerOptions.vue'
import FeedbackDialog from '../components/FeedbackDialog.vue'
import type { PoemOption } from '@/types'
import type { DifficultyLevel } from '@/utils/optionsGenerator'

const userStore = useUserStore()
const poemStore = usePoemStore()

// 状态
const selectedIndex = ref<number | null>(null)
const isCorrect = ref<boolean | null>(null)
const hasAnswered = ref(false)
const difficulty = ref<DifficultyLevel>('normal')
const showFeedback = ref(false)
const selectedAnswer = ref('')

// 难度显示标签
const difficultyLabels = {
  easy: '简单难度',
  normal: '普通难度',
  hard: '困难难度'
}

// 当前正确答案
const correctAnswer = computed(() => {
  const correctOption = poemStore.options.find((opt: PoemOption) => opt.isCorrect)
  return correctOption ? correctOption.value : ''
})

// 方法
// 检查答案
const checkAnswer = (index: number) => {
  selectedIndex.value = index
  
  const selectedOption = poemStore.options[index]
  isCorrect.value = selectedOption.isCorrect
  hasAnswered.value = true
  selectedAnswer.value = selectedOption.value
  
  // 播放音效
  playFeedbackSound(isCorrect.value)
  
  // 如果用户已登录，更新分数
  if (userStore.isLoggedIn) {
    userStore.updateScore(isCorrect.value ? 1 : -1)
  }
  
  // 显示反馈弹窗
  setTimeout(() => {
    showFeedback.value = true
  }, 500)
}

// 播放反馈音效
const playFeedbackSound = (correct: boolean) => {
  // 如果应用设置允许音效，则播放
  if (userStore.settings?.soundEffects) {
    const audio = new Audio()
    audio.src = correct 
      ? '/resource/sounds/correct.mp3' 
      : '/resource/sounds/incorrect.mp3'
    audio.play().catch(error => {
      console.error('播放音效失败:', error)
    })
  }
}

// 切换难度
const changeDifficulty = () => {
  // 难度轮换: easy -> normal -> hard -> easy
  const levels: DifficultyLevel[] = ['easy', 'normal', 'hard']
  const currentIndex = levels.indexOf(difficulty.value)
  const nextIndex = (currentIndex + 1) % levels.length
  difficulty.value = levels[nextIndex]
  
  // 更新选项
  generateNewOptions()
}

// 生成新的选项
const generateNewOptions = () => {
  if (poemStore.currentPoem) {
    // 获取当前正确的诗句
    poemStore.generateOptionsWithDifficulty(difficulty.value)
  }
}

// 下一首诗
const nextPoem = () => {
  poemStore.selectRandomPoem(difficulty.value)
  resetAnswerState()
}

// 重置答题状态
const resetAnswerState = () => {
  selectedIndex.value = null
  isCorrect.value = null
  hasAnswered.value = false
  showFeedback.value = false
  selectedAnswer.value = ''
}

// 获取诗歌小知识
const getPoemFunFact = () => {
  if (!poemStore.currentPoem) return ''
  
  const funFacts = [
    `《${poemStore.currentPoem.title}》是${poemStore.currentPoem.author}的代表作之一。`,
    `唐代有近五万首诗歌流传至今，其中不乏千古佳作。`,
    `唐诗中常用的意象包括月亮、江河、山川等自然景物。`,
    `唐代诗人注重音律，讲究平仄押韵，形成了独特的艺术风格。`,
    `诗歌创作在唐代已经成为文人必备的技能之一。`,
  ]
  
  // 随机选择一条小知识
  const randomIndex = Math.floor(Math.random() * funFacts.length)
  return funFacts[randomIndex]
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