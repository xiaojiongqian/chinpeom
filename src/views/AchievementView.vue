<template>
  <div class="flex flex-col min-h-screen bg-gray-100 pb-16">
    <!-- 页面标题 -->
    <div class="pt-6 pb-3 text-center">
      <h1 class="text-2xl font-bold text-gray-800">成绩</h1>
    </div>

    <div class="flex-1 flex flex-col items-center px-4">
      <!-- 用户信息卡片 -->
      <div class="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div class="flex items-center p-6">
          <div class="flex-shrink-0 mr-4">
            <div class="h-16 w-16 rounded-full bg-success-500 flex items-center justify-center">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-semibold">{{ userStore.username || 'PoemHoby' }}</h2>
            <div class="flex items-center mt-1">
              <span class="text-gray-700 mr-2">{{ userStore.rank }}</span>
              <span class="text-gray-500 text-sm">({{ userStore.score }}分)</span>
            </div>
          </div>
          <div class="text-gray-400">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="w-full max-w-md bg-white rounded-xl shadow-md p-6 mb-8">
        <div class="flex items-center justify-between mb-2">
          <div>
            <span class="flex items-center">
              <span class="text-success-500 mr-2">
                <svg
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  ></path>
                </svg>
              </span>
              <span class="font-medium">学级: {{ userStore.rank }}</span>
            </span>
          </div>
          <div class="text-gray-600 text-sm">得分: {{ userStore.score }}</div>
        </div>

        <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div class="bg-success-500 h-3 rounded-full" :style="{ width: `${scoreProgress}%` }"></div>
        </div>

        <div class="text-sm text-gray-500">
          下一级别还需 {{ nextLevelScore - userStore.score }} 分
        </div>
      </div>

      <!-- 解锁按钮 -->
      <div class="w-full max-w-md">
        <button
          class="w-full flex items-center justify-center p-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow transition-colors"
        >
          <span class="mr-2">
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              ></path>
            </svg>
          </span>
          购买解锁新学级
        </button>
      </div>

      <!-- 返回按钮 -->
      <div class="w-full max-w-md mt-8">
        <router-link
          to="/quizview"
          class="block w-full text-center p-4 bg-success-500 hover:bg-success-600 text-white font-semibold rounded-lg shadow transition-colors"
        >
          返回
        </router-link>
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
import { computed } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

// 计算分数进度
const levelThresholds = [0, 10, 25, 45, 70, 100, 135, 175, 220, 280, 340, Infinity]

const nextLevelScore = computed(() => {
  const currentScore = userStore.score
  for (let i = 0; i < levelThresholds.length - 1; i++) {
    if (currentScore >= levelThresholds[i] && currentScore < levelThresholds[i + 1]) {
      return levelThresholds[i + 1]
    }
  }
  return levelThresholds[levelThresholds.length - 1]
})

const scoreProgress = computed(() => {
  const currentScore = userStore.score
  for (let i = 0; i < levelThresholds.length - 1; i++) {
    if (currentScore >= levelThresholds[i] && currentScore < levelThresholds[i + 1]) {
      const min = levelThresholds[i]
      const max = levelThresholds[i + 1]
      const progress = ((currentScore - min) / (max - min)) * 100
      return Math.min(Math.max(progress, 0), 100)
    }
  }
  return 100
})
</script>

<style scoped>
  .filter-green {
    filter: brightness(0) saturate(100%) invert(42%) sepia(78%) saturate(1084%) hue-rotate(93deg) brightness(96%) contrast(86%);
  }

  .filter-gray {
    filter: brightness(0) saturate(100%) invert(20%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%);
  }
</style> 