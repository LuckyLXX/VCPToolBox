# VCPTavern 配置速查表

## 🎛️ 界面配置选项对照

### 注入类型 (Type)
| 选项 | 英文名 | 功能 | 使用场景 |
|------|--------|------|----------|
| 相对注入 | `relative` | 相对于特定消息注入 | 系统提示词前后、用户消息前后 |
| 深度注入 | `depth` | 在指定深度位置注入 | 对话历史中间位置 |

### 相对位置 (Position) - 仅相对注入可用
| 选项 | 英文名 | 功能 | 效果 |
|------|--------|------|------|
| 之前 | `before` | 在目标消息之前注入 | 前置设定、环境准备 |
| 之后 | `after` | 在目标消息之后注入 | 补充说明、行为约束 |

### 目标 (Target) - 仅相对注入可用
| 选项 | 英文名 | 功能 | 影响范围 |
|------|--------|------|----------|
| 系统提示 | `system` | 针对系统消息注入 | 整个对话的AI行为 |
| 最后用户 | `last_user` | 针对最后用户消息注入 | 当前回合的AI响应 |

### 注入角色 (Role)
| 选项 | 英文名 | 特点 | 适用场景 |
|------|--------|------|----------|
| system | `system` | 最高优先级，AI严格遵循 | 核心指令、行为规范 |
| user | `user` | 模拟用户输入，自然融入 | 补充信息、提供示例 |
| assistant | `assistant` | 模拟AI历史回复 | 设定对话历史、角色记忆 |

## 🎯 常用配置组合

### 1. 角色设定增强
```json
{
    "type": "relative",
    "position": "after", 
    "target": "system",
    "role": "system"
}
```
**效果**：在系统提示词后添加角色个性

### 2. 输出格式控制
```json
{
    "type": "relative",
    "position": "before",
    "target": "last_user", 
    "role": "system"
}
```
**效果**：为每次用户提问添加格式要求

### 3. 上下文记忆
```json
{
    "type": "depth",
    "depth": 3,
    "role": "system"
}
```
**效果**：在倒数第3条消息前注入上下文提醒

### 4. 用户背景补充
```json
{
    "type": "relative",
    "position": "before",
    "target": "last_user",
    "role": "user"
}
```
**效果**：为用户输入添加背景信息

## 📊 执行顺序图

```
对话消息流：

1. [before + system] 前置系统设定
2. [原始 system] 原始系统提示词  
3. [after + system] 后置系统指导
4. [depth 注入] 历史上下文 (按depth倒序)
5. [before + last_user] 用户输入前置
6. [原始 user] 用户输入
7. [after + last_user] 用户输入后置
```

## 🎨 实用模板

### 模板1：专业助手
```json
{
    "name": "专业助手模式",
    "rules": [
        {
            "id": "expertise",
            "type": "relative",
            "position": "after",
            "target": "system", 
            "content": {
                "role": "system",
                "content": "你是该领域的专家，请提供专业、准确的建议。"
            }
        },
        {
            "id": "format",
            "type": "relative", 
            "position": "before",
            "target": "last_user",
            "content": {
                "role": "system",
                "content": "请按照：问题分析→解决方案→实施建议的格式回答。"
            }
        }
    ]
}
```

### 模板2：创意写作
```json
{
    "name": "创意写作模式",
    "rules": [
        {
            "id": "creativity",
            "type": "relative",
            "position": "after",
            "target": "system",
            "content": {
                "role": "system", 
                "content": "发挥创意想象，用生动的语言和丰富的细节来回答。"
            }
        },
        {
            "id": "inspiration",
            "type": "depth",
            "depth": 2,
            "content": {
                "role": "system",
                "content": "结合之前的创意思路，保持风格一致性。"
            }
        }
    ]
}
```

### 模板3：教学辅导
```json
{
    "name": "教学辅导模式", 
    "rules": [
        {
            "id": "teacher-role",
            "type": "relative",
            "position": "after",
            "target": "system",
            "content": {
                "role": "system",
                "content": "你是一位耐心的老师，用循序渐进的方式解释概念。"
            }
        },
        {
            "id": "student-level",
            "type": "relative",
            "position": "before", 
            "target": "last_user",
            "content": {
                "role": "user",
                "content": "我是初学者，希望得到详细易懂的解释。"
            }
        }
    ]
}
```

## 🔧 调试技巧

### 查看注入效果
1. 启用 `DebugMode=true`
2. 观察控制台输出
3. 检查消息数量变化
4. 验证AI回答是否符合预期

### 常见问题排查
| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 注入不生效 | 规则未启用 | 检查 `enabled: true` |
| 内容重复 | 多个规则冲突 | 调整target和position |
| AI行为异常 | 注入内容冲突 | 简化注入规则 |
| 性能下降 | 规则过多 | 减少不必要的规则 |

## 💡 最佳实践

### ✅ 推荐做法
- 使用描述性的规则ID和名称
- 保持注入内容简洁明确
- 定期测试和优化规则
- 根据场景启用相关规则

### ❌ 避免做法  
- 过度复杂的注入逻辑
- 冲突的指令内容
- 过长的注入文本
- 未经测试的规则组合

## 🎯 快速配置指南

### 想要增强AI个性？
→ `relative` + `after` + `system` + `system`

### 想要控制输出格式？
→ `relative` + `before` + `last_user` + `system`

### 想要添加上下文记忆？
→ `depth` + 合适深度 + `system`

### 想要模拟用户背景？
→ `relative` + `before` + `last_user` + `user`

记住：**简单有效的配置胜过复杂的规则组合！** 🎯
