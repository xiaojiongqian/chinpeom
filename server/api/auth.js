import express from 'express'
import jwt from 'jsonwebtoken'
import mysql from 'mysql2/promise'
import config from '../config/database.js'
import appConfig from '../config/env/default.js'
import { auth } from '../middleware/auth.js'
import { firebaseAuthService } from '../services/firebaseAdmin.js'

const router = express.Router()

// 创建数据库连接池
console.log('🔍 [Auth] 数据库配置:', {
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  database: config.database.database,
  hasPassword: !!config.database.password
})

let pool
try {
  pool = mysql.createPool(config.database)
  console.log('✅ [Auth] 数据库连接池创建成功')
} catch (error) {
  console.error('❌ [Auth] 数据库连接池创建失败:', error)
  throw error
}

/**
 * Firebase Google登录验证
 * @param {string} firebaseIdToken Firebase ID Token
 * @returns {Object} 用户信息
 */
async function verifyFirebaseToken(firebaseIdToken) {
  try {
    console.log('[Firebase Auth] 准备验证的Firebase ID Token (前30字符+...):', firebaseIdToken ? firebaseIdToken.substring(0,30) + "..." : "EMPTY_OR_NULL_TOKEN");
    console.log('[Firebase Auth] 验证Firebase ID Token')
    const firebaseUser = await firebaseAuthService.verifyIdToken(firebaseIdToken)
    
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.name || firebaseUser.email?.split('@')[0],
      picture: firebaseUser.picture,
      email_verified: firebaseUser.email_verified,
      provider: 'google'
    }
  } catch (error) {
    console.error('[Firebase Auth] Token验证失败:', error.message)
    throw new Error('Firebase认证失败: ' + error.message)
  }
}

/**
 * Mock认证（仅开发环境）
 * @param {string} provider 认证提供商
 * @param {string} token 访问令牌
 * @returns {Object} 用户信息
 */
async function mockAuthentication(provider, token) {
  console.log(`[Mock Auth] 使用模拟认证: ${provider}`)
  
  // 固定的测试用户数据
  const mockUsers = {
    google: {
      uid: 'mock_google_user_001',
      email: 'test@gmail.com',
      name: 'Google测试用户',
      picture: null,
      email_verified: true,
      provider: 'google'
    },
    wechat: {
      uid: 'mock_wechat_user_001',
      email: null,
      name: '微信测试用户',
      picture: null,
      email_verified: false,
      provider: 'wechat'
    },
    apple: {
      uid: 'mock_apple_user_001',
      email: 'test@privaterelay.appleid.com',
      name: 'Apple测试用户',
      picture: null,
      email_verified: true,
      provider: 'apple'
    }
  }

  // 检查token是否为有效的测试token
  const validTokens = {
    google: ['test_google_token', 'valid_google_token', 'mock_token'],
    wechat: ['test_wechat_token', 'valid_wechat_token'],
    apple: ['test_apple_token', 'valid_apple_token']
  }

  if (!validTokens[provider]?.includes(token)) {
    throw new Error(`无效的${provider}测试token`)
  }

  return mockUsers[provider]
}

