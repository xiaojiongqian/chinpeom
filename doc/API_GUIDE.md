# API配置指南

## 概述
本指南涵盖项目中翻译API的配置、切换和监控。

## API配置切换

### 翻译API配置
项目支持多种翻译API提供商，可根据需要进行切换：

#### 1. 本地翻译数据（推荐）
```typescript
// src/config/api.ts
export const TRANSLATION_CONFIG = {
  type: 'local',
  basePath: '/resource/data/',
  supportedLanguages: ['en', 'fr', 'es', 'de', 'ja']
}
```

#### 2. 在线翻译API（备用）
```typescript
export const TRANSLATION_CONFIG = {
  type: 'online',
  apiEndpoint: 'https://api.translate.service.com',
  apiKey: process.env.VITE_TRANSLATE_API_KEY,
  timeout: 5000
}
```

### 环境配置切换

#### 开发环境配置
```env
# .env.development
VITE_API_BASE_URL=http://localhost:3000
VITE_TRANSLATE_SOURCE=local
VITE_DEBUG_MODE=true
```

#### 生产环境配置
```env
# .env.production
VITE_API_BASE_URL=https://chinpoem.example.com
VITE_TRANSLATE_SOURCE=local
VITE_DEBUG_MODE=false
```

## 翻译数据管理

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

### 数据加载机制
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

### 性能监控指标
- API响应时间
- 缓存命中率
- 错误率统计
- 用户语言偏好分析

### 日志配置
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

### 错误处理策略
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

## API最佳实践

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
- 确认网络连接正常

**2. 切换语言无效**
- 清除浏览器缓存
- 检查语言配置文件
- 验证本地存储设置

**3. 性能问题**
- 启用数据压缩
- 优化缓存策略
- 减少不必要的API调用

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