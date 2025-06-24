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
import { RouterView } from 'vue-router'
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { usePoemStore } from '@/stores/poem'
import DevPanel from '@/components/DevPanel.vue'

const { locale } = useI18n()

// 语言到locale的映射
const languageToLocale = {
  chinese: 'zh-CN',
  english: 'en',
  spanish: 'es',
  japanese: 'ja',
  french: 'fr',
  german: 'de'
}

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
  
  console.log('应用初始化完成 - 音效默认开启，难度默认简单，语言默认英语')
})

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
