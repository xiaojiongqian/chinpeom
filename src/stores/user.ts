import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  id: number
  username: string
  score: number
  language: string
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  
  // 计算属性
  const isLoggedIn = computed(() => !!user.value)
  const username = computed(() => user.value?.username || '')
  const score = computed(() => user.value?.score || 0)
  const language = computed(() => user.value?.language || 'english')
  
  // 根据得分获取学级称号
  const rank = computed(() => {
    const currentScore = score.value
    
    if (currentScore <= 10) return '白丁'
    if (currentScore <= 25) return '学童'
    if (currentScore <= 45) return '秀才'
    if (currentScore <= 70) return '廪生'
    if (currentScore <= 100) return '贡生'
    if (currentScore <= 135) return '举人'
    if (currentScore <= 175) return '贡士'
    if (currentScore <= 220) return '进士'
    if (currentScore <= 280) return '探花'
    if (currentScore <= 340) return '榜眼'
    return '状元'
  })
  
  // 方法
  function setUser(newUser: User) {
    user.value = newUser
  }
  
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }
  
  function login(userData: User, userToken: string) {
    setUser(userData)
    setToken(userToken)
  }
  
  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }
  
  function updateScore(increment: number) {
    if (user.value) {
      user.value.score += increment
      // 这里可以添加与后端同步的逻辑
    }
  }
  
  function setLanguage(newLanguage: string) {
    if (user.value) {
      user.value.language = newLanguage
      // 这里可以添加与后端同步的逻辑
    }
  }
  
  // 初始化时尝试从localStorage恢复会话
  function init() {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      // 这里可以添加从后端获取用户信息的逻辑
    }
  }
  
  return {
    user,
    token,
    isLoggedIn,
    username,
    score,
    rank,
    language,
    login,
    logout,
    updateScore,
    setLanguage,
    init
  }
}) 