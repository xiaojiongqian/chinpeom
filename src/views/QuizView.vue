<template>
  <!-- 测验页面 -->
  <div class="flex flex-col min-h-screen bg-gray-100 pb-16">
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
      class="flex-1 flex flex-col items-center justify-center text-center px-4"
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
      <div class="flex items-center justify-between pt-6 pb-3 px-4">
        <div class="flex items-center space-x-2">
          <!-- 移除了音效开关按钮 -->
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
      <div class="bg-white rounded-2xl shadow-md overflow-hidden mb-4 mx-4">
        <!-- 配图 -->
        <div class="relative w-full">
          <img
            v-if="hasImage"
            :src="imagePath"
            :alt="currentPoem?.title"
            class="w-full h-80 object-cover"
          />
          <div v-else class="w-full h-80 flex items-center justify-center bg-gray-200">
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
            <h2 class="text-2xl font-bold text-gray-800 text-center font-mono">{{ currentPoem?.title }}</h2>
            <p class="text-gray-600 text-center mt-1 font-mono">{{ currentPoem?.author }}</p>
          </div>

          <!-- 诗句内容 -->
          <div v-if="displayContent" class="space-y-2 text-lg font-sans">
            <p
              v-for="(line, index) in displayContent"
              :key="index"
              class="poem-line font-medium"
              :class="{
                'text-gray-800': index !== currentSentenceIndex,
                'text-success-400 text-base font-normal': index === currentSentenceIndex
              }"
            >
              {{ line }}
            </p>
          </div>
        </div>
      </div>

      <!-- 答题选项区 -->
      <div class="space-y-2 mt-2 mb-4 px-4">
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
      <div class="flex justify-between items-center mb-4 px-4">
        <!-- 左侧音乐控制按钮组 -->
        <div class="flex items-center space-x-3">
          <!-- 换音乐按钮（移除图标） -->
          <button 
            class="bg-success-500 hover:bg-success-600 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors" 
            @click="handlePrevMusic"
          >
            <span>换音乐</span>
          </button>
          
          <!-- 音效开关按钮 -->
          <button 
            class="bg-success-500 hover:bg-success-600 text-white p-3 rounded-xl transition-colors flex items-center justify-center" 
            @click="toggleSound"
          >
            <img 
              :src="!musicStore.isMuted ? soundOnIcon : soundOffIcon" 
              alt="音效开关" 
              class="w-5 h-5 filter-white" 
            />
          </button>
        </div>
        
        <!-- 中间答题结果显示区域 -->
        <div v-if="answered" class="flex-1 text-center mx-4">
          <div v-if="isCorrect" class="text-success-600 font-medium">
            <div class="text-lg">✓ 答对了!</div>
          </div>
          <div v-else class="text-red-600 font-medium">
            <div class="text-lg">✗ 答错了!</div>
          </div>
        </div>
        
        <!-- 右侧下一首按钮 -->
        <button 
          class="bg-success-500 hover:bg-success-600 text-white px-4 py-3 rounded-xl text-sm font-medium flex items-center space-x-2 transition-colors" 
          @click="getNextPoem"
        >
          <span>下一首</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- 底部tab导航 -->
      <nav
        class="fixed-mobile bottom-0 bg-white border-t shadow-md flex justify-around items-center h-16 z-20"
      >
        <!-- 成就页面 -->
        <router-link 
          to="/achievement" 
          class="flex flex-col items-center transition-colors"
          :class="route.name === 'achievement' ? 'text-success-600' : 'text-gray-800 hover:text-success-600'"
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
          :class="route.name === 'home' ? 'text-success-600' : 'text-gray-800 hover:text-success-600'"
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
          :class="route.name === 'settings' ? 'text-success-600' : 'text-gray-800 hover:text-success-600'"
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
  import { ref, computed, onMounted, onActivated, onUnmounted, nextTick } from 'vue'
  import { usePoemStore } from '../stores/poem'
  import { useUserStore } from '../stores/user'
  import { useMusicStore } from '../stores/music'
  import { useRoute } from 'vue-router'
  import soundOnIcon from '@/assets/icons/feature/icon_sound_on.svg'
  import soundOffIcon from '@/assets/icons/feature/icon_sound_off.svg'

  const poemStore = usePoemStore()
  const userStore = useUserStore()
  const musicStore = useMusicStore()
  const route = useRoute()

  const answered = ref(false)
  const selectedOptionIndex = ref<number | null>(null)
  const isCorrect = ref<boolean | null>(null)
  const showFeedback = ref(false)
  const selectedAnswer = ref('')
  const scoreChange = ref(0)
  const feedbackTimer = ref<NodeJS.Timeout | null>(null)

  const currentPoem = computed(() => poemStore.currentPoem)
  const options = computed(() => poemStore.options)
  const currentSentenceIndex = computed(() => poemStore.currentSentenceIndex)
  const displayContent = computed(() => poemStore.displayContent)
  const hasImage = computed(() => poemStore.hasImage)
  const imagePath = computed(() => poemStore.imagePath)
  const currentDifficulty = computed(() => poemStore.currentDifficulty)

  // 滚动到页面顶部的函数
  function scrollToTop() {
    nextTick(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    })
  }

  // 清除反馈定时器
  function clearFeedbackTimer() {
    if (feedbackTimer.value) {
      clearTimeout(feedbackTimer.value)
      feedbackTimer.value = null
    }
  }

  function getOptionClass(index: number) {
    if (!answered.value) {
      return 'bg-gray-200 hover:bg-gray-300'
    }

    // 已回答状态
    const option = options.value[index]
    const isSelected = index === selectedOptionIndex.value
    const isCorrectOption = option.isCorrect

    if (isSelected) {
      // 用户选中的选项
      if (isCorrect.value) {
        // 选中正确答案：绿色边框和背景
        return 'bg-success-100 border-success-500 border-2'
      } else {
        // 选中错误答案：红色边框和背景
        return 'bg-red-100 border-red-500 border-2'
      }
    } else if (isCorrectOption && !isCorrect.value) {
      // 非选中但是正确答案（用户选错时突出显示正确答案）：绿色边框
      return 'bg-success-50 border-success-500 border-2'
    } else {
      // 其他选项：降低透明度
      return 'bg-gray-200 opacity-60'
    }
  }

  function handlePrevMusic() {
    // 切换到下一首背景音乐
    musicStore.nextMusic()
  }

  function toggleSound() {
    // 切换音乐的静音状态
    musicStore.toggleMute()
  }

  async function initialize() {
    console.log('[QuizView] initialize called')
    // 清除反馈定时器
    clearFeedbackTimer()
    answered.value = false
    selectedOptionIndex.value = null
    isCorrect.value = null
    showFeedback.value = false
    await poemStore.initialize()
    console.log('[QuizView] poemStore.initialize awaited')
    // 初始化后滚动到顶部
    scrollToTop()
  }

  function handleSelect(index: number) {
    selectedOptionIndex.value = index
    if (index >= 0 && index < options.value.length) {
      const selectedOption = options.value[index]
      selectedAnswer.value = selectedOption.value
      isCorrect.value = poemStore.checkAnswer(selectedOption.value)
      answered.value = true
      
      if (userStore.isLoggedIn) {
        // 根据难度模式调整得分
        const difficultyMultiplier = currentDifficulty.value === 'hard' ? 2 : 1
        scoreChange.value = isCorrect.value ? difficultyMultiplier : -difficultyMultiplier
        
        // 尝试更新分数，如果被限制则显示升级提示
        const updateSuccess = userStore.updateScore(scoreChange.value)
        
        // 如果分数更新被限制（免费用户达到上限）
        if (!updateSuccess && isCorrect.value) {
          // 重置scoreChange，因为实际没有增加分数
          scoreChange.value = 0
          // 显示升级提示
          setTimeout(() => {
            if (confirm('🎉 恭喜答对！\n\n您已达到免费用户的最高学级：秀才\n是否升级VIP继续挑战更高学级？')) {
              // 跳转到成就页面，用户可以在那里购买升级
              window.location.href = '/achievement'
            }
          }, 1000) // 延迟1秒显示，让用户看到答对的反馈
        }
      }
      // 移除自动隐藏定时器，让用户手动点击下一首
    }
  }

  function getNextPoem() {
    // 清除反馈定时器
    clearFeedbackTimer()
    answered.value = false
    selectedOptionIndex.value = null
    isCorrect.value = null
    showFeedback.value = false
    poemStore.selectRandomPoem(currentDifficulty.value)
    // 切换到下一首诗时滚动到顶部
    scrollToTop()
  }

  const retryLoadPoem = () => {
    poemStore.loadError = null
    poemStore.initialize()
    // 重试时滚动到顶部
    scrollToTop()
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

    // 页面首次加载时滚动到顶部
    scrollToTop()

    // 启动主页面背景音乐（默认开启）
    musicStore.startMainPageMusic()

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

  // 当keep-alive组件被激活时（从其他页面返回时）
  onActivated(() => {
    console.log('[QuizView] onActivated: 页面被激活，滚动到顶部')
    scrollToTop()
  })

  // 在组件卸载时清理定时器
  onUnmounted(() => {
    clearFeedbackTimer()
  })
</script>

<style scoped>
  .poem-line {
    text-align: center;
    line-height: 1.8;
    font-weight: 500;
    letter-spacing: 0.02em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2rem;
  }

  /* 外文内容样式优化 */
  .poem-line.text-base {
    font-size: 0.9rem;
    line-height: 1.6;
    font-style: italic;
  }

  .font-mono {
    font-family: "Courier New", Courier, "Lucida Console", "Monaco", monospace;
  }

  .filter-green {
    filter: brightness(0) saturate(100%) invert(42%) sepia(78%) saturate(1084%) hue-rotate(93deg) brightness(96%) contrast(86%);
  }

  .filter-gray {
    filter: brightness(0) saturate(100%) invert(20%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%);
  }

  .filter-white {
    filter: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
  }
</style>
