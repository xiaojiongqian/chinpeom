# 唐诗译境(Chinpoem) API 文档

## 概述

本文档描述了唐诗译境应用的REST API接口。所有API都遵循RESTful设计原则，使用JSON格式进行数据交换。

## 基础信息

- **Base URL**: `http://localhost:3001/api`
- **认证方式**: JWT Bearer Token
- **内容类型**: `application/json`

## 认证相关 `/auth`

### 第三方登录
```http
POST /api/auth/login
```

**请求体**:
```json
{
  "provider": "wechat|apple|google",
  "provider_user_id": "第三方平台用户ID",
  "provider_username": "第三方平台用户名",
  "provider_email": "第三方平台邮箱",
  "access_token": "第三方访问令牌",
  "display_name": "显示名称",
  "avatar_url": "头像URL"
}
```

**响应**:
```json
{
  "message": "登录成功",
  "user": {
    "id": 1,
    "display_name": "用户名",
    "avatar_url": "头像URL",
    "total_score": 0,
    "current_rank": "白丁",
    "is_premium": false,
    // ... 其他用户信息
  },
  "token": "JWT令牌"
}
```

### 刷新令牌
```http
POST /api/auth/refresh
```

**请求头**: `Authorization: Bearer <token>`

**响应**: 返回新的用户信息和令牌

### 退出登录
```http
POST /api/auth/logout
```

**请求头**: `Authorization: Bearer <token>`

## 用户相关 `/user`

### 获取用户完整信息
```http
GET /api/user/profile
```

**请求头**: `Authorization: Bearer <token>`

**响应**:
```json
{
  "user": {
    "id": 1,
    "display_name": "用户名",
    "avatar_url": "头像URL",
    "total_score": 45,
    "current_rank": "秀才",
    "rank_description": "诗词造诣初成，免费用户最高等级",
    "rank_min_score": 26,
    "rank_max_score": 45,
    "is_premium": false,
    "premium_expire_at": null,
    "language_preference": "zh-CN",
    "difficulty_mode": "easy",
    "hint_language": "en",
    "sound_enabled": true,
    "next_rank": "廪生",
    "next_rank_score": 46,
    "points_to_next_rank": 1,
    "last_login_at": "2024-01-01T12:00:00Z",
    "last_sync_at": "2024-01-01T12:00:00Z"
  }
}
```

### 同步用户积分
```http
PUT /api/user/score
```

**请求头**: `Authorization: Bearer <token>`

**请求体**:
```json
{
  "total_score": 50
}
```

**响应**:
```json
{
  "message": "积分同步成功",
  "user": {
    "id": 1,
    "total_score": 50,
    "current_rank": "廪生",
    "next_rank": "贡生",
    "next_rank_score": 71,
    "points_to_next_rank": 21,
    "last_sync_at": "2024-01-01T12:00:00Z"
  }
}
```

### 更新用户设置
```http
PUT /api/user/settings
```

**请求头**: `Authorization: Bearer <token>`

**请求体**:
```json
{
  "language_preference": "zh-CN",
  "difficulty_mode": "easy",
  "hint_language": "en",
  "sound_enabled": true
}
```

## 付费相关 `/payment`

### 创建付费订单
```http
POST /api/payment/create
```

**请求头**: `Authorization: Bearer <token>`

**请求体**:
```json
{
  "payment_method": "alipay|wechat|apple|google|stripe",
  "product_type": "premium_month|premium_year|premium_lifetime",
  "amount": 9.9,
  "currency": "CNY"
}
```

### 验证付费状态
```http
POST /api/payment/verify
```

**请求头**: `Authorization: Bearer <token>`

**请求体**:
```json
{
  "order_no": "订单号",
  "third_party_order_id": "第三方订单ID",
  "status": "paid|failed"
}
```

### 查询付费历史
```http
GET /api/payment/history?page=1&limit=10
```

**请求头**: `Authorization: Bearer <token>`

## 配置相关 `/config`

### 获取学级称号配置
```http
GET /api/config/ranks
```

**响应**:
```json
{
  "ranks": [
    {
      "rank_name": "白丁",
      "min_score": 0,
      "max_score": 10,
      "description": "初学者，刚刚开始唐诗学习之旅",
      "icon_url": null,
      "requires_premium": false,
      "sort_order": 1
    }
    // ... 其他等级
  ]
}
```

### 获取应用配置
```http
GET /api/config/app
```

**响应**:
```json
{
  "app": {
    "name": "唐诗译境",
    "name_en": "Chinpoem",
    "version": "1.0.0",
    "description": "熟读（猜）唐诗三百首，不会作诗也会吟",
    "supported_languages": [...],
    "supported_hint_languages": [...],
    "difficulty_modes": [...],
    "payment_methods": [...],
    "product_types": [...],
    "scoring_rules": {
      "easy_mode": {
        "correct": 1,
        "incorrect": -1
      },
      "hard_mode": {
        "correct": 2,
        "incorrect": -2
      }
    }
  }
}
```

## 系统相关

### 健康检查
```http
GET /api/health
```

**响应**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z",
  "uptime": 3600
}
```

## 错误响应

所有API在出错时都会返回统一格式的错误响应：

```json
{
  "message": "错误描述"
}
```

常见HTTP状态码：
- `200`: 成功
- `400`: 请求参数错误
- `401`: 未认证或认证失败
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

## 环境变量

服务器支持以下环境变量配置：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=poem2ndguess
DB_CONNECTION_LIMIT=10

# JWT配置
JWT_SECRET=chinpoem-secret
``` 