/**
 * 认证API服务
 * 根据配置自动切换真实API和Mock模式
 */

import appConfig from '@/config/app'
import logger from '@/utils/logger'
import firebaseAuth from '@/services/firebaseAuth'

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
    firebase_uid?: string  // 新增Firebase UID字段
  }
  token: string
  expires_in: number
}

/**
 * 真实API认证服务
 */
class RealAuthService {
  private baseUrl = appConfig.api.baseUrl

  async login(provider: string): Promise<LoginResponse> {
    logger.info(`[RealAPI] 开始${provider}登录`)
    
    let accessToken: string
    let firebaseUid: string | undefined
    
    if (provider === 'google') {
      // 使用Firebase进行Google登录
      try {
        const firebaseResult = await firebaseAuth.signInWithGoogle()
        // 使用Firebase ID Token作为access_token
        accessToken = firebaseResult.accessToken || ''
        firebaseUid = firebaseResult.user.uid
        logger.info('[RealAPI] Firebase Google登录成功，获取ID Token')
      } catch (error) {
        logger.error('[RealAPI] Firebase Google登录失败:', error)
        throw error
      }
    } else {
      // 其他登录方式使用模拟token
      accessToken = `test_${provider}_token`
    }
    
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        access_token: accessToken,
        firebase_uid: firebaseUid  // 发送Firebase UID到后端
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
    
    // Firebase登出
    try {
      await firebaseAuth.signOut()
      logger.info('[RealAPI] Firebase登出成功')
    } catch (error) {
      logger.warn('[RealAPI] Firebase登出失败:', error)
    }
    
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
    
    let mockUserData
    
    if (provider === 'google') {
      // Google登录使用Firebase进行真实认证（即使在Mock模式下）
      try {
        const firebaseResult = await firebaseAuth.signInWithGoogle()
        mockUserData = {
          id: Date.now(),
          display_name: firebaseResult.user.displayName || `Google用户_${Date.now()}`,
          avatar_url: firebaseResult.user.photoURL || undefined,
          total_score: 0,
          current_rank: 'rank.baiDing',
          is_premium: false,
          language_preference: 'english',
          difficulty_mode: 'easy',
          hint_language: 'english',
          sound_enabled: true,
          firebase_uid: firebaseResult.user.uid
        }
        logger.info('[MockAPI] 使用真实Firebase Google登录')
      } catch (error) {
        logger.error('[MockAPI] Firebase Google登录失败:', error)
        throw error
      }
    } else {
      // 其他登录方式使用完全模拟的数据
      const userId = Date.now()
      mockUserData = {
        id: userId,
        display_name: `${this.getProviderDisplayName(provider)}用户_${userId}`,
        avatar_url: undefined,
        total_score: 0,
        current_rank: 'rank.baiDing',
        is_premium: false,
        language_preference: 'english',
        difficulty_mode: 'easy',
        hint_language: 'english',
        sound_enabled: true
      }
    }

    const mockResponse: LoginResponse = {
      message: '登录成功',
      user: mockUserData,
      token: `mock-token-${Date.now()}`,
      expires_in: 7 * 24 * 60 * 60 // 7天
    }

    logger.info(`[MockAPI] ${provider}登录成功:`, mockUserData.display_name)
    return mockResponse
  }

  async logout(): Promise<void> {
    logger.info('[MockAPI] 模拟用户登出')
    
    // Firebase登出（即使在Mock模式下也需要真实登出Firebase）
    try {
      await firebaseAuth.signOut()
      logger.info('[MockAPI] Firebase登出成功')
    } catch (error) {
      logger.warn('[MockAPI] Firebase登出失败:', error)
    }
    
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
      const result = this.currentMode === 'Mock' 
        ? await this.mockService.login(provider)
        : await this.realService.login(provider)
      
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

  /**
   * 检查Firebase登录状态
   */
  isFirebaseAuthenticated(): boolean {
    return firebaseAuth.isSignedIn()
  }

  /**
   * 获取Firebase当前用户
   */
  getFirebaseUser() {
    return firebaseAuth.getCurrentUser()
  }

  /**
   * 检查redirect认证结果（页面加载时调用）
   */
  async checkRedirectResult(): Promise<LoginResponse | null> {
    if (this.currentMode === 'Mock') {
      // Mock模式下不需要检查redirect结果
      return null
    }
    
    try {
      logger.info('[AuthAPI] 检查Firebase redirect认证结果')
      
      // 检查Firebase redirect结果
      const firebaseResult = await firebaseAuth.checkRedirectResult()
      
      if (firebaseResult) {
        logger.info('[AuthAPI] 发现redirect认证结果，发送到后端验证')
        
        // 发送到后端验证
        const response = await fetch(`${appConfig.api.baseUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: 'google',
            access_token: firebaseResult.accessToken,
            firebase_uid: firebaseResult.user.uid
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || '后端认证失败')
        }

        const data = await response.json()
        logger.info('[AuthAPI] Redirect认证流程完成:', data.user.display_name)
        
        // 保存token到本地存储
        if (data.token) {
          localStorage.setItem('auth_token', data.token)
        }
        
        return data
      }
      
      return null
    } catch (error: any) {
      logger.error('[AuthAPI] 检查redirect结果失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const authApi = new AuthApiService()
export default authApi 