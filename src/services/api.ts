// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * 基础API请求函数
 * @param url 请求URL
 * @param options 请求选项
 * @returns 请求响应
 */
const fetchApi = async (url: string, options: RequestInit = {}) => {
  try {
    // 添加默认请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    }

    // 添加认证令牌（如果存在）
    const token = localStorage.getItem('auth_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // 构建完整URL
    const fullUrl = url.startsWith('http')
      ? url
      : `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`

    // 发送请求
    const response = await fetch(fullUrl, {
      ...options,
      headers
    })

    // 解析响应
    const data = await response.json()

    // 处理错误响应
    if (!response.ok) {
      throw new Error(data.message || '请求失败')
    }

    return data
  } catch (error) {
    console.error('API请求错误:', error)
    throw error
  }
}

/**
 * 用户API服务
 */
export const userApi = {
  /**
   * 用户注册
   * @param username 用户名
   * @param email 邮箱
   * @param password 密码
   * @returns 注册结果
   */
  async register(username: string, email: string, password: string) {
    return fetchApi('/user/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    })
  },

  /**
   * 用户登录
   * @param email 邮箱
   * @param password 密码
   * @returns 登录结果
   */
  async login(email: string, password: string) {
    const data = await fetchApi('/user/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })

    // 保存令牌到本地存储
    if (data.token) {
      localStorage.setItem('auth_token', data.token)
    }

    return data
  },

  /**
   * 用户登出
   */
  logout() {
    localStorage.removeItem('auth_token')
  },

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  async getCurrentUser() {
    try {
      const data = await fetchApi('/user/me')
      return data.user
    } catch (error: any) {
      // 处理认证错误
      if (error.message === '未授权，请登录' || error.message === '令牌已过期，请重新登录') {
        this.logout()
      }
      throw error
    }
  },

  /**
   * 更新用户分数
   * @param scoreDelta 分数变化
   * @returns 更新后的用户信息
   */
  async updateScore(scoreDelta: number) {
    const data = await fetchApi('/user/score', {
      method: 'PUT',
      body: JSON.stringify({ scoreDelta })
    })

    return data.user
  },

  /**
   * 更新用户语言设置
   * @param language 语言设置
   * @returns 更新后的用户信息
   */
  async updateLanguage(language: string) {
    const data = await fetchApi('/user/language', {
      method: 'PUT',
      body: JSON.stringify({ language })
    })

    return data.user
  },

  /**
   * 获取排行榜
   * @returns 排行榜数据
   */
  async getLeaderboard() {
    const data = await fetchApi('/user/leaderboard')
    return data.leaderboard
  }
}

/**
 * 检查用户是否已登录
 * @returns 是否已登录
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token')
}

/**
 * 离线模式检测
 * @returns 是否处于离线模式
 */
export const isOffline = () => {
  return !navigator.onLine
}
