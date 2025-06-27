import dotenv from 'dotenv'
import testDbHelper from './helpers/testDbHelper.js'
import pool from '../config/db.js'

// 加载测试环境变量
dotenv.config({ path: '.env.test' })

// 如果没有测试环境变量文件，使用开发环境配置
if (!process.env.DB_NAME) {
  dotenv.config()
}

// 设置测试环境
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret'

// 全局测试配置
global.TEST_TIMEOUT = 10000

// 测试数据库配置
process.env.DB_NAME = process.env.DB_NAME || 'poem2ndguess_test'

console.log('测试环境设置完成')
console.log('数据库:', process.env.DB_NAME)
console.log('环境:', process.env.NODE_ENV)

// 全局测试前置处理 - 连接池现在是全局单例，在db.js中自动处理

// 全局测试后置处理
afterAll(async () => {
  console.log('\n[测试清理] 所有测试完成，开始关闭共享连接池...')
  try {
    // 关闭共享连接池
    if (pool) {
      await pool.end()
      console.log('[测试清理] 共享数据库连接池已关闭')
    }
  } catch (error) {
    console.error('[测试清理] 关闭连接池过程中出错:', error.message)
  }
})

// 每个测试后清理当前测试创建的数据
/* afterEach(async () => {
  try {
    await testDbHelper.cleanupTestData()
  } catch (error) {
    console.error('[测试清理] 单个测试清理失败:', error.message)
  }
}) */

// 导出测试帮助工具，供测试文件使用
global.testDbHelper = testDbHelper

// 添加测试辅助函数
global.trackTestUser = (userId) => {
  testDbHelper.trackUser(userId)
}

global.trackTestOrder = (orderNo) => {
  testDbHelper.trackOrder(orderNo)
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('[测试] 未处理的Promise拒绝:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('[测试] 未捕获的异常:', error)
  process.exit(1)
}) 