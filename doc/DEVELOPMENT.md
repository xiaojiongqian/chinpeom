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
│   │   │   ├── poem_spanish.json   # 西班牙文翻译数据
│   │   │   ├── poem_stories_chinese.json   # 中文诗歌故事数据
│   │   │   ├── poem_stories_english.json   # 英文诗歌故事数据
│   │   │   ├── poem_stories_french.json    # 法文诗歌故事数据
│   │   │   ├── poem_stories_german.json    # 德文诗歌故事数据
│   │   │   ├── poem_stories_japanese.json  # 日文诗歌故事数据
│   │   │   └── poem_stories_spanish.json   # 西班牙文诗歌故事数据
│   │   ├── poem_images/    # 诗歌配图目录
│   │   └── sound/          # 诗歌音效目录（暂时不使用）
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
│   │   ├── FeedbackDialog.vue # 反馈对话框组件
│   │   └── PoemDetailDialog.vue # 诗歌详情对话框组件
│   ├── config/             # 配置文件
│   │   ├── app.ts          # 应用配置
│   │   ├── firebase.ts     # Firebase配置
│   │   └── analytics.ts    # Firebase Analytics配置
│   ├── locales/            # 国际化文件
│   │   ├── zh.ts           # 中文翻译
│   │   ├── en.ts           # 英文翻译
│   │   ├── es.ts           # 西班牙文翻译
│   │   ├── ja.ts           # 日文翻译
│   │   ├── fr.ts           # 法文翻译
│   │   └── de.ts           # 德文翻译
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
│   │   ├── firebaseAuth.ts # Firebase认证服务
│   │   └── llmApi.ts       # LLM服务
│   ├── views/              # 页面组件
│   │   ├── LoginView.vue   # 登录页面
│   │   ├── QuizView.vue    # 游戏主页面
│   │   ├── SettingsView.vue # 设置页面
│   │   ├── AchievementView.vue # 成就页面
│   │   ├── PoemDetailView.vue # 诗歌详情页面
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
- **国际化**: Vue I18n (支持中文、英语、西班牙语、日语、法语、德语)
- **移动端打包**: Capacitor
- **组件自动导入**: unplugin-auto-import + unplugin-vue-components
- **数据存储**: localStorage (本地存储模式)
- **认证服务**: Firebase Authentication (Apple, Google, Twitter/X)
- **数据分析**: Firebase Analytics (用户行为追踪)

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
- 分数记录与等级系统（免费用户限制至学童25分）
- 统一语言设置：界面语言与诗歌提示语言复用同一UI控件
- 中文模式特殊处理：简单模式下提示语言为'english'，困难模式为'none' (显示星号)。
- 默认语言检测：中文浏览器默认中文+简单模式。
- 本地存储集成
- Firebase用户认证集成（Apple, Google, Twitter/X）
- Firebase Analytics用户行为追踪

### 2. 认证系统（Firebase集成 - 重构版）
**文件位置**: `src/services/authApi.ts`, `src/services/firebaseAuth.ts`, `src/config/firebase.ts`, `server/api/auth.js`

#### Firebase配置（更新版）
- **项目名称**: poem2guess
- **项目ID**: poem2guess-8d19f
- **Web API Key**: AIzaSyCHt0r0EgWVt7xhOZS_piykzBcTSjKexek
- **Auth Domain**: poem2guess-8d19f.firebaseapp.com
- **支持的登录方式**: Apple Sign-In, Google OAuth, Twitter/X API
- **Analytics**: 用户行为分析与关键动作埋点

#### 重构后的认证架构
经过重构后，认证系统采用了更简洁清晰的架构：

**🎯 核心原则**
1. **多平台登录**: Apple Sign-In, Google OAuth, Twitter/X API统一使用Firebase ID Token认证
2. **环境区分**: 开发环境支持测试模式，生产环境仅支持真实认证
3. **简化配置**: 移除复杂的Mock/Real API模式切换
4. **错误处理**: 完善的错误捕获和用户友好提示
5. **数据分析**: Firebase Analytics集成，关键用户行为埋点

