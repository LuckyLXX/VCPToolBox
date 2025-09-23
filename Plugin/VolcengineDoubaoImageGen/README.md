# 火山引擎豆包4.0图像生成插件

基于火山引擎豆包4.0 API的图像生成插件，支持多种生图方式，为VCP系统提供强大的AI图像生成能力。

## 功能特性

### 🎨 六种生图方式

1. **文生图** - 纯文本输入单图输出
   - 通过文字描述生成对应图像
   - 支持各种风格和场景描述

2. **图文生图** - 单图输入单图输出  
   - 基于已有图片结合文字指令进行图像编辑
   - 支持风格转化、元素增删等

3. **多图融合** - 多图输入单图输出
   - 融合多张图片的风格、元素等特征
   - 适用于服装搭配、风景人物融合等

4. **文生组图** - 纯文本输入多图输出
   - 生成一组内容关联的图像
   - 适用于漫画分镜、系列插画等

5. **图生组图** - 单图输入多图输出
   - 基于单张图片生成一组相关图片
   - 适用于品牌VI设计、产品系列等

6. **多图生组图** - 多图输入多图输出
   - 基于多张图片生成一组相关图片
   - 支持复杂的多元素融合创作

### ✨ 高级特性

- **流式输出支持** - 实时返回生成进度
- **多种尺寸选择** - 1K/2K/4K或自定义像素
- **水印控制** - 可选择是否添加水印
- **智能解析** - 自动识别图片URL和参数
- **错误处理** - 完善的异常处理和重试机制

## 安装配置

### 1. 配置API密钥

编辑 `config.env` 文件：

```env
# 必填：火山引擎API密钥
VOLCENGINE_API_KEY=your_api_key_here

# 可选：自定义配置
VOLCENGINE_MODEL_ID=doubao-seedream-4-0-250828
DEFAULT_SIZE=2K
DEFAULT_WATERMARK=true
```

### 2. 获取API密钥

1. 访问 [火山引擎控制台](https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey)
2. 创建或获取API Key
3. 确保已开通豆包4.0模型服务

## 使用方法

### 基础命令

```bash
# 文生图
文生图 星际穿越，黑洞，电影级画质，超现实主义

# 图文生图  
图文生图 https://example.com/dog.jpg 生成狗狗在草地上玩耍的画面

# 多图融合
多图融合 https://example.com/img1.jpg https://example.com/img2.jpg 将图1的服装换为图2的服装
```

### 组图生成

```bash
# 文生组图
文生组图 4 同一庭院四季变迁的连贯插画，统一风格

# 图生组图
图生组图 https://example.com/logo.jpg 5 参考这个LOGO做户外运动品牌视觉设计

# 多图生组图  
多图生组图 https://example.com/img1.jpg https://example.com/img2.jpg 3 女孩和奶牛玩偶在游乐园的系列场景
```

## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 | 必填 |
|--------|------|--------|------|
| `VOLCENGINE_API_KEY` | 火山引擎API密钥 | - | ✅ |
| `VOLCENGINE_MODEL_ID` | 模型ID | doubao-seedream-4-0-250828 | ❌ |
| `DEFAULT_SIZE` | 默认图片尺寸 | 2K | ❌ |
| `DEFAULT_WATERMARK` | 默认水印设置 | true | ❌ |
| `DEFAULT_MAX_IMAGES` | 组图默认数量 | 4 | ❌ |



### 支持的图片尺寸

- **预设尺寸**: `1K`, `2K`, `4K`
- **自定义尺寸**: `1024x1024`, `2048x2048`, `1024x2048`, `2048x1024`

## API参考

### 模型信息

- **模型名称**: doubao-seedream-4.0
- **版本**: 250828  
- **模型ID**: doubao-seedream-4-0-250828
- **限流**: 500张/分钟
- **支持能力**: 文生图、图生图、多参考图生图、组图生成

### 响应格式

```json
{
  "type": "markdown",
  "content": "生成结果的Markdown格式内容",
  "images": ["图片URL数组"]
}
```

## 错误处理

插件包含完善的错误处理机制：

- **配置验证** - 启动时检查必要配置
- **参数验证** - 命令参数格式检查  
- **网络重试** - 自动重试失败的请求
- **超时处理** - 防止长时间等待
- **友好提示** - 清晰的错误信息和使用建议

## 开发说明

### 项目结构

```
VolcengineDoubaoImageGen/
├── DoubaoImageGen.js      # 主插件文件
├── config.env             # 配置文件
├── plugin-manifest.json   # 插件清单
├── README.md             # 说明文档
├── test.js               # 测试脚本
└── example.js            # 使用示例
```

### 扩展开发

插件采用模块化设计，可以轻松扩展新功能：

1. 在 `DoubaoImageGen` 类中添加新方法
2. 在 `processCommand` 中添加新命令处理
3. 更新 `plugin-manifest.json` 中的命令列表

## 许可证

本插件遵循 MIT 许可证。

## 支持

如有问题或建议，请联系VCP开发团队。