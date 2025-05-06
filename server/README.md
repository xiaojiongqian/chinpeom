# 唐诗译境(Chinpoem) 服务器

这是唐诗译境(Chinpoem)应用的后端服务器，提供用户认证和排行榜等功能。

## 技术架构

- **Express.js**: 轻量级Web框架
- **JWT**: 用户认证
- **文件存储**: 使用JSON文件存储用户数据

## 目录结构

```
server/
├── api/            # API路由
│   └── user.js     # 用户相关API
├── config/         # 配置文件
│   └── config.js   # 服务器配置
├── data/           # 数据存储
│   └── users.json  # 用户数据
├── middleware/     # 中间件
│   └── auth.js     # 认证中间件
├── package.json    # 依赖配置
├── README.md       # 说明文档
└── server.js       # 主服务器文件
```

## API接口

### 用户管理

- **POST /api/user/register**: 用户注册
  - 请求体: `{ username, email, password }`
  - 响应: `{ message, user, token }`

- **POST /api/user/login**: 用户登录
  - 请求体: `{ email, password }`
  - 响应: `{ message, user, token }`

- **GET /api/user/me**: 获取当前用户信息 (需认证)
  - 请求头: `Authorization: Bearer <token>`
  - 响应: `{ user }`

- **PUT /api/user/score**: 更新用户分数 (需认证)
  - 请求头: `Authorization: Bearer <token>`
  - 请求体: `{ scoreDelta }`
  - 响应: `{ message, user }`

- **PUT /api/user/language**: 更新用户语言设置 (需认证)
  - 请求头: `Authorization: Bearer <token>`
  - 请求体: `{ language }`
  - 响应: `{ message, user }`

### 排行榜

- **GET /api/user/leaderboard**: 获取用户排行榜
  - 响应: `{ leaderboard }`

## 部署说明

### 开发环境

1. 安装依赖:
   ```
   npm install
   ```

2. 启动开发服务器:
   ```
   npm run dev
   ```

### 生产环境

1. 设置环境变量:
   ```
   PORT=3001
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   ```

2. 启动服务器:
   ```
   npm start
   ```

## 与前端集成

在开发环境中，前端使用Vite的代理将API请求转发到此服务器。

在生产环境中，此服务器可以直接提供前端静态文件和API服务，实现一体化部署。

## 混合存储模式说明

- 核心诗歌数据作为静态资源打包在前端应用中，确保离线状态下可使用主要功能
- 用户账户、排行榜等社交功能通过本服务器的API实现，需要网络连接

## 移动应用说明

使用Capacitor打包的移动应用:
- 本地存储所有诗歌数据
- 通过网络请求连接远程API服务器实现用户功能 