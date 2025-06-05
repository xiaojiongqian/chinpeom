#!/usr/bin/env node

import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

/**
 * 数据库更新脚本
 * 添加Firebase支持的字段
 */
async function updateDatabase() {
  let connection = null

  try {
    console.log('🔧 更新数据库结构...')
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'poem2ndguess'
    })

    console.log('✅ 数据库连接成功')

    // 首先查看当前表结构
    const [tableInfo] = await connection.execute(`
      DESCRIBE third_party_accounts
    `)
    console.log('📊 当前表结构:')
    tableInfo.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default}`)
    })

    // 检查provider和provider_user_id字段是否存在
    const [providerColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'third_party_accounts' AND COLUMN_NAME IN ('provider', 'provider_user_id')
    `, [process.env.DB_NAME || 'poem2ndguess'])

    if (providerColumns.length < 2) {
      // 检查是否使用了旧的字段名
      const [oldColumns] = await connection.execute(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'third_party_accounts' AND COLUMN_NAME IN ('platform', 'platform_user_id')
      `, [process.env.DB_NAME || 'poem2ndguess'])

      if (oldColumns.length === 2) {
        console.log('🔄 重命名字段以匹配代码...')
        
        // 重命名字段以匹配代码
        await connection.execute(`
          ALTER TABLE third_party_accounts 
          CHANGE COLUMN platform provider VARCHAR(20) NOT NULL
        `)
        await connection.execute(`
          ALTER TABLE third_party_accounts 
          CHANGE COLUMN platform_user_id provider_user_id VARCHAR(100) NOT NULL
        `)
        await connection.execute(`
          ALTER TABLE third_party_accounts 
          CHANGE COLUMN platform_username provider_username VARCHAR(100)
        `)
        await connection.execute(`
          ALTER TABLE third_party_accounts 
          CHANGE COLUMN platform_email provider_email VARCHAR(100)
        `)
        console.log('✅ 字段名已更新：platform -> provider, platform_user_id -> provider_user_id')

        // 更新索引
        try {
          await connection.execute('DROP INDEX unique_platform_user ON third_party_accounts')
        } catch (e) {
          console.log('ℹ️  索引unique_platform_user不存在，跳过删除')
        }
        try {
          await connection.execute('DROP INDEX idx_platform ON third_party_accounts')
        } catch (e) {
          console.log('ℹ️  索引idx_platform不存在，跳过删除')
        }
        await connection.execute('ALTER TABLE third_party_accounts ADD UNIQUE KEY unique_provider_user (provider, provider_user_id)')
        await connection.execute('ALTER TABLE third_party_accounts ADD INDEX idx_provider (provider)')
        console.log('✅ 索引已更新')
      }
    } else {
      console.log('ℹ️  provider字段已存在，跳过重命名')
    }

    // 检查access_token字段是否存在
    const [tokenColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'third_party_accounts' AND COLUMN_NAME = 'access_token'
    `, [process.env.DB_NAME || 'poem2ndguess'])

    if (tokenColumns.length === 0) {
      // 添加access_token字段
      await connection.execute(`
        ALTER TABLE third_party_accounts 
        ADD COLUMN access_token TEXT NULL
      `)
      console.log('✅ access_token字段已添加')
    } else {
      console.log('ℹ️  access_token字段已存在，跳过添加')
    }

    // 检查是否存在firebase_uid字段
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'third_party_accounts' AND COLUMN_NAME = 'firebase_uid'
    `, [process.env.DB_NAME || 'poem2ndguess'])

    if (columns.length === 0) {
      // 添加firebase_uid字段
      await connection.execute(`
        ALTER TABLE third_party_accounts 
        ADD COLUMN firebase_uid VARCHAR(128) NULL
      `)
      await connection.execute(`
        ALTER TABLE third_party_accounts 
        ADD INDEX idx_firebase_uid (firebase_uid)
      `)
      console.log('✅ firebase_uid字段已添加到third_party_accounts表')
    } else {
      console.log('ℹ️  firebase_uid字段已存在，跳过添加')
    }

    // 显示更新后的表结构
    const [updatedTableInfo] = await connection.execute(`
      DESCRIBE third_party_accounts
    `)
    console.log('\n📊 更新后的表结构:')
    updatedTableInfo.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default}`)
    })

    console.log('\n🎉 数据库更新完成！')

  } catch (error) {
    console.error('❌ 数据库更新失败:', error.message)
    console.error(error.stack)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// 运行更新
if (process.argv.includes('--run') || process.argv.includes('update')) {
  updateDatabase()
} else {
  console.log('使用方法: node updateDatabase.js --run')
  console.log('或者: npm run db:update')
} 