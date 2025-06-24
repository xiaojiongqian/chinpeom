<template>
  <div class="flex flex-col min-h-screen bg-gray-100 py-12">
    <div class="flex-1 flex flex-col items-center justify-center px-4">
      <div class="max-w-xs w-full bg-white rounded-2xl shadow-md p-6">
        <!-- Logo部分 -->
        <div class="flex justify-center mb-8">
          <img
            src="@/assets/login_floatwater.webp"
            :alt="$t('common.appName')"
            class="w-40 h-40 rounded-full object-cover shadow-lg"
          />
        </div>

        <!-- 标题和描述 -->
        <div class="text-center mb-8">
          <div class="flex items-center justify-center mb-3">
            <h1 class="text-3xl font-bold text-gray-800">{{ $t('login.appTitle') }}</h1>
            <!-- 音效开关按钮 - 位于标题右侧 -->
            <button class="ml-3 p-2 rounded-full hover:bg-gray-100" @click="toggleSound">
              <img :src="!musicStore.isMuted ? soundOnIcon : soundOffIcon" :alt="$t('common.soundToggle')" class="w-6 h-6" />
            </button>
          </div>
          <p class="mt-3 text-base text-gray-600">{{ $t('login.subtitle') }}</p>
          
          <!-- 开发环境配置信息 -->
          <div v-if="isDevelopment" class="mt-4 p-2 bg-blue-50 rounded-lg text-xs text-blue-600">
            <div>{{ $t('login.apiMode') }}: {{ authApi.currentMode }}</div>
            <div v-if="authApi.isFirebaseAuthenticated()" class="text-green-600">
              {{ $t('login.firebaseConnected') }}
            </div>
            <button 
              class="mt-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
              @click="toggleApiMode"
            >
              {{ authApi.currentMode === 'Mock' ? $t('login.switchToApi') : $t('login.switchToMock') }}
            </button>
          </div>
        </div>

        <!-- 登录按钮区域 -->
        <div class="space-y-4">
          <!-- Google 登录按钮 - 使用Firebase集成，特殊样式 -->
          <button
            class="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            @click="handleLogin('google')"
            :disabled="loading"
          >
            <!-- Google Logo SVG -->
            <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {{ loading ? $t('login.loggingIn') : $t('login.googleLogin') }}
          </button>

          <button
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-success-500 hover:bg-success-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500 transition-colors disabled:opacity-50"
            @click="handleLogin('wechat')"
            :disabled="loading"
          >
            {{ loading ? $t('login.loggingIn') : $t('login.wechatLogin') }}
          </button>

          <button
            class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
            @click="handleLogin('apple')"
            :disabled="loading"
          >
            {{ loading ? $t('login.loggingIn') : $t('login.appleLogin') }}
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
  import { useI18n } from 'vue-i18n'
  import { useMusicStore } from '../stores/music'
  import { useUserStore } from '@/stores/user'
  import authApi from '@/services/authApi'
  import { updateConfig } from '@/config/app'
  import soundOnIcon from '@/assets/icons/feature/icon_sound_on.svg'
  import soundOffIcon from '@/assets/icons/feature/icon_sound_off.svg'

  const router = useRouter()
  const { t } = useI18n()
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

      console.log(`[LoginView] 开始${provider}登录流程`)

      // 添加超时处理，避免无限等待
      const loginPromise = authApi.login(provider)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(t('login.loginTimeout'))), 30000) // 30秒超时
      )
      
      // 调用认证API (带超时)
      const result = await Promise.race([loginPromise, timeoutPromise]) as any
      
      console.log('[LoginView] 登录成功，处理用户数据')
      
      // 处理语言偏好设置
      // 优先使用当前用户设置的语言，如果没有则使用后端返回的语言偏好
      const currentUserLanguage = userStore.language
      const backendLanguage = result.user.language_preference
      
      // 如果用户已经有语言设置，保持当前设置；否则使用后端返回的语言
      const finalLanguage = currentUserLanguage !== 'english' ? currentUserLanguage : (backendLanguage || 'english')
      
      // 更新用户状态
      const userData = {
        id: result.user.id,
        username: result.user.display_name,
        score: result.user.total_score,
        language: finalLanguage as any
      }
      
      userStore.login(userData, result.token)

      console.log('[LoginView] 跳转到游戏页面')
      // 跳转到游戏页面
      router.push('/quizview')
    } catch (error: any) {
      console.error(`[LoginView] ${provider}登录失败:`, error)
      
      // 根据错误类型提供更友好的错误信息
      let friendlyMessage = error.message || t('login.loginFailed')
      
      if (error.message.includes('popup-closed-by-user')) {
        friendlyMessage = t('login.loginCancelled')
      } else if (error.message.includes('popup-blocked')) {
        friendlyMessage = t('login.popupBlocked')
      } else if (error.message.includes('network') || error.message.includes('超时')) {
        friendlyMessage = t('login.networkError')
      } else if (error.message.includes('Firebase')) {
        friendlyMessage = t('login.googleServiceError')
      }
      
      errorMessage.value = friendlyMessage
    } finally {
      loading.value = false
    }
  }

  // 页面加载时启动背景音乐
  onMounted(() => {
    musicStore.startBackgroundMusic()
    
    // 检查redirect认证结果
    checkRedirectAuth()
  })

  // 检查redirect认证结果
  const checkRedirectAuth = async () => {
    try {
      const result = await authApi.checkRedirectResult()
      if (result) {
        console.log('[LoginView] 检测到redirect认证结果，处理登录')
        
        // 处理语言偏好设置
        // 优先使用当前用户设置的语言，如果没有则使用后端返回的语言偏好
        const currentUserLanguage = userStore.language
        const backendLanguage = result.user.language_preference
        
        // 如果用户已经有语言设置，保持当前设置；否则使用后端返回的语言
        const finalLanguage = currentUserLanguage !== 'english' ? currentUserLanguage : (backendLanguage || 'english')
        
        // 更新用户状态
        const userData = {
          id: result.user.id,
          username: result.user.display_name,
          score: result.user.total_score,
          language: finalLanguage as any
        }
        
        userStore.login(userData, result.token)
        
        console.log('[LoginView] Redirect认证成功，跳转到游戏页面')
        router.push('/quizview')
      }
    } catch (error: any) {
      console.error('[LoginView] 处理redirect认证失败:', error)
      errorMessage.value = t('login.googleServiceError')
    }
  }
</script>

<style scoped>
  /* 已有的样式 */
</style>
