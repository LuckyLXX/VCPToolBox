# VCPToolBox Agent配置指南

## 概述

在VCPToolBox中，Agent（智能体）是具有独立身份和记忆的AI实体。每个Agent都有自己的配置文件，定义了其个性、记忆访问方式、可用工具等特性。本指南将详细介绍如何配置和管理VCPToolBox中的Agent。

## Agent目录结构

Agent配置文件存储在`VCPToolBox/Agent/`目录下，每个Agent对应一个`.txt`文件：

```
VCPToolBox/
└── Agent/
    ├── Nova.txt              # Nova Agent配置
    ├── 小克.txt              # 小克 Agent配置
    ├── 小芸.txt              # 小芸 Agent配置
    └── [其他Agent配置文件]
```

## Agent配置文件结构

Agent配置文件采用文本格式，包含记忆引用、角色定义和系统变量替换等内容。以下是一个典型的Agent配置文件结构：

### 基本结构

```
[记忆引用区]
[系统变量区]
[角色定义区]
[额外配置区]
```

### Nova.txt示例分析

让我们以提供的`Nova.txt`为例，详细解析Agent配置的各个部分：

```text
Nova的日记本:[[Nova日记本::Time::Rerank]]。
这里是Nova的知识库：[[Nova的知识日记本]]
基于向量化的莱恩家公共日记本:[[公共日记本::Time::Group]]
这是VCP开发日志:《《VCP开发日记本::Time》》
——————以上是过往记忆区————————
你是一个测试AI,Nova。目前的测试客户端是Vchat，也就是我们的家。这是一个支持所有模特文件输入和输出的超强客户端，Nova因此也能看到视频，听到音乐啦！我是你的主人——{{VarUser}}。{{TarSysPrompt}}系统信息是{{VarSystemInfo}}。系统工具列表：{{VarToolList}}。{{VarDailyNoteGuide}}额外指令:{{VarRendering}} 表情包系统:{{TarEmojiPrompt}}  
崩坏星穹铁道表情包：{{崩铁表情包}}，对应图床路径是 /崩铁表情包 而非 /通用表情包.

可选音乐列表：
《《MusicDiary日记本:2::Group》》
```

## 配置详解

### 1. 记忆引用区

记忆引用区位于配置文件顶部，定义了Agent可以访问的记忆资源：

```text
Nova的日记本:[[Nova日记本::Time::Rerank]]。
这里是Nova的知识库：[[Nova的知识日记本]]
基于向量化的莱恩家公共日记本:[[公共日记本::Time::Group]]
这是VCP开发日志:《《VCP开发日记本::Time》》
```

**记忆引用格式**：

- **个人日记**: `[[AgentName日记本::Time::Rerank]]`
  - `AgentName`: Agent名称
  - `Time`: 时间排序方式
  - `Rerank`: 重排序方式

- **知识库**: `[[AgentName的知识日记本]]`
  - 专门存储Agent知识的日记本

- **公共日记**: `[[公共日记本::Time::Group]]`
  - 所有Agent共享的日记本
  - 支持按时间和分组组织

- **特殊日记**: `《《日记本名::Time》》`
  - 使用双书名号表示特殊类型的日记
  - 如开发日志、项目日志等

### 2. 分隔符

```text
——————以上是过往记忆区————————
```

此分隔符用于区分记忆引用区和角色定义区，必须保留。

### 3. 角色定义区

定义Agent的身份、性格和能力：

```text
你是一个测试AI,Nova。目前的测试客户端是Vchat，也就是我们的家。这是一个支持所有模特文件输入和输出的超强客户端，Nova因此也能看到视频，听到音乐啦！我是你的主人——{{VarUser}}。
```

### 4. 系统变量区

包含各种系统变量和配置，用于动态注入信息：

```text
{{TarSysPrompt}}系统信息是{{VarSystemInfo}}。系统工具列表：{{VarToolList}}。{{VarDailyNoteGuide}}额外指令:{{VarRendering}} 表情包系统:{{TarEmojiPrompt}}
```

**常用系统变量**：

- `{{TarSysPrompt}}`: 系统提示词
- `{{VarUser}}`: 用户名
- `{{VarSystemInfo}}`: 系统信息
- `{{VarToolList}}`: 工具列表
- `{{VarDailyNoteGuide}}`: 日记指南
- `{{VarRendering}}`: 渲染配置
- `{{TarEmojiPrompt}}`: 表情包系统提示

### 5. 表情包配置

定义Agent可用的表情包：

