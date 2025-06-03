import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppSettings } from '@/types'

export interface User {
  id: number
  username: string
  score: number
  language: string
  isPaid?: boolean  // 添加付费状态
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const settings = ref<AppSettings>({
    language: 'english',
    theme: 'light',
    soundEffects: true
  })

  // 计算属性
  const isLoggedIn = computed(() => !!user.value)
  const username = computed(() => user.value?.username || '')
  const score = computed(() => user.value?.score || 0)
  const language = computed(() => user.value?.language || settings.value.language)
  
  // 添加付费状态
  const isPaidUser = computed(() => user.value?.isPaid || false)
  
  // 免费用户最高等级（秀才）的分数上限
  const FREE_USER_MAX_SCORE = 45
  // 最低分数限制
  const MIN_SCORE = 0

  // 根据得分获取学级称号（考虑付费限制）
  const rank = computed(() => {
    const currentScore = score.value
    const userIsPaid = isPaidUser.value

    // 免费用户分数限制在45分（秀才）
    const effectiveScore = !userIsPaid && currentScore > FREE_USER_MAX_SCORE 
      ? FREE_USER_MAX_SCORE 
      : currentScore

    if (effectiveScore <= 10) return '白丁'
    if (effectiveScore <= 25) return '学童'
    if (effectiveScore <= 45) return '秀才'
    if (effectiveScore <= 70) return '廪生'
    if (effectiveScore <= 100) return '贡生'
    if (effectiveScore <= 135) return '举人'
    if (effectiveScore <= 175) return '贡士'
    if (effectiveScore <= 220) return '进士'
    if (effectiveScore <= 280) return '探花'
    if (effectiveScore <= 340) return '榜眼'
    return '状元'
  })

  // 检查用户是否已达到免费等级上限
  const isAtFreeLimit = computed(() => {
    return !isPaidUser.value && score.value >= FREE_USER_MAX_SCORE
  })

  // 获取等级详细信息
  const rankDetails = computed(() => {
    const levels = [
      { name: '白丁', minScore: 0, maxScore: 10, description: '初学者，刚开始接触诗词的启蒙阶段', emoji: '📚' },
      { name: '学童', minScore: 11, maxScore: 25, description: '已有基础认知，能够理解简单的诗词内容', emoji: '🎓' },
      { name: '秀才', minScore: 26, maxScore: 45, description: '具备一定文学素养，能欣赏诗词之美', emoji: '📜' },
      { name: '廪生', minScore: 46, maxScore: 70, description: '文学功底扎实，深谙诗词韵律', emoji: '🖋️' },
      { name: '贡生', minScore: 71, maxScore: 100, description: '学识渊博，对诗词有独到见解', emoji: '📖' },
      { name: '举人', minScore: 101, maxScore: 135, description: '才华出众，能够创作优美诗句', emoji: '🏆' },
      { name: '贡士', minScore: 136, maxScore: 175, description: '诗词造诣精深，文采斐然', emoji: '🎭' },
      { name: '进士', minScore: 176, maxScore: 220, description: '学富五车，诗词功力炉火纯青', emoji: '👑' },
      { name: '探花', minScore: 221, maxScore: 280, description: '诗词大家，作品流传千古', emoji: '🌸' },
      { name: '榜眼', minScore: 281, maxScore: 340, description: '文坛巨匠，诗词成就卓越', emoji: '💎' },
      { name: '状元', minScore: 341, maxScore: Infinity, description: '诗圣境界，千古传诵的文学大师', emoji: '👑' }
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
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  function updateScore(increment: number) {
    if (user.value) {
      const newScore = user.value.score + increment
      
      // 检查最低分数限制（不能低于0分）
      if (newScore < MIN_SCORE) {
        console.log('分数已达最低限制，不能低于0分')
        user.value.score = MIN_SCORE
        return true // 返回true但分数设为0
      }
      
      // 检查免费用户分数上限限制
      if (!isPaidUser.value && newScore > FREE_USER_MAX_SCORE) {
        console.log('免费用户已达到等级上限，需要付费解锁')
        // 这里可以触发付费提示
        return false // 返回false表示积分更新被限制
      }
      
      user.value.score = newScore
      
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
          }
        })
      }
      
      return true // 返回true表示积分更新成功
    }
    return false
  }

  // 同步积分到后端
  async function syncScoreToBackend(totalScore: number) {
    if (!token.value) {
      throw new Error('用户未登录')
    }

    try {
      const response = await fetch('/api/user/score', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        },
        body: JSON.stringify({ total_score: totalScore })
      })

      if (!response.ok) {
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

  function setLanguage(newLanguage: string) {
    // 验证语言是否为poem store支持的外语
    const supportedLanguages = ['english', 'french', 'spanish', 'german', 'japanese']
    const validLanguage = supportedLanguages.includes(newLanguage) ? newLanguage : 'english'
    
    if (user.value) {
      user.value.language = validLanguage
      // 这里可以添加与后端同步的逻辑
    }
    settings.value.language = validLanguage as AppSettings['language']
    saveSettings()
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
    loadSettings()

    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      // 这里可以添加从后端获取用户信息的逻辑
    }
  }

  // 模拟付费升级（实际应用中需要对接真实支付系统）
  function upgradeToPaid() {
    if (user.value) {
      user.value.isPaid = true
      console.log('用户已升级为付费用户')
      // 这里应该调用后端API更新用户状态
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
    updateSettings,
    toggleSoundEffects,
    toggleTheme,
    upgradeToPaid,
    init
  }
})
