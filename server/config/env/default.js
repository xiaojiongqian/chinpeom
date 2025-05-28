/**
 * 服务器默认配置
 */
export default {
  // 服务器配置
  port: 3001,
  jwtSecret: 'chinpoem-secret-key',
  jwtExpire: '7d',

  // 跨域配置
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },

  // 环境
  nodeEnv: 'development'
}
