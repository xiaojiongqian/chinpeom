import request from 'supertest'
import app from '../server.js'

describe('支付API测试', () => {
  let testToken
  let testOrderNo

  beforeAll(async () => {
    // 先登录获取token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        provider: 'wechat',
        access_token: 'valid_wechat_token'
      })
    
    testToken = loginResponse.body.token
  })

  describe('GET /api/payment/products', () => {
    test('应该返回产品价格信息', async () => {
      const response = await request(app)
        .get('/api/payment/products')
        .expect(200)

      expect(response.body).toHaveProperty('products')
      expect(response.body).toHaveProperty('supported_payment_methods')
      
      expect(response.body.products).toHaveLength(3)
      
      const monthlyProduct = response.body.products.find(p => p.type === 'premium_month')
      expect(monthlyProduct).toHaveProperty('price', 9.9)
      expect(monthlyProduct).toHaveProperty('currency', 'CNY')
      expect(monthlyProduct).toHaveProperty('features')

      const yearlyProduct = response.body.products.find(p => p.type === 'premium_year')
      expect(yearlyProduct).toHaveProperty('price', 68.0)
      expect(yearlyProduct).toHaveProperty('discount')

      const lifetimeProduct = response.body.products.find(p => p.type === 'premium_lifetime')
      expect(lifetimeProduct).toHaveProperty('price', 198.0)
      expect(lifetimeProduct).toHaveProperty('popular', true)
    })
  })

  describe('POST /api/payment/create', () => {
    test('应该成功创建月度会员订单', async () => {
      const orderData = {
        payment_method: 'alipay',
        product_type: 'premium_month',
        amount: 9.9,
        currency: 'CNY'
      }

      const response = await request(app)
        .post('/api/payment/create')
        .set('Authorization', `Bearer ${testToken}`)
        .send(orderData)
        .expect(200)

      expect(response.body).toHaveProperty('message', '订单创建成功')
      expect(response.body).toHaveProperty('order')
      
      const order = response.body.order
      expect(order).toHaveProperty('id')
      expect(order).toHaveProperty('order_no')
      expect(order).toHaveProperty('payment_method', 'alipay')
      expect(order).toHaveProperty('amount', 9.9)
      expect(order).toHaveProperty('status', 'pending')
      expect(order).toHaveProperty('payment_data')

      // 保存订单号用于后续测试
      testOrderNo = order.order_no
    })

    test('应该拒绝无效的支付方式', async () => {
      const orderData = {
        payment_method: 'invalid_method',
        product_type: 'premium_month',
        amount: 9.9
      }

      const response = await request(app)
        .post('/api/payment/create')
        .set('Authorization', `Bearer ${testToken}`)
        .send(orderData)
        .expect(400)

      expect(response.body).toHaveProperty('message', '不支持的支付方式')
      expect(response.body).toHaveProperty('valid_payment_methods')
    })

    test('应该拒绝无效的产品类型', async () => {
      const orderData = {
        payment_method: 'alipay',
        product_type: 'invalid_product',
        amount: 9.9
      }

      const response = await request(app)
        .post('/api/payment/create')
        .set('Authorization', `Bearer ${testToken}`)
        .send(orderData)
        .expect(400)

      expect(response.body).toHaveProperty('message', '不支持的产品类型')
      expect(response.body).toHaveProperty('valid_product_types')
    })

    test('应该拒绝错误的金额', async () => {
      const orderData = {
        payment_method: 'alipay',
        product_type: 'premium_month',
        amount: 19.9 // 错误的金额
      }

      const response = await request(app)
        .post('/api/payment/create')
        .set('Authorization', `Bearer ${testToken}`)
        .send(orderData)
        .expect(400)

      expect(response.body).toHaveProperty('message', '支付金额与产品价格不符')
      expect(response.body).toHaveProperty('expected_amount', 9.9)
    })

    test('应该拒绝未认证的请求', async () => {
      const orderData = {
        payment_method: 'alipay',
        product_type: 'premium_month',
        amount: 9.9
      }

      const response = await request(app)
        .post('/api/payment/create')
        .send(orderData)
        .expect(401)

      expect(response.body).toHaveProperty('message', '未授权，请登录')
    })
  })

  describe('POST /api/payment/verify', () => {
    test('应该成功验证支付状态', async () => {
      // 先创建订单
      if (!testOrderNo) {
        const createResponse = await request(app)
          .post('/api/payment/create')
          .set('Authorization', `Bearer ${testToken}`)
          .send({
            payment_method: 'wechat',
            product_type: 'premium_month',
            amount: 9.9
          })
        testOrderNo = createResponse.body.order.order_no
      }

      const verifyData = {
        order_no: testOrderNo,
        third_party_order_id: 'mock_third_party_123'
      }

      const response = await request(app)
        .post('/api/payment/verify')
        .set('Authorization', `Bearer ${testToken}`)
        .send(verifyData)

      expect(response.status).toBeOneOf([200]) // Mock服务有90%成功率
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('order')
        expect(response.body).toHaveProperty('verification_result')
        expect(response.body.order).toHaveProperty('order_no', testOrderNo)
      }
    })

    test('应该拒绝不存在的订单', async () => {
      const verifyData = {
        order_no: 'non_existing_order',
        third_party_order_id: 'mock_third_party_123'
      }

      const response = await request(app)
        .post('/api/payment/verify')
        .set('Authorization', `Bearer ${testToken}`)
        .send(verifyData)
        .expect(404)

      expect(response.body).toHaveProperty('message', '订单不存在或已处理')
    })
  })

  describe('GET /api/payment/history', () => {
    test('应该返回用户付费历史', async () => {
      const response = await request(app)
        .get('/api/payment/history')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('records')
      expect(response.body).toHaveProperty('pagination')
      
      expect(Array.isArray(response.body.records)).toBe(true)
      expect(response.body.pagination).toHaveProperty('page')
      expect(response.body.pagination).toHaveProperty('limit')
      expect(response.body.pagination).toHaveProperty('total')
      expect(response.body.pagination).toHaveProperty('pages')
    })

    test('应该支持状态过滤', async () => {
      const response = await request(app)
        .get('/api/payment/history?status=pending')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('records')
      // 如果有记录，都应该是pending状态
      if (response.body.records.length > 0) {
        response.body.records.forEach(record => {
          expect(record.status).toBe('pending')
        })
      }
    })

    test('应该支持分页', async () => {
      const response = await request(app)
        .get('/api/payment/history?page=1&limit=5')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)

      expect(response.body.pagination.page).toBe(1)
      expect(response.body.pagination.limit).toBe(5)
      expect(response.body.records.length).toBeLessThanOrEqual(5)
    })
  })

  describe('POST /api/payment/cancel', () => {
    test('应该成功取消待支付订单', async () => {
      // 先创建一个新订单
      const createResponse = await request(app)
        .post('/api/payment/create')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          payment_method: 'stripe',
          product_type: 'premium_year',
          amount: 68.0
        })

      const orderNo = createResponse.body.order.order_no

      const response = await request(app)
        .post('/api/payment/cancel')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ order_no: orderNo })
        .expect(200)

      expect(response.body).toHaveProperty('message', '订单已取消')
      expect(response.body).toHaveProperty('order_no', orderNo)
    })

    test('应该拒绝取消不存在的订单', async () => {
      const response = await request(app)
        .post('/api/payment/cancel')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ order_no: 'non_existing_order' })
        .expect(404)

      expect(response.body).toHaveProperty('message', '订单不存在或无法取消')
    })
  })

  describe('支付集成测试', () => {
    test('完整的支付流程测试', async () => {
      // 1. 创建订单
      const createResponse = await request(app)
        .post('/api/payment/create')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          payment_method: 'google',
          product_type: 'premium_lifetime',
          amount: 198.0
        })
        .expect(200)

      const orderNo = createResponse.body.order.order_no
      expect(createResponse.body.order.payment_data).toHaveProperty('purchase_token')

      // 2. 验证支付（模拟支付成功）
      const verifyResponse = await request(app)
        .post('/api/payment/verify')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          order_no: orderNo,
          third_party_order_id: 'google_success_123'
        })

      // Mock服务有90%成功率，所以可能成功或失败
      expect(verifyResponse.status).toBeOneOf([200])

      // 3. 查看付费历史
      const historyResponse = await request(app)
        .get('/api/payment/history')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)

      expect(historyResponse.body.records.length).toBeGreaterThan(0)
      
      // 应该能找到我们创建的订单
      const ourOrder = historyResponse.body.records.find(r => r.order_no === orderNo)
      expect(ourOrder).toBeDefined()
    })
  })
})

// 自定义匹配器
expect.extend({
  toBeOneOf(received, expected) {
    const pass = expected.includes(received)
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected}`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be one of ${expected}`,
        pass: false,
      }
    }
  },
}) 