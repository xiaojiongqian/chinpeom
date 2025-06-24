<template>
  <div class="flex flex-col min-h-screen bg-gray-100 pb-16">
    <!-- 页面标题 -->
    <div class="pt-6 pb-3 text-center">
      <h1 class="text-2xl font-bold text-gray-800">{{ $t('achievement.title') }}</h1>
    </div>

    <div class="flex-1 flex flex-col items-center px-4">
      <!-- 用户信息卡片 -->
      <div class="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div class="flex items-center p-6">
          <div class="flex-shrink-0 mr-4">
            <div class="h-16 w-16 rounded-full bg-success-500 flex items-center justify-center text-2xl">
              {{ userStore.rankDetails.emoji }}
            </div>
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-semibold">{{ userStore.username || 'PoemHoby' }}</h2>
            <div class="flex items-center mt-1">
              <span class="text-gray-700 mr-2">{{ $t(userStore.rank) }}</span>
              <span class="text-gray-500 text-sm">({{ userStore.score }}{{ $t('achievement.userScoreDisplay') }})</span>
              <!-- 付费用户标识 -->
              <span v-if="userStore.isPaidUser" class="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                VIP
              </span>
            </div>
          </div>
          <div class="text-gray-400 cursor-pointer" @click="showRankInfo = true">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- 当前等级详细信息 -->
      <div class="w-full max-w-md bg-white rounded-xl shadow-md p-6 mb-6">
        <div class="text-center">
          <div class="text-3xl mb-2">{{ userStore.rankDetails.emoji }}</div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">{{ $t(userStore.rankDetails.name) }}</h3>
          <p class="text-gray-600 text-sm leading-relaxed">{{ $t(userStore.rankDetails.description) }}</p>
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
              <span class="font-medium">{{ $t('achievement.rankLevel') }}: {{ $t(userStore.rank) }}</span>
            </span>
          </div>
          <div class="text-gray-600 text-sm">{{ $t('achievement.totalScore') }}: {{ userStore.score }}</div>
        </div>

        <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div class="bg-success-500 h-3 rounded-full" :style="{ width: `${scoreProgress}%` }"></div>
        </div>

        <div class="text-sm text-gray-500">
          <span v-if="!userStore.isAtFreeLimit">
            {{ $t('achievement.scoreToNext') }} {{ nextLevelScore - userStore.score }} {{ $t('achievement.points') }}
          </span>
          <span v-else class="text-amber-600 font-medium">
            {{ $t('achievement.freeUserWarning') }}
          </span>
        </div>
      </div>

      <!-- 解锁按钮区域 -->
      <div class="w-full max-w-md">
        <!-- 免费用户：显示升级VIP按钮 -->
        <button
          v-if="!userStore.isPaidUser"
          @click="showUpgradeModal = true"
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
          <span v-if="userStore.isAtFreeLimit">{{ $t('achievement.unlockNewLevels') }}</span>
          <span v-else>{{ $t('achievement.upgradeVipMember') }}</span>
        </button>
        
        <!-- 付费用户：显示VIP状态 -->
        <div v-else class="w-full p-4 bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300 text-amber-800 text-center rounded-lg">
          <div class="flex items-center justify-center mb-2">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span class="font-semibold">{{ $t('achievement.vipMember') }}</span>
          </div>
          <div class="text-sm">
            {{ $t('achievement.vipUnlocked') }}
          </div>
        </div>
      </div>

      <!-- 学习进度提示 -->
      <div class="w-full max-w-md mt-4">
        <div v-if="!userStore.isPaidUser && userStore.isAtFreeLimit" class="p-3 bg-orange-50 border border-orange-200 text-orange-700 text-center rounded-lg text-sm">
          {{ $t('achievement.freeUserWarning') }}
        </div>
        <div v-else-if="!userStore.isPaidUser" class="p-3 bg-blue-50 border border-blue-200 text-blue-700 text-center rounded-lg text-sm">
          {{ $t('achievement.freeUserTip') }}
        </div>
        <div v-else class="p-3 bg-green-50 border border-green-200 text-green-700 text-center rounded-lg text-sm">
          {{ $t('achievement.vipUserTip') }}
        </div>
      </div>

      <!-- 返回按钮 -->
      <div class="w-full max-w-md mt-8">
        <router-link
          to="/quizview"
          class="block w-full text-center p-4 bg-success-500 hover:bg-success-600 text-white font-semibold rounded-lg shadow transition-colors"
        >
          {{ $t('common.back') }}
        </router-link>
      </div>
    </div>

    <!-- 等级说明模态框 -->
    <div v-if="showRankInfo" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-800">{{ $t('achievement.rankSystem') }}</h3>
            <button @click="showRankInfo = false" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div v-for="(level, index) in allLevels" :key="level.name" 
                 :class="[
                   'p-4 rounded-lg border-2 transition-colors',
                   level.name === userStore.rank ? 'border-success-500 bg-success-50' : 'border-gray-200',
                   !userStore.isPaidUser && index > 1 ? 'opacity-60' : ''
                 ]">
              <div class="flex items-center mb-2">
                <span class="text-2xl mr-3">{{ level.emoji }}</span>
                <div>
                  <h4 class="font-semibold text-gray-800">{{ $t(level.name) }}</h4>
                  <p class="text-sm text-gray-600">{{ level.minScore }}-{{ level.maxScore === Infinity ? '∞' : level.maxScore }}{{ $t('achievement.scoreRange') }}</p>
                </div>
                <div class="ml-auto">
                  <span v-if="level.name === userStore.rank" class="px-2 py-1 bg-success-500 text-white text-xs rounded-full">
                    {{ $t('achievement.currentLevel') }}
                  </span>
                  <span v-else-if="!userStore.isPaidUser && index > 1" class="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                    {{ $t('achievement.premiumLevel') }}
                  </span>
                </div>
              </div>
              <p class="text-sm text-gray-700 leading-relaxed">{{ $t(level.description) }}</p>
            </div>
          </div>
          
          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 class="font-semibold text-blue-800 mb-2">💡 {{ $t('achievement.tip') }}</h4>
            <p class="text-sm text-blue-700">
              {{ $t('achievement.freeUserTipText') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 付费升级模态框 -->
    <div v-if="showUpgradeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-lg max-w-md w-full">
        <div class="p-6">
          <div class="text-center mb-6">
            <div class="text-4xl mb-4">🎓</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-2">{{ $t('achievement.upgradeVip') }}</h3>
            <p class="text-gray-600">
              <span v-if="userStore.isAtFreeLimit">
                {{ $t('achievement.upgradeVipDesc1') }}<br>
                {{ $t('achievement.upgradeVipDesc2') }}
              </span>
              <span v-else>
                {{ $t('achievement.upgradeVipDesc3') }}<br>
                {{ $t('achievement.upgradeVipDesc4') }}
              </span>
            </p>
          </div>
          
          <div class="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg mb-6">
            <h4 class="font-semibold text-amber-800 mb-3">{{ $t('achievement.vipFeatures') }}</h4>
            <ul class="text-sm text-amber-700 space-y-2">
              <li class="flex items-center">
                <span class="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                {{ $t('achievement.vipFeature1') }}
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                {{ $t('achievement.vipFeature2') }}
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                {{ $t('achievement.vipFeature3') }}
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                {{ $t('achievement.vipFeature4') }}
              </li>
            </ul>
          </div>
          
          <div class="space-y-3">
            <button 
              @click="simulateUpgrade"
              class="w-full p-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow transition-colors"
            >
              {{ $t('achievement.upgradeNow') }}
            </button>
            <button 
              @click="showUpgradeModal = false"
              class="w-full p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span v-if="userStore.isAtFreeLimit">{{ $t('achievement.continueFreeTier') }}</span>
              <span v-else>{{ $t('achievement.maybeLater') }}</span>
            </button>
          </div>
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
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../stores/user'

const { t } = useI18n()
const userStore = useUserStore()

// 模态框状态
const showRankInfo = ref(false)
const showUpgradeModal = ref(false)

// 所有等级信息（用于等级说明）
const allLevels = computed(() => [
  { name: 'rank.baiDing', minScore: 0, maxScore: 10, description: 'rankDesc.baiDing', emoji: '📚' },
  { name: 'rank.xueTong', minScore: 11, maxScore: 25, description: 'rankDesc.xueTong', emoji: '🎓' },
  { name: 'rank.xiuCai', minScore: 26, maxScore: 45, description: 'rankDesc.xiuCai', emoji: '📜' },
  { name: 'rank.linSheng', minScore: 46, maxScore: 70, description: 'rankDesc.linSheng', emoji: '🖋️' },
  { name: 'rank.gongSheng', minScore: 71, maxScore: 100, description: 'rankDesc.gongSheng', emoji: '📖' },
  { name: 'rank.juRen', minScore: 101, maxScore: 135, description: 'rankDesc.juRen', emoji: '🏆' },
  { name: 'rank.gongShi', minScore: 136, maxScore: 175, description: 'rankDesc.gongShi', emoji: '🎭' },
  { name: 'rank.jinShi', minScore: 176, maxScore: 220, description: 'rankDesc.jinShi', emoji: '👑' },
  { name: 'rank.tanHua', minScore: 221, maxScore: 280, description: 'rankDesc.tanHua', emoji: '🌸' },
  { name: 'rank.bangYan', minScore: 281, maxScore: 340, description: 'rankDesc.bangYan', emoji: '💎' },
  { name: 'rank.zhuangYuan', minScore: 341, maxScore: Infinity, description: 'rankDesc.zhuangYuan', emoji: '👑' }
])

// 计算分数进度
const levelThresholds = [0, 10, 25, 45, 70, 100, 135, 175, 220, 280, 340, Infinity]

const nextLevelScore = computed(() => {
  const currentScore = userStore.score
  
  // 如果是免费用户且已达到上限，显示付费解锁信息
  if (userStore.isAtFreeLimit) {
    return userStore.FREE_USER_MAX_SCORE
  }
  
  for (let i = 0; i < levelThresholds.length - 1; i++) {
    if (currentScore >= levelThresholds[i] && currentScore < levelThresholds[i + 1]) {
      return levelThresholds[i + 1]
    }
  }
  return levelThresholds[levelThresholds.length - 1]
})

const scoreProgress = computed(() => {
  const currentScore = userStore.score
  
  // 如果是免费用户且已达到上限，进度条显示100%
  if (userStore.isAtFreeLimit) {
    return 100
  }
  
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

// 模拟付费升级（演示功能）
function simulateUpgrade() {
  userStore.upgradeToPaid()
  showUpgradeModal.value = false
  // 这里可以添加升级成功的提示
  alert(t('achievement.upgradeSuccess'))
}
</script>

<style scoped>
  .filter-green {
    filter: brightness(0) saturate(100%) invert(42%) sepia(78%) saturate(1084%) hue-rotate(93deg) brightness(96%) contrast(86%);
  }

  .filter-gray {
    filter: brightness(0) saturate(100%) invert(20%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%);
  }
</style> 