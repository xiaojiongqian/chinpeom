import request from 'supertest'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import authRoutes from '../api/auth.js'

// 创建测试应用
const createTestApp = () => {
  const app = express()
  
  app.use(cors())
  app.use(bodyParser.json())
  app.use('/api/auth', authRoutes)
  
  return app
}

describe('认证API简化测试', () => {
  let app
  let testToken
  let testUserId

  beforeAll(async () => {
    app = createTestApp()
    // 等待一下确保应用初始化
    await new Promise(resolve => setTimeout(resolve, 500))
  })

  describe('POST /api/auth/login', () => {
    test('应该成功进行微信登录', async () => {
      const loginData = {
        provider: 'wechat',
        access_token: 'valid_wechat_token'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)

      expect(response.body).toHaveProperty('message', '登录成功')
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('expires_in')
      
      expect(response.body.user).toHaveProperty('id')
      expect(response.body.user).toHaveProperty('display_name')
      expect(response.body.user.display_name).toMatch(/微信用户/)

      // 保存token用于后续测试
      testToken = response.body.token
      testUserId = response.body.user.id
    })

    test('应该成功进行Google登录', async () => {
      const loginData = {
        provider: 'google',
        access_token: 'valid_google_token'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)

      expect(response.body.user.display_name).toMatch(/Google User/)
    })

    test('应该拒绝无效的第三方平台', async () => {
      const loginData = {
        provider: 'invalid_platform',
        access_token: 'some_token'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400)

      expect(response.body).toHaveProperty('message', '不支持的第三方平台')
      expect(response.body).toHaveProperty('supported_providers')
    })

    test('应该拒绝无效的访问令牌', async () => {
      const loginData = {
        provider: 'wechat',
        access_token: 'invalid_token'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      expect(response.body).toHaveProperty('message', '第三方认证失败')
    })

    test('应该拒绝缺少必需参数的请求', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400)

      expect(response.body).toHaveProperty('message', '第三方平台和访问令牌不能为空')
      expect(response.body).toHaveProperty('required')
    })
  })

  describe('POST /api/auth/refresh', () => {
    test('应该成功刷新有效令牌', async () => {
      if (!testToken) {
        // 如果没有测试token，先登录
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            provider: 'wechat',
            access_token: 'valid_wechat_token'
          })
        testToken = loginResponse.body.token
      }

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('message', '令牌刷新成功')
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('expires_in')
    })

    test('应该拒绝无效令牌', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401)

      expect(response.body).toHaveProperty('message', '未授权，请登录')
    })

    test('应该拒绝没有令牌的请求', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .expect(401)

      expect(response.body).toHaveProperty('message', '未授权，请登录')
    })
  })

  describe('GET /api/auth/verify', () => {
    test('应该验证有效令牌', async () => {
      if (!testToken) {
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            provider: 'wechat',
            access_token: 'valid_wechat_token'
          })
        testToken = loginResponse.body.token
      }

      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('valid', true)
      expect(response.body).toHaveProperty('user')
      expect(response.body).toHaveProperty('exp')
      expect(response.body).toHaveProperty('iat')
    })
  })

  describe('POST /api/auth/logout', () => {
    test('应该成功退出登录', async () => {
      if (!testToken) {
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            provider: 'wechat',
            access_token: 'valid_wechat_token'
          })
        testToken = loginResponse.body.token
      }

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('message', '退出登录成功')
      expect(response.body).toHaveProperty('timestamp')
    })
  })
}) 