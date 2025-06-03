import express from 'express'
import mysql from 'mysql2/promise'
import config from '../config/database.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// 创建数据库连接池
const pool = mysql.createPool(config.database)

/**
 * 获取用户完整信息
 * GET /api/user/profile
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const connection = await pool.getConnection()

    try {
      const [users] = await connection.execute(
        'SELECT * FROM v_user_profile WHERE id = ?',
        [userId]
      )

      if (users.length === 0) {
        return res.status(404).json({ message: '用户不存在' })
      }

      const user = users[0]

      res.json({
        user: {
          id: user.id,
          display_name: user.display_name,
          avatar_url: user.avatar_url,
          total_score: user.total_score,
          current_rank: user.current_rank,
          rank_description: user.rank_description,
          rank_min_score: user.rank_min_score,
          rank_max_score: user.rank_max_score,
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
        }
      })

    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('获取用户信息失败:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

/**
 * 同步用户积分
 * PUT /api/user/score
 */
router.put('/score', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const { total_score } = req.body

    if (typeof total_score !== 'number' || total_score < 0) {
      return res.status(400).json({ message: '积分必须是非负数' })
    }

    const connection = await pool.getConnection()

    try {
      // 调用存储过程同步积分和等级
      await connection.execute('CALL SyncUserScore(?, ?)', [userId, total_score])

      // 获取更新后的用户信息
      const [users] = await connection.execute(
        'SELECT * FROM v_user_profile WHERE id = ?',
        [userId]
      )

      if (users.length === 0) {
        return res.status(404).json({ message: '用户不存在' })
      }

      const user = users[0]

      res.json({
        message: '积分同步成功',
        user: {
          id: user.id,
          total_score: user.total_score,
          current_rank: user.current_rank,
          next_rank: user.next_rank,
          next_rank_score: user.next_rank_score,
          points_to_next_rank: user.points_to_next_rank,
          last_sync_at: user.last_sync_at
        }
      })

    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('同步积分失败:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

/**
 * 更新用户设置
 * PUT /api/user/settings
 */
router.put('/settings', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const { language_preference, difficulty_mode, hint_language, sound_enabled } = req.body

    // 验证参数
    const validLanguages = ['zh-CN', 'en', 'es', 'ja', 'fr', 'de']
    const validHintLanguages = ['en', 'es', 'ja', 'fr', 'de']
    const validDifficultyModes = ['easy', 'hard']

    if (language_preference && !validLanguages.includes(language_preference)) {
      return res.status(400).json({ message: '不支持的语言偏好' })
    }

    if (difficulty_mode && !validDifficultyModes.includes(difficulty_mode)) {
      return res.status(400).json({ message: '不支持的难度模式' })
    }

    if (hint_language && !validHintLanguages.includes(hint_language)) {
      return res.status(400).json({ message: '不支持的提示语言' })
    }

    if (sound_enabled !== undefined && typeof sound_enabled !== 'boolean') {
      return res.status(400).json({ message: '音效设置必须是布尔值' })
    }

    const connection = await pool.getConnection()

    try {
      // 构建更新SQL
      const updateFields = []
      const updateValues = []

      if (language_preference !== undefined) {
        updateFields.push('language_preference = ?')
        updateValues.push(language_preference)
      }
      if (difficulty_mode !== undefined) {
        updateFields.push('difficulty_mode = ?')
        updateValues.push(difficulty_mode)
      }
      if (hint_language !== undefined) {
        updateFields.push('hint_language = ?')
        updateValues.push(hint_language)
      }
      if (sound_enabled !== undefined) {
        updateFields.push('sound_enabled = ?')
        updateValues.push(sound_enabled ? 1 : 0)
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ message: '没有提供要更新的设置' })
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP')
      updateValues.push(userId)

      const updateSQL = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`
      await connection.execute(updateSQL, updateValues)

      // 获取更新后的用户信息
      const [users] = await connection.execute(
        'SELECT language_preference, difficulty_mode, hint_language, sound_enabled FROM users WHERE id = ?',
        [userId]
      )

      if (users.length === 0) {
        return res.status(404).json({ message: '用户不存在' })
      }

      res.json({
        message: '设置更新成功',
        settings: {
          language_preference: users[0].language_preference,
          difficulty_mode: users[0].difficulty_mode,
          hint_language: users[0].hint_language,
          sound_enabled: Boolean(users[0].sound_enabled)
        }
      })

    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('更新设置失败:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router
