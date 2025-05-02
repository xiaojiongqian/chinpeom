<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">注册</h2>
        <p class="mt-2 text-sm text-gray-600">
          创建新账号
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="username" class="sr-only">用户名</label>
            <input
              id="username"
              v-model="form.username"
              name="username"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="用户名"
            />
          </div>
          <div>
            <label for="password" class="sr-only">密码</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="密码"
            />
          </div>
          <div>
            <label for="confirmPassword" class="sr-only">确认密码</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              name="confirmPassword"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="确认密码"
            />
          </div>
        </div>

        <div class="text-sm text-center">
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            已有账号？点击登录
          </router-link>
        </div>

        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            :disabled="loading"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <!-- 加载图标 -->
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            注册
          </button>
        </div>
        
        <div v-if="errorMessage" class="text-red-500 text-center">
          {{ errorMessage }}
        </div>
        
        <div v-if="passwordMismatch" class="text-red-500 text-center">
          两次输入的密码不一致
        </div>
      </form>
      
      <!-- 游客模式提示 -->
      <div class="text-center mt-6">
        <button @click="skipRegister" class="text-sm text-gray-500 hover:text-gray-700">
          跳过注册，以游客身份使用
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// 状态
const loading = ref(false)
const errorMessage = ref('')

// 检查密码是否匹配
const passwordMismatch = computed(() => {
  if (form.password && form.confirmPassword) {
    return form.password !== form.confirmPassword
  }
  return false
})

// 处理注册
const handleRegister = async () => {
  // 检查密码是否匹配
  if (passwordMismatch.value) {
    return
  }
  
  try {
    loading.value = true
    errorMessage.value = ''
    
    // 在这里添加实际的API调用
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 注册成功，自动登录
    const userData = {
      id: 1,
      username: form.username,
      score: 0,
      language: 'english'
    }
    
    userStore.login(userData, 'mock-token')
    
    // 跳转到首页
    router.push('/')
  } catch (error: any) {
    errorMessage.value = error.message || '注册失败，请重试'
  } finally {
    loading.value = false
  }
}

// 跳过注册
const skipRegister = () => {
  router.push('/')
}
</script> 