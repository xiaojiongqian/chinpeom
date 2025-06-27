import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppSettings, SupportedLanguage, DifficultyMode } from '@/types'
import { 
  isChineseMode, 
  detectBrowserLanguage, 
  getHintLanguage, 
  handleLanguageChange,
  isValidDifficultyForLanguage 
} from '@/utils/language'

export interface User {
  id: number
  username: string
  score: number
  language: SupportedLanguage
  isPaid?: boolean  // 添加付费状态
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const settings = ref<AppSettings>({
    language: 'english',
    difficulty: 'easy',
    theme: 'light',
    soundEffects: true
  })

  // 计算属性
  const isLoggedIn = computed(() => !!user.value)
  const username = computed(() => user.value?.username || '')
  const score = computed(() => user.value?.score || 0)
  const language = computed(() => user.value?.language || settings.value.language)
  const difficulty = computed(() => settings.value.difficulty)
  
  // 添加付费状态
  const isPaidUser = computed(() => user.value?.isPaid || false)
  
  // 中文模式检测
  const isInChineseMode = computed(() => isChineseMode(language.value))
  
  // 提示语言（用于游戏逻辑）
  const hintLanguage = computed(() => getHintLanguage(language.value, difficulty.value))
  
  // 免费用户最高等级（学童）的分数上限
  const FREE_USER_MAX_SCORE = 25
  // 最低分数限制
  const MIN_SCORE = 0

  // 根据得分获取学级称号翻译键（考虑付费限制）
  const rank = computed(() => {
    const currentScore = score.value
    const userIsPaid = isPaidUser.value

    // 免费用户分数限制在25分（学童）
    const effectiveScore = !userIsPaid && currentScore > FREE_USER_MAX_SCORE 
      ? FREE_USER_MAX_SCORE 
      : currentScore

    if (effectiveScore <= 10) return 'rank.baiDing'
    if (effectiveScore <= 25) return 'rank.xueTong'
    if (effectiveScore <= 45) return 'rank.xiuCai'
    if (effectiveScore <= 70) return 'rank.linSheng'
    if (effectiveScore <= 100) return 'rank.gongSheng'
    if (effectiveScore <= 135) return 'rank.juRen'
    if (effectiveScore <= 175) return 'rank.gongShi'
    if (effectiveScore <= 220) return 'rank.jinShi'
    if (effectiveScore <= 280) return 'rank.tanHua'
    if (effectiveScore <= 340) return 'rank.bangYan'
    return 'rank.zhuangYuan'
  })

  // 检查用户是否已达到免费等级上限
  const isAtFreeLimit = computed(() => {
    return !isPaidUser.value && score.value >= FREE_USER_MAX_SCORE
  })

