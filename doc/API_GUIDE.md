# 本地资源与API配置指南

## 概述
遵循纯终端/本地实现原则：
- 诗歌与翻译数据从本地静态资源读取；
- 账户与进度持久化到本地JSON文件；
- 可选对接第三方LLM服务用于诗歌详情问答（无自建服务端）。

## 本地数据与加载

### 翻译数据结构

### 数据结构
```json
{
  "poems": [
    {
      "id": "poem_001",
      "title": "静夜思",
      "author": "李白",
      "sentences": [
        {
          "senid": 1,
          "content": "床前明月光",
          "translations": {
            "en": "Bright moonlight before my bed",
            "fr": "Clair de lune devant mon lit",
            "es": "Brillante luz de luna ante mi cama"
          }
        }
      ]
    }
  ]
}
```

### 数据文件组织
```
public/resource/data/
├── en/               # 英语翻译
│   ├── poem_001.json
│   └── poem_002.json
├── fr/               # 法语翻译
├── es/               # 西班牙语翻译
├── de/               # 德语翻译
├── ja/               # 日语翻译
└── index.json        # 索引文件
```

### 数据加载机制（前端）
```typescript
// 缓存机制
const translationCache = new Map<string, any>()

// 延迟加载
const loadTranslation = async (language: string, poemId: string) => {
  const cacheKey = `${language}_${poemId}`
  
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)
  }
  
  const data = await fetch(`/resource/data/${language}/${poemId}.json`)
  const result = await data.json()
  
  translationCache.set(cacheKey, result)
  return result
}
```

## 监控和日志

### 本地性能与日志指标
- 本地读取耗时（静态资源）
- 缓存命中率
- 错误率统计
- 用户语言偏好（仅本地统计，不上传）

### 日志配置（本地）
```typescript
// src/utils/logger.ts
export class ApiLogger {
  static logTranslationRequest(language: string, poemId: string) {
    console.log(`[API] Loading translation: ${language}/${poemId}`)
  }
  
  static logError(error: Error, context: string) {
    console.error(`[API Error] ${context}:`, error)
  }
  
  static logPerformance(operation: string, duration: number) {
    console.log(`[Performance] ${operation}: ${duration}ms`)
  }
}
```

### 错误处理策略（无网络依赖）
```typescript
// 渐进降级策略
const getTranslationWithFallback = async (language: string, poemId: string) => {
  try {
    // 尝试加载指定语言翻译
    return await loadTranslation(language, poemId)
  } catch (error) {
    try {
      // 降级到英语翻译
      return await loadTranslation('en', poemId)
    } catch (fallbackError) {
      // 最终降级到显示原文
      return { content: '***', fallback: true }
    }
  }
}
```

## 本地数据最佳实践

### 1. 缓存策略
- 本地存储翻译数据，减少网络请求
- 实现智能预加载，提升用户体验
- 定期清理过期缓存

### 2. 错误处理
- 实现多级降级策略
- 用户友好的错误提示
- 自动重试机制

### 3. 性能优化
- 延迟加载翻译数据
- 压缩数据文件
- 使用CDN加速静态资源

### 4. 监控和维护
- 定期检查数据完整性
- 监控API响应性能
- 收集用户反馈优化体验

## 故障排除

### 常见问题及解决方案

**1. 翻译显示为"***"**
- 检查翻译文件是否存在
- 验证数据格式是否正确
- 确认语言选择与资源路径一致（纯本地，无需网络）

**2. 切换语言无效**
- 清除浏览器缓存
- 检查语言配置文件
- 验证本地存储设置

**3. 性能问题**
- 启用数据压缩
- 优化缓存策略
- 合理预加载，避免一次性加载全部文件

## 账户与进度持久化（本地JSON）

### 目录结构
```
~/.chinpoem/
├── active.json                # 当前激活账户
└── accounts/
    └── <account>.json         # 账户配置与进度
```

### active.json 示例
```json
{
  "currentAccount": "laotang",
  "lastSwitch": "2024-05-12T10:03:17+08:00",
  "schemaVersion": 1
}
```

### <account>.json 示例
```json
{
  "account": "laotang",
  "score": 28,
  "rank": "秀才",
  "language": "zh-CN",
  "difficulty": "hard",
  "totalQuestions": 112,
  "correctQuestions": 87,
  "lastPlayedAt": "2024-05-12T10:00:01+08:00",
  "preferences": { "musicEnabled": true },
  "schemaVersion": 1
}
```

### 前端写盘策略
- Pinia状态节流批量写入；
- 退出前强制写盘；
- 写入失败时回退最近有效备份并提示。

## 终端工具 poemctl

### 常用命令
```bash
poemctl account create <name>
poemctl account switch <name>
poemctl account list
poemctl account remove <name>
poemctl account export <name> --out ./backup.json
poemctl account import ./backup.json
```

### 行为说明
- `switch` 会更新 `~/.chinpoem/active.json`；
- 所有命令均为本地文件操作，无网络请求。

## 可选：LLM 服务（诗歌详情问答）
若需要启用LLM对话，仅需在前端配置第三方API Key（例如 DeepSeek/OpenAI 兼容接口）。

```typescript
// src/config/llm.ts
export const LLM_CONFIG = {
  baseUrl: import.meta.env.VITE_LLM_BASE_URL,
  apiKey: import.meta.env.VITE_LLM_API_KEY,
  model: 'deepseek-chat',
  timeout: 15000
}
```

环境变量示例：
```env
# .env.local
VITE_LLM_BASE_URL=https://api.deepseek.com
VITE_LLM_API_KEY=sk-xxxx
```

注意：LLM为可选项；未配置时，诗歌详情页仅展示本地说明，不提供对话功能。

## 开发调试

### 调试模式配置
```typescript
// 开启详细日志
if (import.meta.env.VITE_DEBUG_MODE === 'true') {
  window.debugApi = {
    clearCache: () => translationCache.clear(),
    getCacheStats: () => ({
      size: translationCache.size,
      keys: Array.from(translationCache.keys())
    })
  }
}
```

### 测试工具
```bash
# 测试翻译API
npm run test:api

# 性能测试
npm run test:performance

# 数据完整性检查
npm run test:data-integrity
```

## 历史服务器实现（存档）
本项目早期版本包含服务端、第三方登录（Apple/Google/Twitter）、数据库与付费逻辑等。
- 存档分支：`v1.0-with-backend-server`
- 涉及技术：Express.js、Firebase Auth/Analytics、MySQL/SQLite、REST API 同步
- 典型端点（示例）：`POST /api/auth/login`, `PUT /api/user/score`, `POST /api/payment/verify`

该实现已从当前版本中移除，以简化为纯本地/终端模式。需要参考历史细节时，请切换到上述分支。
