#!/usr/bin/env node

import dotenv from 'dotenv'
import { TestDatabaseHelper } from '../test/helpers/testDbHelper.js'

// 加载环境变量
dotenv.config({ path: '.env.test' })
if (!process.env.DB_NAME) {
  dotenv.config()
}

// 确保使用测试数据库
const testDbName = process.env.DB_NAME || 'poem2ndguess_test'
if (!testDbName.includes('test')) {
  console.error('❌ 错误: 只能清理测试数据库 (数据库名必须包含 "test")')
  console.error(`当前数据库: ${testDbName}`)
  process.exit(1)
}

/**
 * 测试数据清理脚本
 * 可以清理测试数据库中的测试数据
 */
async function cleanTestData() {
  const helper = new TestDatabaseHelper()

  try {
    console.log('🧹 开始清理测试数据...')
    console.log(`📍 目标数据库: ${testDbName}`)

    // 初始化连接
    await helper.setup()

    // 检查连接状态
    const isConnected = await helper.checkConnection()
    if (!isConnected) {
      throw new Error('数据库连接失败')
    }

    // 获取清理前的统计信息
    const beforeStats = await getDbStats(helper.connection)
    console.log('\n📊 清理前的数据统计:')
    console.log(`   用户数量: ${beforeStats.users}`)
    console.log(`   第三方账号: ${beforeStats.thirdPartyAccounts}`)
    console.log(`   支付记录: ${beforeStats.paymentRecords}`)

    // 执行清理
    await helper.cleanupAllTestData()

    // 获取清理后的统计信息
    const afterStats = await getDbStats(helper.connection)
    console.log('\n📊 清理后的数据统计:')
    console.log(`   用户数量: ${afterStats.users}`)
    console.log(`   第三方账号: ${afterStats.thirdPartyAccounts}`)
    console.log(`   支付记录: ${afterStats.paymentRecords}`)

    // 显示清理结果
    const cleaned = {
      users: beforeStats.users - afterStats.users,
      thirdPartyAccounts: beforeStats.thirdPartyAccounts - afterStats.thirdPartyAccounts,
      paymentRecords: beforeStats.paymentRecords - afterStats.paymentRecords
    }

    console.log('\n✅ 清理完成:')
    console.log(`   删除用户: ${cleaned.users} 个`)
    console.log(`   删除第三方账号: ${cleaned.thirdPartyAccounts} 个`)
    console.log(`   删除支付记录: ${cleaned.paymentRecords} 条`)
  } catch (error) {
    console.error('\n❌ 清理过程中出错:', error.message)
    process.exit(1)
  } finally {
    await helper.teardown()
  }
}

/**
 * 获取数据库统计信息
 */
async function getDbStats(connection) {
  try {
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users')
    const [thirdPartyCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM third_party_accounts'
    )
    const [paymentCount] = await connection.execute('SELECT COUNT(*) as count FROM payment_records')

    return {
      users: userCount[0].count,
      thirdPartyAccounts: thirdPartyCount[0].count,
      paymentRecords: paymentCount[0].count
    }
  } catch (error) {
    console.warn('⚠️  获取统计信息失败:', error.message)
    return {
      users: 0,
      thirdPartyAccounts: 0,
      paymentRecords: 0
    }
  }
}

/**
 * 显示详细的测试数据信息
 */
async function showTestDataInfo() {
  const helper = new TestDatabaseHelper()

  try {
    await helper.setup()

    console.log('📋 测试数据详情:')

    // 获取测试用户列表
    const testUserIds = await helper.getTestUserIds()
    if (testUserIds.length > 0) {
      console.log(`\n👥 找到 ${testUserIds.length} 个测试用户:`)

      const [users] = await helper.connection.execute(
        `
        SELECT id, display_name, total_score, created_at 
        FROM users 
        WHERE id IN (${testUserIds.map(() => '?').join(',')})
        ORDER BY created_at DESC
        LIMIT 10
      `,
        testUserIds
      )

      users.forEach(user => {
        console.log(
          `   ID: ${user.id}, 名称: ${user.display_name}, 积分: ${user.total_score}, 创建时间: ${user.created_at}`
        )
      })

      if (testUserIds.length > 10) {
        console.log(`   ... 还有 ${testUserIds.length - 10} 个用户`)
      }
    } else {
      console.log('\n✅ 没有找到测试用户数据')
    }
  } catch (error) {
    console.error('❌ 获取测试数据信息失败:', error.message)
  } finally {
    await helper.teardown()
  }
}

// 处理命令行参数
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  switch (command) {
    case 'clean':
      await cleanTestData()
      break
    case 'info':
      await showTestDataInfo()
      break
    case 'help':
    case '--help':
    case '-h':
      console.log(`
📖 测试数据清理脚本使用说明:

用法: node scripts/cleanTestData.js [命令]

命令:
  clean     清理所有测试数据
  info      显示当前测试数据信息
  help      显示此帮助信息

示例:
  node scripts/cleanTestData.js clean    # 清理测试数据
  node scripts/cleanTestData.js info     # 查看测试数据
  
⚠️  注意: 此脚本只能操作测试数据库 (数据库名包含 "test")
`)
      break
    default:
      console.log(`❓ 未知命令: ${command || '(空)'}`)
      console.log('使用 "node scripts/cleanTestData.js help" 查看帮助')
      process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ 脚本执行失败:', error)
    process.exit(1)
  })
