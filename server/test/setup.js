import dotenv from 'dotenv'
import { testDbHelper } from './helpers/testDbHelper.js'

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

// 全局测试前置处理
beforeAll(async () => {
  console.log('\n[测试设置] 初始化测试数据库连接...')
  try {
    await testDbHelper.setup()
    console.log('[测试设置] 测试数据库连接成功')
  } catch (error) {
    console.error('[测试设置] 测试数据库连接失败:', error.message)
    console.log('[测试设置] 继续进行测试，但数据清理功能将不可用')
  }
})

// 全局测试后置处理
afterAll(async () => {
  console.log('\n[测试清理] 开始清理测试数据...')
  try {
    const stats = testDbHelper.getStats()
    console.log('[测试清理] 清理统计:', stats)
    
    if (stats.isConnected) {
      await testDbHelper.cleanupAllTestData()
      await testDbHelper.teardown()
      console.log('[测试清理] 测试数据清理完成')
    } else {
      console.log('[测试清理] 数据库未连接，跳过清理')
    }
  } catch (error) {
    console.error('[测试清理] 清理过程中出错:', error.message)
  }
})

// 每个测试后清理当前测试创建的数据
afterEach(async () => {
  try {
    if (testDbHelper.isSetup) {
      await testDbHelper.cleanupTestData()
    }
  } catch (error) {
    console.error('[测试清理] 单个测试清理失败:', error.message)
  }
})

// 导出测试帮助工具，供测试文件使用
global.testDbHelper = testDbHelper

// 添加测试辅助函数
global.trackTestUser = (userId) => {
  if (testDbHelper.isSetup) {
    testDbHelper.trackUser(userId)
  }
}

global.trackTestOrder = (orderNo) => {
  if (testDbHelper.isSetup) {
    testDbHelper.trackOrder(orderNo)
  }
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('[测试] 未处理的Promise拒绝:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('[测试] 未捕获的异常:', error)
  process.exit(1)
}) 