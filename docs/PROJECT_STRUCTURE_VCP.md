# VCPToolBox项目结构说明

## 概述

VCPToolBox是一个基于VCP（Variable & Command Protocol）协议的AI能力增强中间件框架，旨在打通AI模型与外部工具、服务及持久化记忆系统之间的交互壁垒，赋能AI Agent完成复杂任务。

## 核心架构

VCPToolBox采用Node.js作为主要运行环境，通过插件化架构扩展功能，支持分布式部署，并提供WebSocket实时通信能力。

## 目录结构详解

```
VCPToolBox/
├── server.js                    # 主服务器入口文件
├── config.env.example           # 配置文件模板
├── package.json                 # Node.js项目依赖配置
├── requirements.txt             # Python依赖配置
├── README.md                    # 项目说明文档
├── VCP.md                      # VCP协议详细说明
├── TextChunker.js              # 文本分块工具，用于向量数据库
├── VectorDBManager.js          # 向量数据库管理器
├── vectorizationWorker.js      # 向量化工作线程
├── vectorSearchWorker.js       # 向量搜索工作线程
├── vcpInfoHandler.js           # VCP工具调用信息处理模块
├── WebSocketServer.js          # WebSocket服务器实现
├── FileFetcherServer.js        # 分布式文件获取服务器
├── modelRedirectHandler.js     # 模型重定向处理器
├── modules/                    # 核心模块目录
│   ├── agentManager.js         # Agent管理器
│   ├── chatCompletionHandler.js # 聊天完成处理器
│   ├── logger.js               # 日志记录器
│   └── messageProcessor.js     # 消息处理器
├── Plugin/                     # 插件目录
│   ├── [插件名称]/
│   │   ├── plugin-manifest.json # 插件清单文件
│   │   ├── config.env          # 插件配置文件
│   │   ├── [插件主程序]        # 插件主要逻辑实现
│   │   └── requirements.txt    # 插件Python依赖(如需要)
├── VCPDistributedServer/       # 分布式服务器实现
│   ├── VCPDistributedServer.js  # 分布式服务器主程序
│   ├── Plugin.js               # 分布式插件管理器
│   └── Plugin/                 # 分布式服务器插件目录
├── dailynote/                  # AI记忆日记存储目录
├── VectorStore/                # 向量数据库存储目录
├── VCPAsyncResults/            # 异步插件结果存储目录
├── VCPTimedContacts/           # 定时任务存储目录
├── DebugLog/                   # 调试日志目录
├── AdminPanel/                 # Web管理面板
│   ├── index.html              # 管理面板主页
│   ├── script.js               # 管理面板脚本
│   ├── style.css               # 管理面板样式
│   └── [其他资源文件]
├── Agent/                      # AI Agent配置目录
├── TVStxt/                     # TVS文本存储目录
├── routes/                     # 服务器路由目录
│   ├── adminPanelRoutes.js     # 管理面板路由
│   ├── specialModelRouter.js    # 特殊模型路由
│   └── taskScheduler.js        # 任务调度器
├── docs/                       # 文档目录
└── [其他配置和工具文件]
```

## 核心组件说明

### 1. 主服务器 (`server.js`)

- **功能**: VCPToolBox的核心服务器，处理所有HTTP请求和WebSocket连接
- **主要职责**:
  - 初始化插件系统
  - 处理AI模型API请求
  - 管理工具调用循环
  - 处理变量替换
  - 管理异步任务回调
  - 集成向量数据库和记忆系统

### 2. 插件系统 (`Plugin/`)

VCPToolBox通过插件系统扩展功能，支持多种插件类型：

- **`static`插件**: 提供动态更新的文本信息注入上下文
- **`messagePreprocessor`插件**: 在请求发送给AI前对消息进行修改或增强
- **`synchronous`插件**: AI主动调用的即时任务执行插件
- **`asynchronous`插件**: 专为耗时任务设计的非阻塞调用插件
- **`service`插件**: 向VCP主应用注册独立HTTP路由，提供额外服务

每个插件目录包含：
- `plugin-manifest.json`: 插件元信息、类型、入口、通信方式等
- `config.env`: 插件配置文件（可选）
- 主程序文件: 实现插件功能逻辑
- `requirements.txt`: Python依赖（如使用Python开发）

### 3. 向量数据库系统

- **`VectorDBManager.js`**: 管理向量数据库的创建、更新和搜索
- **`vectorizationWorker.js`**: 后台文本向量化工作线程
- **`vectorSearchWorker.js`**: 向量搜索工作线程
- **`TextChunker.js`**: 智能文本分块工具，支持长文本处理

### 4. WebSocket服务器 (`WebSocketServer.js`)

- **功能**: 提供实时双向通信能力
- **主要用途**:
  - 分布式节点连接
  - 实时日志推送
  - 异步任务结果通知
  - 浏览器控制通信

### 5. 分布式架构支持

- **`VCPDistributedServer/`**: 分布式服务器实现
- **`FileFetcherServer.js`**: 分布式文件获取服务器
- 支持将插件部署到不同服务器，实现算力扩展

### 6. 记忆系统

- **`dailynote/`**: AI记忆日记存储目录
- 支持AI自主写入、检索和管理记忆
- 实现持久化记忆和上下文注入

### 7. Web管理面板 (`AdminPanel/`)

- 提供可视化界面管理VCPToolBox
- 功能包括:
  - 插件管理
  - 配置编辑
  - 日志查看
  - 记忆管理

## 配置文件

### `config.env`

主要配置文件，包含：
- API服务器配置
- 数据库连接设置
- 插件配置参数
- 安全密钥
- 系统行为参数

## 部署方式

VCPToolBox支持多种部署方式：

1. **单机部署**: 所有组件运行在同一台服务器
2. **分布式部署**: 主服务器+多个分布式节点
3. **Docker部署**: 使用Docker容器化部署
4. **Docker Compose部署**: 使用Docker Compose编排多容器部署

## 开发指南

### 插件开发

参考文档: `同步异步插件开发手册.md`

插件开发流程:
1. 创建插件目录
2. 编写`plugin-manifest.json`
3. 实现插件主程序
4. 配置`config.env`(如需要)
5. 测试插件功能

### 系统扩展

VCPToolBox可通过以下方式扩展:
- 开发新插件
- 添加新的变量替换规则
- 扩展WebSocket通信协议
- 增强记忆系统功能

## 安全考虑

1. **API密钥管理**: 所有API密钥存储在配置文件中，不提交到版本控制
2. **访问控制**: 管理面板需要基本认证
3. **IP黑名单**: 支持IP黑名单功能，防止恶意访问
4. **请求限制**: 支持API错误计数和临时封禁

## 监控与日志

1. **调试日志**: 支持详细调试模式，记录所有交互
2. **服务器日志**: 记录服务器运行状态和错误
3. **插件日志**: 记录插件执行过程和结果
4. **WebSocket日志**: 记录WebSocket连接和消息

## 总结

VCPToolBox是一个功能强大、高度可扩展的AI能力增强中间件框架。通过其插件化架构、分布式支持、记忆系统和实时通信能力，为AI Agent提供了与外部世界交互的完整解决方案。其模块化设计使得开发者可以轻松扩展功能，满足各种复杂应用场景的需求。