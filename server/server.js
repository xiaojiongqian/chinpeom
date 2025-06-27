import app from './app.js'
import config from './config/env/default.js'

const PORT = config.port

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT} (${config.nodeEnv})`)
  console.log(`📊 API监控面板: http://localhost:${PORT}/api/monitor/status`)
  console.log(`📝 API日志: server/logs/api-${new Date().toISOString().split('T')[0]}.log`)
})

export default app
