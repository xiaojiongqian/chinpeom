import request from 'supertest'
import app from '../app.js' // Use the main app
import { createTestAuthToken } from './helpers/authHelper.js'

describe('认证API简化测试', () => {
  let testToken
  let testUserId

  beforeAll(async () => {
    // Login once for all tests in this suite
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        provider: 'wechat',
        access_token: createTestAuthToken('wechat', { sub: 'simple_auth_test_user' })
      })
    expect(loginResponse.status).toBe(200)
    testToken = loginResponse.body.token
    testUserId = loginResponse.body.user.id

    // Track the created user for cleanup
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

  test('POST /api/auth/login :: should successfully login', () => {
    // Implicitly tested in beforeAll
    expect(testToken).toBeDefined()
  })

  test('POST /api/auth/refresh :: should refresh a valid token', async () => {
    await request(app)
      .post('/api/auth/refresh')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200)
  })

  test('GET /api/auth/verify :: should verify a valid token', async () => {
    const response = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200)
    expect(response.body.valid).toBe(true)
  })

  test('POST /api/auth/logout :: should successfully logout', async () => {
    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200)
  })

  test('POST /api/auth/login :: should reject an invalid token', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({
        provider: 'wechat',
        access_token: createTestAuthToken('wechat', { fail_verification: true })
      })
      .expect(401)
  })
}) 