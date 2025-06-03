<template>
  <div class="flex flex-col min-h-screen bg-gray-100 pb-16">
    <!-- 页面标题 -->
    <div class="pt-4 pb-2 text-center">
      <h1 class="text-xl font-bold text-gray-800">唐诗译境设置</h1>
    </div>

    <!-- 设置内容 -->
    <div class="flex-1 px-3">
      <!-- 游戏设置 -->
      <div class="bg-white rounded-xl shadow-md mb-3 p-4">
        <!-- 翻译语言设置（始终显示，困难模式下禁用） -->
        <div class="mb-5" data-testid="language-settings">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-base font-bold">翻译语言</h2>
            <div v-if="difficulty === 'hard'" class="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded">
              困难模式下禁用
            </div>
          </div>
          <div class="text-xs text-gray-500 mb-3">
            {{ difficulty === 'easy' ? '选择您希望看到的外语提示' : '困难模式下不显示外语提示，但可以预设语言' }}
          </div>
          
          <div class="space-y-2">
            <div
              v-for="language in languages"
              :key="language.value"
              class="flex items-center justify-between p-2.5 border rounded-lg transition-colors"
              :class="{
                'bg-success-50 border-success-500': currentLanguage === language.value && difficulty === 'easy',
                'bg-gray-50 border-gray-200 cursor-not-allowed': difficulty === 'hard',
                'cursor-pointer hover:bg-gray-50': difficulty === 'easy' && currentLanguage !== language.value,
                'bg-gray-100 border-gray-300': currentLanguage === language.value && difficulty === 'hard'
              }"
              @click="difficulty === 'easy' ? setLanguage(language.value) : null"
            >
              <div class="flex items-center space-x-2">
                <span class="text-xl" :class="{ 'opacity-50': difficulty === 'hard' }">{{ language.emoji }}</span>
                <span class="font-medium text-sm" :class="{ 'text-gray-400': difficulty === 'hard' }">{{ language.label }}</span>
              </div>
              <div 
                v-if="currentLanguage === language.value"
                class="w-4 h-4 rounded-full flex items-center justify-center"
                :class="difficulty === 'easy' ? 'bg-success-500' : 'bg-gray-400'"
              >
                <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- 难度设置 -->
        <div class="mb-5 border-t pt-4">
          <h2 class="text-base font-bold mb-3">难度</h2>
          
          <div class="space-y-2">
            <div
              class="flex items-center justify-between p-2.5 border rounded-lg cursor-pointer transition-colors"
              :class="{ 'bg-success-50 border-success-500': difficulty === 'easy' }"
              data-testid="difficulty-easy"
              @click="setDifficulty('easy')"
            >
              <div>
                <div class="font-medium text-sm">简单（有提示）</div>
                <div class="text-xs text-gray-500">显示外语提示，答对+1分</div>
              </div>
              <div 
                v-if="difficulty === 'easy'"
                class="w-4 h-4 bg-success-500 rounded-full flex items-center justify-center"
              >
                <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>

            <div
              class="flex items-center justify-between p-2.5 border rounded-lg cursor-pointer transition-colors"
              :class="{ 'bg-success-50 border-success-500': difficulty === 'hard' }"
              data-testid="difficulty-hard"
              @click="setDifficulty('hard')"
            >
              <div>
                <div class="font-medium text-sm">困难（无提示）</div>
                <div class="text-xs text-gray-500">不显示提示，答对+2分</div>
              </div>
              <div 
                v-if="difficulty === 'hard'"
                class="w-4 h-4 bg-success-500 rounded-full flex items-center justify-center"
              >
                <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- 音乐设置 -->
        <div class="border-t pt-4">
          <h2 class="text-base font-bold mb-3">音乐</h2>
          
          <div class="flex items-center justify-between p-2.5 border rounded-lg">
            <div>
              <div class="font-medium text-sm">背景音乐</div>
              <div class="text-xs text-gray-500">开启或关闭游戏背景音乐</div>
            </div>
            <button
              class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
              :class="!musicStore.isMuted ? 'bg-success-500' : 'bg-gray-300'"
              @click="musicStore.toggleMute()"
            >
              <span
                class="inline-block h-3 w-3 transform rounded-full bg-white transition"
                :class="!musicStore.isMuted ? 'translate-x-5' : 'translate-x-1'"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- 账户管理 -->
      <div class="bg-white rounded-xl shadow-md mb-3 p-4">
        <h2 class="text-base font-bold mb-3">账户</h2>
        <div class="mb-3 text-xs text-gray-600">
          当前用户：{{ userStore.username || '测试用户' }}
        </div>
        <button
          class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 px-3 rounded-lg transition-colors text-sm"
          @click="showLogoutDialog = true"
        >
          退出登录
        </button>
      </div>

      <!-- 操作按钮 -->
      <div class="px-1">
        <button
          class="w-full bg-success-500 hover:bg-success-600 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm"
          @click="confirmSettings"
        >
          确定
        </button>
      </div>
    </div>

    <!-- 退出登录确认弹框 -->
    <div
      v-if="showLogoutDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showLogoutDialog = false"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4">
        <!-- 弹框头部 -->
        <div class="p-6 border-b">
          <h3 class="text-lg font-bold text-gray-800">确认退出</h3>
          <p class="text-gray-600 mt-2">您确定要退出登录吗？</p>
        </div>
        
        <!-- 弹框按钮 -->
        <div class="p-6 flex space-x-3">
          <button
            class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            @click="showLogoutDialog = false"
          >
            取消
          </button>
          <button
            class="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            @click="confirmLogout"
          >
            确定退出
          </button>
        </div>
      </div>
    </div>

    <!-- 底部tab导航 -->
    <nav
      class="fixed-mobile bottom-0 bg-white border-t shadow-md flex justify-around items-center h-16 z-20"
    >
      <!-- 成就页面 -->
      <router-link 
        to="/achievement" 
        class="flex flex-col items-center transition-colors"
        :class="$route.name === 'achievement' ? 'text-success-600' : 'text-gray-800 hover:text-success-600'"
      >
        <img 
          src="@/assets/icons/nav/icon_achievement.svg" 
          alt="成就" 
          class="w-7 h-7 mb-0.5"
          :class="$route.name === 'achievement' ? 'filter-green' : 'filter-gray'"
        />
      </router-link>
      
      <!-- 主页 -->
      <router-link 
        to="/quizview" 
        class="flex flex-col items-center transition-colors"
        :class="$route.name === 'home' ? 'text-success-600' : 'text-gray-800 hover:text-success-600'"
      >
        <img 
          src="@/assets/icons/nav/icon_home.svg" 
          alt="主页" 
          class="w-8 h-8 mb-0.5"
          :class="$route.name === 'home' ? 'filter-green' : 'filter-gray'"
        />
      </router-link>
      
      <!-- 设置页面 -->
      <router-link
        to="/settings"
        class="flex flex-col items-center transition-colors"
        :class="$route.name === 'settings' ? 'text-success-600' : 'text-gray-800 hover:text-success-600'"
      >
        <img 
          src="@/assets/icons/nav/icon_usersetting.svg" 
          alt="设置" 
          class="w-7 h-7 mb-0.5"
          :class="$route.name === 'settings' ? 'filter-green' : 'filter-gray'"
        />
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { usePoemStore } from '../stores/poem'
import { useMusicStore } from '../stores/music'
import type { DifficultyLevel } from '../utils/optionsGenerator'

