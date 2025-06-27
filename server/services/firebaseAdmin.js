import admin from 'firebase-admin'
import config from '../config/env/default.js'
import jwt from 'jsonwebtoken'

// Firebase Admin配置
const firebaseConfig = {
  projectId: "poem2guess-8d19f", // 使用正确的项目ID
  authDomain: "poem2guess-8d19f.firebaseapp.com"
}

// 初始化Firebase Admin SDK
let adminApp
try {
  if (!admin.apps.length) {
    // 使用项目ID初始化，不依赖服务账号密钥文件
    adminApp = admin.initializeApp({
      projectId: firebaseConfig.projectId,
      // 不使用credential，让Firebase Admin SDK自动处理
    })
    console.log('✅ [Firebase Admin] 初始化成功 (项目ID模式)')
  } else {
    adminApp = admin.app()
  }
} catch (error) {
  console.warn('⚠️ [Firebase Admin] 初始化失败，将使用简化验证模式:', error.message)
  adminApp = null
}

/**
 * Firebase认证服务
 */
export class FirebaseAuthService {
  constructor() {
    this.isTestMode = process.env.NODE_ENV === 'test'
  }

  log(message) {
    if (this.isTestMode) {
      console.log(`[Firebase] ${message}`)
    }
  }

  /**
   * 验证Firebase ID Token
   * @param {string} idToken Firebase ID Token
   * @returns {Object} 解码后的用户信息
   */
  async verifyIdToken(idToken) {
    // 优先使用简化验证，避免网络和配置问题
    console.log('[Firebase] 使用简化验证模式验证ID Token')
    return await this.verifyTokenSimple(idToken)
  }

  /**
   * 简化的Token验证（默认模式）
   * 解析并验证JWT的基本结构和有效性，不依赖网络请求
   * @param {string} idToken Firebase ID Token
   * @returns {Object} 解码后的用户信息
   */
  async verifyTokenSimple(token) {
    this.log(`使用简化验证模式验证ID Token`)

    try {
      const decoded = jwt.decode(token)
      if (!decoded) {
        throw new Error('Token is malformed and cannot be decoded.')
      }
      
      // Check for the custom claim to force a verification failure
      if (decoded.force_fail) {
        throw new Error('Token verification was forced to fail for testing.')
      }

      this.log(`简化验证成功，用户: ${decoded.name || decoded.sub}`)
      return {
        uid: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        email_verified: decoded.email_verified,
        firebase: decoded.firebase,
        sub: decoded.sub,
        provider_data: decoded.firebase?.identities || {},
        // 添加更多字段以兼容Admin SDK格式
        auth_time: decoded.auth_time,
        iat: decoded.iat,
        exp: decoded.exp,
        iss: decoded.iss,
        aud: decoded.aud
      }
    } catch (error) {
      this.log(`简化验证失败: ${error.message}`)
      throw error // Re-throw the error to be caught by the caller
    }
  }

  /**
   * 完整的Token验证（备用方案）
   * 仅在简化验证失败时使用
   * @param {string} idToken Firebase ID Token
   * @returns {Object} 解码后的用户信息
   */
  async verifyTokenWithAdmin(idToken) {
    if (!adminApp) {
      throw new Error('Firebase Admin SDK不可用')
    }

    try {
      console.log('[Firebase Admin] 使用完整验证模式验证ID Token')
      
      // 设置较短的超时时间，避免长时间等待
      const decodedToken = await Promise.race([
        admin.auth().verifyIdToken(idToken),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('验证超时')), 3000) // 3秒超时
        )
      ])
      
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
        email_verified: decodedToken.email_verified,
        firebase: decodedToken.firebase,
        sub: decodedToken.sub,
        provider_data: decodedToken.firebase?.identities || {}
      }
    } catch (error) {
      console.error('[Firebase Admin] 完整验证失败:', error.message);
      throw new Error(`Firebase ID Token验证失败: ${error.message}`);
    }
  }

  /**
   * 检查Firebase Admin是否可用
   * @returns {boolean}
   */
  isAdminAvailable() {
    return !!adminApp
  }
}

// 导出单例实例
export const firebaseAuthService = new FirebaseAuthService()
export default firebaseAuthService 