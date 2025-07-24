# VCPTavern 上下文注入器使用说明

## 🎯 功能概述

VCPTavern是VCP的高级上下文注入插件，类似于SillyTavern的上下文编辑功能，允许您精确控制AI对话中的消息注入位置和内容。

## 📋 核心配置选项详解

### 1. 注入类型 (Type)

#### 🔄 **相对注入 (relative)**
- **功能**：相对于特定消息类型进行注入
- **适用场景**：在系统提示词前后、用户消息前后注入内容
- **优势**：位置固定，逻辑清晰

#### 📏 **深度注入 (depth)**  
- **功能**：在指定深度位置注入（倒数第N条消息前）
- **适用场景**：在对话历史的特定位置插入上下文
- **优势**：可以在对话中间注入，增强上下文连贯性

### 2. 相对位置 (Position)

#### ⬅️ **之前 (before)**
- **功能**：在目标消息之前注入内容
- **示例**：在系统提示词之前添加角色设定
- **用途**：前置条件、环境设定、角色背景

#### ➡️ **之后 (after)**
- **功能**：在目标消息之后注入内容  
- **示例**：在系统提示词之后添加行为指导
- **用途**：补充说明、行为约束、输出格式要求

### 3. 目标类型 (Target)

#### 🖥️ **系统提示 (system)**
- **功能**：针对系统消息进行注入
- **适用场景**：修改AI的基础行为和角色设定
- **影响范围**：整个对话的AI行为模式

#### 👤 **最后用户 (last_user)**
- **功能**：针对最后一条用户消息进行注入
- **适用场景**：为当前用户输入添加上下文或指导
- **影响范围**：当前回合的AI响应

### 4. 注入角色 (Role)

#### 🖥️ **system**
- **功能**：以系统身份注入内容
- **特点**：具有最高优先级，AI会严格遵循
- **用途**：核心指令、行为规范、角色设定

#### 👤 **user** 
- **功能**：以用户身份注入内容
- **特点**：模拟用户输入，自然融入对话
- **用途**：补充信息、澄清需求、提供示例

#### 🤖 **assistant**
- **功能**：以AI助手身份注入内容
- **特点**：模拟AI的历史回复，建立对话上下文
- **用途**：设定对话历史、建立角色记忆

## 🎨 实际应用场景

### 场景1：角色增强设定

```json
{
    "id": "character-enhancement",
    "name": "角色个性增强",
    "enabled": true,
    "type": "relative",
    "position": "after",
    "target": "system",
    "content": {
        "role": "system",
        "content": "你的回答要体现出专业、友善、耐心的特质。使用适当的表情符号让对话更生动。"
    }
}
```

**效果**：在原系统提示词后添加个性化指导

### 场景2：输出格式控制

```json
{
    "id": "format-control",
    "name": "输出格式要求",
    "enabled": true,
    "type": "relative", 
    "position": "before",
    "target": "last_user",
    "content": {
        "role": "system",
        "content": "请按照以下格式回答：1)简要总结 2)详细解释 3)实际示例 4)相关建议"
    }
}
```

**效果**：为每次用户提问添加格式要求

### 场景3：上下文记忆注入

```json
{
    "id": "context-memory",
    "name": "对话上下文",
    "enabled": true,
    "type": "depth",
    "depth": 3,
    "content": {
        "role": "system", 
        "content": "请结合之前的对话内容，保持话题的连贯性和个性化体验。"
    }
}
```

**效果**：在倒数第3条消息前注入上下文提醒

### 场景4：动态角色切换

```json
{
    "id": "role-switch",
    "name": "专家模式激活",
    "enabled": true,
    "type": "relative",
    "position": "after",
    "target": "system", 
    "content": {
        "role": "system",
        "content": "现在你是一位资深的{{专业领域}}专家，请用专业但易懂的方式回答问题。"
    }
}
```

**效果**：动态激活专家角色模式

## 🔧 配置组合策略

### 策略1：层次化注入

