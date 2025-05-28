/**
 * 服务器配置
 */

export default {
  // 服务器端口
  port: process.env.PORT || 3001,

  // JWT密钥
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',

  // JWT过期时间
  jwtExpire: '7d',

  // CORS配置
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  // 环境
  env: process.env.NODE_ENV || 'development'
}
