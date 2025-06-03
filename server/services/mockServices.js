/**
 * Mock外部服务
 * 用于开发和测试环境模拟第三方服务调用
 */

// Mock微信登录验证
export const mockWechatAuth = {
  /**
   * 验证微信访问令牌
   * @param {string} token 微信访问令牌
   * @returns {Object} 用户信息
   */
  async verifyToken(token) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 200))
    
    if (token === 'valid_wechat_token') {
      // 使用固定的用户ID确保持久化
      return {
        openid: 'mock_wechat_fixed_001',
        nickname: '微信测试用户',
        headimgurl: null,
        unionid: 'mock_union_fixed_001'
      }
    }
    
    throw new Error('微信令牌验证失败')
  }
}

// Mock Google登录验证
export const mockGoogleAuth = {
  /**
   * 验证Google访问令牌
   * @param {string} token Google访问令牌
   * @returns {Object} 用户信息
   */
  async verifyToken(token) {
    await new Promise(resolve => setTimeout(resolve, 150))
    
    if (token === 'valid_google_token') {
      // 使用固定的用户ID确保持久化
      return {
        sub: 'mock_google_fixed_001',
        name: 'Google测试用户',
        email: 'mockuser@gmail.com',
        picture: null
      }
    }
    
    throw new Error('Google令牌验证失败')
  }
}

// Mock Apple登录验证
export const mockAppleAuth = {
  /**
   * 验证Apple访问令牌
   * @param {string} token Apple访问令牌
   * @returns {Object} 用户信息
   */
  async verifyToken(token) {
    await new Promise(resolve => setTimeout(resolve, 180))
    
    if (token === 'valid_apple_token') {
      // 使用固定的用户ID确保持久化
      return {
        sub: 'mock_apple_fixed_001',
        name: 'Apple测试用户',
        email: 'mockuser@privaterelay.appleid.com'
      }
    }
    
    throw new Error('Apple令牌验证失败')
  }
}

// Mock支付服务
export const mockPaymentService = {
  /**
   * 创建支付订单
   * @param {Object} orderData 订单数据
   * @returns {Object} 支付信息
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
   * @param {Object} paymentData 支付数据
   * @returns {Object} 验证结果
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
        status: 'failed'
      }
    }
  }
}

/**
 * 第三方认证主服务
 * 根据提供商选择对应的验证服务
 */
export const mockAuthService = {
  /**
   * 验证第三方访问令牌
   * @param {string} provider 第三方平台名称
   * @param {string} token 访问令牌
   * @returns {Object} 用户信息
   */
  async verifyThirdPartyAuth(provider, token) {
    console.log(`[MockAuth] 验证${provider}令牌: ${token}`)
    
    switch (provider) {
      case 'wechat':
        return await mockWechatAuth.verifyToken(token)
        
      case 'google':
        return await mockGoogleAuth.verifyToken(token)
        
      case 'apple':
        return await mockAppleAuth.verifyToken(token)
        
      default:
        throw new Error(`不支持的第三方平台: ${provider}`)
    }
  }
} 