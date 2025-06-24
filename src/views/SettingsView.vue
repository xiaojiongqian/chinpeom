<template>
  <div class="flex flex-col min-h-screen bg-gray-100 pb-16">
    <!-- 页面标题 -->
    <div class="pt-4 pb-2 text-center">
      <h1 class="text-xl font-bold text-gray-800">{{ $t('settings.title') }}</h1>
    </div>

    <!-- 设置内容 -->
    <div class="flex-1 px-3">
      <!-- 游戏设置 -->
      <div class="bg-white rounded-xl shadow-md mb-3 p-4">
        <!-- 语言设置（始终可用，同时控制界面语言和诗歌提示语言） -->
        <div class="mb-5" data-testid="language-settings">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-base font-bold">{{ $t('settings.language') }}</h2>
            <div class="flex items-center space-x-2">
              <div v-if="currentLanguage === 'chinese'" class="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">
                {{ $t('common.chineseMode') }}
              </div>
              <!-- 调试信息 -->
              <div class="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
                {{ currentLanguage }}
              </div>
            </div>
          </div>

          
          <div class="space-y-2">
            <div
              v-for="language in languages"
              :key="language.value"
              class="flex items-center justify-between p-2.5 border rounded-lg cursor-pointer transition-colors"
              :class="{
                'bg-success-50 border-success-500': currentLanguage === language.value,
                'hover:bg-gray-50': currentLanguage !== language.value
              }"
              :data-testid="`language-${language.value}`"
              @click="setLanguage(language.value)"
            >
              <div class="flex items-center space-x-2">
                <span class="text-xl">{{ language.emoji }}</span>
                <span class="font-medium text-sm">{{ $t(`languages.${language.value}`) }}</span>
              </div>
              <div 
                v-if="currentLanguage === language.value"
                class="w-4 h-4 bg-success-500 rounded-full flex items-center justify-center"
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
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-base font-bold">{{ $t('settings.difficulty') }}</h2>
            <!-- 调试信息 -->
            <div class="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
              {{ difficulty }}
            </div>
          </div>
          
          <div class="space-y-2">
            <div
              class="flex items-center justify-between p-2.5 border rounded-lg transition-colors"
              :class="{
                'bg-success-50 border-success-500': difficulty === 'easy' && currentLanguage !== 'chinese',
                'cursor-pointer': currentLanguage !== 'chinese',
                'cursor-not-allowed bg-gray-100 border-gray-300': currentLanguage === 'chinese'
              }"
              data-testid="difficulty-easy"
              @click="currentLanguage !== 'chinese' ? setDifficulty('easy') : null"
            >
              <div>
                <div class="font-medium text-sm" :class="{ 'text-gray-400': currentLanguage === 'chinese' }">
                  {{ $t('settings.easyMode') }}
                  <span v-if="currentLanguage === 'chinese'" class="text-xs text-gray-400">（{{ $t('settings.chineseModeUnavailable') }}）</span>
                </div>
                <div class="text-xs" :class="currentLanguage === 'chinese' ? 'text-gray-400' : 'text-gray-500'">
                  {{ $t('settings.easyModeDesc') }}
                </div>
              </div>
              <div 
                v-if="difficulty === 'easy' && currentLanguage !== 'chinese'"
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
                <div class="font-medium text-sm">{{ $t('settings.hardMode') }}</div>
                <div class="text-xs text-gray-500">{{ $t('settings.hardModeDesc') }}</div>
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
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-base font-bold">{{ $t('settings.music') }}</h2>
            <!-- 调试信息 -->
            <div class="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
              {{ musicStore.isMuted ? 'Off' : 'On' }}
            </div>
          </div>
          <div
            class="flex items-center justify-between p-2.5 border rounded-lg cursor-pointer transition-colors"
            :class="{ 'bg-success-50 border-success-500': !musicStore.isMuted }"
            @click="musicStore.toggleMute()"
          >
            <div>
              <div class="font-medium text-sm">{{ $t('settings.musicEnabled') }}</div>
              <div class="text-xs text-gray-500">{{ $t('settings.musicDesc') }}</div>
            </div>
            <div 
              v-if="!musicStore.isMuted"
              class="w-4 h-4 bg-success-500 rounded-full flex items-center justify-center"
            >
              <svg class="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户信息 -->
      <div class="bg-white rounded-xl shadow-md mb-3 p-4">
        <h2 class="text-base font-bold mb-3">{{ $t('settings.userInfo') }}</h2>
        <div class="mb-3 text-xs text-gray-600">
          {{ $t('settings.currentUser') }}：{{ userStore.username || $t('settings.guestUser') }}
        </div>
        <button
          class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 px-3 rounded-lg transition-colors text-sm"
          @click="showLogoutDialog = true"
        >
          {{ $t('common.logout') }}
        </button>
      </div>

      <!-- 操作按钮 -->
      <div class="px-1">
        <button
          class="w-full bg-success-500 hover:bg-success-600 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm"
          @click="confirmSettings"
        >
          {{ $t('common.confirm') }}
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
          <h3 class="text-lg font-bold text-gray-800">{{ $t('settings.confirmLogout') }}</h3>
          <p class="text-gray-600 mt-2">{{ $t('settings.confirmLogoutText') }}</p>
        </div>
        
        <!-- 弹框按钮 -->
        <div class="p-6 flex space-x-3">
          <button
            class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            @click="showLogoutDialog = false"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            class="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            @click="confirmLogout"
          >
            {{ $t('settings.confirmLogoutAction') }}
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
          :alt="$t('common.achievement')" 
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
          :alt="$t('common.home')" 
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
          :alt="$t('common.settings')" 
          class="w-7 h-7 mb-0.5"
          :class="$route.name === 'settings' ? 'filter-green' : 'filter-gray'"
        />
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../stores/user'
import { usePoemStore } from '../stores/poem'
import { useMusicStore } from '../stores/music'
import authApi from '@/services/authApi'
import type { DifficultyLevel } from '../utils/optionsGenerator'

