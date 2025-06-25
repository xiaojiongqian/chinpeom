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
              class="flex items-center justify-between p-2.5 border rounded-lg cursor-pointer transition-colors"
              :class="{
                'bg-success-50 border-success-500': difficulty === 'easy',
                'hover:bg-gray-50': difficulty !== 'easy'
              }"
              data-testid="difficulty-easy"
              @click="setDifficulty('easy')"
            >
              <div>
                <div class="font-medium text-sm">
                  {{ $t('settings.easyMode') }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ $t('settings.easyModeDesc') }}
                </div>
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
              :class="{
                'bg-success-50 border-success-500': difficulty === 'hard',
                'hover:bg-gray-50': difficulty !== 'hard'
              }"
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useMusicStore } from '../stores/music'
import type { SupportedLanguage, DifficultyMode } from '@/types'
import soundOnIcon from '@/assets/icons/feature/icon_sound_on.svg'
import soundOffIcon from '@/assets/icons/feature/icon_sound_off.svg'

const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()
const musicStore = useMusicStore()

// 状态
const currentLanguage = computed(() => userStore.language)
const difficulty = computed(() => userStore.difficulty)
const showLogoutDialog = ref(false)

// 可用语言
const languages = computed<Array<{ value: SupportedLanguage; emoji: string }>>(() => [
  { value: 'chinese', emoji: '🇨🇳' },
  { value: 'english', emoji: '🇬🇧' },
  { value: 'spanish', emoji: '🇪🇸' },
  { value: 'japanese', emoji: '🇯🇵' },
  { value: 'french', emoji: '🇫🇷' },
  { value: 'german', emoji: '🇩🇪' }
])

// 方法
function setDifficulty(newDifficulty: DifficultyMode) {
  userStore.setDifficulty(newDifficulty)
}

function setLanguage(newLanguage: SupportedLanguage) {
  userStore.setLanguage(newLanguage)
}

function confirmSettings() {
  router.push('/quizview')
}

function confirmLogout() {
  userStore.logout()
  showLogoutDialog.value = false
  // 可选：退出后跳转到登录页
  router.push('/login')
}
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