#### 认证流程（多平台版）
1. **前端Firebase认证**: 用户选择Apple/Google/Twitter登录，通过Firebase弹窗完成认证
2. **获取ID Token**: 前端获取Firebase ID Token（JWT格式）
3. **后端验证**: 后端使用Firebase Admin SDK验证ID Token
4. **用户存储**: 验证成功后在数据库中创建/更新用户记录
5. **JWT返回**: 返回应用自己的JWT Token供后续API调用使用
6. **Analytics埋点**: 记录用户登录行为和平台来源

#### 技术实现要点
- **多平台支持**: 集成Apple Sign-In、Google OAuth、Twitter/X API三种登录方式
- **Firebase集成**: 使用Firebase Authentication进行用户身份验证和ID Token生成
- **后端验证**: 使用Firebase Admin SDK验证前端传递的ID Token
- **Analytics集成**: 登录成功时记录用户行为数据和登录平台来源
- **开发模式**: 支持测试token模式，便于开发调试
- **错误处理**: 完善的错误捕获机制和用户友好提示
- **状态同步**: Firebase认证状态与本地用户状态保持同步

#### 环境配置（多平台版）
**开发环境**: 
- Apple/Google/Twitter登录: 支持真实Firebase认证 + 测试token模式
- Firebase Analytics: 开发模式，详细日志记录

**生产环境**:
- Apple/Google/Twitter登录: 仅支持真实Firebase认证
- Firebase Analytics: 生产模式，用户行为数据收集

#### 测试工具（精简版）
- **主要测试页面**: `public/test-firebase-auth.html` - Firebase认证端到端测试
- **登录流程诊断**: `public/test-login-flow.html` - 登录问题诊断工具
- **简化认证测试**: `public/test-simple-auth.html` - 快速认证测试
- **音乐功能测试**: `public/test-music-debug.html` - 音乐播放调试
- **音乐暂停测试**: `public/test-resume-music.html` - 暂停/恢复功能测试
- **访问地址**: `http://localhost:3000/test-*.html`

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
**注意**：暂时不使用音效功能，所有音频控制均针对背景音乐。

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

#### 技术实现要点
- **状态管理**: 使用Pinia管理音乐播放状态、音量控制和当前曲目
- **智能播放**: 登录页面固定第一首音乐且默认静音，主页面随机选择且默认开启
- **暂停恢复**: 支持从暂停位置继续播放，避免重新开始造成的体验中断
- **自动切换**: 音乐自然结束后随机选择下一首，保持连续播放体验
- **手动控制**: 提供独立的播放/暂停开关和手动切换下一首功能
- **浏览器兼容**: 处理不同浏览器的自动播放限制和用户交互要求

#### 播放逻辑优化
- **自动播放**：音乐自然结束时，随机选择下一首音乐无缝播放
- **手动切换**：用户主动切换时立即响应，确保交互体验
- **连续性保证**：避免音乐播放中的生硬中断，提供流畅的听觉体验
- **暂停恢复优化**：音效开关实现真正的暂停/恢复，提升用户体验

#### 用户交互设计
1. **登录界面**：固定播放第一首音乐，默认静音，用户可手动开启背景音乐
2. **主页面**：随机选择音乐，默认开启，提供两个独立按钮：
   - 背景音乐开关按钮：控制播放/暂停（保持播放位置）
   - 背景音乐切换按钮：切换到下一首音乐
3. **设置页面**：背景音乐开关控制，状态与主界面同步
4. **音效移除**：暂时不使用音效功能，音频控制专注于背景音乐

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
- 付费边界处理：25分时显示学童并立即弹出付费提示

### 7. 语言逻辑系统
**文件位置**: `src/stores/user.ts`, `src/locales/`, `src/utils/language.ts`

#### 功能概述
- 统一语言设置：界面语言与诗歌提示语言使用同一个语言选择器
- 中文模式特殊处理：支持简单/困难模式，简单模式使用英文提示。
- 浏览器语言检测：自动设置合适的默认语言和模式
- 数据存储：中文模式下，简单模式提示语言字段为'english'，困难模式为'none'。

#### 实现要点
- **语言切换**: 用户选择语言时同时设置界面语言和提示语言
- **中文模式限制**: 用户可在简单/困难模式间自由切换
- **UI状态管理**: 难度模式选择器始终可用
- **默认值检测**: 根据浏览器语言智能设置初始语言和难度
- **无缝切换**: 语言切换时系统自动处理模式调整

