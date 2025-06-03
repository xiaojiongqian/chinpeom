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
            <div class="h-16 w-16 rounded-full bg-success-500 flex items-center justify-center text-2xl">
              {{ userStore.rankDetails.emoji }}
            </div>
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-semibold">{{ userStore.username || 'PoemHoby' }}</h2>
            <div class="flex items-center mt-1">
              <span class="text-gray-700 mr-2">{{ userStore.rank }}</span>
              <span class="text-gray-500 text-sm">({{ userStore.score }}分)</span>
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
          <h3 class="text-xl font-bold text-gray-800 mb-2">{{ userStore.rankDetails.name }}</h3>
          <p class="text-gray-600 text-sm leading-relaxed">{{ userStore.rankDetails.description }}</p>
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
          <span v-if="!userStore.isAtFreeLimit">
            下一级别还需 {{ nextLevelScore - userStore.score }} 分
          </span>
          <span v-else class="text-amber-600 font-medium">
            ⚠️ 免费用户最高等级：秀才
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
          <span v-if="userStore.isAtFreeLimit">立即解锁新学级</span>
          <span v-else>升级VIP会员</span>
        </button>
        
        <!-- 付费用户：显示VIP状态 -->
        <div v-else class="w-full p-4 bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300 text-amber-800 text-center rounded-lg">
          <div class="flex items-center justify-center mb-2">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span class="font-semibold">VIP会员</span>
          </div>
          <div class="text-sm">
            🎉 已解锁全部学级，可无限制冲击状元！
          </div>
        </div>
      </div>

      <!-- 学习进度提示 -->
      <div class="w-full max-w-md mt-4">
        <div v-if="!userStore.isPaidUser && userStore.isAtFreeLimit" class="p-3 bg-orange-50 border border-orange-200 text-orange-700 text-center rounded-lg text-sm">
          ⚠️ 您已达到免费用户最高学级，升级VIP继续挑战更高境界！
        </div>
        <div v-else-if="!userStore.isPaidUser" class="p-3 bg-blue-50 border border-blue-200 text-blue-700 text-center rounded-lg text-sm">
          💡 继续答题冲击更高学级，或升级VIP解锁无限可能！
        </div>
        <div v-else class="p-3 bg-green-50 border border-green-200 text-green-700 text-center rounded-lg text-sm">
          🚀 VIP会员无限制，继续您的诗词修炼之路！
        </div>
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

    <!-- 等级说明模态框 -->
    <div v-if="showRankInfo" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-800">学级制度说明</h3>
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
                   !userStore.isPaidUser && index > 2 ? 'opacity-60' : ''
                 ]">
              <div class="flex items-center mb-2">
                <span class="text-2xl mr-3">{{ level.emoji }}</span>
                <div>
                  <h4 class="font-semibold text-gray-800">{{ level.name }}</h4>
                  <p class="text-sm text-gray-600">{{ level.minScore }}-{{ level.maxScore === Infinity ? '∞' : level.maxScore }}分</p>
                </div>
                <div class="ml-auto">
                  <span v-if="level.name === userStore.rank" class="px-2 py-1 bg-success-500 text-white text-xs rounded-full">
                    当前
                  </span>
                  <span v-else-if="!userStore.isPaidUser && index > 2" class="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                    付费
                  </span>
                </div>
              </div>
              <p class="text-sm text-gray-700 leading-relaxed">{{ level.description }}</p>
            </div>
          </div>
          
          <div class="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 class="font-semibold text-blue-800 mb-2">💡 提示</h4>
            <p class="text-sm text-blue-700">
              免费用户可升级至秀才，体验古诗词学习的乐趣。升级VIP可解锁所有学级，享受完整的文学成长之路！
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
            <h3 class="text-2xl font-bold text-gray-800 mb-2">升级VIP会员</h3>
            <p class="text-gray-600">
              <span v-if="userStore.isAtFreeLimit">
                您已达到免费用户的最高学级：秀才<br>
                升级VIP即可继续您的文学修炼之路
              </span>
              <span v-else>
                解锁完整的学习体验<br>
                享受无限制的诗词学习之旅
              </span>
            </p>
          </div>
          
          <div class="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg mb-6">
            <h4 class="font-semibold text-amber-800 mb-3">🌟 VIP特权</h4>
            <ul class="text-sm text-amber-700 space-y-2">
              <li class="flex items-center">
                <span class="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                解锁全部11个学级（白丁→状元）
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                无分数上限，挑战文学巅峰
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                专属VIP标识，彰显学者身份
              </li>
              <li class="flex items-center">
                <span class="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                优先体验新功能和题库更新
              </li>
            </ul>
          </div>
          
          <div class="space-y-3">
            <button 
              @click="simulateUpgrade"
              class="w-full p-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow transition-colors"
            >
              立即升级VIP（演示模式）
            </button>
            <button 
              @click="showUpgradeModal = false"
              class="w-full p-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span v-if="userStore.isAtFreeLimit">继续免费使用</span>
              <span v-else>稍后再说</span>
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
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

// 模态框状态
const showRankInfo = ref(false)
const showUpgradeModal = ref(false)

// 所有等级信息（用于等级说明）
const allLevels = [
  { name: '白丁', minScore: 0, maxScore: 10, description: '初学者，刚开始接触诗词的启蒙阶段', emoji: '📚' },
  { name: '学童', minScore: 11, maxScore: 25, description: '已有基础认知，能够理解简单的诗词内容', emoji: '🎓' },
  { name: '秀才', minScore: 26, maxScore: 45, description: '具备一定文学素养，能欣赏诗词之美', emoji: '📜' },
  { name: '廪生', minScore: 46, maxScore: 70, description: '文学功底扎实，深谙诗词韵律', emoji: '🖋️' },
  { name: '贡生', minScore: 71, maxScore: 100, description: '学识渊博，对诗词有独到见解', emoji: '📖' },
  { name: '举人', minScore: 101, maxScore: 135, description: '才华出众，能够创作优美诗句', emoji: '🏆' },
  { name: '贡士', minScore: 136, maxScore: 175, description: '诗词造诣精深，文采斐然', emoji: '🎭' },
  { name: '进士', minScore: 176, maxScore: 220, description: '学富五车，诗词功力炉火纯青', emoji: '👑' },
  { name: '探花', minScore: 221, maxScore: 280, description: '诗词大家，作品流传千古', emoji: '🌸' },
  { name: '榜眼', minScore: 281, maxScore: 340, description: '文坛巨匠，诗词成就卓越', emoji: '💎' },
  { name: '状元', minScore: 341, maxScore: Infinity, description: '诗圣境界，千古传诵的文学大师', emoji: '👑' }
]

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
  alert('🎉 恭喜！您已成功升级为VIP用户，现在可以冲击更高学级了！')
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