const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()
const poemStore = usePoemStore()
const musicStore = useMusicStore()
const difficulty = ref<DifficultyLevel>(poemStore.currentDifficulty || userStore.difficulty || 'easy')
const showLogoutDialog = ref(false)

// 创建响应式的本地语言状态 - 初始化为当前用户语言或设置语言
const currentLanguage = ref<string>(userStore.language || userStore.settings.language || 'english')

// 可用的提示语言
const languages = [
  { value: 'chinese', label: '中文（仅困难模式）', emoji: '🇨🇳' },
  { value: 'english', label: '英语', emoji: '🇬🇧' },
  { value: 'french', label: '法语', emoji: '🇫🇷' },
  { value: 'spanish', label: '西班牙语', emoji: '🇪🇸' },
  { value: 'german', label: '德语', emoji: '🇩🇪' },
  { value: 'japanese', label: '日语', emoji: '🇯🇵' }
]

// 设置语言 - 统一语言设置，同时控制界面语言和诗歌提示语言
const setLanguage = async (language: string) => {
  // 更新本地状态
  currentLanguage.value = language
  
  // 更新用户语言设置（界面语言）
  userStore.setLanguage(language as any)
  
  // 中文模式检查：如果选择中文，必须切换到困难模式
  if (language === 'chinese') {
    difficulty.value = 'hard'
    poemStore.setDifficulty('hard')
    // 中文模式下诗歌提示语言设置为"none"
    console.log('切换到中文模式，诗歌提示语言设置为none')
  } else {
    // 非中文模式：同时更新诗歌显示语言（如果是简单模式）
    if (difficulty.value === 'easy') {
      try {
        await poemStore.setDisplayLanguage(language as any)
        console.log('语言设置已同步到诗歌显示语言:', language)
      } catch (error) {
        console.error('同步诗歌显示语言失败:', error)
      }
    }
  }
  
  console.log('语言设置已更新为:', language)
}

