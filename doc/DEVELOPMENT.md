# 唐诗译境（Chinpoem）开发规范文档

## 目录结构

```
├── doc/                    # 项目文档
│   ├── progress.md         # 项目进度规划
│   ├── PRD.md              # 产品需求文档
│   ├── design/             # 设计文档和截图
│   └── DEVELOPMENT.md      # 开发规范文档（本文档）
│
├── public/                 # 静态资源
│   ├── resource/           # 诗歌资源文件
│   │   ├── data/           # 诗歌数据目录
│   │   │   ├── poem_chinese.json   # 中文诗歌数据
│   │   │   ├── poem_english.json   # 英文翻译数据
│   │   │   ├── poem_french.json    # 法文翻译数据
│   │   │   ├── poem_german.json    # 德文翻译数据
│   │   │   ├── poem_japanese.json  # 日文翻译数据
│   │   │   └── poem_spanish.json   # 西班牙文翻译数据
│   │   ├── poem_images/    # 诗歌配图目录
│   │   └── sound/          # 诗歌音效目录
│   ├── backgroundmusic/    # 背景音乐文件
│   ├── test-music-debug.html     # 音乐测试页面
│   ├── test-resume-music.html    # 音乐恢复测试页面
│   └── test-firebase.html        # Firebase连接测试页面
│
├── src/                    # 源代码
│   ├── assets/             # 项目资源文件
│   │   ├── icons/          # 图标资源
│   │   │   ├── nav/        # 导航图标
│   │   │   └── feature/    # 功能图标
│   │   ├── main.css        # 全局样式
│   │   ├── theme.css       # 主题样式
│   │   └── login_floatwater.webp  # 登录页面背景图
│   ├── components/         # UI组件
│   │   ├── common/         # 通用组件
│   │   │   ├── BaseButton.vue
│   │   │   ├── BaseCard.vue
│   │   │   ├── BaseInput.vue
│   │   │   └── ExampleButton.vue
│   │   ├── layout/         # 布局组件
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppFooter.vue
│   │   │   └── MainLayout.vue
│   │   ├── PoemDisplay.vue # 诗歌显示组件
│   │   ├── PoemImage.vue   # 诗歌配图组件
│   │   ├── AnswerOptions.vue # 答案选项组件
│   │   └── FeedbackDialog.vue # 反馈对话框组件
│   ├── config/             # 配置文件
│   │   ├── app.ts          # 应用配置
│   │   └── firebase.ts     # Firebase配置
│   ├── locales/            # 国际化文件
│   │   ├── zh-CN.ts        # 中文翻译
│   │   ├── en.ts           # 英文翻译
│   │   ├── fr.ts           # 法文翻译
│   │   ├── de.ts           # 德文翻译
│   │   ├── ja.ts           # 日文翻译
│   │   └── es.ts           # 西班牙文翻译
│   ├── router/             # 路由配置
│   │   └── index.ts        # 路由定义
│   ├── stores/             # 状态管理 (Pinia)
│   │   ├── user.ts         # 用户状态管理
│   │   ├── poem.ts         # 诗歌状态管理
│   │   └── music.ts        # 音乐状态管理
│   ├── types/              # TypeScript类型定义
│   │   ├── index.ts        # 全局类型定义
│   │   ├── poem.d.ts       # 诗歌相关类型
│   │   └── user.d.ts       # 用户相关类型
│   ├── utils/              # 工具函数库
│   │   ├── helpers.ts      # 通用辅助函数
│   │   ├── logger.ts       # 日志工具
│   │   ├── poemData.ts     # 诗歌数据处理工具
│   │   ├── resourceChecker.ts    # 资源检查工具
│   │   ├── resourceLoader.ts     # 资源加载工具
│   │   ├── poemTranslation.ts    # 诗歌翻译工具
│   │   ├── sentenceTranslation.ts # 句子翻译工具
│   │   ├── optionsGenerator.ts   # 选项生成器
│   │   ├── randomPoemSelector.ts # 随机诗歌选择器
│   │   └── poem.ts         # 诗歌相关工具函数
│   ├── services/           # 服务层
│   │   ├── authApi.ts      # 认证API服务（支持Firebase）
│   │   └── firebaseAuth.ts # Firebase认证服务
│   ├── views/              # 页面组件
│   │   ├── LoginView.vue   # 登录页面
│   │   ├── QuizView.vue    # 游戏主页面
│   │   ├── SettingsView.vue # 设置页面
│   │   ├── AchievementView.vue # 成就页面
│   │   └── ComponentsView.vue  # 组件展示页面
│   ├── App.vue             # 根组件
│   ├── main.ts             # 应用入口文件
│   └── vite-env.d.ts       # Vite环境类型定义
│
├── tests/                  # 测试文件
│   ├── components/         # 组件测试
│   ├── utils/              # 工具函数测试
│   ├── views/              # 页面测试
│   ├── stores/             # 状态管理测试
│   ├── services/           # 服务测试
│   ├── router/             # 路由测试
│   ├── mocks/              # mock数据
│   ├── models/             # 测试模型
│   ├── setup.ts            # 测试配置
│   ├── README.md           # 测试说明文档
│   ├── verify-fetch.mjs    # 数据验证脚本
│   └── poemTest.mjs        # 诗歌测试脚本
│
├── server/                 # 后端服务
│   ├── server.js           # 服务入口
│   ├── api/                # 接口实现
│   ├── data/               # 数据文件
│   ├── config/             # 配置文件
│   └── middleware/         # 中间件
│
├── coverage/               # 测试覆盖率报告
├── dist/                   # 构建输出目录
├── test-logs/              # 测试日志
├── .vscode/                # VSCode配置
├── .cursor/                # Cursor编辑器配置
├── .git/                   # Git版本控制
├── node_modules/           # 依赖包
│
├── .eslintrc.cjs           # ESLint配置
├── .prettierrc             # Prettier配置
├── .gitignore              # Git忽略文件
├── index.html              # HTML模板
├── package.json            # 项目依赖配置
├── package-lock.json       # 依赖锁定文件
├── tailwind.config.js      # TailwindCSS配置
├── postcss.config.js       # PostCSS配置
├── tsconfig.json           # TypeScript配置
├── tsconfig.node.json      # Node专用TS配置
├── vite.config.ts          # Vite构建配置
├── capacitor.config.ts     # Capacitor移动应用配置
├── components.d.ts         # 组件自动导入类型
└── README.md               # 项目说明文档
```

