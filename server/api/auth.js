import express from 'express'
import jwt from 'jsonwebtoken'
import mysql from 'mysql2/promise'
import config from '../config/database.js'
import { auth } from '../middleware/auth.js'
import { mockAuthService } from '../services/mockServices.js'

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
 * 第三方登录
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { provider, access_token } = req.body

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

    // 验证第三方令牌并获取用户信息
    let thirdPartyUser
    try {
      thirdPartyUser = await mockAuthService.verifyThirdPartyAuth(provider, access_token)
    } catch (error) {
      return res.status(401).json({ 
        message: '第三方认证失败',
        error: error.message 
      })
    }

    // 提取第三方用户信息
    const providerUserId = thirdPartyUser.openid || thirdPartyUser.sub || thirdPartyUser.id
    const providerUsername = thirdPartyUser.nickname || thirdPartyUser.name || thirdPartyUser.username
    const providerEmail = thirdPartyUser.email || null
    const displayName = thirdPartyUser.nickname || thirdPartyUser.name || `${provider}用户`
    const avatarUrl = thirdPartyUser.headimgurl || thirdPartyUser.picture || thirdPartyUser.profile_image_url || null

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
        // 用户已存在，更新登录时间和令牌信息
        user = existingAccounts[0]
        
        await connection.execute(
          'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
          [user.id]
        )
        
        await connection.execute(
          'UPDATE third_party_accounts SET access_token = ?, updated_at = CURRENT_TIMESTAMP WHERE provider = ? AND provider_user_id = ?',
          [access_token, provider, providerUserId]
        )
      } else {
        // 新用户注册
        const [userResult] = await connection.execute(
          'INSERT INTO users (display_name, avatar_url, last_login_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
          [displayName, avatarUrl]
        )
        
        const userId = userResult.insertId
        
        // 绑定第三方账号
        await connection.execute(
          'INSERT INTO third_party_accounts (user_id, provider, provider_user_id, provider_username, provider_email, access_token) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, provider, providerUserId, providerUsername, providerEmail, access_token]
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
          iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET || 'chinpoem-secret',
        { expiresIn: '7d' }
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
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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