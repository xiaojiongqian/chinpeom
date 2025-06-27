import request from 'supertest'
import app from '../app.js'
import { createTestAuthToken } from './helpers/authHelper.js'

describe('支付API测试', () => {
  let testToken

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        provider: 'wechat',
        access_token: createTestAuthToken('wechat', { sub: 'payment_test_user' })
      })
    
    testToken = loginResponse.body.token
    const testUserId = loginResponse.body.user.id
    if (global.trackTestUser) {
      global.trackTestUser(testUserId)
    }
  })

  afterAll(async () => {
    if (global.testDbHelper) {
      await global.testDbHelper.cleanupTestData()
    }
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

      expect(response.body.order).toHaveProperty('status', 'pending')
    })
  })

  describe('支付集成测试', () => {
    test('完整的支付流程测试', async () => {
      // 1. Create and successfully pay for a lifetime order
      const createLifetimeResponse = await request(app)
        .post('/api/payment/create')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          payment_method: 'google',
          product_type: 'premium_lifetime',
          amount: 198.0
        })
      expect(createLifetimeResponse.status).toBe(200)
      const lifetimeOrderNo = createLifetimeResponse.body.order.order_no

      await request(app)
        .post('/api/payment/verify')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ order_no: lifetimeOrderNo, third_party_order_id: 'mock_force_success' })
        .expect(200)

      // 2. Create and then cancel a yearly order
      const createYearlyResponse = await request(app)
        .post('/api/payment/create')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          payment_method: 'stripe',
          product_type: 'premium_year',
          amount: 68.0
        })
      const yearlyOrderNo = createYearlyResponse.body.order.order_no

      await request(app)
        .post('/api/payment/cancel')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ order_no: yearlyOrderNo })
        .expect(200)

      // 3. Get payment history and check statuses
      const historyResponse = await request(app)
        .get('/api/payment/history')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)

      const lifetimeOrder = historyResponse.body.records.find(r => r.order_no === lifetimeOrderNo)
      expect(lifetimeOrder.status).toBe('paid')

      const yearlyOrder = historyResponse.body.records.find(r => r.order_no === yearlyOrderNo)
      expect(yearlyOrder.status).toBe('failed')
    })
  })
}) 