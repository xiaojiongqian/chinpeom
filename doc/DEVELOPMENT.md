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
│   └── test-resume-music.html    # 音乐恢复测试页面
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
│   │   ├── poemData.ts     # 诗歌数据处理工具
│   │   ├── resourceChecker.ts    # 资源检查工具
│   │   ├── resourceLoader.ts     # 资源加载工具
│   │   ├── poemTranslation.ts    # 诗歌翻译工具
│   │   ├── sentenceTranslation.ts # 句子翻译工具
│   │   ├── optionsGenerator.ts   # 选项生成器
│   │   ├── randomPoemSelector.ts # 随机诗歌选择器
│   │   └── poem.ts         # 诗歌相关工具函数
│   ├── services/           # 服务层（P2后期实现）
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
│   ├── services/           # 服务测试（P2后期实现）
│   ├── router/             # 路由测试
│   ├── mocks/              # mock数据
│   ├── models/             # 测试模型
│   ├── setup.ts            # 测试配置
│   ├── README.md           # 测试说明文档
│   ├── verify-fetch.mjs    # 数据验证脚本
│   └── poemTest.mjs        # 诗歌测试脚本
│
├── server/                 # 后端服务（P2后期实现）
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
- **认证**: JWT Token
- **API**: RESTful

## 核心功能模块

### 1. 用户管理系统
**文件位置**: `src/stores/user.ts`, `src/types/user.d.ts`
- 本地用户状态管理
- 分数记录与等级系统
- 语言偏好设置
- 本地存储集成
- 用户认证（P2后期实现）

### 2. 诗歌管理系统
**文件位置**: `src/stores/poem.ts`, `src/utils/poem*.ts`
- 多语言诗歌数据加载
- 随机诗歌选择
- 翻译系统集成
- 答案选项生成
- 难度等级管理

### 3. 音乐管理系统
**文件位置**: `src/stores/music.ts`
- 背景音乐播放控制
- 音效开关管理
- 音乐文件动态加载
- 播放状态持久化

### 4. 游戏逻辑系统
**文件位置**: `src/utils/optionsGenerator.ts`, `src/components/AnswerOptions.vue`
- 答案选项智能生成
- 分数计算逻辑
- 难度自适应调整
- 反馈机制

### 5. 成就系统
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

## 测试规范

### 1. 测试文件结构
```
tests/
├── components/     # 组件测试
├── stores/         # 状态管理测试
├── utils/          # 工具函数测试
├── views/          # 页面组件测试
├── services/       # 服务层测试
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

### 3. 测试覆盖率目标
- **总体覆盖率**: 目标达到80%以上
- **关键模块**: stores、utils目录达到90%以上
- **组件测试**: 核心业务组件达到85%以上

### 4. Mock策略
- **API调用**: 使用MSW模拟HTTP请求
- **外部依赖**: 模拟音频、图片等资源加载
- **浏览器API**: 模拟localStorage、sessionStorage等

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
feat: 添加设置页面紧凑布局选项
fix: 修复音乐播放状态同步问题
docs: 更新开发规范文档
test: 添加用户状态管理测试用例
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

### 2. 代码审查清单
- [ ] 代码符合项目编码规范
- [ ] 新功能包含相应测试用例
- [ ] TypeScript类型定义完整
- [ ] 组件可复用性良好
- [ ] 性能影响在可接受范围
- [ ] 移动端兼容性良好

### 3. 发布流程
1. 功能开发完成并通过测试
2. 创建Pull Request到develop分支
3. 代码审查通过后合并
4. 在develop分支进行集成测试
5. 合并到main分支并打标签发布 