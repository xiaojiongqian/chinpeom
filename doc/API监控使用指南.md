# 唐诗译境(Chinpoem) API调用监控指南

## 📊 API监控系统

### 🎯 监控目的
在测试过程中，您可以通过多种方式观察前后台API调用情况，了解系统运行状态和性能表现。

## 🔗 监控入口

### 1. 🌐 Web监控面板 (推荐)
**访问地址**: http://localhost:3001/monitor

**功能特性**:
- 📈 实时API统计数据
- 🖥️ 系统运行状态
- 📝 最近50条API调用日志
- 🔄 自动刷新功能（10秒间隔）
- 🗑️ 日志清理功能

**使用方法**:
1. 在浏览器中打开 http://localhost:3001/monitor
2. 查看实时统计数据
3. 启用"自动刷新"监控实时API调用
4. 在日志区域查看详细的API请求响应信息

### 2. 📱 API接口方式

#### 获取系统状态
```bash
curl http://localhost:3001/api/monitor/status
```

#### 获取API调用日志
```bash
curl http://localhost:3001/api/monitor/logs?limit=20
```

#### 获取API统计数据
```bash
curl http://localhost:3001/api/monitor/stats
```

### 3. 🖥️ 终端控制台监控
后端服务启动后，所有API调用都会在终端控制台实时显示：

**日志格式**:
```bash
[API] GET /api/health - 200 - 5ms        # 成功请求 (绿色)
[API] POST /api/auth/login - 401 - 12ms  # 认证失败 (红色)
[API] GET /api/config/ranks - 200 - 8ms  # 正常请求 (绿色)
```

**颜色编码**:
- 🟢 绿色: 200-299 成功响应
- 🟡 黄色: 300-399 重定向
- 🔴 红色: 400+ 错误响应

### 4. 📄 日志文件监控
**日志文件位置**: `server/logs/api-2025-06-02.log`

**实时查看日志**:
```bash
# 实时监控日志文件
tail -f server/logs/api-$(date +%Y-%m-%d).log

# 查看最近20条日志
tail -20 server/logs/api-$(date +%Y-%m-%d).log
```

## 📋 监控数据说明

### 📈 API统计指标
- **总调用数**: 今日累计API请求次数
- **成功率**: 成功请求占总请求的百分比
- **平均响应时间**: 所有请求的平均处理时间
- **错误调用**: 返回4xx/5xx状态码的请求数量

### 🖥️ 系统状态指标
- **运行时间**: 服务器持续运行时间
- **内存使用**: 当前内存占用情况
- **Node版本**: 运行环境Node.js版本
- **环境**: 当前运行环境（development/production）

### 📝 日志详细信息
每条API调用日志包含：
- **时间戳**: 请求发生的具体时间
- **HTTP方法**: GET/POST/PUT/DELETE
- **请求路径**: API端点路径
- **状态码**: HTTP响应状态码
- **响应时间**: 请求处理耗时
- **IP地址**: 客户端IP
- **User Agent**: 客户端信息
- **请求体**: POST/PUT请求的数据内容
- **响应体**: API返回的数据内容

## 🧪 测试时的监控建议

### 1. 🏠 前端页面测试监控
当您在前端页面进行操作时：

1. **打开监控面板**: http://localhost:3001/monitor
2. **启用自动刷新**: 勾选"自动刷新"选项
3. **观察API调用**: 在前端页面进行操作，观察监控面板的实时变化

### 2. 🔐 登录流程监控
测试用户登录时，关注以下API调用：
```bash
POST /api/auth/login           # 用户登录请求
GET /api/user/profile          # 获取用户信息
POST /api/user/sync-score      # 同步积分
```

### 3. 🎮 游戏功能监控
测试游戏功能时的关键API：
```bash
GET /api/config/ranks          # 获取学级配置
GET /api/config/app           # 获取应用配置
POST /api/user/settings       # 更新用户设置
```

### 4. 💰 支付流程监控
测试支付功能时的API序列：
```bash
GET /api/payment/products      # 获取产品列表
POST /api/payment/create       # 创建订单
POST /api/payment/verify       # 验证支付
GET /api/payment/history       # 查看历史
```

## 🚨 异常监控和排错

### 1. 常见错误状态码
- **400**: 请求参数错误
- **401**: 认证失败，令牌无效
- **403**: 权限不足
- **404**: API端点不存在
- **500**: 服务器内部错误

### 2. 性能监控指标
- **响应时间 > 1000ms**: 需要优化
- **成功率 < 95%**: 需要排查错误
- **内存使用 > 100MB**: 可能存在内存泄漏

### 3. 排错步骤
1. **查看监控面板**: 确认错误类型和频率
2. **检查控制台日志**: 查看详细错误信息
3. **分析日志文件**: 查找错误模式和原因
4. **测试API接口**: 直接测试有问题的API

## 🛠️ 高级监控功能

### 1. 自定义监控脚本
```bash
#!/bin/bash
# 监控脚本示例
while true; do
  echo "=== $(date) ==="
  curl -s http://localhost:3001/api/monitor/stats | jq '.data'
  sleep 30
done
```

### 2. 监控数据导出
```bash
# 导出今日API日志
curl -s "http://localhost:3001/api/monitor/logs?limit=1000" > api_logs_$(date +%Y%m%d).json

# 导出系统状态
curl -s "http://localhost:3001/api/monitor/status" > system_status_$(date +%Y%m%d_%H%M%S).json
```

### 3. 监控告警
您可以基于API监控数据设置告警规则：
- 错误率超过5%时发出警告
- 响应时间超过500ms时发出警告
- 内存使用超过阈值时发出警告

## 📖 使用示例

### 完整的测试监控流程

1. **启动监控**:
   ```bash
   # 打开监控面板
   open http://localhost:3001/monitor
   
   # 或在终端监控
   tail -f server/logs/api-$(date +%Y-%m-%d).log
   ```

2. **执行测试操作**:
   - 打开前端应用: http://localhost:3000
   - 尝试登录功能
   - 测试游戏核心功能
   - 验证支付流程

3. **观察监控数据**:
   - 监控面板显示实时统计
   - 控制台输出彩色日志
   - 日志文件记录详细信息

4. **分析结果**:
   - 检查API调用成功率
   - 分析响应时间分布
   - 识别潜在问题和瓶颈

## 🎯 总结

通过这套完整的API监控系统，您可以：
- ✅ 实时观察前后台API调用情况
- ✅ 监控系统性能和稳定性
- ✅ 快速定位和排查问题
- ✅ 分析用户行为和系统使用模式
- ✅ 为系统优化提供数据支持

**推荐使用方式**: 在测试过程中，同时打开Web监控面板和控制台，这样可以获得最全面的监控信息。

---

**文档更新时间**: 2025年6月2日  
**服务状态**: 🟢 监控系统运行正常  
**推荐浏览器**: Chrome、Safari、Firefox、Edge 