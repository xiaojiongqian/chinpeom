#!/usr/bin/env node

import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

/**
 * 数据库初始化脚本
 * 创建必要的表结构
 */
async function initDatabase() {
  let connection = null

  try {
    console.log('🔧 初始化数据库...')
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'poem2ndguess'
    })

    console.log('✅ 数据库连接成功')

    // 创建用户表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        third_party_platform VARCHAR(20) NOT NULL,
        third_party_user_id VARCHAR(100) NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        avatar_url VARCHAR(255),
        total_score INT DEFAULT 0,
        current_rank VARCHAR(20) DEFAULT '白丁',
        language_preference VARCHAR(10) DEFAULT 'zh',
        difficulty_mode VARCHAR(10) DEFAULT 'easy',
        hint_language VARCHAR(10) DEFAULT 'english',
        sound_enabled BOOLEAN DEFAULT TRUE,
        is_premium BOOLEAN DEFAULT FALSE,
        premium_expires_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_third_party (third_party_platform, third_party_user_id),
        INDEX idx_score (total_score),
        INDEX idx_rank (current_rank),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ 用户表已创建/更新')

    // 创建第三方账号关联表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS third_party_accounts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        platform VARCHAR(20) NOT NULL,
        platform_user_id VARCHAR(100) NOT NULL,
        platform_username VARCHAR(100),
        platform_email VARCHAR(100),
        access_token_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_platform_user (platform, platform_user_id),
        INDEX idx_user_id (user_id),
        INDEX idx_platform (platform)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ 第三方账号表已创建/更新')

    // 删除并重新创建学级配置表（如果存在结构问题）
    await connection.execute('DROP TABLE IF EXISTS academic_ranks')
    
    // 创建学级配置表
    await connection.execute(`
      CREATE TABLE academic_ranks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        rank_name VARCHAR(20) NOT NULL UNIQUE,
        min_score INT NOT NULL,
        max_score INT DEFAULT NULL,
        rank_order INT NOT NULL,
        requires_premium BOOLEAN DEFAULT FALSE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_score_range (min_score, max_score),
        INDEX idx_order (rank_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ 学级配置表已重新创建')

    // 创建支付记录表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payment_records (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        order_no VARCHAR(50) NOT NULL UNIQUE,
        payment_method VARCHAR(20) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'CNY',
        product_type VARCHAR(50) NOT NULL,
        status ENUM('pending', 'paid', 'failed', 'cancelled') DEFAULT 'pending',
        third_party_order_id VARCHAR(100),
        payment_data JSON,
        paid_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_order_no (order_no),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✅ 支付记录表已创建/更新')

    // 插入初始学级配置数据
    const rankData = [
      { rank_name: '白丁', min_score: 0, max_score: 10, rank_order: 1, requires_premium: false, description: '初学者，刚开始学习唐诗' },
      { rank_name: '学童', min_score: 11, max_score: 25, rank_order: 2, requires_premium: false, description: '已掌握基础诗句，继续努力' },
      { rank_name: '秀才', min_score: 26, max_score: 45, rank_order: 3, requires_premium: false, description: '免费用户的最高等级' },
      { rank_name: '廪生', min_score: 46, max_score: 70, rank_order: 4, requires_premium: true, description: '需要付费解锁' },
      { rank_name: '贡生', min_score: 71, max_score: 100, rank_order: 5, requires_premium: true, description: '需要付费解锁' },
      { rank_name: '举人', min_score: 101, max_score: 135, rank_order: 6, requires_premium: true, description: '需要付费解锁' },
      { rank_name: '贡士', min_score: 136, max_score: 175, rank_order: 7, requires_premium: true, description: '需要付费解锁' },
      { rank_name: '进士', min_score: 176, max_score: 220, rank_order: 8, requires_premium: true, description: '需要付费解锁' },
      { rank_name: '探花', min_score: 221, max_score: 280, rank_order: 9, requires_premium: true, description: '需要付费解锁' },
      { rank_name: '榜眼', min_score: 281, max_score: 340, rank_order: 10, requires_premium: true, description: '需要付费解锁' },
      { rank_name: '状元', min_score: 341, max_score: null, rank_order: 11, requires_premium: true, description: '最高等级，需要付费解锁' }
    ]

    for (const rank of rankData) {
      await connection.execute(`
        INSERT IGNORE INTO academic_ranks (rank_name, min_score, max_score, rank_order, requires_premium, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [rank.rank_name, rank.min_score, rank.max_score, rank.rank_order, rank.requires_premium, rank.description])
    }
    console.log('✅ 学级配置数据已初始化')

    console.log('\n🎉 数据库初始化完成！')

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// 运行初始化
if (process.argv.includes('--run') || process.argv.includes('init')) {
  initDatabase()
} else {
  console.log('使用方法: node initDatabase.js --run')
  console.log('或者: npm run db:init')
} 