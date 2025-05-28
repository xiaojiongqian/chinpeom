# 唐诗译境（Chinpoem）开发规范文档

## 目录结构

```
├── doc/                    # 项目文档
│   ├── progress.md         # 项目进度规划
│   └── PRD.md              # 产品需求文档
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
│   │   ├── poem_images/    # 诗歌配图目录
│   │   └── sound/          # 诗歌音频目录
│
├── src/                    # 源代码
│   ├── assets/             # 项目资源文件
│   │   ├── main.css        # 全局样式
│   │   └── theme.css       # 主题样式
│   ├── components/         # UI组件
│   │   ├── common/         # 通用组件
│   │   │   ├── BaseButton.vue
│   │   │   ├── BaseCard.vue
│   │   │   ├── BaseInput.vue
│   │   └── layout/         # 布局组件
│   │       ├── AppHeader.vue
│   │       ├── AppFooter.vue
│   │       ├── MainLayout.vue
│   │   ├── PoemDisplay.vue # 业务组件示例
│   │   ├── PoemImage.vue
│   │   ├── AnswerOptions.vue
│   │   ├── FeedbackDialog.vue
│   ├── locales/            # 国际化文件
│   │   ├── zh-CN.ts        # 中文翻译
│   │   ├── en.ts           # 英文翻译
│   │   ├── fr.ts           # 法文翻译
│   │   ├── de.ts           # 德文翻译
│   │   ├── ja.ts           # 日文翻译
│   │   ├── es.ts           # 西班牙文翻译
│   ├── router/             # 路由配置
│   │   └── index.ts        # 路由定义
│   ├── stores/             # 状态管理
│   │   ├── user.ts         # 用户状态
│   │   └── poem.ts         # 诗歌状态
│   ├── types/              # TypeScript类型定义
│   │   ├── index.ts        # 全局类型定义
│   │   ├── poem.d.ts       # 诗歌类型
│   │   └── user.d.ts       # 用户类型
│   ├── utils/              # 工具函数
│   │   ├── helpers.ts      # 辅助函数
│   │   ├── poemData.ts     # 诗歌数据工具
│   │   ├── resourceChecker.ts
│   │   ├── resourceLoader.ts
│   │   ├── poemTranslation.ts
│   │   ├── sentenceTranslation.ts
│   │   ├── optionsGenerator.ts
│   │   ├── randomPoemSelector.ts
│   │   └── poem.ts
│   ├── services/           # 服务层
│   ├── views/              # 页面组件
│   │   ├── HomeView.vue    # 首页
│   │   ├── LoginView.vue   # 登录页
│   │   ├── RegisterView.vue
│   │   ├── QuizView.vue
│   │   ├── SettingsView.vue
│   │   └── ComponentsView.vue
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
│
├── tests/                  # 测试文件
│   ├── components/         # 组件测试
│   ├── utils/              # 工具函数测试
│   ├── views/              # 页面测试
│   ├── stores/             # 状态管理测试
│   ├── services/           # 服务测试
│   ├── mocks/              # mock数据
│   ├── models/             # 测试模型
│   └── setup.ts            # 测试配置
│
├── server/                 # 后端服务（简要）
│   ├── server.js           # 服务入口
│   ├── api/                # 接口实现
│   ├── data/               # 数据文件
│   ├── config/             # 配置文件
│   └── middleware/         # 中间件
│
├── .eslintrc.js            # ESLint配置
├── .prettierrc             # Prettier配置
├── index.html              # HTML模板
├── package.json            # 项目依赖
├── tailwind.config.js      # TailwindCSS配置
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
├── capacitor.config.ts     # Capacitor配置
├── tsconfig.node.json      # Node专用TS配置
└── components.d.ts         # 组件自动导入类型
```

## 命名规范

### 文件命名

1. **组件文件**：使用PascalCase（大驼峰）命名，如`AppHeader.vue`、`PoemCard.vue`
2. **工具函数和模块**：使用camelCase（小驼峰）命名，如`helpers.ts`、`api.ts`
3. **类型定义文件**：使用camelCase，如`index.ts`
4. **视图组件**：使用PascalCase并添加View后缀，如`HomeView.vue`、`LoginView.vue`

### 测试文件命名

1. 测试文件使用与被测文件相同的名称，但添加`.spec.ts`或`.test.ts`后缀
2. 例如：组件`Button.vue`的测试文件为`Button.spec.ts`

### 组件命名

1. **基础组件**：使用`Base`前缀，如`BaseButton`、`BaseCard`
2. **布局组件**：使用具有描述性的名称，如`AppHeader`、`SideMenu`
3. **业务组件**：使用具有描述性的名称，如`PoemCard`、`ScoreDisplay`

### CSS类命名

1. 使用kebab-case（短横线）命名，如`poem-card`、`user-avatar`
2. 组件内部类名使用组件名作为前缀，避免冲突，如`poem-card__title`

## 开发规范

1. **组件开发**：采用组合式API（Composition API）和`<script setup>`语法
2. **类型定义**：为所有变量、函数参数和返回值定义TypeScript类型
3. **状态管理**：使用Pinia存储，遵循模块化原则
4. **路由管理**：使用Vue Router，按功能模块组织路由
5. **国际化**：使用Vue I18n，按功能模块组织翻译键

## 测试规范

1. **测试文件结构**：与源代码目录结构保持一致
2. **命名约定**：测试描述使用`describe`和`it`，清晰表达测试意图
3. **组件测试**：使用Vue Test Utils和Vitest进行组件测试
4. **测试覆盖率**：目标达到80%以上的测试覆盖率

## 提交规范

1. **提交信息**：使用约定式提交（Conventional Commits）规范
   - feat: 新功能
   - fix: 修复bug
   - docs: 文档变更
   - style: 代码格式变更
   - refactor: 代码重构
   - test: 测试相关
   - chore: 构建过程或辅助工具变动

2. **分支管理**：
   - main: 主分支，保持稳定
   - develop: 开发分支
   - feature/*: 功能分支
   - fix/*: 修复分支 