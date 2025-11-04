import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../app.js'
import { createTestAuthToken } from './helpers/authHelper.js'

describe('认证API测试', () => {
  let testToken
  let testUserId

  beforeAll(async () => {
    // Login once and get a token for all tests in this suite
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        provider: 'wechat',
        access_token: createTestAuthToken('wechat', { sub: 'auth_test_user' })
      })

    expect(loginResponse.status).toBe(200)
    testToken = loginResponse.body.token
    testUserId = loginResponse.body.user.id

    // Track the user created for this suite
    if (global.trackTestUser) {
      global.trackTestUser(testUserId)
    }
  })

  afterAll(async () => {
    // Clean up all data created in this suite
    if (global.testDbHelper) {
      await global.testDbHelper.cleanupTestData()
    }
  })

  describe('POST /api/auth/login', () => {
    test('应该为新用户成功创建账户和登录', () => {
      // This is implicitly tested in the beforeAll block
      expect(testToken).toBeDefined()
      expect(testUserId).toBeDefined()
    })

    test('应该拒绝无效的第三方平台', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ provider: 'invalid_platform', access_token: 'some_token' })
        .expect(400)
    })

    test('应该拒绝无效的访问令牌', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          provider: 'wechat',
          access_token: createTestAuthToken('wechat', { fail_verification: true })
        })
        .expect(401)
    })
  })

  describe('POST /api/auth/refresh', () => {
    test('应该成功刷新有效令牌', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('token')
      expect(response.body.user.id).toBe(testUserId)
    })
  })

  describe('GET /api/auth/verify', () => {
    test('应该验证有效令牌', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)

      expect(response.body.valid).toBe(true)
      expect(response.body.user.id).toBe(testUserId)
    })
  })

  describe('POST /api/auth/logout', () => {
    test('应该成功退出登录', async () => {
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)
    })
  })

  describe('JWT令牌功能测试', () => {
    test('生成的JWT应该包含正确的用户信息', async () => {
      // We use the token generated in beforeAll for this check
      const decoded = jwt.verify(testToken, process.env.JWT_SECRET)

      expect(decoded).toHaveProperty('id', testUserId)
      expect(decoded).toHaveProperty('provider', 'wechat')
    })
  })
})
