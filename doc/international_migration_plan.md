# 唐诗译境国际化重构迁移计划

## 概述

本文档详细说明唐诗译境应用从当前版本迁移到完全国际化版本的具体实施步骤。这是一个重大的产品定位调整，从面向中文用户转向面向国际用户。

## 重大变更摘要

### 1. 登录方式变更
- **移除**: 微信登录
- **保留**: Apple Sign-In, Google OAuth  
- **新增**: Twitter/X API登录

### 2. 语言支持调整
- **移除**: 中文界面支持（保留诗歌内容为中文）
- **保留**: 英语、西班牙语、日语、法语、德语
- **新增**: 界面语言与诗歌提示语言分离设置

### 3. 付费模式调整
- **变更前**: 免费用户可达秀才（45分）
- **变更后**: 免费用户限制至学童（25分），秀才需要付费

### 4. 新增功能
- **Firebase Analytics**: 用户行为分析和关键动作埋点
- **语言分离**: 界面语言与诗歌提示语言独立设置
- **自动检测**: 根据设备语言自动设置默认界面语言

## 详细迁移步骤

### 阶段一：登录系统重构（预计2天）

#### 1.1 移除微信登录
```bash
# 需要删除的文件和代码
- src/services/wechatAuth.ts (如果存在)
- 登录界面中的微信登录按钮
- 微信SDK相关依赖
```

#### 1.2 集成Twitter/X登录
```typescript
// 需要添加的配置
// src/config/firebase.ts
import { TwitterAuthProvider } from 'firebase/auth'

const twitterProvider = new TwitterAuthProvider()
twitterProvider.setCustomParameters({
  lang: 'en' // 设置为英语
})

// src/services/firebaseAuth.ts  
async signInWithTwitter(): Promise<FirebaseAuthResult> {
  const result = await signInWithPopup(auth, twitterProvider)
  const accessToken = await result.user.getIdToken()
  await analytics.logEvent('login', { method: 'twitter' })
  return { user: this.formatUser(result.user), accessToken }
}
```

#### 1.3 更新登录界面
```vue
<!-- src/views/LoginView.vue 需要更新 -->
<template>
  <!-- 移除微信登录按钮 -->
  <!-- 添加Twitter登录按钮 -->
  <button @click="loginWithTwitter" class="twitter-login-btn">
    <TwitterIcon />
    {{ $t('login.signInWithTwitter') }}
  </button>
</template>
```

### 阶段二：语言架构重构（预计3天）

#### 2.1 移除中文语言支持
```bash
# 需要删除的文件
rm src/locales/zh-CN.ts
rm src/locales/zh.ts (如果存在)

# 需要修改的配置文件
# src/config/app.ts - 移除中文语言选项
# vite.config.ts - 移除中文相关配置
```

#### 2.2 用户数据模型更新
```typescript
// src/types/user.d.ts - 更新用户接口
interface User {
  id: number
  username: string
  score: number
  interface_language: 'en' | 'es' | 'ja' | 'fr' | 'de'  // 新增：界面语言
  poem_hint_language: 'en' | 'es' | 'ja' | 'fr' | 'de' // 新增：诗歌提示语言
  difficulty_mode: 'easy' | 'hard'
}

// src/stores/user.ts - 更新用户状态管理
const user = ref<User>({
  interface_language: 'en', // 默认英语
  poem_hint_language: 'en', // 默认英语
  // ... 其他字段
})

// 新增方法
const setInterfaceLanguage = (lang: string) => {
  user.value.interface_language = lang
  // 更新i18n locale
  localStorage.setItem('user_data', JSON.stringify(user.value))
}

const setPoemHintLanguage = (lang: string) => {
  user.value.poem_hint_language = lang
  localStorage.setItem('user_data', JSON.stringify(user.value))
}
```

### 阶段三：Firebase Analytics集成（预计2天）

#### 3.1 安装和配置
```bash
# 安装Analytics SDK
npm install firebase/analytics

# 或者如果已有firebase，确保版本支持analytics
npm update firebase
```

#### 3.2 Analytics配置
```typescript
// src/config/analytics.ts - 新建文件
import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics'
import { app } from './firebase'

const analytics = getAnalytics(app)

// 用户行为追踪
export const trackUserLogin = (method: 'google' | 'apple' | 'twitter') => {
  logEvent(analytics, 'login', { method })
}

export const trackAnswerSubmit = (isCorrect: boolean, difficulty: string) => {
  logEvent(analytics, 'answer_submit', { 
    is_correct: isCorrect, 
    difficulty_mode: difficulty 
  })
}

export const trackLanguageChange = (type: 'interface' | 'poem_hint', language: string) => {
  logEvent(analytics, 'language_change', { type, language })
}

export const trackDifficultyChange = (new_difficulty: string) => {
  logEvent(analytics, 'difficulty_change', { new_difficulty })
}

export const trackPaymentAttempt = (current_score: number, target_level: string) => {
  logEvent(analytics, 'payment_attempt', { current_score, target_level })
}

export const trackPaymentSuccess = (amount: number, level_unlocked: string) => {
  logEvent(analytics, 'purchase', { 
    currency: 'USD', 
    value: amount,
    level_unlocked 
  })
}

// 设置用户属性
export const setUserAnalyticsProperties = (user: User) => {
  setUserId(analytics, user.id.toString())
  setUserProperties(analytics, {
    interface_language: user.interface_language,
    poem_hint_language: user.poem_hint_language,
    difficulty_mode: user.difficulty_mode,
    current_level: getUserLevel(user.score)
  })
}
```

