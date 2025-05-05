<template>
  <div class="max-w-3xl mx-auto">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="bg-blue-700 text-white p-4 text-center">
        <h1 class="text-2xl font-bold">设置</h1>
      </div>
      
      <div class="p-6 space-y-8">
        <!-- 语言设置 -->
        <div>
          <h2 class="text-xl font-bold mb-4">提示语言</h2>
          <p class="text-gray-600 mb-4">选择您希望看到的提示语言（仅在简单和普通模式下有效）</p>
          
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button 
              v-for="language in languages" 
              :key="language.value"
              @click="setLanguage(language.value)"
              class="p-4 border rounded-lg flex flex-col items-center justify-center transition-colors"
              :class="{'bg-blue-50 border-blue-500': userStore.language === language.value}"
            >
              <span class="text-2xl mb-2">{{ language.emoji }}</span>
              <span>{{ language.label }}</span>
            </button>
          </div>
        </div>
        
        <!-- 难度设置 -->
        <div class="border-t pt-6">
          <h2 class="text-xl font-bold mb-4">难度设置</h2>
          <p class="text-gray-600 mb-4">选择答题的难度级别</p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              @click="setDifficulty('easy')" 
              class="border rounded-lg p-4 cursor-pointer transition-all"
              :class="{'bg-green-50 border-green-500': difficulty === 'easy'}"
            >
              <div class="flex items-center mb-2">
                <span class="text-lg font-bold text-green-600">简单模式</span>
                <span class="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">推荐新手</span>
              </div>
              <ul class="text-sm space-y-1 text-gray-600">
                <li>• 显示外语提示</li>
                <li>• 答对+1分，答错-1分</li>
                <li>• 选项差异较大</li>
              </ul>
            </div>
            
            <div 
              @click="setDifficulty('normal')" 
              class="border rounded-lg p-4 cursor-pointer transition-all"
              :class="{'bg-blue-50 border-blue-500': difficulty === 'normal'}"
            >
              <div class="flex items-center mb-2">
                <span class="text-lg font-bold text-blue-600">普通模式</span>
                <span class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">标准难度</span>
              </div>
              <ul class="text-sm space-y-1 text-gray-600">
                <li>• 显示外语提示</li>
                <li>• 答对+2分，答错-1分</li>
                <li>• 选项难度适中</li>
              </ul>
            </div>
            
            <div 
              @click="setDifficulty('hard')" 
              class="border rounded-lg p-4 cursor-pointer transition-all"
              :class="{'bg-red-50 border-red-500': difficulty === 'hard'}"
            >
              <div class="flex items-center mb-2">
                <span class="text-lg font-bold text-red-600">困难模式</span>
                <span class="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">高级挑战</span>
              </div>
              <ul class="text-sm space-y-1 text-gray-600">
                <li>• 不显示外语提示</li>
                <li>• 答对+3分，答错-2分</li>
                <li>• 选项极为相似</li>
              </ul>
            </div>
          </div>
        </div>
        
        <!-- 用户信息 -->
        <div v-if="userStore.isLoggedIn" class="border-t pt-6">
          <h2 class="text-xl font-bold mb-4">用户信息</h2>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <p><span class="font-medium">用户名：</span>{{ userStore.username }}</p>
            <p><span class="font-medium">当前得分：</span>{{ userStore.score }}</p>
            <p><span class="font-medium">学级称号：</span>{{ userStore.rank }}</p>
          </div>
          
          <div class="mt-4">
            <button 
              @click="confirmReset" 
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              重置得分
            </button>
          </div>
        </div>
        
        <!-- 学级说明 -->
        <div class="border-t pt-6">
          <h2 class="text-xl font-bold mb-4">学级称号说明</h2>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <ul class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <li><span class="font-medium">白丁：</span>0-10分</li>
              <li><span class="font-medium">学童：</span>11-25分</li>
              <li><span class="font-medium">秀才：</span>26-45分</li>
              <li><span class="font-medium">廪生：</span>46-70分</li>
              <li><span class="font-medium">贡生：</span>71-100分</li>
              <li><span class="font-medium">举人：</span>101-135分</li>
              <li><span class="font-medium">贡士：</span>136-175分</li>
              <li><span class="font-medium">进士：</span>176-220分</li>
              <li><span class="font-medium">探花：</span>221-280分</li>
              <li><span class="font-medium">榜眼：</span>281-340分</li>
              <li><span class="font-medium">状元：</span>341分以上</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 确认对话框 -->
  <div v-if="showConfirmDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full">
      <h3 class="text-xl font-bold mb-4">确认重置</h3>
      <p class="mb-6">重置后您的得分将归零，学级称号将重新开始。确定要重置吗？</p>
      <div class="flex justify-end space-x-4">
        <button 
          @click="showConfirmDialog = false" 
          class="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          取消
        </button>
        <button 
          @click="resetScore" 
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          确认重置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../stores/user'
import { usePoemStore } from '../stores/poem'
import type { DifficultyLevel } from '../utils/optionsGenerator'

const userStore = useUserStore()
const poemStore = usePoemStore()
const showConfirmDialog = ref(false)
const difficulty = ref<DifficultyLevel>(poemStore.currentDifficulty || 'normal')

// 可用的提示语言
const languages = [
  { value: 'english', label: '英语', emoji: '🇬🇧' },
  { value: 'french', label: '法语', emoji: '🇫🇷' },
  { value: 'spanish', label: '西班牙语', emoji: '🇪🇸' },
  { value: 'german', label: '德语', emoji: '🇩🇪' },
  { value: 'japanese', label: '日语', emoji: '🇯🇵' }
]

// 设置语言
const setLanguage = (language: string) => {
  userStore.setLanguage(language)
}

// 设置难度
const setDifficulty = (newDifficulty: DifficultyLevel) => {
  difficulty.value = newDifficulty
  // 同步到poemStore中
  poemStore.setDifficulty(newDifficulty)
}

// 打开确认对话框
const confirmReset = () => {
  showConfirmDialog.value = true
}

// 重置得分
const resetScore = () => {
  // 如果用户登录，重置分数
  if (userStore.user) {
    userStore.user.score = 0
    // 这里可以添加与后端同步的逻辑
  }
  
  showConfirmDialog.value = false
}
</script>

<style scoped>
.transition-all {
  transition: all 0.3s ease;
}
</style> 