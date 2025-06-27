<!--
  开发环境调试面板
  提供API模式切换、配置查看等功能
-->
<template>
  <div v-if="isDevelopment" class="fixed bottom-4 right-4 z-50">
    <!-- 浮动按钮 -->
    <button
      v-if="!showPanel"
      class="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-colors"
      @click="showPanel = true"
      title="开发面板"
    >
      🔧
    </button>

    <!-- 面板 -->
    <div
      v-if="showPanel"
      class="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-h-96 overflow-y-auto"
    >
      <!-- 头部 -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">开发面板</h3>
        <button
          class="text-gray-400 hover:text-gray-600 text-xl"
          @click="showPanel = false"
        >
          ×
        </button>
      </div>

      <!-- API配置 -->
      <div class="mb-4">
        <h4 class="text-sm font-medium text-gray-700 mb-2">API配置</h4>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">模式:</span>
            <span class="text-sm font-medium" :class="apiModeClass">
              {{ appConfig.auth.mockMode ? 'Mock' : 'Real' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">地址:</span>
            <span class="text-xs text-gray-500 max-w-32 truncate" :title="appConfig.api.baseUrl">
              {{ appConfig.api.baseUrl }}
            </span>
          </div>
        </div>
      </div>

      <!-- 切换按钮 -->
      <div class="space-y-2 mb-4">
        <button
          class="w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          :class="appConfig.auth.mockMode 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'"
          @click="setMockMode"
        >
          Mock API模式
        </button>
        <button
          class="w-full py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          :class="!appConfig.auth.mockMode 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'"
          @click="setRealMode"
        >
          真实API模式
        </button>
      </div>

      <!-- 日志统计 -->
      <div class="mb-4" v-if="logStats">
        <h4 class="text-sm font-medium text-gray-700 mb-2">日志统计</h4>
        <div class="space-y-1 text-xs text-gray-600">
          <div class="flex justify-between">
            <span>调试日志:</span>
            <span>{{ logStats.debug }}</span>
          </div>
          <div class="flex justify-between">
            <span>信息日志:</span>
            <span>{{ logStats.info }}</span>
          </div>
          <div class="flex justify-between">
            <span>错误日志:</span>
            <span class="text-red-600">{{ logStats.error }}</span>
          </div>
        </div>
        <button
          class="mt-2 w-full py-1 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs"
          @click="clearLogs"
        >
          清除日志
        </button>
      </div>

      <!-- 快捷操作 -->
      <div class="space-y-2">
        <button
          class="w-full py-2 px-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
          @click="testApiConnection"
          :disabled="testing"
        >
          {{ testing ? '测试中...' : '测试API连接' }}
        </button>
        <button
          class="w-full py-2 px-3 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-sm font-medium transition-colors"
          @click="refreshPage"
        >
          刷新页面
        </button>
      </div>

      <!-- 测试结果 -->
      <div v-if="testResult" class="mt-3 p-2 rounded-lg text-xs" :class="testResultClass">
        {{ testResult }}
      </div>

      <div class="mb-2">
        <button 
          @click="clearAllCache"
          class="px-2 py-1 bg-red-500 text-white text-xs rounded mr-2"
        >
          清除缓存
        </button>
        <button 
          @click="showUserStoreInfo"
          class="px-2 py-1 bg-blue-500 text-white text-xs rounded mr-2"
        >
          用户信息
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import appConfig, { updateConfig } from '@/config/app'
import logger from '@/utils/logger'

const isDevelopment = import.meta.env.DEV
const showPanel = ref(false)
const testing = ref(false)
const testResult = ref('')

// 计算属性
const apiModeClass = computed(() => {
  return appConfig.auth.mockMode ? 'text-orange-600' : 'text-green-600'
})

const testResultClass = computed(() => {
  if (testResult.value.includes('成功')) {
    return 'bg-green-50 text-green-700 border border-green-200'
  } else if (testResult.value.includes('失败')) {
    return 'bg-red-50 text-red-700 border border-red-200'
  }
  return 'bg-gray-50 text-gray-700 border border-gray-200'
})

// 模拟日志统计（在实际应用中应该从logger获取）
const logStats = ref({
  debug: 0,
  info: 0,
  error: 0
})

// 设置Mock模式
function setMockMode() {
  updateConfig({
    api: { useRealApi: false },
    auth: { mockMode: true }
  })
  logger.info('切换到Mock API模式')
  testResult.value = '已切换到Mock模式，页面将刷新'
  setTimeout(() => window.location.reload(), 1000)
}

// 设置真实API模式
function setRealMode() {
  updateConfig({
    api: { useRealApi: true },
    auth: { mockMode: false }
  })
  logger.info('切换到真实API模式')
  testResult.value = '已切换到真实API模式，页面将刷新'
  setTimeout(() => window.location.reload(), 1000)
}

// 测试API连接
async function testApiConnection() {
  testing.value = true
  testResult.value = ''
  
  try {
    const response = await fetch(`${appConfig.api.baseUrl.replace('/api', '')}/api/health`)
    if (response.ok) {
      testResult.value = '✅ API连接测试成功'
    } else {
      testResult.value = `❌ API连接失败: ${response.status}`
    }
  } catch (error) {
    testResult.value = `❌ API连接失败: ${error}`
  } finally {
    testing.value = false
  }
}

// 清除日志
function clearLogs() {
  // 尝试清除日志（如果logger支持clear方法）
  if (typeof (logger as any).clear === 'function') {
    (logger as any).clear()
  }
  logStats.value = { debug: 0, info: 0, error: 0 }
  testResult.value = '日志已清除'
}

// 刷新页面
function refreshPage() {
  window.location.reload()
}

// 清除所有缓存
function clearAllCache() {
  localStorage.clear()
  sessionStorage.clear()
  testResult.value = '✅ 所有缓存已清除，页面将刷新'
  setTimeout(() => window.location.reload(), 1000)
}

// 显示用户存储信息
function showUserStoreInfo() {
  const userData = localStorage.getItem('user_data')
  const settings = localStorage.getItem('app_settings')
  const token = localStorage.getItem('token')
  
  console.group('🔍 用户存储信息')
  console.log('用户数据:', userData ? JSON.parse(userData) : 'null')
  console.log('应用设置:', settings ? JSON.parse(settings) : 'null')
  console.log('Token存在:', !!token)
  console.groupEnd()
  
  testResult.value = '✅ 用户信息已打印到控制台'
}
</script> 