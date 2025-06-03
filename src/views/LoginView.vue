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
          
          <!-- 开发环境配置信息 -->
          <div v-if="isDevelopment" class="mt-4 p-2 bg-blue-50 rounded-lg text-xs text-blue-600">
            <div>API模式: {{ authApi.currentMode }}</div>
            <button 
              class="mt-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              @click="toggleApiMode"
            >
              切换到{{ authApi.currentMode === 'Mock' ? '真实API' : 'Mock' }}
            </button>
          </div>
        </div>

        <!-- 登录按钮区域 -->
        <div class="space-y-4">
          <button
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-success-500 hover:bg-success-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500 transition-colors disabled:opacity-50"
            @click="handleLogin('wechat')"
            :disabled="loading"
          >
            {{ loading ? '登录中...' : '微信登录' }}
          </button>

          <button
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-success-500 hover:bg-success-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500 transition-colors disabled:opacity-50"
            @click="handleLogin('google')"
            :disabled="loading"
          >
            {{ loading ? '登录中...' : 'Google 账号登录' }}
          </button>

          <button
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-success-500 hover:bg-success-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500 transition-colors disabled:opacity-50"
            @click="handleLogin('apple')"
            :disabled="loading"
          >
            {{ loading ? '登录中...' : 'Apple 账号登录' }}
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
  import { useUserStore } from '@/stores/user'
  import authApi from '@/services/authApi'
  import { updateConfig } from '@/config/app'
  import soundOnIcon from '@/assets/icons/feature/icon_sound_on.svg'
  import soundOffIcon from '@/assets/icons/feature/icon_sound_off.svg'

  const router = useRouter()
  const musicStore = useMusicStore()
  const userStore = useUserStore()

  // 状态
  const loading = ref(false)
  const errorMessage = ref('')
  const isDevelopment = import.meta.env.DEV

  // 音效开关
  function toggleSound() {
    musicStore.toggleMute()
  }

  // 切换API模式（仅开发环境）
  function toggleApiMode() {
    if (authApi.currentMode === 'Mock') {
      updateConfig({
        api: { useRealApi: true },
        auth: { mockMode: false }
      })
    } else {
      updateConfig({
        api: { useRealApi: false },
        auth: { mockMode: true }
      })
    }
    // 刷新页面应用配置
    window.location.reload()
  }

  // 处理登录
  const handleLogin = async (provider: 'wechat' | 'google' | 'apple') => {
    try {
      loading.value = true
      errorMessage.value = ''

      // 调用认证API
      const result = await authApi.login(provider)
      
      // 处理语言偏好设置
      // 如果后端返回中文（zh-CN），映射为英语，因为poem store只支持外语
      const userLanguagePreference = result.user.language_preference || 'english'
      const mappedLanguage = userLanguagePreference === 'zh-CN' ? 'english' : userLanguagePreference
      
      // 更新用户状态
      const userData = {
        id: result.user.id,
        username: result.user.display_name,
        score: result.user.total_score,
        language: mappedLanguage
      }
      
      userStore.login(userData, result.token)

      // 跳转到游戏页面
      router.push('/quizview')
    } catch (error: any) {
      errorMessage.value = error.message || '登录失败，请重试'
    } finally {
      loading.value = false
    }
  }

  // 页面加载时启动背景音乐
  onMounted(() => {
    musicStore.startBackgroundMusic()
  })
</script>
