<template>
  <div class="min-h-screen bg-gray-50">
    <header v-if="!isLoginPage" class="bg-blue-800 text-white shadow-md">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <router-link to="/" class="text-xl font-bold">唐诗译境</router-link>
        <div class="flex items-center space-x-4">
          <router-link to="/settings" class="hover:text-blue-200">
            <span class="i-carbon-settings text-xl"></span>
          </router-link>
          <div v-if="userStore.isLoggedIn">
            <span class="mr-2">{{ userStore.username }}</span>
            <span class="mr-2">{{ userStore.rank }}</span>
            <span class="mr-2">{{ userStore.score }}分</span>
            <button @click="logout" class="text-sm bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded">
              退出
            </button>
          </div>
          <router-link v-else to="/login" class="text-sm bg-blue-700 hover:bg-blue-600 px-3 py-1 rounded">
            登录
          </router-link>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-6">
      <router-view></router-view>
    </main>

    <footer class="bg-gray-800 text-white mt-auto">
      <div class="container mx-auto px-4 py-4 text-center">
        <p>唐诗译境 &copy; {{ new Date().getFullYear() }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from './stores/user'

const route = useRoute()
const userStore = useUserStore()

// 判断是否是登录页，如果是则不显示头部
const isLoginPage = computed(() => {
  return route.path === '/login' || route.path === '/register'
})

// 退出登录
const logout = () => {
  userStore.logout()
}
</script> 