## 技术栈

### 前端技术
- **框架**: Vue 3 (Composition API + \<script setup\>)
- **类型系统**: TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **样式**: TailwindCSS + PostCSS
- **国际化**: Vue I18n
- **移动端打包**: Capacitor
- **组件自动导入**: unplugin-auto-import + unplugin-vue-components
- **数据存储**: localStorage (本地存储模式)
- **认证服务**: Firebase Authentication

### 测试技术
- **测试框架**: Vitest
- **组件测试**: Vue Test Utils
- **覆盖率**: c8/vitest coverage
- **E2E测试**: 自定义验证脚本

### 开发工具
- **代码格式化**: Prettier
- **代码检查**: ESLint
- **编辑器**: VSCode / Cursor
- **版本控制**: Git

### 后期技术栈（P2）
- **后端框架**: Express.js
- **数据库**: SQLite/MySQL
- **认证**: JWT Token + Firebase UID
- **API**: RESTful

## 核心功能模块

### 1. 用户管理系统
**文件位置**: `src/stores/user.ts`, `src/types/user.d.ts`
- 本地用户状态管理
- 分数记录与等级系统
- 语言偏好设置
- 本地存储集成
- Firebase用户认证集成

### 2. 认证系统（Firebase集成 - 重构版）
**文件位置**: `src/services/authApi.ts`, `src/services/firebaseAuth.ts`, `src/config/firebase.ts`, `server/api/auth.js`

#### Firebase配置（不变）
- **项目名称**: poem2guess
- **项目ID**: poem2guess-8d19f
- **Web API Key**: AIzaSyCHt0r0EgWVt7xhOZS_piykzBcTSjKexek
- **Auth Domain**: poem2guess-8d19f.firebaseapp.com
- **支持的登录方式**: Google账号登录

