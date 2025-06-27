import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import bodyParser from 'body-parser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 首先加载环境变量 - 指定正确的.env文件路径
dotenv.config({ path: join(__dirname, '.env') })

// 配置
import config from './config/env/default.js'

// 中间件
import { apiLogger } from './middleware/apiLogger.js'

// 路由
import authRoutes from './api/auth.js'
import userRoutes from './api/user.js'
import paymentRoutes from './api/payment.js'
import configRoutes from './api/config.js'
import monitorRoutes from './api/monitor.js'

// 创建Express应用
const app = express()

// 基础中间件
app.use(cors(config.cors))
app.use(bodyParser.json())

// API日志中间件 - 在所有API路由之前
app.use('/api', apiLogger)

// 静态文件服务
app.use(express.static(join(__dirname, '../dist'))) // 生产环境中提供前端静态文件

// API路由
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/config', configRoutes)
app.use('/api/monitor', monitorRoutes)

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// 监控面板页面
app.get('/monitor', (req, res) => {
  res.sendFile(join(__dirname, 'public/monitor.html'))
})

// 处理SPA路由
app.get('*', (req, res) => {
  // API路径不重定向到前端
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API not found' })
  }

  // 前端路由 - 返回index.html
  res.sendFile(join(__dirname, '../dist/index.html'))
})

export default app 