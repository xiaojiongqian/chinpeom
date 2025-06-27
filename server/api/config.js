import express from 'express'
import pool from '../config/db.js'

const router = express.Router()

/**
 * 获取所有学级称号配置
 * GET /api/config/ranks
 */
router.get('/ranks', async (req, res) => {
  try {
    const connection = await pool.getConnection()

    try {
      const [ranks] = await connection.execute(
        'SELECT rank_name, min_score, max_score, description, requires_premium, rank_order FROM academic_ranks ORDER BY rank_order'
      )

      res.json({
        ranks: ranks.map(rank => ({
          rank_name: rank.rank_name,
          min_score: rank.min_score,
          max_score: rank.max_score,
          description: rank.description,
          requires_premium: Boolean(rank.requires_premium),
          rank_order: rank.rank_order
        }))
      })

    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('获取学级称号失败:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

/**
 * 获取应用配置信息
 * GET /api/config/app
 */
router.get('/app', async (req, res) => {
  try {
    res.json({
      app: {
        name: '唐诗译境',
        name_en: 'Chinpoem',
        version: '1.0.0',
        description: '熟读（猜）唐诗三百首，不会作诗也会吟',
        supported_languages: [
          { code: 'zh-CN', name: '中文', name_en: 'Chinese' },
          { code: 'en', name: '英语', name_en: 'English' },
          { code: 'es', name: '西班牙语', name_en: 'Spanish' },
          { code: 'ja', name: '日语', name_en: 'Japanese' },
          { code: 'fr', name: '法语', name_en: 'French' },
          { code: 'de', name: '德语', name_en: 'German' }
        ],
        supported_hint_languages: [
          { code: 'en', name: '英语', name_en: 'English' },
          { code: 'es', name: '西班牙语', name_en: 'Spanish' },
          { code: 'ja', name: '日语', name_en: 'Japanese' },
          { code: 'fr', name: '法语', name_en: 'French' },
          { code: 'de', name: '德语', name_en: 'German' }
        ],
        difficulty_modes: [
          { code: 'easy', name: '简单模式', description: '有外语提示' },
          { code: 'hard', name: '困难模式', description: '无语言提示' }
        ],
        payment_methods: [
          { code: 'alipay', name: '支付宝', enabled: true },
          { code: 'wechat', name: '微信支付', enabled: true },
          { code: 'apple', name: 'Apple Pay', enabled: true },
          { code: 'google', name: 'Google Pay', enabled: true },
          { code: 'stripe', name: 'Stripe', enabled: true }
        ],
        product_types: [
          {
            code: 'premium_month',
            name: '月度会员',
            description: '解锁所有学级，享受完整学习体验',
            duration: '1个月',
            price: 9.9,
            currency: 'CNY'
          },
          {
            code: 'premium_year',
            name: '年度会员',
            description: '解锁所有学级，享受完整学习体验',
            duration: '1年',
            price: 68.0,
            currency: 'CNY'
          },
          {
            code: 'premium_lifetime',
            name: '终身会员',
            description: '永久解锁所有学级和功能',
            duration: '永久',
            price: 198.0,
            currency: 'CNY'
          }
        ],
        scoring_rules: {
          easy_mode: {
            correct: 1,
            incorrect: -1
          },
          hard_mode: {
            correct: 2,
            incorrect: -2
          }
        }
      }
    })

  } catch (error) {
    console.error('获取应用配置失败:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router 