#### 重构后的认证架构
经过重构后，认证系统采用了更简洁清晰的架构：

**🎯 核心原则**
1. **Google登录**: 统一使用Firebase ID Token进行认证
2. **环境区分**: 开发环境支持测试模式，生产环境仅支持真实认证
3. **简化配置**: 移除复杂的Mock/Real API模式切换
4. **错误处理**: 完善的错误捕获和用户友好提示

#### 认证流程（简化版）
1. **前端Firebase认证**: 用户点击Google登录，通过Firebase弹窗完成认证
2. **获取ID Token**: 前端获取Firebase ID Token（JWT格式）
3. **后端验证**: 后端使用Firebase Admin SDK验证ID Token
4. **用户存储**: 验证成功后在数据库中创建/更新用户记录
5. **JWT返回**: 返回应用自己的JWT Token供后续API调用使用

#### 技术实现（重构版）

**前端Firebase服务 (`src/services/firebaseAuth.ts`)**
```typescript
export class FirebaseAuthService {
  async signInWithGoogle(): Promise<FirebaseAuthResult> {
    const result = await signInWithPopup(auth, googleProvider)
    const accessToken = await result.user.getIdToken() // Firebase ID Token
    return {
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      },
      accessToken // 这是Firebase ID Token
    }
  }
}
```

**前端认证API (`src/services/authApi.ts`)**
```typescript
// Google登录直接使用Firebase ID Token
if (provider === 'google') {
  const firebaseResult = await firebaseAuth.signInWithGoogle()
  accessToken = firebaseResult.accessToken // Firebase ID Token
  firebaseUid = firebaseResult.user.uid
}

// 发送到后端
await fetch(`${this.baseUrl}/auth/login`, {
  method: 'POST',
  body: JSON.stringify({
    provider: 'google',
    access_token: accessToken, // Firebase ID Token
    firebase_uid: firebaseUid
  })
})
```

**后端认证API (`server/api/auth.js` - 重构版)**
```typescript
// 简化的Firebase认证验证
async function verifyFirebaseToken(firebaseIdToken) {
  const firebaseUser = await firebaseAuthService.verifyIdToken(firebaseIdToken)
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    name: firebaseUser.name || firebaseUser.email?.split('@')[0],
    picture: firebaseUser.picture,
    provider: 'google'
  }
}

// 认证逻辑
if (provider === 'google') {
  if (process.env.NODE_ENV === 'development' && access_token.includes('test_')) {
    // 开发环境测试模式
    authUser = await mockAuthentication(provider, access_token)
  } else {
    // 使用Firebase验证真实Google登录
    authUser = await verifyFirebaseToken(access_token)
  }
}
```

#### 环境配置（简化版）
**开发环境**: 
- Google登录: 支持真实Firebase认证 + 测试token模式
- 其他provider: 仅支持测试token模式

**生产环境**:
- Google登录: 仅支持真实Firebase认证
- 其他provider: 暂不支持（返回错误提示）

#### 测试工具（更新版）
- **测试页面**: `public/test-firebase-auth.html`
- **功能**: 端到端Firebase认证测试、ID Token获取、后端API验证
- **访问地址**: `http://localhost:3000/test-firebase-auth.html`
- **测试覆盖**: Firebase登录 → ID Token获取 → 后端验证 → 用户创建/更新

#### 重构优势
1. **架构清晰**: 移除了复杂的Mock服务文件和配置切换
2. **代码简洁**: 认证逻辑集中在单个文件中，易于维护
3. **错误处理**: 统一的错误处理和用户友好提示
4. **开发友好**: 保留测试模式，支持开发调试
5. **生产就绪**: 生产环境配置简单可靠

#### 故障排除
如果遇到认证问题，请检查：
1. **Firebase配置**: 确认API Key和项目ID正确
2. **网络连接**: 确认能访问Firebase服务
3. **Token格式**: 确认传递的是Firebase ID Token而非Access Token
4. **环境模式**: 开发环境可以使用`test_google_token`进行测试
5. **服务器日志**: 查看`server/logs/`目录下的错误日志

