<template>
  <!-- 测验页面 -->
  <div class="flex flex-col min-h-screen bg-gray-100 px-4 pb-16">
    <!-- 加载指示器 -->
    <div v-if="poemStore.isLoading" class="flex-1 flex items-center justify-center">
      <svg
        class="animate-spin h-10 w-10 text-blue-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>

    <!-- 错误信息显示 -->
    <div
      v-else-if="poemStore.loadError"
      class="flex-1 flex flex-col items-center justify-center text-center"
    >
      <p class="text-red-500 text-xl mb-4">{{ poemStore.loadError }}</p>
      <button
        class="retry-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        @click="retryLoadPoem"
      >
        重试
      </button>
    </div>

    <!-- 实际内容，仅在非加载且无错误状态下显示 -->
    <template v-else>
      <!-- 顶部操作栏 -->
      <div class="flex items-center justify-between pt-6 pb-3">
        <div class="flex items-center space-x-2">
          <!-- 音效开关 -->
          <button class="p-1.5 rounded-full hover:bg-gray-200" @click="toggleSound">
            <img :src="soundOn ? soundOnIcon : soundOffIcon" alt="音效开关" class="w-6 h-6" />
          </button>
        </div>
        <!-- 当前学级与得分 -->
        <div class="flex items-center space-x-1">
          <span class="text-base font-medium text-gray-700">{{ userStore.rank }}</span>
          <span class="text-sm text-gray-500">({{ userStore.score }}分)</span>
        </div>
        <div>
          <!-- 空占位，保持布局平衡 -->
        </div>
      </div>

      <!-- 诗歌展示卡片 -->
      <div class="bg-white rounded-2xl shadow-md overflow-hidden mb-4">
        <!-- 配图 -->
        <div class="relative w-full">
          <img
            v-if="hasImage"
            :src="imagePath"
            :alt="currentPoem?.title"
            class="w-full h-56 object-cover"
          />
          <div v-else class="w-full h-56 flex items-center justify-center bg-gray-200">
            <img
              src="@/assets/icons/feature/icon_star.svg"
              alt="配图占位"
              class="w-16 h-16 opacity-40"
            />
          </div>
        </div>

        <!-- 诗歌内容 -->
        <div class="p-5">
          <!-- 标题与作者 -->
          <div class="mb-3">
            <h2 class="text-2xl font-bold text-gray-800 text-center">{{ currentPoem?.title }}</h2>
            <p class="text-gray-600 text-center mt-1">{{ currentPoem?.author }}</p>
          </div>

          <!-- 诗句内容 -->
          <div v-if="displayContent" class="space-y-2 text-lg">
            <p
              v-for="(line, index) in displayContent"
              :key="index"
              class="poem-line"
              :class="{
                'text-gray-800': index !== currentSentenceIndex,
                'text-blue-600 font-medium':
                  index === currentSentenceIndex && currentDifficulty !== 'hard',
                'text-red-600 font-medium':
                  index === currentSentenceIndex && currentDifficulty === 'hard'
              }"
            >
              {{ line }}
            </p>
          </div>
        </div>
      </div>

      <!-- 答题选项区 -->
      <div class="space-y-2 mt-2 mb-4">
        <button
          v-for="(option, index) in options"
          :key="index"
          :disabled="answered"
          class="w-full text-left p-4 rounded-xl transition-colors text-gray-700 font-medium quiz-option-button"
          :class="getOptionClass(index)"
          @click="() => !answered && handleSelect(index)"
        >
          <span class="mr-2">{{ index + 1 }}.</span>{{ option.label }}
        </button>
      </div>

      <!-- 操作按钮区 -->
      <div class="flex justify-between space-x-4 mb-4">
        <!-- 换音乐按钮 -->
        <button 
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-2 transition-colors" 
          @click="handlePrevMusic"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
          </svg>
          <span>换音乐</span>
        </button>
        
        <!-- 下一首按钮 -->
        <button 
          class="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-2 transition-colors" 
          @click="getNextPoem"
        >
          <span>下一首</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- 简洁反馈提示 -->
      <div
        v-if="answered"
        class="fixed bottom-32 left-1/2 transform -translate-x-1/2 px-5 py-3 rounded-xl shadow-lg z-30"
        :class="isCorrect ? 'bg-green-500' : 'bg-red-500'"
        style="transition: all 0.3s ease"
      >
        <div class="flex flex-col items-center text-white">
          <span class="font-medium">{{ isCorrect ? '答对了!' : '答错了!' }}</span>
          <span v-if="!isCorrect" class="text-white text-sm mt-1"
            >正确答案: {{ correctAnswer }}</span
          >
        </div>
      </div>

      <!-- 底部tab导航 -->
      <nav
        class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around items-center h-16 z-20"
      >
        <!-- 成就页面 -->
        <router-link 
          to="/achievement" 
          class="flex flex-col items-center transition-colors"
          :class="route.name === 'achievement' ? 'text-green-600' : 'text-gray-800 hover:text-green-600'"
        >
          <img 
            src="@/assets/icons/nav/icon_achievement.svg" 
            alt="成就" 
            class="w-7 h-7 mb-0.5"
            :class="route.name === 'achievement' ? 'filter-green' : 'filter-gray'"
          />
        </router-link>
        
        <!-- 主页 -->
        <router-link 
          to="/quizview" 
          class="flex flex-col items-center transition-colors"
          :class="route.name === 'home' ? 'text-green-600' : 'text-gray-800 hover:text-green-600'"
        >
          <img 
            src="@/assets/icons/nav/icon_home.svg" 
            alt="主页" 
            class="w-8 h-8 mb-0.5"
            :class="route.name === 'home' ? 'filter-green' : 'filter-gray'"
          />
        </router-link>
        
        <!-- 设置页面 -->
        <router-link
          to="/settings"
          class="flex flex-col items-center transition-colors"
          :class="route.name === 'settings' ? 'text-green-600' : 'text-gray-800 hover:text-green-600'"
        >
          <img 
            src="@/assets/icons/nav/icon_usersetting.svg" 
            alt="设置" 
            class="w-7 h-7 mb-0.5"
            :class="route.name === 'settings' ? 'filter-green' : 'filter-gray'"
          />
        </router-link>
      </nav>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { usePoemStore } from '../stores/poem'
  import { useUserStore } from '../stores/user'
  import { useRoute } from 'vue-router'
  import soundOnIcon from '@/assets/icons/feature/icon_sound_on.svg'
  import soundOffIcon from '@/assets/icons/feature/icon_sound_off.svg'

  const poemStore = usePoemStore()
  const userStore = useUserStore()
  const route = useRoute()

  const answered = ref(false)
  const selectedOptionIndex = ref<number | null>(null)
  const isCorrect = ref<boolean | null>(null)
  const showFeedback = ref(false)
  const selectedAnswer = ref('')
  const scoreChange = ref(0)
  const soundOn = ref(true)

  const currentPoem = computed(() => poemStore.currentPoem)
  const options = computed(() => poemStore.options)
  const currentSentenceIndex = computed(() => poemStore.currentSentenceIndex)
  const displayContent = computed(() => poemStore.displayContent)
  const hasImage = computed(() => poemStore.hasImage)
  const imagePath = computed(() => poemStore.imagePath)
  const currentDifficulty = computed(() => poemStore.currentDifficulty)

  const correctAnswer = computed(() => {
    const correctOption = options.value.find((opt: any) => opt.isCorrect)
    return correctOption ? correctOption.value : ''
  })

  function getOptionClass(index: number) {
    if (!answered.value) {
      return 'bg-gray-200 hover:bg-gray-300'
    }

    if (index === selectedOptionIndex.value) {
      if (isCorrect.value) {
        return 'bg-green-100 border-green-500 border'
      }
      return 'bg-red-100 border-red-500 border'
    }

    if (options.value[index].isCorrect && !isCorrect.value) {
      return 'bg-green-50 border-green-500 border'
    }

    return 'bg-gray-200 opacity-70'
  }

  function handlePrevMusic() {
    // TODO: 切换上一首背景音乐逻辑
    // 可调用背景音乐管理模块
  }

  function toggleSound() {
    soundOn.value = !soundOn.value
    // TODO: 实际控制音效播放
  }

  async function initialize() {
    console.log('[QuizView] initialize called')
    answered.value = false
    selectedOptionIndex.value = null
    isCorrect.value = null
    showFeedback.value = false
    await poemStore.initialize()
    console.log('[QuizView] poemStore.initialize awaited')
  }

  function handleSelect(index: number) {
    selectedOptionIndex.value = index
    if (index >= 0 && index < options.value.length) {
      const selectedOption = options.value[index]
      selectedAnswer.value = selectedOption.value
      isCorrect.value = poemStore.checkAnswer(selectedOption.value)
      answered.value = true
      if (userStore.isLoggedIn) {
        scoreChange.value = isCorrect.value ? 1 : -1
        userStore.updateScore(scoreChange.value)
      }
    }
  }

  function getNextPoem() {
    answered.value = false
    selectedOptionIndex.value = null
    isCorrect.value = null
    showFeedback.value = false
    poemStore.selectRandomPoem(currentDifficulty.value)
  }

  const retryLoadPoem = () => {
    poemStore.loadError = null
    poemStore.initialize()
  }

  onMounted(() => {
    console.log(
      '[QuizView] onMounted: currentPoem is null:',
      !poemStore.currentPoem,
      ', loadError is null:',
      !poemStore.loadError,
      ', poemStore.isLoading is:',
      poemStore.isLoading
    )

    if (!poemStore.currentPoem && !poemStore.loadError) {
      console.log('[QuizView] onMounted: Conditions met, calling initialize() to load poem data.')
      initialize()
    } else {
      console.log(
        '[QuizView] onMounted: Conditions NOT met or data already present/loading. currentPoem:',
        poemStore.currentPoem,
        ', loadError:',
        poemStore.loadError,
        ', isLoading:',
        poemStore.isLoading
      )
    }
  })
</script>

<style scoped>
  .poem-line {
    text-align: center;
    line-height: 1.8;
  }

  .filter-green {
    filter: brightness(0) saturate(100%) invert(42%) sepia(78%) saturate(1084%) hue-rotate(93deg) brightness(96%) contrast(86%);
  }

  .filter-gray {
    filter: brightness(0) saturate(100%) invert(20%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%);
  }
</style>
