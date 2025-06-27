/**
 * Firebase 认证服务
 * 处理Google登录、登出和用户状态管理
 */

import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth'
import { auth, googleProvider } from '@/config/firebase'
import logger from '@/utils/logger'

export interface FirebaseAuthResult {
  user: {
    uid: string
    email: string | null
    displayName: string | null
    photoURL: string | null
  }
  accessToken?: string
}

/**
 * Firebase认证服务类
 */
export class FirebaseAuthService {
  /**
   * Google登录 - 智能选择认证模式
   */
  async signInWithGoogle(): Promise<FirebaseAuthResult> {
    // 优先尝试popup模式，适用于所有环境
    try {
      logger.info('[Firebase] 开始Google登录 (popup模式)')
      
      const result: UserCredential = await signInWithPopup(auth, googleProvider)
      const user = result.user
      
      // 获取访问令牌
      const accessToken = await user.getIdToken()
      
      logger.info('[Firebase] Google登录成功 (popup模式)', user.displayName)
      
      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        },
        accessToken
      }
    } catch (error: any) {
      logger.error('[Firebase] Popup模式登录失败:', error)
      
      // 如果用户取消了popup，不要回退到redirect模式
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('用户取消了登录')
      }
      
      // 如果是CORS相关错误或popup被阻止，回退到redirect模式
      if (error.code === 'auth/popup-blocked' || 
          error.message.includes('Cross-Origin-Opener-Policy') ||
          error.message.includes('window.close') ||
          error.message.includes('cookies') ||
          error.message.includes('blocked')) {
        logger.info('[Firebase] 检测到popup/CORS问题，回退到redirect模式')
        await signInWithRedirect(auth, googleProvider)
        throw new Error('Popup模式不可用，已切换到页面跳转模式')
      }
      
      // 处理其他特定错误类型
      if (error.code === 'auth/network-request-failed') {
        throw new Error('网络连接失败，请检查网络后重试')
      } else {
        throw new Error(error.message || 'Google登录失败')
      }
    }
  }

  /**
   * Google登录 - 使用redirect模式
   */
  async signInWithGoogleRedirect(): Promise<FirebaseAuthResult> {
    try {
      logger.info('[Firebase] 开始Google登录 (redirect模式)')
      
      // 首先检查是否有redirect结果
      const redirectResult = await getRedirectResult(auth)
      
      if (redirectResult) {
        // 有redirect结果，说明用户刚从Google回来
        const user = redirectResult.user
        const accessToken = await user.getIdToken()
        
        logger.info('[Firebase] Google登录成功 (redirect模式)', user.displayName)
        
        return {
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          },
          accessToken
        }
      } else {
        // 没有redirect结果，启动redirect流程
        logger.info('[Firebase] 启动redirect认证流程')
        await signInWithRedirect(auth, googleProvider)
        
        // redirect后页面会刷新，这里不会执行到
        throw new Error('Redirect认证已启动，页面将跳转')
      }
    } catch (error: any) {
      logger.error('[Firebase] Redirect模式登录失败:', error)
      throw new Error(error.message || 'Google redirect登录失败')
    }
  }

  /**
   * 检查redirect认证结果（页面加载时调用）
   */
  async checkRedirectResult(): Promise<FirebaseAuthResult | null> {
    try {
      logger.info('[Firebase] 检查redirect认证结果')
      const result = await getRedirectResult(auth)
      
      if (result) {
        const user = result.user
        const accessToken = await user.getIdToken()
        
        logger.info('[Firebase] 检测到redirect认证结果，用户:', user.displayName)
        
        return {
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          },
          accessToken
        }
      } else {
        logger.info('[Firebase] 没有检测到redirect认证结果')
        return null
      }
    } catch (error: any) {
      logger.error('[Firebase] 检查redirect结果失败:', error)
      return null
    }
  }

  /**
   * 登出
   */
  async signOut(): Promise<void> {
    try {
      logger.info('[Firebase] 开始登出')
      await signOut(auth)
      logger.info('[Firebase] 登出成功')
    } catch (error: any) {
      logger.error('[Firebase] 登出失败:', error)
      throw new Error(error.message || '登出失败')
    }
  }

  /**
   * 获取当前用户
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser
  }

  /**
   * 监听用户状态变化
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback)
  }

  /**
   * 获取当前用户的ID Token
   */
  async getCurrentUserToken(): Promise<string | null> {
    const user = this.getCurrentUser()
    if (user) {
      return await user.getIdToken()
    }
    return null
  }

  /**
   * 检查用户是否已登录
   */
  isSignedIn(): boolean {
    return !!this.getCurrentUser()
  }
}

// 导出单例实例
export const firebaseAuth = new FirebaseAuthService()
export default firebaseAuth 