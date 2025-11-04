import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// 加载环境变量 - 默认加载项目根目录的.env
dotenv.config()

/**
 * 数据库配置
 * 直接从环境变量中读取，并提供默认值
 */
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'juphoon419708',
  database: process.env.DB_NAME || 'poem2ndguess',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  charset: 'utf8mb4',
  timezone: '+08:00',
  waitForConnections: true,
  queueLimit: 0
}

/**
 * 创建并导出一个MySQL连接池
 * 这是推荐的在整个应用程序中管理连接的方式
 */
const pool = mysql.createPool(dbConfig)

pool.on('acquire', function (connection) {
  console.log('🔍 [DB Pool] Connection %d acquired', connection.threadId)
})

pool.on('release', function (connection) {
  console.log('✅ [DB Pool] Connection %d released', connection.threadId)
})

export default pool
