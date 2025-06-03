import { 
  mockWechatAuth, 
  mockGoogleAuth, 
  mockAppleAuth,
  mockAuthService 
} from '../services/mockServices.js'

describe('Mock认证服务测试', () => {
  describe('微信认证', () => {
    test('有效令牌应该返回用户信息', async () => {
      const result = await mockWechatAuth.verifyToken('valid_wechat_token')
      
      expect(result).toHaveProperty('openid')
      expect(result).toHaveProperty('nickname')
      expect(result.openid).toMatch(/^mock_wechat_/)
      expect(result.nickname).toMatch(/^微信用户\d+$/)
    })

    test('无效令牌应该抛出错误', async () => {
      await expect(mockWechatAuth.verifyToken('invalid_token'))
        .rejects
        .toThrow('微信令牌验证失败')
    })
  })

  describe('Google认证', () => {
    test('有效令牌应该返回用户信息', async () => {
      const result = await mockGoogleAuth.verifyToken('valid_google_token')
      
      expect(result).toHaveProperty('sub')
      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('email')
      expect(result.sub).toMatch(/^mock_google_/)
      expect(result.name).toMatch(/^Google User \d+$/)
      expect(result.email).toMatch(/^mockuser\d+@gmail\.com$/)
    })

    test('无效令牌应该抛出错误', async () => {
      await expect(mockGoogleAuth.verifyToken('invalid_token'))
        .rejects
        .toThrow('Google令牌验证失败')
    })
  })

  describe('Apple认证', () => {
    test('有效令牌应该返回用户信息', async () => {
      const result = await mockAppleAuth.verifyToken('valid_apple_token')
      
      expect(result).toHaveProperty('sub')
      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('email')
      expect(result.sub).toMatch(/^mock_apple_/)
      expect(result.name).toMatch(/^Apple User \d+$/)
      expect(result.email).toMatch(/^mockuser\d+@privaterelay\.appleid\.com$/)
    })

    test('无效令牌应该抛出错误', async () => {
      await expect(mockAppleAuth.verifyToken('invalid_token'))
        .rejects
        .toThrow('Apple令牌验证失败')
    })
  })

  describe('统一认证服务', () => {
    test('微信认证应该正常工作', async () => {
      const result = await mockAuthService.verifyThirdPartyAuth('wechat', 'valid_wechat_token')
      expect(result.openid).toMatch(/^mock_wechat_/)
    })

    test('Google认证应该正常工作', async () => {
      const result = await mockAuthService.verifyThirdPartyAuth('google', 'valid_google_token')
      expect(result.sub).toMatch(/^mock_google_/)
    })

    test('Apple认证应该正常工作', async () => {
      const result = await mockAuthService.verifyThirdPartyAuth('apple', 'valid_apple_token')
      expect(result.sub).toMatch(/^mock_apple_/)
    })

    test('不支持的平台应该抛出错误', async () => {
      await expect(mockAuthService.verifyThirdPartyAuth('unsupported', 'token'))
        .rejects
        .toThrow('不支持的第三方平台: unsupported')
    })

    test('所有平台的无效令牌都应该抛出错误', async () => {
      const platforms = ['wechat', 'google', 'apple']
      
      for (const platform of platforms) {
        await expect(mockAuthService.verifyThirdPartyAuth(platform, 'invalid_token'))
          .rejects
          .toThrow()
      }
    })
  })
}) 