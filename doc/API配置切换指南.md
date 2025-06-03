# API配置切换指南

## 概述

唐诗译境项目支持在Mock API和真实API之间动态切换，配置会自动持久化保存，方便开发和测试。

## 🎯 功能特性

### ✅ 双模式支持
- **Mock模式**: 使用本地模拟数据，无需后端服务
- **真实模式**: 调用实际后端API服务

### ✅ 持久化配置
- **自动保存**: 配置更改自动保存到localStorage
- **页面刷新保持**: 刷新页面后配置状态保持不变
- **多种切换方式**: UI界面、控制台命令、代码配置

## 🔧 切换方式

### 1. UI界面切换

#### 登录页面切换
- 在开发环境下，登录页面显示当前API模式
- 点击"切换到xxx"按钮可以切换模式
- **新功能**: 切换后配置自动保存，页面刷新后状态保持

#### 开发面板切换
- 页面右下角有🔧图标的开发面板
- 点击展开面板，显示详细配置信息
- 提供"Mock API模式"和"真实API模式"按钮
- 支持API连接测试功能
- **新功能**: 切换后配置持久化保存

### 2. 控制台命令

打开浏览器控制台(F12)，输入以下命令：

```javascript
// 切换到真实API模式（配置会自动保存）
enableRealApi()

// 切换到Mock模式（配置会自动保存）
enableMockApi()

// 重置为默认配置
resetConfig()

// 查看当前配置
appConfig
```

### 3. 代码配置

配置现在支持持久化存储，通过updateConfig函数更新：

```typescript
import { updateConfig } from '@/config/app'

// 切换到真实API模式
updateConfig({
  api: { useRealApi: true },
  auth: { mockMode: false }
})

// 切换到Mock模式
updateConfig({
  api: { useRealApi: false },
  auth: { mockMode: true }
})
```

## 🔄 持久化机制

### 自动保存
- 配置更改后自动保存到 `localStorage`
- 存储键名: `chinpoem_app_config`
- 仅保存必要的配置项: `useRealApi` 和 `mockMode`

### 配置加载
- 页面加载时自动从localStorage读取配置
- 如果没有保存的配置，使用默认值
- 配置加载失败时回退到默认配置

### 配置结构
```json
{
  "api": { "useRealApi": false },
  "auth": { "mockMode": true }
}
```

## 📊 模式对比

| 特性 | Mock模式 | 真实API模式 |
|------|----------|-------------|
| 后端依赖 | ❌ 无需后端 | ✅ 需要后端服务 |
| 网络请求 | ❌ 本地模拟 | ✅ 真实网络调用 |
| 数据持久化 | ❌ 临时数据 | ✅ 数据库存储 |
| API日志 | ❌ 无服务器日志 | ✅ 完整API日志 |
| 配置持久化 | ✅ 自动保存 | ✅ 自动保存 |
| 开发速度 | ⚡ 快速开发 | 🐌 依赖后端 |
| 测试完整性 | 📝 单元测试 | 🔍 集成测试 |

## 🚀 使用场景

### Mock模式适用于：
- 前端独立开发
- UI界面调试
- 离线开发环境
- 单元测试
- 演示和原型

### 真实API模式适用于：
- 后端联调测试
- 集成测试
- 性能测试
- 生产环境验证
- API日志监控

## 🔍 调试技巧

### 1. 查看当前模式
```javascript
console.log('当前API模式:', appConfig.auth.mockMode ? 'Mock' : 'Real')
console.log('保存的配置:', localStorage.getItem('chinpoem_app_config'))
```

### 2. 测试API连接
- 使用开发面板的"测试API连接"按钮
- 或手动访问: http://localhost:3001/api/health

### 3. 查看日志
- Mock模式: 查看浏览器控制台日志
- 真实模式: 查看服务器终端日志和监控面板

### 4. 验证切换效果
1. 切换到真实API模式
2. **刷新页面验证配置保持**
3. 执行登录操作（微信、Google或Apple）
4. 检查终端是否显示API调用日志：
   ```
   [API] POST /api/auth/login - 200 - 45ms
   ```

### 5. 支持的登录方式
- ✅ 微信登录
- ✅ Google账号登录
- ✅ Apple账号登录

## 🎨 开发工作流

### 推荐开发流程：
1. **启动阶段**: 使用Mock模式快速开发UI
2. **联调阶段**: 切换到真实API模式测试后端
3. **测试阶段**: 在两种模式间切换验证功能
4. **部署阶段**: 确保使用真实API模式

### 快速切换：
```bash
# 终端1: 启动前后端服务
npm run dev:full

# 浏览器: 访问 http://localhost:3000
# 方式1: 点击登录页面的切换按钮
# 方式2: 使用右下角开发面板
# 方式3: 控制台命令 enableRealApi() 或 enableMockApi()
```

## 📝 注意事项

1. **配置持久化**: 配置更改会自动保存，无需手动操作
2. **页面刷新**: 刷新页面后配置状态会保持不变
3. **数据差异**: Mock数据和真实数据可能存在差异
4. **网络依赖**: 真实模式需要确保后端服务正常运行
5. **生产环境**: 生产环境应该禁用Mock模式

## 🐛 常见问题

### Q: 切换到真实API后无法登录？
A: 检查后端服务是否启动，访问 http://localhost:3001/api/health

### Q: 配置没有保存？
A: 检查浏览器是否允许localStorage，或使用控制台查看: `localStorage.getItem('chinpoem_app_config')`

### Q: 如何重置配置？
A: 使用控制台命令 `resetConfig()` 或手动清除: `localStorage.removeItem('chinpoem_app_config')`

### Q: 配置加载失败怎么办？
A: 系统会自动回退到默认配置，也可以手动重置配置

### Q: Mock模式下看不到API日志？
A: Mock模式不会产生服务器日志，只有前端控制台日志

### Q: 如何确认当前使用的是哪种模式？
A: 查看登录页面的模式显示，或使用开发面板查看详细配置

### Q: 切换模式后页面没有变化？
A: 确保页面已刷新，部分缓存可能需要强制刷新(Ctrl+F5) 