### 3. 诗歌管理系统
**文件位置**: `src/stores/poem.ts`, `src/utils/poem*.ts`
- 多语言诗歌数据加载
- 随机诗歌选择
- 翻译系统集成
- 答案选项生成
- 难度等级管理

### 4. 音乐管理系统
**文件位置**: `src/stores/music.ts`

#### 功能概述
为应用提供沉浸式的古典背景音乐体验，支持自动播放、手动切换和状态控制。

#### 音乐文件
位置：`public/backgroundmusic/` 目录，包含8首古典音乐：
1. 古韵绵长.mp3
2. 关山月.mp3  
3. 黄鹤归来.mp3
4. 将进酒.mp3
5. The Moon's Whisper.mp3
6. The Winter's Embrace(白雪歌送武判官归京).mp3
7. The Winds of War(轮台歌奉送封大夫出师西征).mp3
8. Longing in Chang'an.mp3

#### 核心特性
- **智能播放控制**：登录页默认静音，主页面默认开启
- **连续播放**：音乐结束后自动随机选择下一首
- **暂停恢复**：支持从暂停位置继续播放，而非重新开始
- **浏览器兼容**：处理自动播放限制和用户交互要求
- **错误处理**：音乐加载失败时自动切换到下一首

#### 技术实现

**状态管理 (`src/stores/music.ts`)**
```typescript
export const useMusicStore = defineStore('music', () => {
  const isPlaying = ref(false)
  const isMuted = ref(true)  // 默认静音
  const currentMusicIndex = ref(0)
  const volume = ref(0.5)
  const isAudioEnabled = ref(false)
  
  // 启动登录页面音乐（固定第一首，默认静音）
  const startBackgroundMusic = () => {
    currentMusicIndex.value = 0
    playMusic()
  }
  
  // 启动主页面音乐（随机选择，默认开启）
  const startMainPageMusic = () => {
    isMuted.value = false
    currentMusicIndex.value = Math.floor(Math.random() * musicFiles.length)
    playMusic()
  }
  
  // 暂停后恢复播放（保持播放位置）
  const resumeMusic = () => {
    if (audioElement.value && !audioElement.value.paused) return
    if (audioElement.value) {
      audioElement.value.play()
      isPlaying.value = true
    }
  }
  
  // 切换静音状态（使用恢复播放）
  const toggleMute = () => {
    isMuted.value = !isMuted.value
    if (!isMuted.value) {
      resumeMusic()  // 恢复播放而非重新开始
    } else {
      pauseMusic()
    }
  }
  
  return {
    startBackgroundMusic,
    startMainPageMusic,
    resumeMusic,
    toggleMute,
    nextMusic
  }
})
```

**使用方法**
```typescript
// 在登录页面
const musicStore = useMusicStore()
musicStore.startBackgroundMusic()  // 固定第一首，默认静音

// 在主页面  
musicStore.startMainPageMusic()    // 随机音乐，默认开启

// 控制音乐
musicStore.toggleMute()            // 切换播放/暂停（保持播放位置）
musicStore.nextMusic()             // 手动切换下一首（立即切换）
```

#### 播放逻辑优化
- **自动播放**：音乐自然结束时，随机选择下一首音乐无缝播放
- **手动切换**：用户主动切换时立即响应，确保交互体验
- **连续性保证**：避免音乐播放中的生硬中断，提供流畅的听觉体验
- **暂停恢复优化**：音效开关实现真正的暂停/恢复，提升用户体验

#### 用户交互设计
1. **登录界面**：固定播放第一首音乐，默认静音，用户可手动开启
2. **主页面**：随机选择音乐，默认开启，提供换音乐按钮
3. **设置页面**：背景音乐开关控制

### 5. 游戏逻辑系统
**文件位置**: `src/utils/optionsGenerator.ts`, `src/components/AnswerOptions.vue`
- 答案选项智能生成
- 分数计算逻辑
- 难度自适应调整
- 反馈机制

### 6. 成就系统
**文件位置**: `src/views/AchievementView.vue`, `src/stores/user.ts`
- 古代学级称号展示
- 分数进度追踪
- 等级说明和介绍
- 成就反馈机制

