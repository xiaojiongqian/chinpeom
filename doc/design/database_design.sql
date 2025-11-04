-- ================================================
-- 唐诗译境(Chinpoem) 数据库设计 - 历史服务器实现（存档）
-- 说明：当前项目已采用纯本地/终端方案，不再使用服务器与数据库。
-- 如需参考后端与数据库设计，请切换到分支：v1.0-with-backend-server
-- ================================================

-- 1. 用户基础信息表（极简版）
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `display_name` varchar(100) DEFAULT NULL COMMENT '显示名称',
  `avatar_url` varchar(500) DEFAULT NULL COMMENT '头像URL',
  `total_score` int NOT NULL DEFAULT '0' COMMENT '总积分',
  `current_rank` varchar(20) NOT NULL DEFAULT '白丁' COMMENT '当前学级称号',
  `is_premium` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否为付费用户 0-免费 1-付费',
  `premium_expire_at` datetime DEFAULT NULL COMMENT '付费到期时间',
  `language_preference` varchar(10) NOT NULL DEFAULT 'zh-CN' COMMENT '语言偏好',
  `difficulty_mode` enum('easy','hard') NOT NULL DEFAULT 'easy' COMMENT '难度模式',
  `hint_language` varchar(10) NOT NULL DEFAULT 'en' COMMENT '提示语言',
  `sound_enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '音效开关',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `last_login_at` timestamp NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_sync_at` timestamp NULL DEFAULT NULL COMMENT '最后同步时间',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '用户状态 0-禁用 1-正常',
  PRIMARY KEY (`id`),
  KEY `idx_total_score` (`total_score`),
  KEY `idx_is_premium` (`is_premium`),
  KEY `idx_current_rank` (`current_rank`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户基础信息表';

-- 2. 第三方账号关联表
CREATE TABLE `third_party_accounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `provider` enum('wechat','apple','google','twitter') NOT NULL COMMENT '第三方平台',
  `provider_user_id` varchar(255) NOT NULL COMMENT '第三方平台用户ID',
  `provider_username` varchar(255) DEFAULT NULL COMMENT '第三方平台用户名',
  `provider_email` varchar(255) DEFAULT NULL COMMENT '第三方平台邮箱',
  `access_token` text COMMENT '访问令牌',
  `refresh_token` text COMMENT '刷新令牌',
  `token_expires_at` datetime DEFAULT NULL COMMENT '令牌过期时间',
  `extra_data` json DEFAULT NULL COMMENT '额外数据',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '绑定时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_provider_user` (`provider`, `provider_user_id`),
  KEY `fk_user_id` (`user_id`),
  KEY `idx_provider` (`provider`),
  CONSTRAINT `fk_third_party_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='第三方账号关联表';

-- 3. 学级称号配置表
CREATE TABLE `academic_ranks` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '称号ID',
  `rank_name` varchar(20) NOT NULL COMMENT '称号名称',
  `min_score` int NOT NULL COMMENT '最低积分要求',
  `max_score` int DEFAULT NULL COMMENT '最高积分（NULL表示无上限）',
  `description` text COMMENT '称号描述',
  `icon_url` varchar(500) DEFAULT NULL COMMENT '称号图标URL',
  `requires_premium` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否需要付费解锁 0-免费 1-付费',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT '排序权重',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_rank_name` (`rank_name`),
  KEY `idx_min_score` (`min_score`),
  KEY `idx_requires_premium` (`requires_premium`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学级称号配置表';

-- 4. 付费记录表
CREATE TABLE `payment_records` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` bigint unsigned NOT NULL COMMENT '用户ID',
  `order_no` varchar(100) NOT NULL COMMENT '订单号',
  `payment_method` enum('alipay','wechat','apple','google','stripe') NOT NULL COMMENT '支付方式',
  `amount` decimal(10,2) NOT NULL COMMENT '支付金额',
  `currency` varchar(3) NOT NULL DEFAULT 'CNY' COMMENT '货币类型',
  `product_type` enum('premium_month','premium_year','premium_lifetime') NOT NULL COMMENT '产品类型',
  `status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending' COMMENT '支付状态',
  `third_party_order_id` varchar(255) DEFAULT NULL COMMENT '第三方支付订单ID',
  `paid_at` datetime DEFAULT NULL COMMENT '支付时间',
  `refunded_at` datetime DEFAULT NULL COMMENT '退款时间',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `fk_payment_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_payment_method` (`payment_method`),
  CONSTRAINT `fk_payment_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='付费记录表';

-- ================================================
-- 初始化学级称号数据
-- ================================================
INSERT INTO `academic_ranks` (`rank_name`, `min_score`, `max_score`, `description`, `requires_premium`, `sort_order`) VALUES
('白丁', 0, 10, '初学者，刚刚开始唐诗学习之旅', 0, 1),
('学童', 11, 25, '已掌握基础诗词，开始展现才华', 0, 2),
('秀才', 26, 45, '诗词造诣初成，需要付费解锁', 1, 3),
('廪生', 46, 70, '诗词功底深厚，需要付费解锁', 1, 4),
('贡生', 71, 100, '诗词造诣不凡，受人敬仰', 1, 5),
('举人', 101, 135, '诗词大家，名声远扬', 1, 6),
('贡士', 136, 175, '诗词宗师，学问渊博', 1, 7),
('进士', 176, 220, '诗词巨匠，才华横溢', 1, 8),
('探花', 221, 280, '诗词泰斗，三甲之末', 1, 9),
('榜眼', 281, 340, '诗词圣手，二甲之首', 1, 10),
('状元', 341, NULL, '诗词之神，学问第一', 1, 11);

-- ================================================
-- 视图定义（极简版）
-- ================================================

-- 用户完整信息视图
CREATE VIEW `v_user_profile` AS
SELECT 
  u.`id`,
  u.`display_name`,
  u.`avatar_url`,
  u.`total_score`,
  u.`current_rank`,
  ar.`description` as `rank_description`,
  ar.`min_score` as `rank_min_score`,
  ar.`max_score` as `rank_max_score`,
  u.`is_premium`,
  u.`premium_expire_at`,
  CASE 
    WHEN u.`is_premium` = 1 AND (u.`premium_expire_at` IS NULL OR u.`premium_expire_at` > NOW()) THEN 1 
    ELSE 0 
  END as `is_premium_active`,
  u.`language_preference`,
  u.`difficulty_mode`,
  u.`hint_language`,
  u.`sound_enabled`,
  u.`created_at`,
  u.`last_login_at`,
  u.`last_sync_at`,
  -- 计算下一等级信息
  (SELECT ar2.`rank_name` FROM `academic_ranks` ar2 
   WHERE ar2.`min_score` > u.`total_score` 
   AND (u.`is_premium` = 1 OR ar2.`requires_premium` = 0)
   ORDER BY ar2.`min_score` ASC LIMIT 1) as `next_rank`,
  (SELECT ar2.`min_score` FROM `academic_ranks` ar2 
   WHERE ar2.`min_score` > u.`total_score` 
   AND (u.`is_premium` = 1 OR ar2.`requires_premium` = 0)
   ORDER BY ar2.`min_score` ASC LIMIT 1) as `next_rank_score`,
  -- 计算距离下一等级的积分差
  (SELECT ar2.`min_score` - u.`total_score` FROM `academic_ranks` ar2 
   WHERE ar2.`min_score` > u.`total_score` 
   AND (u.`is_premium` = 1 OR ar2.`requires_premium` = 0)
   ORDER BY ar2.`min_score` ASC LIMIT 1) as `points_to_next_rank`
FROM `users` u
LEFT JOIN `academic_ranks` ar ON u.`current_rank` = ar.`rank_name`
WHERE u.`status` = 1;

-- ================================================
-- 存储过程（精简版）
-- ================================================

DELIMITER //

-- 同步用户积分和等级的存储过程
CREATE PROCEDURE `SyncUserScore`(
  IN p_user_id BIGINT UNSIGNED,
  IN p_total_score INT
)
BEGIN
  DECLARE v_new_rank VARCHAR(20) DEFAULT '';
  DECLARE v_is_premium TINYINT(1) DEFAULT 0;
  
  -- 声明异常处理
  DECLARE EXIT HANDLER FOR SQLEXCEPTION 
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  
  START TRANSACTION;
  
  -- 获取用户付费状态
  SELECT `is_premium` INTO v_is_premium
  FROM `users` WHERE `id` = p_user_id FOR UPDATE;
  
  -- 确保积分不为负数
  SET p_total_score = GREATEST(0, p_total_score);
  
  -- 确定新等级
  SELECT `rank_name` INTO v_new_rank
  FROM `academic_ranks` 
  WHERE `min_score` <= p_total_score 
    AND (v_is_premium = 1 OR `requires_premium` = 0)
    AND (`max_score` IS NULL OR `max_score` >= p_total_score)
  ORDER BY `min_score` DESC 
  LIMIT 1;
  
  -- 如果没有找到合适等级，使用白丁
  IF v_new_rank IS NULL THEN
    SET v_new_rank = '白丁';
  END IF;
  
  -- 更新用户积分和等级
  UPDATE `users` 
  SET `total_score` = p_total_score, 
      `current_rank` = v_new_rank,
      `last_sync_at` = CURRENT_TIMESTAMP,
      `updated_at` = CURRENT_TIMESTAMP
  WHERE `id` = p_user_id;
  
  COMMIT;
END //

-- 更新用户付费状态的存储过程
CREATE PROCEDURE `UpdateUserPremium`(
  IN p_user_id BIGINT UNSIGNED,
  IN p_is_premium TINYINT(1),
  IN p_premium_expire_at DATETIME
)
BEGIN
  DECLARE v_current_score INT DEFAULT 0;
  
  -- 声明异常处理
  DECLARE EXIT HANDLER FOR SQLEXCEPTION 
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  
  START TRANSACTION;
  
  -- 更新付费状态
  UPDATE `users` 
  SET `is_premium` = p_is_premium,
      `premium_expire_at` = p_premium_expire_at,
      `updated_at` = CURRENT_TIMESTAMP
  WHERE `id` = p_user_id;
  
  -- 如果是付费用户，重新计算等级（可能解锁更高等级）
  IF p_is_premium = 1 THEN
    SELECT `total_score` INTO v_current_score FROM `users` WHERE `id` = p_user_id;
    CALL SyncUserScore(p_user_id, v_current_score);
  END IF;
  
  COMMIT;
END //

DELIMITER ;

-- ================================================
-- 索引优化
-- ================================================

-- 复合索引
CREATE INDEX `idx_user_premium_expire` ON `users` (`is_premium`, `premium_expire_at`);
CREATE INDEX `idx_payment_user_status` ON `payment_records` (`user_id`, `status`);

-- ================================================
-- 常用查询示例
-- ================================================

-- 查询用户完整信息
-- SELECT * FROM v_user_profile WHERE id = ?;

-- 根据第三方账号查找用户
-- SELECT u.* FROM users u 
-- JOIN third_party_accounts tpa ON u.id = tpa.user_id 
-- WHERE tpa.provider = ? AND tpa.provider_user_id = ?;

-- 同步用户积分
-- CALL SyncUserScore(?, ?);

-- 更新用户付费状态
-- CALL UpdateUserPremium(?, ?, ?);

-- 查询用户付费记录
-- SELECT * FROM payment_records WHERE user_id = ? ORDER BY created_at DESC;

-- 查询所有学级称号
-- SELECT * FROM academic_ranks ORDER BY sort_order;

-- ================================================
-- API 设计建议
-- ================================================

/*
建议的 API 端点：

1. 用户认证
POST /api/auth/login - 第三方登录
POST /api/auth/refresh - 刷新令牌
POST /api/auth/logout - 退出登录

2. 用户信息
GET /api/user/profile - 获取用户完整信息
PUT /api/user/settings - 更新用户设置
PUT /api/user/score - 同步用户积分

3. 付费相关
POST /api/payment/create - 创建付费订单
GET /api/payment/history - 查询付费历史
POST /api/payment/verify - 验证付费状态

4. 配置信息
GET /api/config/ranks - 获取所有学级称号
GET /api/config/app - 获取应用配置

本地缓存策略：
- 用户积分和等级在本地实时更新
- 定期（如每分钟或应用关闭时）同步到服务器
- 网络异常时暂存本地，恢复后再同步
- 用户设置变更时立即同步
*/ 
