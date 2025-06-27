import express from 'express'
import pool from '../config/db.js'
import { auth } from '../middleware/auth.js'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

/**
 * 简化的Mock支付服务
 */
const mockPaymentService = {
  /**
   * 创建支付订单
   */
  async createPayment(orderData) {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const { payment_method, amount, order_no } = orderData
    
    // 模拟不同支付方式的响应
    const mockResponses = {
      alipay: {
        payment_url: `https://openapi.alipay.com/gateway.do?mock_order=${order_no}`,
        qr_code: `https://mock-qr.alipay.com/${order_no}`,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      },
      wechat: {
        prepay_id: `wx_prepay_${Math.random().toString(36).substr(2, 9)}`,
        qr_code: `https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?mock=${order_no}`,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      },
      apple: {
        transaction_id: `apple_${Math.random().toString(36).substr(2, 9)}`,
        receipt_data: 'mock_receipt_data_base64',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      },
      google: {
        purchase_token: `google_${Math.random().toString(36).substr(2, 9)}`,
        order_id: `GPA.${Math.random().toString(36).substr(2, 9)}`,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      },
      stripe: {
        payment_intent_id: `pi_${Math.random().toString(36).substr(2, 9)}`,
        client_secret: `pi_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }
    }
    
    return {
      success: true,
      order_no,
      payment_method,
      amount,
      currency: 'CNY',
      ...mockResponses[payment_method]
    }
  },

  /**
   * 验证支付结果
   */
  async verifyPayment(paymentData) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const { order_no, third_party_order_id } = paymentData
    
    // 模拟90%的成功率
    const isSuccess = Math.random() > 0.1
    
    if (isSuccess) {
      return {
        success: true,
        order_no,
        third_party_order_id: third_party_order_id || `mock_${Date.now()}`,
        paid_amount: paymentData.amount || 9.9,
        paid_at: new Date().toISOString(),
        status: 'paid'
      }
    } else {
      return {
        success: false,
        order_no,
        error: '支付失败',
        status: 'failed',
        third_party_order_id: null
      }
    }
  }
}

/**
 * 创建付费订单
 * POST /api/payment/create
 */
router.post('/create', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const { payment_method, product_type, amount, currency = 'CNY' } = req.body

    // 验证参数
    const validPaymentMethods = ['alipay', 'wechat', 'apple', 'google', 'stripe']
    const validProductTypes = ['premium_month', 'premium_year', 'premium_lifetime']

    if (!payment_method || !validPaymentMethods.includes(payment_method)) {
      return res.status(400).json({ 
        message: '不支持的支付方式',
        valid_payment_methods: validPaymentMethods
      })
    }

    if (!product_type || !validProductTypes.includes(product_type)) {
      return res.status(400).json({ 
        message: '不支持的产品类型',
        valid_product_types: validProductTypes
      })
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: '无效的支付金额' })
    }

    // 验证产品价格
    const productPrices = {
      premium_month: 9.9,
      premium_year: 68.0,
      premium_lifetime: 198.0
    }

    if (Math.abs(amount - productPrices[product_type]) > 0.01) {
      return res.status(400).json({ 
        message: '支付金额与产品价格不符',
        expected_amount: productPrices[product_type]
      })
    }

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // 检查用户是否已经是付费用户
      const [userInfo] = await connection.execute(
        'SELECT is_premium, premium_expire_at FROM users WHERE id = ?',
        [userId]
      )

      if (userInfo.length === 0) {
        return res.status(404).json({ message: '用户不存在' })
      }

      const user = userInfo[0]
      
      // 如果是终身会员，不允许重复购买
      if (user.is_premium && !user.premium_expire_at && product_type === 'premium_lifetime') {
        return res.status(400).json({ message: '您已是终身会员，无需重复购买' })
      }

      // 生成订单号
      const orderNo = `CP${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // 创建付费记录
      const [result] = await connection.execute(
        'INSERT INTO payment_records (user_id, order_no, payment_method, amount, currency, product_type, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, orderNo, payment_method, amount, currency, product_type, 'pending']
      )

      const orderId = result.insertId

      // 调用Mock支付服务创建支付
      const paymentData = await mockPaymentService.createPayment({
        order_no: orderNo,
        payment_method,
        amount,
        currency,
        product_type
      })

      await connection.commit()

      res.json({
        message: '订单创建成功',
        order: {
          id: orderId,
          order_no: orderNo,
          payment_method,
          amount,
          currency,
          product_type,
          status: 'pending',
          created_at: new Date().toISOString(),
          payment_data: paymentData
        }
      })

    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('创建订单失败:', error)
    res.status(500).json({ 
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * 验证付费状态（模拟第三方支付回调）
 * POST /api/payment/verify
 */
router.post('/verify', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const { order_no, third_party_order_id } = req.body

    if (!order_no) {
      return res.status(400).json({ message: '订单号不能为空' })
    }

    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // 查找订单
      const [orders] = await connection.execute(
        'SELECT * FROM payment_records WHERE user_id = ? AND order_no = ? AND status = ?',
        [userId, order_no, 'pending']
      )

      if (orders.length === 0) {
        return res.status(404).json({ message: '订单不存在或已处理' })
      }

      const order = orders[0]

      // 调用Mock支付服务验证支付
      const verificationResult = await mockPaymentService.verifyPayment({
        order_no,
        third_party_order_id,
        amount: order.amount,
        payment_method: order.payment_method
      })

      const status = verificationResult.success ? 'paid' : 'failed'
      const paidAt = verificationResult.success ? new Date() : null

      // 更新订单状态
      await connection.execute(
        'UPDATE payment_records SET status = ?, third_party_order_id = ?, paid_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, verificationResult.third_party_order_id, paidAt, order.id]
      )

      // 如果支付成功，更新用户付费状态
      if (verificationResult.success) {
        let expireAt = null
        
        // 计算到期时间
        if (order.product_type === 'premium_month') {
          expireAt = new Date()
          expireAt.setMonth(expireAt.getMonth() + 1)
        } else if (order.product_type === 'premium_year') {
          expireAt = new Date()
          expireAt.setFullYear(expireAt.getFullYear() + 1)
        }
        // premium_lifetime 不设置到期时间

        // 调用存储过程更新用户付费状态
        await connection.execute('CALL UpdateUserPremium(?, ?, ?)', [userId, 1, expireAt])
      }

      await connection.commit()

      res.json({
        message: verificationResult.success ? '支付成功' : '支付失败',
        order: {
          order_no: order.order_no,
          status,
          paid_at: paidAt,
          amount: order.amount,
          product_type: order.product_type
        },
        verification_result: verificationResult
      })

    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('验证支付状态失败:', error)
    res.status(500).json({ 
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * 查询用户付费历史
 * GET /api/payment/history
 */
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10, status } = req.query

    // 确保page和limit是数字类型
    const pageNum = parseInt(page) || 1
    const limitNum = parseInt(limit) || 10
    const offset = (pageNum - 1) * limitNum
    
    const connection = await pool.getConnection()

    try {
      // 构建查询条件
      let whereClause = 'WHERE user_id = ?'
      let queryParams = [userId]

      if (status) {
        const validStatuses = ['pending', 'paid', 'failed', 'cancelled']
        if (validStatuses.includes(status)) {
          whereClause += ' AND status = ?'
          queryParams.push(status)
        }
      }

      // 查询付费记录
      const [records] = await connection.execute(
        `SELECT id, order_no, payment_method, amount, currency, product_type, status, paid_at, created_at 
         FROM payment_records ${whereClause} ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`,
        queryParams
      )

      // 查询总记录数
      const [countResult] = await connection.execute(
        `SELECT COUNT(*) as total FROM payment_records ${whereClause}`,
        queryParams
      )

      const total = countResult[0]?.total || 0

      res.json({
        records: (records || []).map(record => ({
          ...record,
          created_at: record.created_at ? record.created_at.toISOString() : null,
          paid_at: record.paid_at ? record.paid_at.toISOString() : null
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      })

    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('查询付费历史失败:', error)
    res.status(500).json({ 
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * 取消订单
 * POST /api/payment/cancel
 */
router.post('/cancel', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const { order_no } = req.body

    if (!order_no) {
      return res.status(400).json({ message: '订单号不能为空' })
    }

    const connection = await pool.getConnection()

    try {
      // 查找待支付订单
      const [orders] = await connection.execute(
        'SELECT * FROM payment_records WHERE user_id = ? AND order_no = ? AND status = ?',
        [userId, order_no, 'pending']
      )

      if (orders.length === 0) {
        return res.status(404).json({ message: '订单不存在或无法取消' })
      }

      // 更新订单状态为已取消
      await connection.execute(
        'UPDATE payment_records SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['failed', orders[0].id]
      )

      res.json({
        message: '订单已取消',
        order_no: orders[0].order_no
      })

    } finally {
      connection.release()
    }

  } catch (error) {
    console.error('取消订单失败:', error)
    res.status(500).json({ 
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * 获取产品价格信息
 * GET /api/payment/products
 */
router.get('/products', async (req, res) => {
  try {
    const products = [
      {
        type: 'premium_month',
        name: '月度会员',
        description: '解锁所有学级，享受完整学习体验',
        duration: '1个月',
        price: 9.9,
        currency: 'CNY',
        features: [
          '解锁所有学级等级',
          '无限制诗歌学习',
          '专属会员徽章',
          '优先客服支持'
        ]
      },
      {
        type: 'premium_year',
        name: '年度会员',
        description: '解锁所有学级，享受完整学习体验',
        duration: '1年',
        price: 68.0,
        currency: 'CNY',
        original_price: 118.8,
        discount: '43%',
        features: [
          '解锁所有学级等级',
          '无限制诗歌学习',
          '专属会员徽章',
          '优先客服支持',
          '年度学习报告'
        ]
      },
      {
        type: 'premium_lifetime',
        name: '终身会员',
        description: '永久解锁所有学级和功能',
        duration: '永久',
        price: 198.0,
        currency: 'CNY',
        original_price: 999.0,
        discount: '80%',
        popular: true,
        features: [
          '永久解锁所有功能',
          '无限制诗歌学习',
          '专属终身徽章',
          '专属客服通道',
          '新功能优先体验',
          '终身学习统计'
        ]
      }
    ]

    res.json({
      products,
      supported_payment_methods: [
        { code: 'alipay', name: '支付宝', enabled: true },
        { code: 'wechat', name: '微信支付', enabled: true },
        { code: 'apple', name: 'Apple Pay', enabled: true },
        { code: 'google', name: 'Google Pay', enabled: true },
        { code: 'stripe', name: 'Stripe', enabled: true }
      ]
    })

  } catch (error) {
    console.error('获取产品信息失败:', error)
    res.status(500).json({ 
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router 