### 8. 诗歌详情与AI对话系统
**文件位置**: `src/views/PoemDetailView.vue`, `src/components/PoemDetailDialog.vue`, `src/services/llmApi.ts`, `public/resource/data/poem_stories_*.json`
- **功能概述**: 在答题页点击诗歌可进入详情页，查看诗歌的详细解读（如典故、背景），并与AI进行对话，深入了解诗歌内涵。
- **诗歌详情**:
    - 加载并展示对应诗歌的背景、典故等信息。
    - 内容支持多语言，根据用户设置的界面语言显示。
- **AI对话**:
    - 集成DeepSeek LLM服务，提供智能问答功能。
    - 用户可通过输入框提问，或点击预设的动态问题按钮快速提问。
    - 对话历史会呈现在详情内容下方。
- **技术实现**:
    - 前端通过`PoemDetailView.vue`作为独立页面承载，便于路由和返回。
    - `PoemDetailDialog.vue`负责展示详情和处理对话交互。
    - `llmApi.ts`服务封装对DeepSeek API的请求逻辑。

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

### 4. 国际化（多语言架构）
- **支持语言**: 中文、英语、西班牙语、日语、法语、德语
- **文件组织**: 按语言代码组织翻译文件（zh.ts, en.ts, es.ts, ja.ts, fr.ts, de.ts）
- **统一语言设置**: 界面语言与诗歌提示语言使用同一个UI控件，无需分离
- **中文特殊逻辑**: 
  * 中文模式下支持简单和困难两种模式。
  * 简单模式使用英文作为提示语言。
  * 困难模式使用星号作为提示。
- **默认语言检测**: 
  * 中文浏览器：默认中文模式+简单模式
  * 非中文浏览器：默认对应语言+简单模式
- **键命名**: 使用点分层级结构，如`settings.language`, `difficulty.mode`
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

## 项目状态概览

### 当前完成度
- **核心游戏功能**: 100%完成
- **用户系统**: 100%完成  
- **音乐系统**: 100%完成（音效功能暂时移除）
- **成就系统**: 100%完成
- **中文模式逻辑**: 已调整
- **测试覆盖率**: 47.75%
- **国际化架构**: 需要更新为6语言版本

### 等级系统
- 白丁 (0-10分) - 免费
- 学童 (11-25分) - 免费 (免费用户上限)
- 秀才 (26-45分) - 需要付费 (付费门槛)
- 廪生至状元 (46-341+分) - 付费

## 3rd Party

### 1. Firebase配置
- **项目名称**: poem2guess
- **项目ID**: poem2guess-8d19f  
- **Web API Key**: AIzaSyCHt0r0EgWVt7xhOZS_piykzBcTSjKexek
- **Auth Domain**: poem2guess-8d19f.firebaseapp.com
- **支持认证**: Apple Sign-In, Google OAuth, Twitter/X API
- **Analytics**: 用户行为分析和关键动作埋点
- **SSO功能**: 检测浏览器登录状态，支持一键登录

### 2. 多语言架构
- **界面语言**: 中文、英语、西班牙语、日语、法语、德语
- **语言设置**: 界面语言与诗歌提示语言使用统一的语言选择器
- **中文特殊性**: 中文模式下支持简单（英文提示）和困难（星号提示）两种模式。
- **自动检测**: 中文浏览器默认中文+简单模式，非中文浏览器默认对应语言+简单模式
- **困难模式**: 界面语言保持，诗歌提示显示星号（中文模式下困难模式始终如此）
- **UI标注**: 移除"仅困难模式"的特殊标注

### 3. 音乐系统
- **背景音乐**: 8首古典音乐自动轮播
- **智能控制**: 登录页默认静音，主页面默认开启
- **暂停恢复**: 支持从暂停位置继续播放
- **浏览器兼容**: 处理自动播放限制

### 4. 部署配置
- **Firebase部署**: 使用Firebase CLI工具进行项目初始化和部署
- **移动应用打包**: 使用Capacitor添加iOS/Android平台支持
- **同步更新**: 支持代码同步到移动平台并运行测试
- **构建优化**: 针对不同平台的资源优化和性能调整
