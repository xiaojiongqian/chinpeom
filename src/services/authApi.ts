/**
 * 认证API服务
 * 根据配置自动切换真实API和Mock模式
 */

import appConfig from '@/config/app'
import logger from '@/utils/logger'

// 真实API调用接口
interface LoginResponse {
  message: string
  user: {
    id: number
    display_name: string
    avatar_url?: string
    total_score: number
    current_rank: string
    is_premium: boolean
    language_preference?: string
    difficulty_mode?: string
    hint_language?: string
    sound_enabled?: boolean
  }
  token: string
  expires_in: number
}

// 真实API调用接口

/**
 * 真实API认证服务
 */
class RealAuthService {
  private baseUrl = appConfig.api.baseUrl

  async login(provider: string): Promise<LoginResponse> {
    logger.info(`[RealAPI] 开始${provider}登录`)
    
    // 生成模拟的access_token（在真实应用中应该从第三方获取）
    const mockAccessToken = `valid_${provider}_token`
    
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        access_token: mockAccessToken
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '登录失败')
    }

    const data = await response.json()
    logger.info(`[RealAPI] ${provider}登录成功:`, data.user.display_name)
    
    return data
  }

  async logout(): Promise<void> {
    logger.info('[RealAPI] 用户登出')
    const token = localStorage.getItem('auth_token')
    
    if (token) {
      try {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })
      } catch (error) {
        logger.warn('[RealAPI] 登出请求失败:', error)
      }
    }
    
    localStorage.removeItem('auth_token')
  }
}

/**
 * Mock认证服务
 */
class MockAuthService {
  async login(provider: string): Promise<LoginResponse> {
    logger.info(`[MockAPI] 模拟${provider}登录`)
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const userId = Date.now()
    const mockUser = {
      id: userId,
      display_name: `${this.getProviderDisplayName(provider)}用户_${userId}`,
      avatar_url: undefined,
      total_score: 0,
      current_rank: '白丁',
      is_premium: false,
      language_preference: 'english',
      difficulty_mode: 'easy',
      hint_language: 'english',
      sound_enabled: true
    }

    const mockResponse: LoginResponse = {
      message: '登录成功',
      user: mockUser,
      token: `mock-token-${userId}`,
      expires_in: 7 * 24 * 60 * 60 // 7天
    }

    logger.info(`[MockAPI] ${provider}登录成功:`, mockUser.display_name)
    return mockResponse
  }

  async logout(): Promise<void> {
    logger.info('[MockAPI] 模拟用户登出')
    localStorage.removeItem('auth_token')
  }

  private getProviderDisplayName(provider: string): string {
    const names = {
      wechat: '微信',
      google: 'Google',
      apple: 'Apple'
    }
    return names[provider as keyof typeof names] || provider
  }
}

/**
 * 认证API服务 - 自动切换真实/Mock模式
 */
class AuthApiService {
  private realService = new RealAuthService()
  private mockService = new MockAuthService()

  get currentMode() {
    return appConfig.auth.mockMode ? 'Mock' : 'Real'
  }

  async login(provider: 'wechat' | 'google' | 'apple'): Promise<LoginResponse> {
    try {
      const service = appConfig.auth.mockMode ? this.mockService : this.realService
      const result = await service.login(provider)
      
      // 保存token到本地存储
      if (result.token) {
        localStorage.setItem('auth_token', result.token)
      }
      
      return result
    } catch (error) {
      logger.error('登录失败:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      const service = appConfig.auth.mockMode ? this.mockService : this.realService
      await service.logout()
    } catch (error) {
      logger.error('登出失败:', error)
      throw error
    }
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token')
  }

  /**
   * 获取当前token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }
}

// 导出单例实例
export const authApi = new AuthApiService()
export default authApi 