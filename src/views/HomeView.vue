<template>
  <div class="max-w-3xl mx-auto">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <!-- 诗歌标题和作者 -->
      <div class="bg-blue-700 text-white p-4 text-center">
        <h1 class="text-2xl font-bold mb-1">{{ currentPoem.title }}</h1>
        <p class="text-lg">{{ currentPoem.author }}</p>
      </div>
      
      <!-- 诗歌内容 -->
      <div class="p-6 text-center">
        <div class="space-y-4 text-xl">
          <div v-for="(line, index) in displayLines" :key="index" class="leading-relaxed">
            <template v-if="index === hiddenLineIndex">
              <!-- 选择答案区域 -->
              <div class="my-6 p-4 bg-gray-100 rounded-lg">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    v-for="(option, optIndex) in options" 
                    :key="optIndex"
                    @click="checkAnswer(option)"
                    class="p-3 text-left border rounded-lg hover:bg-blue-50 transition-colors"
                    :class="{'bg-green-100 border-green-500': selectedIndex === optIndex && isCorrect, 
                             'bg-red-100 border-red-500': selectedIndex === optIndex && !isCorrect && selectedIndex !== null}"
                  >
                    {{ option }}
                  </button>
                </div>
              </div>
              <!-- 外语提示 -->
              <div class="my-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-gray-700">
                {{ translatedLine }}
              </div>
            </template>
            <template v-else>
              {{ line }}
            </template>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="bg-gray-100 p-4 flex justify-center">
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
    <div v-if="currentPoem.id" class="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
      <img 
        :src="`/resource/images/${currentPoem.id}.jpg`" 
        :alt="currentPoem.title" 
        class="w-full object-cover max-h-96"
        @error="imageError = true"
        v-if="!imageError"
      />
      <div v-else class="p-12 text-center text-gray-500">
        无相关配图
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { usePoemStore } from '../stores/poem'

const userStore = useUserStore()
const poemStore = usePoemStore()

// 状态
const currentPoem = ref<any>({
  id: '',
  title: '',
  author: '',
  content: [],
  translation: {}
})
const hiddenLineIndex = ref(0)
const options = ref<string[]>([])
const selectedIndex = ref<number | null>(null)
const isCorrect = ref(false)
const hasAnswered = ref(false)
const imageError = ref(false)

// 计算属性
const displayLines = computed(() => currentPoem.value.content || [])
const translatedLine = computed(() => {
  const language = userStore.language || 'english'
  if (currentPoem.value.translation && 
      currentPoem.value.translation[language] && 
      hiddenLineIndex.value < currentPoem.value.translation[language].length) {
    return currentPoem.value.translation[language][hiddenLineIndex.value]
  }
  return ''
})

// 方法
// 获取随机诗歌
const fetchRandomPoem = async () => {
  try {
    const poem = await poemStore.getRandomPoem()
    currentPoem.value = poem
    resetGame()
  } catch (error) {
    console.error('获取诗歌失败:', error)
  }
}

// 重置游戏状态
const resetGame = () => {
  // 随机选择一行作为题目
  if (currentPoem.value.content && currentPoem.value.content.length > 0) {
    hiddenLineIndex.value = Math.floor(Math.random() * currentPoem.value.content.length)
    
    // 生成选项
    generateOptions()
    
    // 重置答题状态
    selectedIndex.value = null
    isCorrect.value = false
    hasAnswered.value = false
    imageError.value = false
  }
}

// 生成选项
const generateOptions = () => {
  // 正确答案
  const correctAnswer = currentPoem.value.content[hiddenLineIndex.value]
  
  // 从poemStore获取干扰项
  const distractors = poemStore.getDistractors(correctAnswer, 3)
  
  // 合并选项并随机排序
  const allOptions = [correctAnswer, ...distractors]
  options.value = shuffleArray(allOptions)
}

// 检查答案
const checkAnswer = (selected: string) => {
  const correctAnswer = currentPoem.value.content[hiddenLineIndex.value]
  const index = options.value.indexOf(selected)
  
  selectedIndex.value = index
  isCorrect.value = selected === correctAnswer
  hasAnswered.value = true
  
  // 如果用户已登录，更新分数
  if (userStore.isLoggedIn) {
    userStore.updateScore(isCorrect.value ? 1 : -1)
  }
}

// 下一首诗
const nextPoem = () => {
  fetchRandomPoem()
}

// 辅助函数：洗牌算法
const shuffleArray = (array: any[]) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// 组件挂载时获取一首随机诗歌
onMounted(() => {
  fetchRandomPoem()
})
</script> 