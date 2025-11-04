import pool from '../../config/db.js'

/**
 * 测试数据库帮助工具
 * 提供测试数据的创建、跟踪和清理功能
 */
class TestDatabaseHelper {
  constructor() {
    this.createdUserIds = new Set()
    this.createdOrderNos = new Set()
    this.createdThirdPartyAccountIds = new Set()
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
    // 获取测试用户（通过显示名称识别）
    const [users] = await pool.execute(`
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
    let connection
    try {
      connection = await pool.getConnection()
      await connection.beginTransaction()

      // 1. 清理支付记录
      if (this.createdOrderNos.size > 0) {
        const orderNos = Array.from(this.createdOrderNos)
        const placeholders = orderNos.map(() => '?').join(',')
        await connection.execute(
          `DELETE FROM payment_records WHERE order_no IN (${placeholders})`,
          orderNos
        )
        console.log(`[测试数据库] 清理了 ${orderNos.length} 条支付记录`)
      }

      // 2. 清理第三方账号绑定
      if (this.createdUserIds.size > 0) {
        const userIds = Array.from(this.createdUserIds)
        const placeholders = userIds.map(() => '?').join(',')
        await connection.execute(
          `DELETE FROM third_party_accounts WHERE user_id IN (${placeholders})`,
          userIds
        )
        console.log(`[测试数据库] 清理了第三方账号绑定`)
      }

      // 3. 清理用户数据
      if (this.createdUserIds.size > 0) {
        const userIds = Array.from(this.createdUserIds)
        const placeholders = userIds.map(() => '?').join(',')
        await connection.execute(`DELETE FROM users WHERE id IN (${placeholders})`, userIds)
        console.log(`[测试数据库] 清理了 ${userIds.length} 个用户`)
      }

      await connection.commit()

      // 重置跟踪记录
      this.createdUserIds.clear()
      this.createdOrderNos.clear()
      this.createdThirdPartyAccountIds.clear()

      console.log('[测试数据库] 数据清理完成')
    } catch (error) {
      if (connection) await connection.rollback()
      console.error('[测试数据库] 清理失败:', error.message)
      throw error
    } finally {
      if (connection) connection.release()
    }
  }

  /**
   * 全量清理测试数据库
   */
  async cleanupAllTestData() {
    let connection
    try {
      connection = await pool.getConnection()
      await connection.beginTransaction()

      // 获取所有测试用户ID
      const testUserIds = await this.getTestUserIds()

      if (testUserIds.length > 0) {
        const placeholders = testUserIds.map(() => '?').join(',')

        // 1. 清理支付记录
        await connection.execute(
          `DELETE FROM payment_records WHERE user_id IN (${placeholders})`,
          testUserIds
        )

        // 2. 清理第三方账号绑定
        await connection.execute(
          `DELETE FROM third_party_accounts WHERE user_id IN (${placeholders})`,
          testUserIds
        )

        // 3. 清理用户数据
        await connection.execute(`DELETE FROM users WHERE id IN (${placeholders})`, testUserIds)

        console.log(
          `[测试数据库] 全量清理完成，删除了 ${testUserIds.length} 个测试用户的所有关联数据`
        )
      } else {
        console.log('[测试数据库] 没有找到测试数据，跳过清理')
      }

      await connection.commit()
    } catch (error) {
      if (connection) await connection.rollback()
      console.error('[测试数据库] 全量清理失败:', error.message)
      throw error
    } finally {
      if (connection) connection.release()
    }
  }

  /**
   * 检查数据库连接状态
   */
  async checkConnection() {
    try {
      await pool.ping()
      return true
    } catch (error) {
      console.error('[测试数据库] 连接检查失败:', error.message)
      return false
    }
  }

  /**
   * 关闭数据库连接
   *
   * @deprecated The connection pool is now managed globally and closed in afterAll.
   */
  async teardown() {
    // The global pool is managed and closed in the test setup file (e.g., afterAll hook)
    // This method is kept for backward compatibility but does nothing.
    console.log('[测试数据库] 全局连接池将在所有测试完成后关闭')
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      trackedUsers: this.createdUserIds.size,
      trackedOrders: this.createdOrderNos.size,
      trackedThirdPartyAccounts: this.createdThirdPartyAccountIds.size,
      isConnected: !!pool
    }
  }
}

// 导出一个单例
const testDbHelper = new TestDatabaseHelper()
export default testDbHelper
