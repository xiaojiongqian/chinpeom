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
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { usePoemStore } from '@/stores/poem'
import DevPanel from '@/components/DevPanel.vue'

// 应用级初始化
onMounted(async () => {
  console.log('应用初始化开始...')
  
  // 1. 初始化用户存储（包含设置）
  const userStore = useUserStore()
  userStore.init()
  console.log('用户存储初始化完成，默认语言:', userStore.language)
  
  // 2. 初始化诗歌存储，确保使用正确的默认设置
  const poemStore = usePoemStore()
  console.log('诗歌存储默认难度:', poemStore.currentDifficulty)
  
  console.log('应用初始化完成 - 音效默认开启，难度默认简单，语言默认英语')
})
</script>

<style>
  @import './assets/main.css';
</style>
