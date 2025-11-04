# 唐诗译境(Chinpoem) 服务端（已归档）

> 说明：当前项目已切换为“纯本地/终端”实现方案，不再依赖自建后端服务。本目录为历史服务器实现的存档，仅用于回顾与参考。

## 概述（历史实现）

唐诗译境应用早期版本的后端 API 服务器，基于 Express.js 和 MySQL 构建。

## 功能特性（历史实现）

- 🔐 第三方登录支持（微信、苹果、Google、X）
- 📊 用户积分同步和等级管理
- 💰 付费功能和订单管理
- ⚙️ 配置管理和学级称号系统
- 🛡️ JWT认证和安全中间件

## 技术栈（历史实现）

- **框架**: Express.js
- **数据库**: MySQL 8.0+
- **认证**: JWT
- **ORM**: mysql2
- **开发工具**: nodemon

## 快速开始（历史实现）

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制环境变量示例文件并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接信息：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=poem2ndguess
DB_CONNECTION_LIMIT=10

# JWT配置
JWT_SECRET=your-secret-key

# 服务器配置
PORT=3001
NODE_ENV=development
```

### 3. 数据库准备

确保MySQL服务运行，并且已经创建了 `poem2ndguess` 数据库：

```sql
CREATE DATABASE poem2ndguess CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. 启动服务

开发模式启动（支持热重载）：

```bash
npm run dev
```

生产模式启动：

```bash
npm start
```

服务器将在 `http://localhost:3001` 启动。

## API 文档

历史 API 文档与联调说明已迁移至存档分支：`v1.0-with-backend-server`。

### 主要端点

- `POST /api/auth/login` - 第三方登录
- `GET /api/user/profile` - 获取用户信息
- `PUT /api/user/score` - 同步用户积分
- `POST /api/payment/create` - 创建付费订单
- `GET /api/config/ranks` - 获取学级配置

### 健康检查

```bash
curl http://localhost:3001/api/health
```

## 项目结构（历史实现）

```
server/
├── api/              # API路由模块
│   ├── auth.js       # 认证相关
│   ├── user.js       # 用户相关
│   ├── payment.js    # 付费相关
│   └── config.js     # 配置相关
├── config/           # 配置文件
│   ├── database.js   # 数据库配置
│   └── env/          # 环境配置
├── middleware/       # 中间件
│   └── auth.js       # JWT认证中间件
├── data/            # 数据文件（如果使用）
├── package.json     # 依赖配置
├── server.js        # 服务器入口
└── README.md        # 文档
```

## 开发指南（历史实现）

### 数据库操作

使用 mysql2 连接池进行数据库操作：

```javascript
const connection = await pool.getConnection()
try {
  const [results] = await connection.execute('SELECT * FROM users WHERE id = ?', [userId])
  // 处理结果
} finally {
  connection.release()
}
```

### 添加新的API

1. 在 `api/` 目录下创建新的路由文件
2. 在 `server.js` 中注册路由
3. 更新API文档

### 错误处理

所有API都应返回统一的错误格式：

```javascript
res.status(400).json({ message: '错误描述' })
```

## 故障排除（历史实现）

### 数据库连接失败

1. 检查MySQL服务是否运行
2. 验证 `.env` 文件中的数据库配置
3. 确保数据库用户有相应权限

### JWT认证失败

1. 检查 `JWT_SECRET` 环境变量
2. 验证请求头中的 `Authorization` 格式

### 端口占用

如果3001端口被占用，可以修改 `.env` 文件中的 `PORT` 配置。

## 部署（历史实现）

### 生产环境配置

1. 设置安全的 `JWT_SECRET`
2. 配置生产数据库连接
3. 启用HTTPS
4. 设置适当的CORS策略

### Docker部署（可选）

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 状态与去向

- 现状：该服务端实现已从主分支移除依赖，不再维护为生产能力。
- 存档：完整代码、API 与文档位于分支 `v1.0-with-backend-server`。
- 现版应用：使用本地资源与可选第三方云服务（如 LLM 接口），详见 `doc/README.md` 与 `doc/API_GUIDE.md`。

## 许可证

MIT License