## 命名规范

### 文件命名

1. **组件文件**：使用PascalCase（大驼峰）命名，如`AppHeader.vue`、`PoemDisplay.vue`
2. **工具函数和模块**：使用camelCase（小驼峰）命名，如`helpers.ts`、`poemData.ts`
3. **类型定义文件**：使用camelCase，如`index.ts`、`poem.d.ts`
4. **视图组件**：使用PascalCase并添加View后缀，如`LoginView.vue`、`QuizView.vue`
5. **状态管理文件**：使用camelCase，如`user.ts`、`poem.ts`
6. **服务文件**：使用camelCase，如`authApi.ts`、`firebaseAuth.ts`
7. **配置文件**：使用camelCase，如`app.ts`、`firebase.ts`

### 测试文件命名

1. 测试文件使用与被测文件相同的名称，但添加`.spec.ts`或`.test.ts`后缀
2. 例如：组件`PoemDisplay.vue`的测试文件为`PoemDisplay.spec.ts`

### 组件命名

1. **基础组件**：使用`Base`前缀，如`BaseButton`、`BaseCard`
2. **布局组件**：使用`App`前缀，如`AppHeader`、`AppFooter`
3. **业务组件**：使用具有描述性的名称，如`PoemDisplay`、`AnswerOptions`
4. **页面组件**：使用具有描述性的名称加`View`后缀，如`SettingsView`

### CSS类命名

1. 使用TailwindCSS工具类优先
2. 自定义类使用kebab-case（短横线）命名
3. 组件作用域样式使用BEM命名规范

## 开发规范

### 1. Vue组件开发
- **API风格**: 统一使用组合式API（Composition API）
- **语法糖**: 使用`<script setup>`语法
- **类型安全**: 为所有props、emits、refs定义TypeScript类型
- **响应式**: 优先使用`ref`和`reactive`进行状态管理

### 2. 状态管理
- **Store结构**: 使用Pinia，按功能模块划分store
- **命名规范**: store文件使用camelCase，如`useUserStore`
- **持久化**: 关键状态使用localStorage持久化
- **类型定义**: 为所有store状态定义TypeScript接口

### 3. 路由管理
- **路由配置**: 集中在`src/router/index.ts`
- **路由守卫**: 实现认证检查和权限控制
- **懒加载**: 页面组件使用动态导入
- **滚动行为**: 配置平滑滚动和位置恢复

### 4. 国际化
- **文件组织**: 按语言代码组织翻译文件
- **键命名**: 使用点分层级结构，如`settings.language`
- **类型安全**: 使用TypeScript确保翻译键的类型安全

### 5. 工具函数开发
- **纯函数**: 优先编写无副作用的纯函数
- **模块化**: 按功能分组，便于测试和维护
- **错误处理**: 实现完善的异常捕获和处理机制
- **性能优化**: 对计算密集型函数进行优化

### 6. 认证服务开发
- **服务分离**: Firebase认证服务与通用认证API分离
- **错误处理**: 针对Firebase特定错误提供友好提示
- **状态同步**: 确保Firebase状态与本地状态同步
- **兼容性**: 支持Mock模式和真实API模式切换

## 测试规范

### 1. 测试文件结构
```
tests/
├── components/     # 组件测试
├── stores/         # 状态管理测试
├── utils/          # 工具函数测试
├── views/          # 页面组件测试
├── services/       # 服务层测试（包括Firebase）
├── router/         # 路由测试
├── mocks/          # 模拟数据
├── models/         # 测试模型
└── setup.ts        # 测试配置
```

### 2. 测试类型
- **单元测试**: 工具函数、纯逻辑组件
- **组件测试**: Vue组件的渲染和交互
- **集成测试**: Store与组件的集成
- **E2E测试**: 关键用户流程
- **Firebase测试**: 认证流程和状态管理

### 3. 测试覆盖率目标
- **总体覆盖率**: 目标达到80%以上
- **关键模块**: stores、services、utils目录达到90%以上
- **组件测试**: 核心业务组件达到85%以上

