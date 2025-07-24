# VCP Windows系统通知配置指南

## 🎯 功能概述

VCP支持多种方式向Windows系统发送通知，包括：
- **Windows Toast通知**：系统级弹窗通知
- **VCPChat界面通知**：客户端内通知
- **Agent主动通知**：AI主动发送的消息

## 🔔 方法1：VCPWinNotify.py（系统级Toast通知）

### 安装依赖
```bash
pip install win10toast websocket-client
```

### 配置文件
修改 `VCPWinNotify.py` 中的配置：

```python
# --- 配置信息 ---
VCP_KEY = 'lxx98120'  # 与config.env中的VCP_Key一致
WS_SERVER_URL = 'ws://127.0.0.1:5890'  # VCP服务器WebSocket地址
APP_ID = "VCP.Toolbox.Notifier"  # Windows通知应用ID
```

### 启动通知服务
```bash
python VCPWinNotify.py
```

### 效果
- 系统右下角弹出Toast通知
- 显示在Windows通知中心
- 支持自定义图标和持续时间

## 📱 方法2：AgentMessage插件（AI主动通知）

### 基本用法
```
<<<[TOOL_REQUEST]>>>
tool_name:「始」AgentMessage「末」,
Maid:「始」Nova「末」,
message:「始」🎉 主人，您的任务已完成！「末」
<<<[END_TOOL_REQUEST]>>>
```

### 高级用法
```
<<<[TOOL_REQUEST]>>>
tool_name:「始」AgentMessage「末」,
Maid:「始」小镜「末」,
message:「始」🎨 您的自画像已生成完成！
📸 图片地址：http://127.0.0.1:6005/pw=lxx98120/images/doubaogen/xxx.jpg
✨ 请查看您的专属AI艺术作品！「末」
<<<[END_TOOL_REQUEST]>>>
```

## 🔧 方法3：VCPChat内置通知

VCPChat客户端自动接收VCPLog通知，无需额外配置。

### 支持的通知类型
- 工具调用结果
- 异步任务完成
- 系统状态变化
- Agent消息推送

## ⚙️ 配置文件设置

### config.env配置
```env
# VCP通知相关配置
VCP_Key=lxx98120
PORT=6005

# WebSocket服务配置
WEBSOCKET_PORT=5890
```

### VCPLog插件配置
在 `Plugin/VCPLog/config.env` 中：
```env
VCP_Key=lxx98120
Enable_Gotify_Push=false  # 可选：Gotify推送
DebugMode=true
```

## 🎨 通知样式定制

### Windows Toast通知定制
```python
# 在VCPWinNotify.py中修改
notifier.show_toast(
    title,
    message,
    icon_path="D:/VCP/icon.ico",  # 自定义图标
    duration=10,                   # 显示时长（秒）
    threaded=True
)
```

### VCPChat通知样式
VCPChat支持HTML格式的通知消息：
```
<<<[TOOL_REQUEST]>>>
tool_name:「始」AgentMessage「末」,
message:「始」<div style="color: #4CAF50; font-weight: bold;">
✅ 任务完成通知
<br>📊 处理结果：成功
<br>⏰ 完成时间：{{VarTimeNow}}
</div>「末」
<<<[END_TOOL_REQUEST]>>>
```

## 🚀 自动化通知场景

### 1. 任务完成通知
```python
# 在插件中添加通知逻辑
def notify_task_completion(task_name, result):
    message = f"🎉 任务 '{task_name}' 已完成！\n结果：{result}"
    # 发送到VCPLog
    webSocketServer.broadcast({
        'type': 'vcp_log',
        'data': {
            'tool_name': 'TaskNotifier',
            'status': 'success',
            'content': message
        }
    }, 'VCPLog')
```

### 2. 定时提醒
```
<<<[TOOL_REQUEST]>>>
tool_name:「始」AgentAssistant「末」,
agent_name:「始」Nova「末」,
prompt:「始」请在明天上午9点提醒主人查看今日工作安排「末」,
timely_contact:「始」2025-07-25-09:00「末」
<<<[END_TOOL_REQUEST]>>>
```

### 3. 异步任务通知
```python
# 异步任务完成后自动通知
async def on_async_task_complete(task_id, result):
    notification = {
        'type': 'vcp_log',
        'data': {
            'tool_name': f'AsyncTask-{task_id}',
            'status': 'success',
            'content': f'异步任务 {task_id} 已完成：{result}'
        }
    }
    webSocketServer.broadcast(notification, 'VCPLog')
```

## 🔍 调试和监控

### 启用调试模式
```env
# config.env
DebugMode=true
ShowVCP=true
```

### 查看通知日志
```bash
# 查看VCPLog日志
tail -f Plugin/VCPLog/log/VCPlog.txt

# 查看WebSocket连接状态
# 在VCPWinNotify.py运行时观察控制台输出
```

### 测试通知功能
```
<<<[TOOL_REQUEST]>>>
tool_name:「始」AgentMessage「末」,
message:「始」🧪 这是一条测试通知消息「末」
<<<[END_TOOL_REQUEST]>>>
```

## 💡 最佳实践

### 1. 通知内容设计
- 使用表情符号增加视觉效果
- 保持消息简洁明了
- 包含必要的上下文信息

### 2. 通知频率控制
- 避免过于频繁的通知
- 重要事件才发送系统通知
- 普通信息使用界面通知

### 3. 多端同步
- VCPWinNotify.py：系统级通知
- VCPChat：界面通知
- 手机端：通过Gotify等推送

## 🛠️ 故障排除

### 常见问题

1. **Toast通知不显示**
   - 检查Windows通知设置
   - 确认win10toast库安装正确
   - 验证WebSocket连接状态

2. **WebSocket连接失败**
   - 检查VCP_Key是否正确
   - 确认服务器地址和端口
   - 查看防火墙设置

3. **AgentMessage不工作**
   - 确认插件已启用
   - 检查WebSocket服务器状态
   - 验证客户端连接

### 解决方案
```bash
# 重启VCP服务器
npm start

# 重新连接通知客户端
python VCPWinNotify.py

# 检查WebSocket状态
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" http://127.0.0.1:5890/VCPlog/VCP_Key=lxx98120
```

## 🎯 总结

VCP的Windows通知系统提供了完整的解决方案：
- **系统级通知**：VCPWinNotify.py
- **应用内通知**：VCPChat客户端
- **AI主动通知**：AgentMessage插件
- **自动化通知**：VCPLog系统

选择适合您需求的通知方式，享受智能化的消息推送体验！
