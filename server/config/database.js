import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 加载环境变量 - 指定正确的.env文件路径
dotenv.config({ path: join(__dirname, '../.env') })

/**
 * 数据库配置
 * 
 * 环境变量说明：
 * - DB_HOST: 数据库主机地址，默认 localhost
 * - DB_PORT: 数据库端口，默认 3306
 * - DB_USER: 数据库用户名，默认 root
 * - DB_PASSWORD: 数据库密码，请在 .env 文件中设置
 * - DB_NAME: 数据库名称，默认 poem2ndguess
 * - DB_CONNECTION_LIMIT: 连接池最大连接数，默认 10
 */
export default {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'poem2ndguess',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    charset: 'utf8mb4',
    timezone: '+08:00',
    waitForConnections: true,
    queueLimit: 0
  }
} 