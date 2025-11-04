import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

// 加载环境变量
dotenv.config()

console.log('=== 数据库连接测试 ===')
console.log('环境变量检查:')
console.log('DB_HOST:', process.env.DB_HOST || 'localhost')
console.log('DB_PORT:', process.env.DB_PORT || '3306')
console.log('DB_USER:', process.env.DB_USER || 'root')
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***已设置***' : '未设置')
console.log('DB_NAME:', process.env.DB_NAME || 'poem2ndguess')

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'poem2ndguess'
}

console.log('\n尝试连接数据库...')

async function main() {
  let connection
  try {
    connection = await mysql.createConnection(config)
    console.log('✅ 数据库连接成功!')

    // 测试查询
    const [rows] = await connection.execute('SELECT 1 as test')
    console.log('✅ 数据库查询测试成功:', rows[0])

    // 检查表结构
    const [tables] = await connection.execute('SHOW TABLES')
    console.log('📋 数据库表列表:')
    tables.forEach(table => {
      console.log('  -', Object.values(table)[0])
    })

    await connection.end()
    connection = null
    console.log('✅ 数据库连接已关闭')
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message)
    console.error('错误代码:', error.code)
    console.error('错误状态:', error.sqlState)

    // 调试信息
    console.log('\n🔍 调试信息:')
    console.log('配置对象:', JSON.stringify(config, null, 2))

    throw error
  } finally {
    if (connection) {
      await connection.end()
      console.log('✅ 数据库连接已关闭')
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