  // 获取等级详细信息
  const rankDetails = computed(() => {
    const levels = [
      { name: 'rank.baiDing', minScore: 0, maxScore: 10, description: 'rankDesc.baiDing', emoji: '📚' },
      { name: 'rank.xueTong', minScore: 11, maxScore: 25, description: 'rankDesc.xueTong', emoji: '🎓' },
      { name: 'rank.xiuCai', minScore: 26, maxScore: 45, description: 'rankDesc.xiuCai', emoji: '📜' },
      { name: 'rank.linSheng', minScore: 46, maxScore: 70, description: 'rankDesc.linSheng', emoji: '🖋️' },
      { name: 'rank.gongSheng', minScore: 71, maxScore: 100, description: 'rankDesc.gongSheng', emoji: '📖' },
      { name: 'rank.juRen', minScore: 101, maxScore: 135, description: 'rankDesc.juRen', emoji: '🏆' },
      { name: 'rank.gongShi', minScore: 136, maxScore: 175, description: 'rankDesc.gongShi', emoji: '🎭' },
      { name: 'rank.jinShi', minScore: 176, maxScore: 220, description: 'rankDesc.jinShi', emoji: '👑' },
      { name: 'rank.tanHua', minScore: 221, maxScore: 280, description: 'rankDesc.tanHua', emoji: '🌸' },
      { name: 'rank.bangYan', minScore: 281, maxScore: 340, description: 'rankDesc.bangYan', emoji: '💎' },
      { name: 'rank.zhuangYuan', minScore: 341, maxScore: Infinity, description: 'rankDesc.zhuangYuan', emoji: '👑' }
    ]
    
    return levels.find(level => 
      score.value >= level.minScore && score.value <= level.maxScore
    ) || levels[0]
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
    
    // 只有在用户语言与当前设置不同时才更新语言设置
    if (userData.language !== settings.value.language) {
      const result = handleLanguageChange(userData.language, settings.value.difficulty)
      settings.value.language = result.language
      settings.value.difficulty = result.difficulty
      saveSettings()
      console.log('用户登录时更新语言设置为:', result.language)
    } else {
      console.log('用户登录时保持当前语言设置:', settings.value.language)
    }
    
    // 保存用户数据到本地存储
    localStorage.setItem('user_data', JSON.stringify(userData))
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user_data')
  }

  function updateScore(increment: number) {
    if (user.value) {
      const newScore = user.value.score + increment
      
      // 检查最低分数限制（不能低于0分）
      if (newScore < MIN_SCORE) {
        console.log('分数已达最低限制，不能低于0分')
        user.value.score = MIN_SCORE
        // 更新本地存储
        localStorage.setItem('user_data', JSON.stringify(user.value))
        return true // 返回true但分数设为0
      }
      
      // 检查免费用户分数上限限制
      if (!isPaidUser.value && newScore > FREE_USER_MAX_SCORE) {
        console.log('免费用户已达到等级上限，需要付费解锁')
        // 这里可以触发付费提示
        return false // 返回false表示积分更新被限制
      }
      
      user.value.score = newScore
      
      // 更新本地存储中的用户数据
      localStorage.setItem('user_data', JSON.stringify(user.value))
      
      // 同步积分到后端
      if (token.value) {
        syncScoreToBackend(user.value.score).catch(error => {
          console.error('积分同步失败:', error)
          // 同步失败时回滚本地积分
          if (user.value) {
            user.value.score -= increment
            // 如果回滚后仍然低于最低分数，设为最低分数
            if (user.value.score < MIN_SCORE) {
              user.value.score = MIN_SCORE
            }
            // 更新本地存储
            localStorage.setItem('user_data', JSON.stringify(user.value))
          }
        })
      }
      
      return true // 返回true表示积分更新成功
    }
    return false
  }

  // 同步积分到后端
  async function syncScoreToBackend(totalScore: number) {
    // 检查当前应用配置
    const { appConfig } = await import('@/config/app')
    
    // 如果在Mock模式下，跳过后端同步
    if (appConfig.auth.mockMode) {
      console.log('Mock模式下跳过积分同步')
      return { message: 'Mock模式积分同步已跳过' }
    }
    
    // 尝试从多个位置获取token
    let authToken = token.value || localStorage.getItem('auth_token') || localStorage.getItem('token')
    
    if (!authToken) {
      throw new Error('用户未登录')
    }

    try {
      // 优先尝试获取Firebase ID Token，失败则使用本地JWT token
      try {
        const { firebaseAuth } = await import('@/services/firebaseAuth')
        const firebaseToken = await firebaseAuth.getCurrentUserToken()
        if (firebaseToken) {
          // 如果有Firebase ID Token，发送到后端获取JWT token
          console.log('使用Firebase ID Token获取最新JWT token')
          const response = await fetch(`${appConfig.api.baseUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              provider: 'google',
              access_token: firebaseToken,
              firebase_uid: firebaseAuth.getCurrentUser()?.uid
            })
          })
          
          if (response.ok) {
            const data = await response.json()
            authToken = data.token
            // 更新本地存储的token
            localStorage.setItem('auth_token', data.token)
            localStorage.setItem('token', data.token)
            console.log('获取到最新JWT token用于积分同步')
          } else {
            console.log('获取JWT token失败，使用本地token')
          }
        }
      } catch (error) {
        console.log('获取Firebase Token失败，使用本地token:', error)
      }

      const apiUrl = `${appConfig.api.baseUrl}/user/score`
      console.log('积分同步请求URL:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ total_score: totalScore })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('积分同步响应错误:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error(`积分同步失败: ${response.status}`)
      }

      const data = await response.json()
      console.log('积分同步成功:', data.message)
      
      // 更新用户等级信息（如果后端返回了更新的等级）
      if (data.user && user.value) {
        user.value.score = data.user.total_score
        // 注意：这里不更新rank，因为前端有自己的计算逻辑
      }
      
      return data
    } catch (error) {
      console.error('积分同步请求失败:', error)
      throw error
    }
  }

  function setLanguage(newLanguage: SupportedLanguage) {
    // 使用语言切换处理器处理逻辑
    const result = handleLanguageChange(newLanguage, settings.value.difficulty)
    
    // 更新设置
    settings.value.language = result.language
    settings.value.difficulty = result.difficulty
    saveSettings()
    
    // 更新用户数据（如果已登录）
    if (user.value) {
      user.value.language = result.language
      localStorage.setItem('user_data', JSON.stringify(user.value))
    }
    
    console.log(`语言已切换到 ${result.language}，难度模式: ${result.difficulty}，提示语言: ${result.hintLanguage}`)
  }

  function setDifficulty(newDifficulty: DifficultyMode) {
    // 检查当前语言是否支持该难度
    if (!isValidDifficultyForLanguage(language.value, newDifficulty)) {
      console.warn(`${language.value} 模式不支持 ${newDifficulty} 难度`)
      return false
    }
    
    settings.value.difficulty = newDifficulty
    saveSettings()
    
    console.log(`难度模式已切换到: ${newDifficulty}`)
    return true
  }

  // 更新应用设置
  function updateSettings(newSettings: Partial<AppSettings>) {
    settings.value = { ...settings.value, ...newSettings }
    saveSettings()
  }

  // 保存设置到本地存储
  function saveSettings() {
    localStorage.setItem('app_settings', JSON.stringify(settings.value))
  }

  // 从本地存储加载设置
  function loadSettings() {
    const savedSettings = localStorage.getItem('app_settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        settings.value = { ...settings.value, ...parsed }
      } catch (e) {
        console.error('加载设置失败', e)
      }
    }
  }

  // 开关音效
  function toggleSoundEffects() {
    settings.value.soundEffects = !settings.value.soundEffects
    saveSettings()
  }

  // 切换主题
  function toggleTheme() {
    settings.value.theme = settings.value.theme === 'light' ? 'dark' : 'light'
    saveSettings()
  }

  // 初始化时尝试从localStorage恢复会话和设置
  function init() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user_data')
    
    // 后端locale到前端语言的映射（与App.vue保持一致）
    const backendToFrontendLanguage: Record<string, string> = {
      'zh-CN': 'chinese',
      'en': 'english',
      'es': 'spanish',
      'ja': 'japanese',
      'fr': 'french',
      'de': 'german'
    }
    
    // 先尝试恢复用户会话，如果用户已登录，优先使用用户保存的语言设置
    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        const userData = JSON.parse(savedUser)
        
        // 转换语言格式（如果需要）
        if (userData.language && backendToFrontendLanguage[userData.language]) {
          console.log(`[UserStore] 转换保存的语言格式: ${userData.language} -> ${backendToFrontendLanguage[userData.language]}`)
          userData.language = backendToFrontendLanguage[userData.language]
          // 更新localStorage中的数据
          localStorage.setItem('user_data', JSON.stringify(userData))
        }
        
        user.value = userData
        console.log('用户会话已恢复:', user.value?.username, '语言:', user.value?.language)
        
        // 如果用户有保存的语言设置，优先使用用户的语言设置
        if (user.value && user.value.language) {
          const result = handleLanguageChange(user.value.language, settings.value.difficulty)
          settings.value.language = result.language
          settings.value.difficulty = result.difficulty
          console.log('恢复用户语言设置:', user.value.language)
        }
      } catch (e) {
        console.error('恢复用户会话失败:', e)
        // 清除无效的存储数据
        localStorage.removeItem('token')
        localStorage.removeItem('user_data')
        user.value = null
        token.value = null
      }
    }

    // 加载本地保存的设置
    loadSettings()

    // 如果没有用户会话且没有保存的设置，使用浏览器检测的默认值
    const savedSettings = localStorage.getItem('app_settings')
    if (!savedSettings && !user.value) {
      const browserDefaults = detectBrowserLanguage()
      settings.value.language = browserDefaults.language
      settings.value.difficulty = browserDefaults.difficulty
      saveSettings()
      console.log('检测到浏览器语言，设置默认值:', browserDefaults)
    }
  }

  // 模拟付费升级（实际应用中需要对接真实支付系统）
  function upgradeToPaid() {
    if (user.value) {
      user.value.isPaid = true
      console.log('用户已升级为付费用户')
      
      // 更新本地存储中的用户数据
      localStorage.setItem('user_data', JSON.stringify(user.value))
      
      // 这里应该调用后端API更新用户状态
      // TODO: 调用后端API同步付费状态
    }
  }

  return {
    user,
    token,
    settings,
    isLoggedIn,
    username,
    score,
    rank,
    language,
    difficulty,
    hintLanguage,
    isInChineseMode,
    isPaidUser,
    isAtFreeLimit,
    rankDetails,
    FREE_USER_MAX_SCORE,
    MIN_SCORE,
    login,
    logout,
    updateScore,
    syncScoreToBackend,
    setLanguage,
    setDifficulty,
    updateSettings,
    toggleSoundEffects,
    toggleTheme,
    upgradeToPaid,
    init
  }
})
