import config from '../../config/env/default.js'
import jwt from 'jsonwebtoken'

/**
 * 创建一个用于测试的伪JWT
 * @param {object} payload - 要编码的载荷
 * @returns {string} 伪JWT字符串
 */
const createFakeJwt = (payload) => {
  const header = { alg: 'HS256', typ: 'JWT' }
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64')
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64')
  const signature = 'fake-signature' // 不需要是有效的签名
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * 为第三方认证生成测试用的JWT
 * @param {string} provider - 'google', 'wechat', 'apple'
 * @param {object} [options]
 * @param {string} [options.sub] The subject (user ID) of the token.
 * @param {string} [options.name] The user's name.
 * @param {string} [options.email] The user's email.
 * @param {boolean} [options.fail_verification=false] If true, create a token that mock verification will reject.
 * @returns {string} A JWT-like string.
 */
export function createTestAuthToken(provider, options = {}) {
  const { sub, name, email, fail_verification = false } = options

  const now = Math.floor(Date.now() / 1000)
  const projectId = 'poem2guess-8d19f'

  const defaultUser = {
    google: {
      sub: 'google_user_123',
      email: 'test.google@example.com',
      name: 'Google User',
      picture: 'http://example.com/google.jpg',
      email_verified: true,
      firebase: {
        identities: {
          'google.com': ['google_user_123']
        }
      }
    },
    wechat: {
      sub: 'wechat_user_789',
      name: '微信用户_测试',
      // 微信登录没有email
      firebase: {
        identities: {
          'wechat.com': ['wechat_user_789_openid']
        }
      }
    },
    apple: {
      sub: 'apple_user_456',
      email: 'test.apple@example.com',
      name: 'Apple User',
      email_verified: true,
      firebase: {
        identities: {
          'apple.com': ['apple_user_456']
        }
      }
    }
  }

  const user = { ...defaultUser[provider], ...options }

  const payload = {
    iss: `https://mock.issuer.for.${provider}`,
    aud: 'mock_audience',
    sub: sub || user.sub,
    name: name || user.name,
    email: email || user.email,
    picture: user.picture || null,
    // Custom claim to control mock verification
    force_fail: fail_verification
  }

  // We are not using a real secret because in test, we just decode, not verify.
  return jwt.sign(payload, 'test-secret')
} 