```json
{
    "rules": [
        {
            "id": "base-character",
            "type": "relative",
            "position": "before", 
            "target": "system",
            "content": {"role": "system", "content": "基础角色设定"}
        },
        {
            "id": "behavior-guide",
            "type": "relative",
            "position": "after",
            "target": "system", 
            "content": {"role": "system", "content": "行为指导"}
        },
        {
            "id": "format-requirement",
            "type": "relative",
            "position": "before",
            "target": "last_user",
            "content": {"role": "system", "content": "格式要求"}
        }
    ]
}
```

**执行顺序**：基础设定 → 原系统提示 → 行为指导 → 格式要求 → 用户输入

### 策略2：条件化注入

```json
{
    "rules": [
        {
            "id": "tech-mode",
            "name": "技术问题模式",
            "enabled": true,
            "type": "relative",
            "position": "after",
            "target": "system",
            "content": {
                "role": "system", 
                "content": "检测到技术问题，启用专业模式：提供准确的技术解答、代码示例和最佳实践。"
            }
        }
    ]
}
```

### 策略3：多角色协作

```json
{
    "rules": [
        {
            "id": "user-context",
            "type": "relative",
            "position": "before",
            "target": "last_user",
            "content": {
                "role": "user",
                "content": "补充背景：我是一个初学者，希望得到详细的解释。"
            }
        },
        {
            "id": "assistant-memory", 
            "type": "depth",
            "depth": 2,
            "content": {
                "role": "assistant",
                "content": "我记得您之前提到过相关的问题，让我结合之前的讨论来回答。"
            }
        }
    ]
}
```

## 📝 最佳实践指南

### 1. 注入顺序规划

```
推荐顺序：
1. before + system → 前置角色设定
2. 原始系统提示词
3. after + system → 后置行为指导  
4. depth注入 → 历史上下文
5. before + last_user → 当前请求增强
6. 用户输入
```

### 2. 内容设计原则

#### ✅ **好的注入内容**
- 简洁明确的指令
- 具体的行为要求
- 清晰的格式规范
- 相关的上下文信息

#### ❌ **避免的内容**
- 过长的描述
- 模糊的要求
- 冲突的指令
- 重复的信息

### 3. 性能优化建议

- **适量注入**：避免过多规则影响性能
- **条件启用**：根据场景启用相关规则
- **定期清理**：移除不再需要的规则
- **测试验证**：确保注入效果符合预期

## 🎯 使用技巧

### 技巧1：动态变量使用

```json
{
    "content": {
        "role": "system",
        "content": "当前时间：{{VarTimeNow}}，用户：{{VarUser}}，请个性化回答。"
    }
}
```

### 技巧2：条件性注入

```json
{
    "id": "code-helper",
    "name": "编程助手模式", 
    "enabled": true,
    "condition": {
        "keywords": ["代码", "编程", "bug", "函数"]
    },
    "content": {
        "role": "system",
        "content": "检测到编程问题，请提供：1)代码示例 2)详细注释 3)最佳实践"
    }
}
```

### 技巧3：多预设组合

```
基础对话：{{VCPTavern::basic-chat}}
技术问答：{{VCPTavern::tech-expert}}{{VCPTavern::code-formatter}}
创意写作：{{VCPTavern::creative-writer}}{{VCPTavern::story-enhancer}}
```

## 🔍 调试和监控

### 启用调试模式

```env
# config.env
DebugMode=true
```

### 查看注入效果

调试模式下，控制台会显示：
- 预设加载情况
- 规则执行状态
- 消息注入前后对比
- 错误和警告信息

## 💡 常见问题解答

### Q: 多个规则的执行顺序是什么？
A: 相对注入按position排序(before优先)，深度注入按depth倒序执行。

### Q: 如何避免注入内容冲突？
A: 使用不同的target和position，避免在同一位置注入冲突内容。

### Q: 注入的内容会被AI看到吗？
A: 是的，注入的内容会成为AI的输入上下文，影响AI的回答。

### Q: 可以动态修改注入规则吗？
A: 可以通过修改预设文件并重新加载来动态调整规则。

记住：**合理的上下文注入能显著提升AI的表现，但过度注入可能适得其反！** 🎯