### 4. Mock策略
- **API调用**: 使用MSW模拟HTTP请求
- **外部依赖**: 模拟音频、图片等资源加载
- **浏览器API**: 模拟localStorage、sessionStorage等
- **Firebase模拟**: 模拟Firebase认证服务

## 代码质量控制

### 1. ESLint配置
- 基于Vue 3 + TypeScript推荐配置
- 自定义规则确保代码一致性
- 集成Prettier避免格式冲突

### 2. TypeScript配置
- 严格模式开启
- 路径别名配置
- 自动类型导入

### 3. Git工作流
- **分支策略**: GitFlow模式
- **提交规范**: 约定式提交（Conventional Commits）
- **代码审查**: Pull Request必须经过审查

## 性能优化

### 1. 构建优化
- **代码分割**: 按路由和组件进行分割
- **资源压缩**: 图片、音频文件优化
- **缓存策略**: 合理配置浏览器缓存

### 2. 运行时优化
- **懒加载**: 图片、音频资源按需加载
- **虚拟滚动**: 长列表使用虚拟滚动
- **防抖节流**: 用户输入事件优化

### 3. 移动端优化
- **响应式设计**: 使用TailwindCSS响应式类
- **触摸优化**: 触摸事件和手势支持
- **性能监控**: 关键性能指标监控

## 部署配置

### 1. 开发环境
```bash
npm run dev          # 开发服务器
npm run test         # 运行测试
npm run coverage     # 生成覆盖率报告
```

### 2. 生产构建
```bash
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
```

### 3. 移动应用
```bash
npx cap add ios      # 添加iOS平台
npx cap add android  # 添加Android平台
npx cap run ios      # 运行iOS应用
npx cap run android  # 运行Android应用
```

## 提交规范

### 1. 提交信息格式
使用约定式提交（Conventional Commits）规范：
- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档变更
- `style:` 代码格式变更（不影响代码含义）
- `refactor:` 代码重构（既不是新增功能，也不是修复bug）
- `test:` 测试相关
- `chore:` 构建过程或辅助工具变动
- `perf:` 性能优化

### 2. 示例
```
feat: 集成Firebase Google登录认证
fix: 修复音乐播放状态同步问题
docs: 更新Firebase集成开发规范
test: 添加Firebase认证服务测试用例
```

### 3. 分支管理
- `main`: 主分支，保持稳定，用于生产发布
- `develop`: 开发分支，集成最新开发功能
- `feature/*`: 功能分支，开发新功能
- `fix/*`: 修复分支，修复线上问题
- `hotfix/*`: 热修复分支，紧急修复

## 项目维护

### 1. 依赖管理
- 定期更新依赖包到最新稳定版本
- 使用`npm audit`检查安全漏洞
- 保持package-lock.json与package.json同步
- 关注Firebase SDK版本更新

### 2. 代码审查清单
- [ ] 代码符合项目编码规范
- [ ] 新功能包含相应测试用例
- [ ] TypeScript类型定义完整
- [ ] 组件可复用性良好
- [ ] 性能影响在可接受范围
- [ ] 移动端兼容性良好
- [ ] Firebase集成正确处理错误

### 3. 发布流程
1. 功能开发完成并通过测试
2. 创建Pull Request到develop分支
3. 代码审查通过后合并
4. 在develop分支进行集成测试
5. 合并到main分支并打标签发布

## 3rd Party

### 1. Google Firebase Authentication
1. Firebase项目名称: poem2guess
2. Firebase项目ID: poem2guess-8d19f
3. Firebase Web API Key: AIzaSyCHt0r0EgWVt7xhOZS_piykzBcTSjKexek
4. Firebase已集成到Vue项目: npm install firebase
5. Firebase测试页面: `public/test-firebase.html`
6. 支持的认证方式: Google账号登录
7. 认证域名: poem2guess-8d19f.firebaseapp.com

### 2. Firebase Hosting（可选）
1. 安装Firebase CLI工具: npm install firebase-tools
2. 初始化Firebase Hosting: firebase init hosting
3. 部署到Firebase: firebase deploy
