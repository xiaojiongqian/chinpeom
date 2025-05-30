<template>
  <div class="flex flex-col min-h-screen bg-gray-100 py-12">
    <div class="flex-1 flex flex-col items-center justify-center px-4">
      <div class="max-w-xs w-full bg-white rounded-2xl shadow-md p-6">
        <!-- Logo部分 -->
        <div class="flex justify-center mb-8">
          <img
            src="@/assets/login_floatwater.webp"
            alt="唐诗译境"
            class="w-40 h-40 rounded-full object-cover shadow-lg"
          />
        </div>

        <!-- 标题和描述 -->
        <div class="text-center mb-8">
          <div class="flex items-center justify-center mb-3">
            <h1 class="text-3xl font-bold text-gray-800">唐诗译境</h1>
            <!-- 音效开关按钮 - 位于标题右侧 -->
            <button class="ml-3 p-2 rounded-full hover:bg-gray-100" @click="toggleSound">
              <img :src="!musicStore.isMuted ? soundOnIcon : soundOffIcon" alt="音效开关" class="w-6 h-6" />
            </button>
          </div>
          <p class="mt-3 text-base text-gray-600">配合其它语言来学习唐诗的游戏</p>
        </div>

        <!-- 登录按钮区域 -->
        <div class="space-y-4">
          <button
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-success-500 hover:bg-success-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500 transition-colors"
            @click="handleLogin('wechat')"
          >
            微信登录
          </button>

          <button
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-success-500 hover:bg-success-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500 transition-colors"
            @click="handleLogin('google')"
          >
            Google 账号登录
          </button>

          <button
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-success-500 hover:bg-success-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500 transition-colors"
            @click="handleLogin('apple')"
          >
            Apple 账号登录
          </button>

          <button
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-success-500 hover:bg-success-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500 transition-colors"
            @click="handleLogin('x')"
          >
            X 账号登录
          </button>
        </div>

        <div v-if="errorMessage" class="text-red-500 text-center mt-6 text-sm">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useMusicStore } from '../stores/music'
  import soundOnIcon from '@/assets/icons/feature/icon_sound_on.svg'
  import soundOffIcon from '@/assets/icons/feature/icon_sound_off.svg'
  // import { useUserStore } from '@/stores/user' // 暂时注释掉，因为我们直接跳转

  const router = useRouter()
  const musicStore = useMusicStore()
  // const userStore = useUserStore() // 暂时注释掉

  // 状态
  const loading = ref(false)
  const errorMessage = ref('')

  // 音效开关
  function toggleSound() {
    musicStore.toggleMute()
  }

  // 处理登录
  const handleLogin = async (_provider: string) => {
    try {
      loading.value = true
      errorMessage.value = ''

      // 模拟登录过程
      await new Promise(resolve => setTimeout(resolve, 100)) // 缩短延迟

      // // 登录成功，更新用户状态 (暂时注释掉用户状态更新逻辑)
      // const userData = {
      //   id: Date.now(), // 使用时间戳作为临时ID
      //   username: `user_${provider}`,
      //   score: 0,
      //   language: 'english'
      // }
      // userStore.login(userData, 'mock-token')

      // 直接跳转到 QuizView 页面
      router.push('/quizview') // 修改跳转路径
    } catch (error: any) {
      errorMessage.value = error.message || '登录跳转失败，请重试'
    } finally {
      loading.value = false
    }
  }

  // 页面加载时启动背景音乐
  onMounted(() => {
    musicStore.startBackgroundMusic()
  })
</script>
