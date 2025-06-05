import jwt from 'jsonwebtoken'
import appConfig from '../config/env/default.js' // Import appConfig

/**
 * 用户认证中间件
 * 验证请求头中的JWT令牌
 */
export const auth = (req, res, next) => {
  try {
    // 获取请求头中的authorization
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '未授权，请登录' })
    }

    // 提取令牌
    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: '未授权，请登录' })
    }

    // 验证令牌
    // 使用与签名时一致的密钥配置
    const jwtSecret = process.env.JWT_SECRET || appConfig.jwtSecret 
    const decoded = jwt.verify(token, jwtSecret)

    // 将用户信息添加到请求对象
    req.user = decoded

    // 继续下一个中间件
    next()
  } catch (error) {
    console.error('认证失败:', error)

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '令牌已过期，请重新登录' })
    }

    return res.status(401).json({ message: '未授权，请登录' })
  }
}
