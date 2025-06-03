/**
 * 服务器默认配置
 */
export default {
  // 服务器配置
  port: process.env.PORT || 3001,
  jwtSecret: 'chinpoem-secret-key',
  jwtExpire: '7d',

  // 跨域配置
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },

  // 环境
  nodeEnv: process.env.NODE_ENV || 'development'
}
