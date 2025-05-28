<template>
  <div class="flex flex-col min-h-screen bg-gray-100 px-4 pb-16">
    <!-- 页面标题 -->
    <div class="pt-6 pb-3 text-center">
      <h1 class="text-2xl font-bold text-gray-800">唐诗译境设置</h1>
    </div>

    <!-- 设置内容 -->
    <div class="flex-1">
      <!-- 翻译语言设置 -->
      <div class="bg-white rounded-xl shadow-md mb-4 p-6">
        <h2 class="text-lg font-bold mb-4">翻译语言</h2>
        
        <div class="space-y-3">
          <div
            v-for="language in languages"
            :key="language.value"
            class="flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors"
            :class="{ 'bg-green-50 border-green-500': userStore.language === language.value }"
            @click="setLanguage(language.value)"
          >
            <div class="flex items-center space-x-3">
              <span class="text-2xl">{{ language.emoji }}</span>
              <span class="font-medium">{{ language.label }}</span>
            </div>
            <div 
              v-if="userStore.language === language.value"
              class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
            >
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 难度设置 -->
      <div class="bg-white rounded-xl shadow-md mb-4 p-6">
        <h2 class="text-lg font-bold mb-4">难度</h2>
        
        <div class="space-y-3">
          <div
            class="flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors"
            :class="{ 'bg-green-50 border-green-500': difficulty === 'easy' }"
            @click="setDifficulty('easy')"
          >
            <div>
              <div class="font-medium">简单（有提示）</div>
              <div class="text-sm text-gray-500">显示外语提示，答对+1分</div>
            </div>
            <div 
              v-if="difficulty === 'easy'"
              class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
            >
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>

          <div
            class="flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors"
            :class="{ 'bg-green-50 border-green-500': difficulty === 'hard' }"
            @click="setDifficulty('hard')"
          >
            <div>
              <div class="font-medium">困难（无提示）</div>
              <div class="text-sm text-gray-500">不显示提示，答对+2分</div>
            </div>
            <div 
              v-if="difficulty === 'hard'"
              class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
            >
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 退出登录按钮 -->
      <div class="bg-white rounded-xl shadow-md mb-4 p-6">
        <h2 class="text-lg font-bold mb-4">账户</h2>
        <div class="mb-4 text-sm text-gray-600">
          当前用户：{{ userStore.username || '测试用户' }}
        </div>
        <button
          class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
          @click="showLogoutDialog = true"
        >
          退出登录
        </button>
      </div>

      <!-- 确定按钮 -->
      <div class="bg-white rounded-xl shadow-md mb-4 p-6">
        <button
          class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
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
      class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around items-center h-16 z-20"
    >
      <!-- 成就页面 -->
      <router-link 
        to="/achievement" 
        class="flex flex-col items-center transition-colors"
        :class="$route.name === 'achievement' ? 'text-green-600' : 'text-gray-800 hover:text-green-600'"
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
        :class="$route.name === 'home' ? 'text-green-600' : 'text-gray-800 hover:text-green-600'"
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
        :class="$route.name === 'settings' ? 'text-green-600' : 'text-gray-800 hover:text-green-600'"
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { usePoemStore } from '../stores/poem'
import type { DifficultyLevel } from '../utils/optionsGenerator'

const router = useRouter()
const userStore = useUserStore()
const poemStore = usePoemStore()
const difficulty = ref<DifficultyLevel>(poemStore.currentDifficulty || 'easy')
const showLogoutDialog = ref(false)

// 可用的提示语言
const languages = [
  { value: 'english', label: '英语', emoji: '🇬🇧' },
  { value: 'french', label: '法语', emoji: '🇫🇷' },
  { value: 'spanish', label: '西班牙语', emoji: '🇪🇸' },
  { value: 'german', label: '德语', emoji: '🇩🇪' },
  { value: 'japanese', label: '日语', emoji: '🇯🇵' }
]

// 设置语言
const setLanguage = (language: string) => {
  userStore.setLanguage(language)
}

// 设置难度
const setDifficulty = (newDifficulty: DifficultyLevel) => {
  difficulty.value = newDifficulty
  poemStore.setDifficulty(newDifficulty)
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