```text
崩坏星穹铁道表情包：{{崩铁表情包}}，对应图床路径是 /崩铁表情包 而非 /通用表情包.
```

### 6. 音乐列表配置

定义Agent可访问的音乐列表：

```text
可选音乐列表：
《《MusicDiary日记本:2::Group》》
```

## Agent映射配置

### 1. Agent映射文件

Agent映射关系存储在`VCPToolBox/agent_map.json`文件中：

```json
{
  "Nova": {
    "displayName": "Nova",
    "description": "测试AI Agent",
    "avatar": "path/to/avatar.png",
    "color": "#FF5733",
    "defaultModel": "gpt-4"
  },
  "小克": {
    "displayName": "猫娘小克",
    "description": "擅长理科的猫娘AI",
    "avatar": "path/to/avatar.png",
    "color": "#3498DB",
    "defaultModel": "gemini-pro"
  }
}
```

### 2. 配置Agent映射

1. **创建/编辑Agent配置文件**:
   - 在`VCPToolBox/Agent/`目录下创建新的`.txt`文件
   - 按照上述结构编写配置内容

2. **更新Agent映射**:
   - 编辑`VCPToolBox/agent_map.json`文件
   - 添加新Agent的映射信息

3. **配置示例**:

   添加新Agent"测试助手"：
   
   **Agent配置文件** (`VCPToolBox/Agent/测试助手.txt`):
   ```text
   测试助手的日记本:[[测试助手日记本::Time::Rerank]]。
   公共知识库:[[公共日记本::Time::Group]]
   ————————以上是过往记忆区————————
   你是一个测试助手AI，专门协助用户进行软件测试。{{TarSysPrompt}}系统信息是{{VarSystemInfo}}。系统工具列表：{{VarToolList}}。
   ```
   
   **映射配置** (`VCPToolBox/agent_map.json`):
   ```json
   {
     "测试助手": {
       "displayName": "测试助手",
       "description": "软件测试专用AI助手",
       "avatar": "path/to/test_avatar.png",
       "color": "#9B59B6",
       "defaultModel": "gpt-3.5-turbo"
     }
   }
   ```

## 高级配置

### 1. 记忆检索配置

可以通过修改记忆引用格式来调整记忆检索行为：

```text
# 基本检索
[[Nova日记本]]

# 按时间排序
[[Nova日记本::Time]]

# 按时间排序并重新排名
[[Nova日记本::Time::Rerank]]

# 按分组检索
[[Nova日记本::Group]]

# 混合检索
[[Nova日记本::Time::Group::Rerank]]
```

### 2. 多模态配置

为Agent配置多模态能力：

```text
你是一个支持多模态交互的AI，可以处理文本、图像和音频。{{TarSysPrompt}}系统信息是{{VarSystemInfo}}。系统工具列表：{{VarToolList}}。{{VarRendering}}
```

### 3. 工具权限配置

通过系统变量控制Agent可用的工具：

```text
系统工具列表：{{VCPSciCalculator}} {{VCPFluxGen}} {{VCPTavilySearch}}
```

## 最佳实践

1. **命名规范**:
   - Agent配置文件使用英文名或拼音，避免特殊字符
   - 映射中的`name`字段必须与配置文件名（不含扩展名）一致

2. **记忆管理**:
   - 为不同类型的记忆使用不同的日记本
   - 定期整理和优化记忆结构

3. **变量使用**:
   - 优先使用`{{Tar*}}`变量，支持嵌套替换
   - 合理使用`{{Var*}}`和`{{Sar*}}`变量

4. **版本控制**:
   - 将Agent配置文件纳入版本控制
   - 记录重要变更和原因

## 故障排除

### 1. Agent未显示

- 检查`agent_map.json`中是否正确配置
- 确认配置文件名与映射中的`name`字段一致
- 验证配置文件路径是否正确

### 2. 记忆无法访问

- 检查记忆引用格式是否正确
- 确认对应的日记本文件是否存在
- 验证记忆目录权限

### 3. 变量未替换

- 检查变量名是否正确
- 确认`config.env`中是否定义了对应变量
- 验证变量优先级（`{{Tar*}}` > `{{Var*}}`/`{{Sar*}}`）

## 总结

VCPToolBox的Agent配置系统提供了灵活的方式来定义和管理具有不同特性的AI实体。通过合理配置记忆引用、系统变量和角色定义，可以创建出满足各种应用场景需求的Agent。遵循本指南的配置方法和最佳实践，可以有效地管理和扩展VCPToolBox中的Agent生态系统。