### 阶段四：付费限制调整（预计1天）

#### 4.1 常量更新
```typescript
// src/stores/user.ts
const FREE_USER_MAX_SCORE = 25 // 从45改为25

// src/utils/levels.ts
export const ACADEMIC_RANKS = [
  { name: 'baiding', minScore: 0, maxScore: 10, requiresPremium: false },
  { name: 'xuetong', minScore: 11, maxScore: 25, requiresPremium: false },
  { name: 'xiucai', minScore: 26, maxScore: 45, requiresPremium: true },  // 改为需要付费
  // ... 其他等级
]
```

#### 4.2 数据库更新脚本
```sql
-- 更新数据库中的学级配置
UPDATE academic_ranks 
SET requires_premium = true 
WHERE rank_name = 'xiucai';

-- 如果有现有免费用户超过25分的，需要特殊处理
UPDATE users 
SET score = 25 
WHERE score > 25 AND is_premium = false;
```

### 阶段五：国际化翻译完善（预计2天）

#### 5.1 翻译文件更新
需要为所有新增的UI文本创建五种语言的翻译：

```typescript
// src/locales/en.ts
export default {
  login: {
    signInWithApple: "Sign in with Apple",
    signInWithGoogle: "Sign in with Google", 
    signInWithTwitter: "Sign in with Twitter",
    gameDescription: "Learn Tang poetry through multilingual guessing"
  },
  settings: {
    interfaceLanguage: "Interface Language",
    poemHintLanguage: "Poem Hint Language", 
    hardModeHint: "In hard mode, poem hints are hidden",
    languageNote: "Interface and hint languages can be set independently"
  },
  // ... 其他翻译
}
```

#### 5.2 自动语言检测
```typescript
// src/utils/languageDetection.ts - 新建文件
export const detectUserLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0]
  const supportedLangs = ['en', 'es', 'ja', 'fr', 'de']
  
  return supportedLangs.includes(browserLang) ? browserLang : 'en'
}

// src/stores/user.ts - 在初始化时使用
const init = () => {
  const savedData = localStorage.getItem('user_data')
  if (savedData) {
    // 恢复保存的数据
    const userData = JSON.parse(savedData)
    user.value = userData
  } else {
    // 新用户：自动检测语言
    user.value.interface_language = detectUserLanguage()
    user.value.poem_hint_language = detectUserLanguage()
  }
}
```

## 测试计划

### 功能测试
- [ ] 三种登录方式完整流程测试
- [ ] 语言分离设置测试
- [ ] 困难模式下星号显示测试
- [ ] 付费限制25分测试
- [ ] Analytics事件触发测试

### 兼容性测试
- [ ] 不同浏览器下的语言检测
- [ ] 移动设备上的登录流程
- [ ] 网络不稳定情况下的Analytics

### 用户体验测试
- [ ] 语言切换的响应速度
- [ ] 界面元素的多语言适配
- [ ] 新用户首次使用流程

## 风险评估与应对

### 高风险项
1. **用户数据迁移**: 现有用户的语言设置可能需要重置
   - **应对**: 提供平滑的迁移脚本，保留用户偏好

2. **Twitter/X API限制**: 可能有请求频率限制
   - **应对**: 实现优雅的错误处理和重试机制

3. **Analytics数据合规**: GDPR等隐私法规要求
   - **应对**: 添加用户同意提示，提供退出选项

### 中风险项
1. **翻译质量**: 非英语翻译可能需要母语者审核
   - **应对**: 先发布英语版本，逐步完善其他语言

2. **付费用户影响**: 现有免费用户可能对限制调整不满
   - **应对**: 提供明确的升级价值说明

## 发布策略

### 阶段性发布
1. **Alpha版本**: 内部测试，验证核心功能
2. **Beta版本**: 小范围用户测试，收集反馈
3. **正式发布**: 全量发布国际化版本

### 回滚计划
- 保留当前版本的完整备份
- 准备快速回滚脚本
- 监控关键指标，必要时快速回滚

## 时间线

- **第1-2天**: 登录系统重构（移除微信，添加Twitter）
- **第3-5天**: 语言架构重构（分离设置，移除中文）
- **第6-7天**: Firebase Analytics集成
- **第8天**: 付费限制调整
- **第9-10天**: 翻译完善和自动检测
- **第11-12天**: 全面测试和修复
- **第13天**: 部署和发布

**预计总时间**: 13个工作日（约2.5周） 