/**
 * 第三方登录
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { provider, access_token, firebase_uid } = req.body

    // 验证必需参数
    if (!provider || !access_token) {
      return res.status(400).json({ 
        message: '第三方平台和访问令牌不能为空',
        required: ['provider', 'access_token']
      })
    }

    // 验证支持的第三方平台
    const supportedProviders = ['wechat', 'apple', 'google']
    if (!supportedProviders.includes(provider)) {
      return res.status(400).json({ 
        message: '不支持的第三方平台',
        supported_providers: supportedProviders
      })
    }

    let authUser
    
    // 根据环境和provider选择认证方式
    if (provider === 'google') {
      // Google登录始终使用Firebase认证
      if (process.env.NODE_ENV === 'development' && access_token.includes('test_')) {
        // 开发环境的测试模式
        authUser = await mockAuthentication(provider, access_token)
      } else {
        // 使用Firebase验证Google登录
        authUser = await verifyFirebaseToken(access_token)
      }
    } else if (process.env.NODE_ENV === 'development') {
      // 其他provider在开发环境使用Mock
      authUser = await mockAuthentication(provider, access_token)
    } else {
      // 生产环境暂不支持其他provider
      return res.status(400).json({
        message: `生产环境暂不支持${provider}登录`,
        supported_providers: ['google']
      })
    }

    // 使用Firebase UID或者auth user的uid作为唯一标识
    const providerUserId = firebase_uid || authUser.uid
    const displayName = authUser.name || `${provider}用户`
    const providerEmail = authUser.email || null
    const avatarUrl = authUser.picture || null
    const finalFirebaseUid = firebase_uid || null  // 确保firebase_uid不会是undefined

    console.log(`[Auth] 处理${provider}登录:`, {
      providerUserId,
      displayName,
      providerEmail,
      avatarUrl,
      finalFirebaseUid
    })

    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()

      // 查找是否已存在该第三方账号绑定
      const [existingAccounts] = await connection.execute(
        'SELECT u.* FROM users u JOIN third_party_accounts tpa ON u.id = tpa.user_id WHERE tpa.provider = ? AND tpa.provider_user_id = ?',
        [provider, providerUserId]
      )

      let user
      
      if (existingAccounts.length > 0) {
        // 用户已存在，更新登录时间
        user = existingAccounts[0]
        
        await connection.execute(
          'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
          [user.id]
        )
        
        // 更新第三方账号信息 - 将undefined转换为null避免数据库错误
        await connection.execute(
          'UPDATE third_party_accounts SET access_token = ?, updated_at = CURRENT_TIMESTAMP WHERE provider = ? AND provider_user_id = ?',
          [access_token || null, provider, providerUserId]
        )
      } else {
        // 新用户注册 - 将undefined转换为null避免数据库错误
        const [userResult] = await connection.execute(
          'INSERT INTO users (display_name, avatar_url, last_login_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
          [displayName || null, avatarUrl || null]
        )
        
        const userId = userResult.insertId
        
        // 绑定第三方账号 - 将undefined转换为null避免数据库错误
        await connection.execute(
          'INSERT INTO third_party_accounts (user_id, provider, provider_user_id, provider_username, provider_email, access_token, firebase_uid) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            userId, 
            provider, 
            providerUserId, 
            displayName || null, 
            providerEmail || null, 
            access_token || null, 
            finalFirebaseUid
          ]
        )
        
        // 获取新创建的用户信息
        const [newUsers] = await connection.execute(
          'SELECT * FROM users WHERE id = ?',
          [userId]
        )
        user = newUsers[0]
      }

      await connection.commit()

      // 生成JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          provider, 
          provider_user_id: providerUserId,
          firebase_uid: finalFirebaseUid,
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET || appConfig.jwtSecret,
        { expiresIn: appConfig.jwtExpire }
      )

      res.json({
        message: '登录成功',
        user: {
          id: user.id,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          total_score: user.total_score,
          current_rank: user.current_rank,
          is_premium: user.is_premium,
          premium_expire_at: user.premium_expire_at,
          language_preference: user.language_preference,
          difficulty_mode: user.difficulty_mode,
          hint_language: user.hint_language,
          sound_enabled: user.sound_enabled,
          firebase_uid: finalFirebaseUid,
          created_at: user.created_at,
          last_login_at: user.last_login_at
        },
        token,
        expires_in: 7 * 24 * 60 * 60 // 7天，秒为单位
      })

    } catch (dbError) {
      await connection.rollback()
      console.error('数据库操作失败:', dbError)
      throw dbError
    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('登录失败:', error)
    res.status(500).json({ 
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : '认证失败'
    })
  }
})

/**
 * 刷新令牌
 * POST /api/auth/refresh
 */
router.post('/refresh', auth, async (req, res) => {
  try {
    const userId = req.user.id

    const connection = await pool.getConnection()
    
    try {
      // 获取用户信息
      const [users] = await connection.execute(
        'SELECT * FROM v_user_profile WHERE id = ?',
        [userId]
      )

      if (users.length === 0) {
        return res.status(404).json({ message: '用户不存在' })
      }

      const user = users[0]

      // 生成新的JWT
      const token = jwt.sign(
        { 
          id: user.id,
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET || 'chinpoem-secret',
        { expiresIn: '7d' }
      )

      res.json({
        message: '令牌刷新成功',
        user: {
          id: user.id,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          total_score: user.total_score,
          current_rank: user.current_rank,
          is_premium: user.is_premium_active,
          premium_expire_at: user.premium_expire_at,
          language_preference: user.language_preference,
          difficulty_mode: user.difficulty_mode,
          hint_language: user.hint_language,
          sound_enabled: user.sound_enabled,
          next_rank: user.next_rank,
          next_rank_score: user.next_rank_score,
          points_to_next_rank: user.points_to_next_rank,
          last_login_at: user.last_login_at,
          last_sync_at: user.last_sync_at
        },
        token,
        expires_in: 7 * 24 * 60 * 60
      })

    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('刷新令牌失败:', error)
    res.status(500).json({ 
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * 退出登录
 * POST /api/auth/logout
 */
router.post('/logout', auth, async (req, res) => {
  try {
    // 由于使用JWT，客户端删除token即可
    // 这里可以添加token黑名单逻辑（如果需要）
    res.json({ 
      message: '退出登录成功',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('退出登录失败:', error)
    res.status(500).json({ 
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * 验证令牌状态
 * GET /api/auth/verify
 */
router.get('/verify', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const connection = await pool.getConnection()
    
    try {
      const [users] = await connection.execute(
        'SELECT id, display_name, avatar_url FROM users WHERE id = ?',
        [userId]
      )

      if (users.length === 0) {
        return res.status(404).json({ message: '用户不存在' })
      }

      res.json({
        valid: true,
        user: users[0],
        exp: req.user.exp,
        iat: req.user.iat
      })

    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('验证令牌失败:', error)
    res.status(500).json({ 
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router 