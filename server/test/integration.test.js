import request from 'supertest'
import app from '../app.js'
import { createTestAuthToken } from './helpers/authHelper.js'
import testDbHelper from './helpers/testDbHelper.js'

describe('API集成测试', () => {
  describe('完整的用户流程测试', () => {
    let userToken
    let userId

    beforeAll(async () => {
      // 在这个测试套件开始前，先登录并创建一个用户
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          provider: 'wechat',
          access_token: createTestAuthToken('wechat', { sub: 'integration_test_user' })
        })

      expect(response.status).toBe(200)
      userToken = response.body.token
      userId = response.body.user.id

      // 跟踪这个测试套件创建的用户，以便在 afterEach 中清理
      testDbHelper.trackUser(userId)
    })

    afterAll(async () => {
      // 清理现在由全局的 afterEach 处理
    })

    test('1. 新用户注册和登录 - is implicitly tested in beforeAll', () => {
      expect(userToken).toBeDefined()
      expect(userId).toBeDefined()
    })

    test('2. 获取用户详细信息', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)

      expect(response.body.user.id).toBe(userId)
      expect(response.body.user).toHaveProperty('current_rank')
      expect(response.body.user).toHaveProperty('next_rank')
    })

    test('3. 更新用户设置', async () => {
      const response = await request(app)
        .put('/api/user/settings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          language_preference: 'en',
          difficulty_mode: 'hard',
          hint_language: 'fr',
          sound_enabled: false
        })
        .expect(200)

      expect(response.body.message).toBe('设置更新成功')
      expect(response.body.settings.difficulty_mode).toBe('hard')
      expect(response.body.settings.sound_enabled).toBe(false)
    })

    test('4. 同步用户积分', async () => {
      const response = await request(app)
        .put('/api/user/score')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          total_score: 30
        })
        .expect(200)

      expect(response.body.message).toBe('积分同步成功')
      expect(response.body.user.total_score).toBe(30)
      expect(response.body.user.current_rank).toBe('秀才') // 26-45分
    })

    test('5. 查看学级配置', async () => {
      const response = await request(app).get('/api/config/ranks').expect(200)

      expect(response.body.ranks).toBeInstanceOf(Array)
      expect(response.body.ranks.length).toBeGreaterThan(0)

      const baiDing = response.body.ranks.find(r => r.rank_name === '白丁')
      expect(baiDing).toBeDefined()
      expect(baiDing.min_score).toBe(0)
      expect(baiDing.requires_premium).toBe(false)
    })

    test('6. 查看产品信息', async () => {
      const response = await request(app).get('/api/payment/products').expect(200)

      expect(response.body.products).toHaveLength(3)
      expect(response.body.supported_payment_methods).toBeInstanceOf(Array)
    })

    test('7. 创建付费订单', async () => {
      const response = await request(app)
        .post('/api/payment/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          payment_method: 'alipay',
          product_type: 'premium_month',
          amount: 9.9,
          currency: 'CNY'
        })
        .expect(200)

      expect(response.body.message).toBe('订单创建成功')
      expect(response.body.order).toHaveProperty('order_no')
      expect(response.body.order.payment_data).toHaveProperty('payment_url')

      // 保存订单号用于后续测试
      global.testOrderNo = response.body.order.order_no

      // 跟踪测试创建的订单
      if (global.trackTestOrder) {
        global.trackTestOrder(global.testOrderNo)
      }
    })

    test('8. 模拟支付成功', async () => {
      const response = await request(app)
        .post('/api/payment/verify')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          order_no: global.testOrderNo,
          third_party_order_id: 'integration_test_payment_123'
        })

      // Mock服务有90%成功率，允许失败
      expect(response.status).toBeOneOf([200])

      if (response.status === 200) {
        expect(response.body.verification_result).toHaveProperty('success')
      }
    })

    test('9. 查看付费历史', async () => {
      const response = await request(app)
        .get('/api/payment/history')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)

      expect(response.body.records).toBeInstanceOf(Array)
      // Since we create an order in test 7, we expect at least one record
      expect(response.body.records.length).toBeGreaterThan(0)

      // 应该能找到我们创建的订单
      const ourOrder = response.body.records.find(r => r.order_no === global.testOrderNo)
      expect(ourOrder).toBeDefined()
    })

    test('10. 刷新令牌', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)

      expect(response.body.message).toBe('令牌刷新成功')
      expect(response.body.token).toBeDefined()
      expect(response.body.user.id).toBe(userId)
    })

    test('11. 验证令牌', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)

      expect(response.body.valid).toBe(true)
      expect(response.body.user.id).toBe(userId)
    })

    test('12. 退出登录', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)

      expect(response.body.message).toBe('退出登录成功')
    })
  })

  describe('多用户场景测试', () => {
    test('应该支持多个用户同时使用系统', async () => {
      const users = []

      // 创建3个不同平台的用户
      const providers = ['wechat', 'google', 'apple']

      for (const provider of providers) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            provider: provider,
            access_token: createTestAuthToken(provider, { sub: `${provider}_multi_user_token` })
          })
          .expect(200)

        users.push({
          provider,
          token: response.body.token,
          userId: response.body.user.id
        })

        // 跟踪测试创建的用户
        if (global.trackTestUser) {
          global.trackTestUser(response.body.user.id)
        }
      }

      // 验证用户ID都不相同
      const userIds = users.map(u => u.userId)
      const uniqueIds = [...new Set(userIds)]
      expect(uniqueIds.length).toBe(users.length)

      // 每个用户都能独立操作
      for (const user of users) {
        const profileResponse = await request(app)
          .get('/api/user/profile')
          .set('Authorization', `Bearer ${user.token}`)
          .expect(200)

        expect(profileResponse.body.user.id).toBe(user.userId)
      }
    })
  })

  describe('错误处理和边界测试', () => {
    test('应该正确处理各种无效请求', async () => {
      // 无效的JSON
      await request(app).post('/api/auth/login').send('invalid json').expect(400)

      // 空请求体
      await request(app).post('/api/auth/login').send({}).expect(400)

      // 无效的令牌
      await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401)

      // 不存在的路径
      await request(app).get('/api/nonexistent').expect(404)
    })

    test('应该正确处理数据库相关错误', async () => {
      // 模拟数据库查询失败

      // 登录获取token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          provider: 'wechat',
          access_token: createTestAuthToken('wechat', { sub: 'db_error_test_user' })
        })

      expect(loginResponse.status).toBe(200)

      const token = loginResponse.body.token
      const userId = loginResponse.body.user.id

      // 跟踪测试创建的用户
      if (global.trackTestUser) {
        global.trackTestUser(userId)
      }

      const invalidScoreResponse = await request(app)
        .put('/api/user/score')
        .set('Authorization', `Bearer ${token}`)
        .send({
          total_score: -10 // 负数积分
        })
        .expect(400)

      expect(invalidScoreResponse.body.message).toBe('积分必须是非负数')
    })
  })

  describe('性能和并发测试', () => {
    test('应该能处理并发请求', async () => {
      const totalRequests = 10
      const promises = []

      for (let i = 0; i < totalRequests; i++) {
        const promise = request(app)
          .post('/api/auth/login')
          .send({
            provider: 'wechat',
            access_token: createTestAuthToken('wechat', { sub: `concurrent_test_user_${i}` })
          })
        promises.push(promise)
      }

      const responses = await Promise.all(promises)

      // 所有请求都应该成功
      responses.forEach(response => {
        expect(response.status).toBe(200)
        expect(response.body.message).toBe('登录成功')

        // 跟踪测试创建的用户
        if (global.trackTestUser && response.body.user.id) {
          global.trackTestUser(response.body.user.id)
        }
      })

      // 所有用户应该有不同的ID
      const userIds = responses.map(r => r.body.user.id)
      const uniqueIds = [...new Set(userIds)]
      expect(uniqueIds.length).toBe(responses.length)
    })
  })
})

// 扩展Jest expect的自定义匹配器
expect.extend({
  toBeOneOf(received, expected) {
    const pass = expected.includes(received)
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected}`,
        pass: true
      }
    } else {
      return {
        message: () => `expected ${received} to be one of ${expected}`,
        pass: false
      }
    }
  }
})
