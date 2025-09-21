# Cobo Home Work

Cobo Home Work 是一个基于 React 和 TypeScript 开发的 AI 聊天应用，支持与多种模拟 AI 模型进行交互，并提供多轮对话、主题切换等功能。

## 功能特性

- 💬 **多模型支持**：内置 Mock GPT、Mock Doubao、Mock Deepseek 三种模拟 AI 模型
- 🔄 **多轮对话**：支持创建、切换、删除对话
- 🌓 **主题切换**：支持浅色模式和深色模式
- 📝 **Markdown 支持**：AI 回复支持 Markdown 渲染、代码语法高亮
- ⚡ **流式响应**：支持 AI 响应的流式展示
- ⚙️ **模型配置**：可自定义每个模型的参数配置

## 技术栈

### 前端

- **框架**：React 19
- **语言**：TypeScript
- **构建工具**：Vite
- **状态管理**：Zustand
- **样式**：SCSS
- **UI 组件**：自定义组件

### 后端 （用作接口mock）

- **框架**：Koa
- **路由**：@koa/router
- **中间件**：@koa/cors、koa-bodyparser
- **语言**：TypeScript

### 开发工具

- **代码检查**：ESLint
- **代码格式化**：Prettier
- **测试框架**：Jest
- **Git Hook**：Husky、lint-staged

## 快速开始

### 前置条件

- Node.js (v16+) 环境
- pnpm 包管理工具

### 安装依赖

```bash
# 使用 pnpm
pnpm install

```

### 开发模式

启动前后端开发服务器：

```bash
# 同时启动前端和后端服务
pnpm run dev:both

# 或分别启动
pnpm run server  # 启动后端服务
pnpm run client     # 启动前端服务
```

前端服务将在 http://localhost:5173 启动，后端服务将在 http://localhost:3001 启动。

## 项目结构

```
├── server/               # 后端 API 服务器，mock接口使用
│   ├── handlers/         # API 处理函数
│   ├── utils/            # 工具函数
│   ├── index.ts          # 服务器入口
│   └── routes.ts         # API 路由配置
├── src/                  # 前端源码
│   ├── api/              # API 调用服务
│   ├── components/       # React 组件
│   │   ├── main/         # 主内容区域组件
│   │   │   ├── content/  # 聊天内容组件
│   │   │   └── header/   # 主内容头部组件
│   │   └── sidebar/      # 侧边栏组件
│   ├── constants/        # 常量定义
│   ├── store/            # Zustand 状态管理
│   ├── styles/           # 全局样式
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   ├── App.tsx           # 应用入口组件
│   └── main.tsx          # React 挂载点
├── test/                 # 测试文件
├── .eslintrc.js          # ESLint 配置
├── .prettierrc           # Prettier 配置
├── package.json          # 项目配置和依赖
├── tsconfig.json         # TypeScript 配置
└── vite.config.ts        # Vite 配置
```

## 状态管理

项目使用 Zustand 进行状态管理，主要包括两个 store：

- **appConfigStore**：管理应用配置，如主题设置
- **chatStore**：管理聊天相关状态，如对话列表、消息、当前会话、模型配置等

## API 接口

### 聊天接口

**POST /api/chat/:model**

参数：

- `messages`: 消息数组，包含角色和内容
- `model`: 模型配置信息

返回：

- 流式：以 Server-Sent Events (SSE) 格式返回响应

## 自定义 AI 模型

项目中的 AI 模型都是模拟的，若要添加新的模拟模型，需要在以下文件中进行修改：

1. 在 `src/constants/model.ts` 中添加新模型配置
2. 在 `server/utils/mockGenerator.ts` 中添加对应的模拟响应生成逻辑

## 测试

运行单元测试：

```bash
pnpm test
```

## 代码规范

项目使用 ESLint 和 Prettier 确保代码质量和一致性。在提交代码前，可以运行以下命令进行检查和格式化：

```bash
# 运行 ESLint 检查
pnpm run lint

# 自动修复 ESLint 错误
pnpm run lint:fix

# 格式化代码
pnpm run format
```