const router = useRouter()
const userStore = useUserStore()
const poemStore = usePoemStore()
const musicStore = useMusicStore()
const difficulty = ref<DifficultyLevel>(poemStore.currentDifficulty || 'easy')
const showLogoutDialog = ref(false)

// 创建响应式的本地语言状态
const currentLanguage = ref<string>('english')

// 可用的提示语言
const languages = [
  { value: 'english', label: '英语', emoji: '🇬🇧' },
  { value: 'french', label: '法语', emoji: '🇫🇷' },
  { value: 'spanish', label: '西班牙语', emoji: '🇪🇸' },
  { value: 'german', label: '德语', emoji: '🇩🇪' },
  { value: 'japanese', label: '日语', emoji: '🇯🇵' }
]

// 设置语言
const setLanguage = async (language: string) => {
  // 更新本地状态
  currentLanguage.value = language
  
  // 更新用户语言设置
  userStore.setLanguage(language)
  
  // 如果是简单模式，同时更新诗歌显示语言
  if (difficulty.value === 'easy') {
    try {
      await poemStore.setDisplayLanguage(language as any)
    } catch (error) {
      console.error('切换语言失败:', error)
    }
  }
}

// 设置难度
const setDifficulty = async (newDifficulty: DifficultyLevel) => {
  difficulty.value = newDifficulty
  poemStore.setDifficulty(newDifficulty)
  
  // 如果切换到简单模式，需要同步当前语言设置
  if (newDifficulty === 'easy') {
    try {
      await poemStore.setDisplayLanguage(userStore.language as any)
    } catch (error) {
      console.error('同步语言设置失败:', error)
    }
  }
}

// 退出登录
const logout = () => {
  userStore.logout()
  router.push('/login')
}

// 确认退出登录
const confirmLogout = () => {
  logout()
  showLogoutDialog.value = false
}

// 确认设置
const confirmSettings = () => {
  // 导航回主页
  router.push('/quizview')
}

// 组件挂载时初始化
onMounted(async () => {
  console.log('设置页面初始化...')
  
  // 1. 首先确保用户存储已初始化
  await userStore.init()
  
  // 2. 同步语言设置
  const userLanguage = userStore.language || 'english'
  currentLanguage.value = userLanguage
  console.log('当前语言已设置为:', userLanguage)
  
  // 3. 同步难度设置
  const currentDifficulty = poemStore.currentDifficulty || 'easy'
  difficulty.value = currentDifficulty
  console.log('当前难度:', currentDifficulty)
  
  // 4. 确保音乐存储状态正确
  console.log('音乐状态:', musicStore.isMuted ? '关闭' : '开启')
  
  // 5. 确保语言设置正确显示
  console.log('用户登录状态:', userStore.isLoggedIn)
  console.log('设置中的语言:', userStore.settings.language)
  
  // 6. 如果是简单模式，确保语言设置同步
  if (difficulty.value === 'easy') {
    try {
      await poemStore.setDisplayLanguage(userLanguage as any)
      console.log('语言设置已同步到诗歌存储')
    } catch (error) {
      console.error('初始化语言设置失败:', error)
    }
  }
})

// 监听诗歌存储的难度变化
watch(() => poemStore.currentDifficulty, (newDifficulty) => {
  if (newDifficulty) {
    difficulty.value = newDifficulty
    console.log('难度已更新为:', newDifficulty)
  }
}, { immediate: true })

// 监听用户语言变化
watch(() => userStore.language, (newLanguage) => {
  if (newLanguage) {
    currentLanguage.value = newLanguage
    console.log('用户语言已更新为:', newLanguage)
  }
}, { immediate: true })
</script>

<style scoped>
  .transition-all {
    transition: all 0.3s ease;
  }

  .filter-green {
    filter: brightness(0) saturate(100%) invert(42%) sepia(78%) saturate(1084%) hue-rotate(93deg) brightness(96%) contrast(86%);
  }

  .filter-gray {
    filter: brightness(0) saturate(100%) invert(20%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%);
  }
</style>
