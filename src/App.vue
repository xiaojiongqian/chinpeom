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
  import { onMounted, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useUserStore } from '@/stores/user'
  import { usePoemStore } from '@/stores/poem'
  import DevPanel from '@/components/DevPanel.vue'
  import logger from '@/utils/logger'

  const { locale } = useI18n()
  const router = useRouter()
  const userStore = useUserStore()
  const poemStore = usePoemStore()

  const languageToLocale: Record<string, string> = {
    chinese: 'zh-CN',
    english: 'en',
    spanish: 'es',
    japanese: 'ja',
    french: 'fr',
    german: 'de'
  }

  onMounted(async () => {
    logger.info('[App] 启动初始化流程')
    const accountLoaded = await userStore.bootstrap()

    const initialLocale = languageToLocale[userStore.language] || 'en'
    locale.value = initialLocale

    if (!accountLoaded) {
      logger.info('[App] 未检测到账户，跳转至引导页')
      if (router.currentRoute.value.name !== 'onboarding') {
        await router.replace({ name: 'onboarding' })
      }
      return
    }

    logger.info('[App] 账户加载完成，初始化诗歌数据')
    await poemStore.initialize()

    if (router.currentRoute.value.name === 'onboarding') {
      await router.replace({ name: 'home' })
    }
  })

  watch(
    () => userStore.language,
    newLanguage => {
      const newLocale = languageToLocale[newLanguage] || 'en'
      if (locale.value !== newLocale) {
        locale.value = newLocale
        logger.info('[App] 同步UI语言', newLocale)
      }
    },
    { immediate: true }
  )
</script>

<style>
  @import './assets/main.css';
</style>
