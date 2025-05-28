<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-xs w-full bg-white rounded-lg shadow-md p-6">
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
        <h1 class="text-3xl font-bold text-gray-800">唐诗译境</h1>
        <p class="mt-3 text-base text-gray-600">配合其它语言来学习唐诗的游戏</p>
      </div>

      <!-- 特点列表 -->
      <div class="mb-10 text-sm text-gray-700 space-y-1">
        <p class="text-left">— 欣赏诗歌</p>
        <p class="text-left">— 中文母语者可以用来学外语</p>
        <p class="text-left">— 非中文母语者可用来学唐诗</p>
      </div>

      <!-- 登录按钮区域 -->
      <div class="space-y-4">
        <button
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#95c866] hover:bg-[#85b758] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#95c866]"
          @click="handleLogin('wechat')"
        >
          微信登录
        </button>

        <button
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#95c866] hover:bg-[#85b758] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#95c866]"
          @click="handleLogin('google')"
        >
          Google 账号登录
        </button>

        <button
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#95c866] hover:bg-[#85b758] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#95c866]"
          @click="handleLogin('apple')"
        >
          Apple 账号登录
        </button>

        <button
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#95c866] hover:bg-[#85b758] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#95c866]"
          @click="handleLogin('x')"
        >
          X 账号登录
        </button>
      </div>

      <div v-if="errorMessage" class="text-red-500 text-center mt-6 text-sm">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  // import { useUserStore } from '@/stores/user' // 暂时注释掉，因为我们直接跳转

  const router = useRouter()
  // const userStore = useUserStore() // 暂时注释掉

  // 状态
  const loading = ref(false)
  const errorMessage = ref('')

  // 处理登录
  const handleLogin = async (_provider: string) => {
    try {
      loading.value = true
      errorMessage.value = ''

      // 模拟登录过程
      await new Promise(resolve => setTimeout(resolve, 100)) // 缩短延迟

      // // 登录成功，更新用户状态 (暂时注释掉用户状态更新逻辑)
      // const userData = {
      //   id: Date.now(), // 使用时间戳作为临时ID
      //   username: `user_${provider}`,
      //   score: 0,
      //   language: 'english'
      // }
      // userStore.login(userData, 'mock-token')

      // 直接跳转到 QuizView 页面
      router.push('/quizview') // 修改跳转路径
    } catch (error: any) {
      errorMessage.value = error.message || '登录跳转失败，请重试'
    } finally {
      loading.value = false
    }
  }
</script>
