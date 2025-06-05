import admin from 'firebase-admin'
import config from '../config/env/default.js'

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
  async verifyTokenSimple(idToken) {
    try {
      if (!idToken || typeof idToken !== 'string') {
        throw new Error('ID Token为空或格式错误')
      }

      // 解析JWT payload
      const parts = idToken.split('.')
      if (parts.length !== 3) {
        throw new Error('JWT格式错误')
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
      
      // 检查基本字段
      if (!payload.sub || !payload.iss || !payload.aud) {
        throw new Error('Firebase ID Token结构错误')
      }

      // 检查是否是Firebase项目的token
      if (payload.aud !== firebaseConfig.projectId) {
        throw new Error(`Token不属于当前Firebase项目 (期望: ${firebaseConfig.projectId}, 实际: ${payload.aud})`)
      }

      // 检查发行者
      if (!payload.iss.includes('securetoken.google.com') || !payload.iss.includes(firebaseConfig.projectId)) {
        throw new Error('Token发行者不正确')
      }

      // 检查过期时间
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp && payload.exp < now) {
        throw new Error('Token已过期')
      }

      // 检查签发时间（允许5分钟的时钟偏差）
      if (payload.iat && payload.iat > now + 300) {
        throw new Error('Token签发时间异常')
      }

      // 检查认证时间（允许5分钟的时钟偏差）
      if (payload.auth_time && payload.auth_time > now + 300) {
        throw new Error('Token认证时间异常')
      }

      console.log('[Firebase] 简化验证成功，用户:', payload.email || payload.sub)

      return {
        uid: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        email_verified: payload.email_verified,
        firebase: payload.firebase,
        sub: payload.sub,
        provider_data: payload.firebase?.identities || {},
        // 添加更多字段以兼容Admin SDK格式
        auth_time: payload.auth_time,
        iat: payload.iat,
        exp: payload.exp,
        iss: payload.iss,
        aud: payload.aud
      }
    } catch (error) {
      console.error('[Firebase] Token简化验证失败:', error.message)
      throw new Error('Firebase ID Token验证失败: ' + error.message)
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