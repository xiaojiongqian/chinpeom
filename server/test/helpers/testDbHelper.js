import mysql from 'mysql2/promise'
import config from '../../config/database.js'

/**
 * 测试数据库帮助工具
 * 提供测试数据的创建、跟踪和清理功能
 */
class TestDatabaseHelper {
  constructor() {
    this.connection = null
    this.createdUserIds = new Set()
    this.createdOrderNos = new Set()
    this.createdThirdPartyAccountIds = new Set()
    this.isSetup = false
  }

  /**
   * 初始化测试数据库连接
   */
  async setup() {
    if (this.isSetup) return

    try {
      this.connection = await mysql.createConnection(config.database)
      console.log(`[测试数据库] 连接到测试数据库: ${config.database.database}`)
      this.isSetup = true
    } catch (error) {
      console.error('[测试数据库] 连接失败:', error.message)
      throw error
    }
  }

  /**
   * 记录创建的用户ID
   */
  trackUser(userId) {
    this.createdUserIds.add(userId)
    console.log(`[测试数据库] 跟踪用户: ${userId}`)
  }

  /**
   * 记录创建的订单号
   */
  trackOrder(orderNo) {
    this.createdOrderNos.add(orderNo)
    console.log(`[测试数据库] 跟踪订单: ${orderNo}`)
  }

  /**
   * 记录创建的第三方账号ID
   */
  trackThirdPartyAccount(accountId) {
    this.createdThirdPartyAccountIds.add(accountId)
    console.log(`[测试数据库] 跟踪第三方账号: ${accountId}`)
  }

  /**
   * 获取测试过程中创建的用户ID列表
   */
  async getTestUserIds() {
    if (!this.connection) {
      throw new Error('数据库连接未初始化')
    }

    // 获取测试用户（通过显示名称识别）
    const [users] = await this.connection.execute(`
      SELECT id FROM users 
      WHERE display_name LIKE '%测试%' 
        OR display_name LIKE '%test%'
        OR display_name LIKE '%微信用户%'
        OR display_name LIKE '%Google User%'
        OR display_name LIKE '%Apple User%'
      ORDER BY created_at DESC
    `)

    return users.map(user => user.id)
  }

  /**
   * 清理单个测试创建的数据
   */
  async cleanupTestData() {
    if (!this.connection) {
      console.log('[测试数据库] 未连接，跳过清理')
      return
    }

    try {
      await this.connection.beginTransaction()

      // 1. 清理支付记录
      if (this.createdOrderNos.size > 0) {
        const orderNos = Array.from(this.createdOrderNos)
        const placeholders = orderNos.map(() => '?').join(',')
        await this.connection.execute(
          `DELETE FROM payment_records WHERE order_no IN (${placeholders})`,
          orderNos
        )
        console.log(`[测试数据库] 清理了 ${orderNos.length} 条支付记录`)
      }

      // 2. 清理第三方账号绑定
      if (this.createdUserIds.size > 0) {
        const userIds = Array.from(this.createdUserIds)
        const placeholders = userIds.map(() => '?').join(',')
        await this.connection.execute(
          `DELETE FROM third_party_accounts WHERE user_id IN (${placeholders})`,
          userIds
        )
        console.log(`[测试数据库] 清理了第三方账号绑定`)
      }

      // 3. 清理用户数据
      if (this.createdUserIds.size > 0) {
        const userIds = Array.from(this.createdUserIds)
        const placeholders = userIds.map(() => '?').join(',')
        await this.connection.execute(
          `DELETE FROM users WHERE id IN (${placeholders})`,
          userIds
        )
        console.log(`[测试数据库] 清理了 ${userIds.length} 个用户`)
      }

      await this.connection.commit()

      // 重置跟踪记录
      this.createdUserIds.clear()
      this.createdOrderNos.clear()
      this.createdThirdPartyAccountIds.clear()

      console.log('[测试数据库] 数据清理完成')
    } catch (error) {
      await this.connection.rollback()
      console.error('[测试数据库] 清理失败:', error.message)
      throw error
    }
  }

  /**
   * 全量清理测试数据库
   */
  async cleanupAllTestData() {
    if (!this.connection) {
      console.log('[测试数据库] 未连接，跳过全量清理')
      return
    }

    try {
      await this.connection.beginTransaction()

      // 获取所有测试用户ID
      const testUserIds = await this.getTestUserIds()

      if (testUserIds.length > 0) {
        const placeholders = testUserIds.map(() => '?').join(',')

        // 1. 清理支付记录
        await this.connection.execute(
          `DELETE FROM payment_records WHERE user_id IN (${placeholders})`,
          testUserIds
        )

        // 2. 清理第三方账号绑定
        await this.connection.execute(
          `DELETE FROM third_party_accounts WHERE user_id IN (${placeholders})`,
          testUserIds
        )

        // 3. 清理用户数据
        await this.connection.execute(
          `DELETE FROM users WHERE id IN (${placeholders})`,
          testUserIds
        )

        console.log(`[测试数据库] 全量清理完成，删除了 ${testUserIds.length} 个测试用户的所有关联数据`)
      } else {
        console.log('[测试数据库] 没有找到测试数据，跳过清理')
      }

      await this.connection.commit()
    } catch (error) {
      await this.connection.rollback()
      console.error('[测试数据库] 全量清理失败:', error.message)
      throw error
    }
  }

  /**
   * 检查数据库连接状态
   */
  async checkConnection() {
    if (!this.connection) return false

    try {
      await this.connection.ping()
      return true
    } catch (error) {
      console.error('[测试数据库] 连接检查失败:', error.message)
      return false
    }
  }

  /**
   * 关闭数据库连接
   */
  async teardown() {
    if (this.connection) {
      try {
        await this.connection.end()
        console.log('[测试数据库] 连接已关闭')
      } catch (error) {
        console.error('[测试数据库] 关闭连接失败:', error.message)
      }
      this.connection = null
      this.isSetup = false
    }
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      trackedUsers: this.createdUserIds.size,
      trackedOrders: this.createdOrderNos.size,
      trackedThirdPartyAccounts: this.createdThirdPartyAccountIds.size,
      isConnected: !!this.connection
    }
  }
}

// 导出单例实例
export const testDbHelper = new TestDatabaseHelper()

// 导出类以便测试
export { TestDatabaseHelper } 