// 设置难度
const setDifficulty = async (newDifficulty: DifficultyLevel) => {
  difficulty.value = newDifficulty
  poemStore.setDifficulty(newDifficulty)
  
  // 如果切换到简单模式且不是中文模式，需要同步当前语言设置到诗歌显示语言
  if (newDifficulty === 'easy' && currentLanguage.value !== 'chinese') {
    try {
      await poemStore.setDisplayLanguage(currentLanguage.value as any)
      console.log('切换到简单模式，语言设置已同步:', currentLanguage.value)
    } catch (error) {
      console.error('同步语言设置失败:', error)
    }
  }
  
  console.log('难度设置已更新为:', newDifficulty)
}

// 退出登录
const logout = async () => {
  try {
    // 调用认证API登出（会处理Firebase登出）
    await authApi.logout()
    
    // 调用用户存储登出（清理本地状态）
    userStore.logout()
    
    // 跳转到登录页面
    router.push('/login')
  } catch (error) {
    console.error('登出失败:', error)
    // 即使登出失败，也要清理本地状态
    userStore.logout()
    router.push('/login')
  }
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
  
  // 2. 等待一个tick确保所有响应式数据已更新
  await nextTick()
  
  // 3. 同步语言设置 - 优先使用用户语言，其次使用设置中的语言
  const userLanguage = userStore.language || userStore.settings.language || 'english'
  currentLanguage.value = userLanguage
  console.log('当前语言已设置为:', userLanguage)
  
  // 4. 同步难度设置
  const currentDifficulty = poemStore.currentDifficulty || userStore.difficulty || 'easy'
  difficulty.value = currentDifficulty
  console.log('当前难度:', currentDifficulty)
  
  // 5. 确保音乐存储状态正确
  console.log('音乐状态:', musicStore.isMuted ? 'Off' : 'On')
  
  // 6. 确保语言设置正确显示
  console.log('用户登录状态:', userStore.isLoggedIn)
  console.log('设置中的语言:', userStore.settings.language)
  console.log('用户语言:', userStore.language)
  
  // 7. 如果是简单模式且不是中文模式，确保语言设置同步到诗歌显示语言
  if (difficulty.value === 'easy' && userLanguage !== 'chinese') {
    try {
      await poemStore.setDisplayLanguage(userLanguage as any)
      console.log('语言设置已同步到诗歌存储:', userLanguage)
    } catch (error) {
      console.error('初始化语言设置失败:', error)
    }
  }
})

// 监听诗歌存储的难度变化
watch(() => poemStore.currentDifficulty, (newDifficulty) => {
  if (newDifficulty && newDifficulty !== difficulty.value) {
    difficulty.value = newDifficulty
    console.log('诗歌存储难度已更新为:', newDifficulty)
  }
}, { immediate: true })

// 监听用户设置的难度变化（作为后备）
watch(() => userStore.difficulty, (newDifficulty) => {
  if (newDifficulty && !poemStore.currentDifficulty && newDifficulty !== difficulty.value) {
    difficulty.value = newDifficulty
    console.log('用户设置难度已更新为:', newDifficulty)
  }
}, { immediate: true })

// 监听用户语言变化
watch(() => userStore.language, (newLanguage) => {
  if (newLanguage && newLanguage !== currentLanguage.value) {
    currentLanguage.value = newLanguage
    console.log('用户语言已更新为:', newLanguage)
  }
}, { immediate: true })

// 监听用户设置中的语言变化（作为后备）
watch(() => userStore.settings.language, (newLanguage) => {
  if (newLanguage && !userStore.language && newLanguage !== currentLanguage.value) {
    currentLanguage.value = newLanguage
    console.log('设置语言已更新为:', newLanguage)
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
    filter: brightness(0) saturate(100%) invert(60%) sepia(7%) saturate(0%) hue-rotate(157deg) brightness(95%) contrast(85%);
  }
</style>
