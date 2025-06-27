<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 全局容器，限制最大宽度并居中 -->
    <div class="mx-auto max-w-md min-h-screen">
      <RouterView />
    </div>
    
    <!-- 开发面板（仅开发环境显示） -->
    <DevPanel />
  </div>
</template>

<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { usePoemStore } from '@/stores/poem'
import DevPanel from '@/components/DevPanel.vue'
import { authApi } from '@/services/authApi'
import { firebaseAuth } from '@/services/firebaseAuth'
import logger from '@/utils/logger'

const { locale } = useI18n()
const router = useRouter()

// 语言到locale的映射
const languageToLocale = {
  chinese: 'zh-CN',
  english: 'en',
  spanish: 'es',
  japanese: 'ja',
  french: 'fr',
  german: 'de'
}

// Firebase状态监听器
let unsubscribeAuth: (() => void) | null = null

// 应用级初始化
onMounted(async () => {
  console.log('应用初始化开始...')
  
  // 1. 初始化用户存储（包含设置）
  const userStore = useUserStore()
  userStore.init()
  console.log('用户存储初始化完成，默认语言:', userStore.language)
  
  // 2. 同步初始语言到i18n
  const initialLocale = languageToLocale[userStore.language] || 'en'
  locale.value = initialLocale
  console.log('i18n语言设置为:', initialLocale)
  
  // 3. 初始化诗歌存储，确保使用正确的默认设置
  const poemStore = usePoemStore()
  console.log('诗歌存储默认难度:', poemStore.currentDifficulty)
  
  // 4. 检查Firebase redirect认证结果
  try {
    logger.info('[App] 检查Firebase redirect认证结果')
    const redirectResult = await authApi.checkRedirectResult()
    
    if (redirectResult) {
      logger.info('[App] 检测到redirect认证成功，更新用户状态')
      await handleSuccessfulAuth(redirectResult, userStore)
    } else {
      logger.info('[App] 没有检测到redirect认证结果')
    }
  } catch (error) {
    logger.error('[App] 检查redirect认证结果失败:', error)
  }
  
  // 5. 设置Firebase实时状态监听（临时修复）
  unsubscribeAuth = firebaseAuth.onAuthStateChanged(async (user) => {
    logger.info('[App] Firebase状态变化:', {
      hasUser: !!user,
      userDisplayName: user?.displayName,
      userEmail: user?.email,
      isCurrentlyLoggedIn: userStore.isLoggedIn,
      currentRoute: router.currentRoute.value.path
    })
    
    if (user) {
      logger.info('[App] Firebase用户存在，检查是否需要更新本地状态')
      
      // 如果本地已经登录且用户UID匹配，说明是popup登录刚完成，不需要重复处理
      if (userStore.isLoggedIn && userStore.user?.id) {
        logger.info('[App] 本地已登录，跳过状态变化处理')
        return
      }
      
      // 检查是否需要更新本地状态（即使已经登录也要检查）
      if (!userStore.isLoggedIn) {
        logger.info('[App] 本地未登录，执行登录流程')
        
        try {
          // 获取Firebase ID Token
          const firebaseIdToken = await user.getIdToken()
          logger.info('[App] 获取到Firebase ID Token，发送到后端验证')
          
          // 发送Firebase ID Token到后端验证，获取JWT token
          const { appConfig } = await import('@/config/app')
          const response = await fetch(`${appConfig.api.baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              provider: 'google',
              access_token: firebaseIdToken,
              firebase_uid: user.uid
            })
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || '后端认证失败')
          }

          const authResult = await response.json()
          logger.info('[App] 后端认证成功，获得JWT token')
            
          await handleSuccessfulAuth(authResult, userStore)
          logger.info('[App] 通过状态监听完成认证，跳转到主页')
        } catch (error) {
          logger.error('[App] 处理Firebase状态变化失败:', error)
        }
      } else {
        logger.info('[App] 本地已登录，检查是否在登录页面需要跳转')
        
        // 如果已经登录但仍在登录页面，直接跳转
        if (router.currentRoute.value.path === '/login') {
          logger.info('[App] 已登录用户在登录页面，直接跳转到主页')
          await router.push({ name: 'home' })
        }
      }
    } else {
      logger.info('[App] Firebase用户不存在，用户未登录')
    }
  })
  
  console.log('应用初始化完成 - 音效默认开启，难度默认简单，语言默认英语')
})

// 组件卸载时清理监听器
onUnmounted(() => {
  if (unsubscribeAuth) {
    unsubscribeAuth()
  }
})

// 处理成功认证的通用逻辑
async function handleSuccessfulAuth(authResult: any, userStore: any) {
  // 后端locale到前端语言的映射
  const backendToFrontendLanguage: Record<string, string> = {
    'zh-CN': 'chinese',
    'en': 'english',
    'es': 'spanish',
    'ja': 'japanese',
    'fr': 'french',
    'de': 'german'
  }
  
  // 转换后端返回的用户数据格式到store格式
  const backendLanguage = authResult.user.language_preference || 'en'
  const frontendLanguage = backendToFrontendLanguage[backendLanguage] || 'english'
  
  const userData = {
    id: authResult.user.id,
    username: authResult.user.display_name,
    score: authResult.user.total_score,
    language: frontendLanguage,
    isPaid: authResult.user.is_premium
  }
  
  // 登录用户状态
  userStore.login(userData, authResult.token)
  
  logger.info('[App] 认证成功，用户数据已更新')
  
  // 跳转到主页
  if (router.currentRoute.value.path === '/login') {
    await router.push({ name: 'home' })
    logger.info('[App] 已跳转到主页')
  }
}

// 监听用户语言变化并同步到i18n
const userStore = useUserStore()
watch(() => userStore.language, (newLanguage) => {
  const newLocale = languageToLocale[newLanguage] || 'en'
  locale.value = newLocale
  console.log('UI语言已切换到:', newLocale)
}, { immediate: true })
</script>

<style>
  @import './assets/main.css';
</style>
