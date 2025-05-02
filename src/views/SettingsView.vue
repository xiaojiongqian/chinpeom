<template>
  <div class="max-w-3xl mx-auto">
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="bg-blue-700 text-white p-4 text-center">
        <h1 class="text-2xl font-bold">设置</h1>
      </div>
      
      <div class="p-6">
        <!-- 语言设置 -->
        <div class="mb-8">
          <h2 class="text-xl font-bold mb-4">提示语言</h2>
          <p class="text-gray-600 mb-4">选择您希望看到的提示语言</p>
          
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

const userStore = useUserStore()
const showConfirmDialog = ref(false)

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