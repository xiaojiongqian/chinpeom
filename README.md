# 唐诗译境 (Chinpoem)

一个关于唐诗和外语混搭学习的 Web 应用，使用 Capacitor 打包成 APP。当前版本取消自建服务端，采用本地资源与可选第三方云服务（如 LLM 接口）。

## 项目介绍

这个应用旨在通过游戏化方式帮助用户学习唐诗和外语。用户需要根据外语提示，从备选答案中选择正确的诗句。

主要功能：
- 随机显示唐诗，某一句以外语显示（或困难模式星号遮挡）
- 根据外语提示，选择正确的中文诗句
- 本地账户记录学习得分与学级称号（通过 `poemctl` 终端工具）
- 支持多种外语提示（中文/英文/西班牙文/日文/法文/德文）
- 设置语言与难度模式，查看成就与统计

## 技术栈

- Vue 3 + TypeScript + Vite
- TailwindCSS 样式管理
- Vue Router 路由管理
- Vue I18n 国际化
- Pinia 状态管理
- Capacitor 打包成APP

## 项目结构（简要）

```
/chinpoem
├── public/                 # 静态资源
│   └── resource/           # 唐诗配图和JSON文件
│       ├── images/         # 唐诗配图
│       └── data/           # 多语言诗句JSON文件
├── resource/               # 诗歌资源文件
│   ├── poem_chinese.json   # 中文诗歌数据
│   ├── poem_english.json   # 英文翻译数据
│   └── ...                 # 其他语言翻译数据
├── src/
│   ├── assets/             # 项目资源文件
│   ├── components/         # 公共组件
│   │   ├── common/         # 通用组件
│   │   └── layout/         # 布局组件
│   ├── composables/        # 组合式函数
│   ├── config/             # 配置文件
│   ├── locales/            # 国际化语言包
│   ├── router/             # 路由配置
│   ├── stores/             # 状态管理
│   ├── types/              # 类型定义
│   ├── utils/              # 工具函数
│   ├── views/              # 页面视图
│   ├── App.vue             # 根组件
│   └── main.ts             # 入口文件
└── ...
```

## 安装与运行

### 安装依赖

```bash
npm install
```

### 开发环境运行（前端）

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

### 打包 APP（Capacitor）

```bash
# 添加平台
npm run cap:add android
npm run cap:add ios

# 构建并打开对应平台
npm run cap:android
npm run cap:ios
```

## 文档与开发规范

完整文档入口请见 `doc/README.md`：
- 产品需求与说明：`doc/PRD.md`
- 开发规范与技术细节：`doc/DEVELOPMENT.md`
- 本地资源与 API 配置：`doc/API_GUIDE.md`
- 测试报告：`doc/TEST_REPORTS.md`
- 项目进度：`doc/progress.md`

## 本地账户与学级称号

本地账户由命令行工具 `poemctl` 管理（创建/切换/导入/导出）。前端启动时读取当前账户信息，自动加载对应学习进度。

学级称号对应分数：

- 白丁：0-10分
- 学童：11-25分
- 秀才：26-45分
- 廪生：46-70分
- 贡生：71-100分
- 举人：101-135分
- 贡士：136-175分
- 进士：176-220分
- 探花：221-280分
- 榜眼：281-340分
- 状元：341分以上

## 许可证

MIT 

## 历史服务器实现（存档）

早期版本包含自建后端（Express/MySQL）与第三方登录/付费等能力，现已从主分支移除。
- 存档分支：`v1.0-with-backend-server`
- 相关说明：见 `server/README.md` 与各文档中的“历史服务器实现（存档）”章节。
