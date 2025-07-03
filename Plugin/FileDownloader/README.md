# FileDownloader 插件

## 概述

`FileDownloader` 是一个通用文件下载插件，支持多种文件格式的下载，包括图片、视频、文档等。提供单文件下载、批量下载和按类型下载等功能，具备完善的安全控制和错误处理机制。

## 功能特性

### 🎯 核心功能
- **单文件下载**: 下载指定URL的单个文件
- **批量下载**: 同时下载多个文件，支持并发控制
- **按类型下载**: 根据文件类型自动选择保存目录
- **多格式支持**: 图片、视频、音频、文档等各种文件格式

### 🛡️ 安全特性
- **域名白名单**: 可限制允许下载的网站域名
- **文件大小限制**: 防止下载过大文件
- **超时控制**: 避免长时间阻塞
- **路径安全**: 防止目录遍历攻击

### ⚡ 高级功能
- **并发下载**: 支持同时下载多个文件
- **自动目录创建**: 目标目录不存在时自动创建
- **文件覆盖控制**: 可配置是否覆盖同名文件
- **详细进度反馈**: 提供下载状态和错误信息

## 安装与配置

### 1. 配置文件设置

复制 `config.env.example` 为 `config.env` 并根据需要修改：

```bash
cd Plugin/FileDownloader
cp config.env.example config.env
```

### 2. 主要配置项

```ini
# 文件大小限制（MB）
MAX_FILE_SIZE_MB=500

# 下载超时时间（秒）
DOWNLOAD_TIMEOUT_SECONDS=300

# 最大并发下载数
MAX_CONCURRENT_DOWNLOADS=5

# 默认保存目录
DEFAULT_IMAGE_DIR=D:/VCP/Downloads/Pictures/
DEFAULT_VIDEO_DIR=D:/VCP/Downloads/videos/
DEFAULT_DOCUMENT_DIR=D:/VCP/Downloads/docs/

# 域名白名单（可选，留空表示允许所有）
ALLOWED_DOMAINS=

# 功能开关
AUTO_CREATE_DIRECTORIES=true
OVERWRITE_EXISTING_FILES=true
DEBUG_MODE=false
```

## 使用方法

### 📋 VCP 调用格式

#### 1. 单文件下载

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」FileDownloader「末」,
command:「始」download「末」,
url:「始」https://example.com/image.jpg「末」,
filename:「始」wallpaper.jpg「末」,
target_directory:「始」D:/VCP/VCPChat/assets/wallpaper/「末」
<<<[END_TOOL_REQUEST]>>>
```

**参数说明:**
- `command`: 固定为 `download`
- `url`: 要下载的文件URL地址
- `filename`: 保存的文件名（包含扩展名）
- `target_directory`: 目标保存目录路径

#### 2. 批量下载

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」FileDownloader「末」,
command:「始」batch_download「末」,
downloads:「始」[
  {"url": "https://example.com/dark.jpg", "filename": "theme_dark.jpg"},
  {"url": "https://example.com/light.jpg", "filename": "theme_light.jpg"}
]「末」,
target_directory:「始」D:/VCP/VCPChat/assets/wallpaper/「末」
<<<[END_TOOL_REQUEST]>>>
```

**参数说明:**
- `command`: 固定为 `batch_download`
- `downloads`: JSON数组，每项包含 `url` 和 `filename`
- `target_directory`: 统一保存目录

#### 3. 按类型下载

```
<<<[TOOL_REQUEST]>>>
tool_name:「始」FileDownloader「末」,
command:「始」download_by_type「末」,
url:「始」https://example.com/video.mp4「末」,
file_type:「始」video「末」,
filename:「始」demo.mp4「末」
<<<[END_TOOL_REQUEST]>>>
```

**参数说明:**
- `command`: 固定为 `download_by_type`
- `url`: 文件URL
- `file_type`: 文件类型 (`image`, `video`, `document`, `other`)
- `filename`: 文件名

## 返回格式

### 成功响应示例

#### 单文件下载成功
```json
{
  "status": "success",
  "message": "文件下载成功: wallpaper.jpg",
  "result": {
    "filename": "wallpaper.jpg",
    "filePath": "D:/VCP/VCPChat/assets/wallpaper/wallpaper.jpg",
    "size": 2048576,
    "sizeText": "2000KB"
  }
}
```

#### 批量下载成功
```json
{
  "status": "success",
  "message": "批量下载完成: 成功 2 个, 失败 0 个",
  "result": {
    "successful": [
      {
        "index": 1,
        "filename": "theme_dark.jpg",
        "filePath": "D:/VCP/VCPChat/assets/wallpaper/theme_dark.jpg",
        "size": 1024000,
        "status": "success"
      }
    ],
    "failed": [],
    "summary": {
      "total": 2,
      "success": 2,
      "failed": 0
    }
  }
}
```

### 错误响应示例

```json
{
  "status": "error",
  "message": "文件过大: 600MB, 超过限制 500MB"
}
```

## 与其他插件集成

### 🎨 与 Coco 主题生成集成

FileDownloader 特别适合与 Coco (ThemeMaidCoco) 配合使用，实现主题壁纸的自动下载：

```javascript
// Coco 工作流示例
// 1. 生成壁纸
VCPFluxGen/VCPDoubaoGen → 生成图片 → 获得URL

// 2. 自动下载壁纸
FileDownloader.batch_download → 下载到本地 → 获得路径

// 3. 生成主题CSS
VCPFileOperator → 创建主题文件 → 使用本地路径
```

### 🔗 与其他文件处理插件配合

- **图片处理**: 下载后可使用 `ImageProcessor` 进行压缩优化
- **文件管理**: 与 `VCPFileOperator` 配合进行文件组织
- **内容分析**: 下载的文档可使用文本分析插件处理

## 文件类型支持

### 🖼️ 图片格式
`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.bmp`, `.svg`

### 🎥 视频格式
`.mp4`, `.avi`, `.mov`, `.mkv`, `.webm`, `.flv`

### 📄 文档格式
`.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`, `.txt`, `.zip`, `.rar`

### 🎵 音频格式
`.mp3`, `.wav`, `.flac`, `.ogg`

## 错误处理

### 常见错误及解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `域名不在允许列表中` | URL域名被白名单限制 | 检查 `ALLOWED_DOMAINS` 配置 |
| `文件过大` | 文件超出大小限制 | 增加 `MAX_FILE_SIZE_MB` 值 |
| `下载超时` | 网络连接超时 | 检查网络或增加 `DOWNLOAD_TIMEOUT_SECONDS` |
| `无法创建目录` | 目录权限不足 | 检查目标目录权限 |
| `文件已存在` | 同名文件存在且禁止覆盖 | 设置 `OVERWRITE_EXISTING_FILES=true` |

## 最佳实践

### ✅ 推荐做法

1. **合理设置大小限制**: 根据实际需求设置 `MAX_FILE_SIZE_MB`
2. **使用批量下载**: 多文件下载时优先使用 `batch_download`
3. **指定明确路径**: 使用完整的绝对路径避免歧义
4. **启用调试模式**: 开发时启用 `DEBUG_MODE` 便于排查问题

### ❌ 避免事项

1. **不要下载未知来源文件**: 注意安全风险
2. **避免过大的批量下载**: 控制并发数量
3. **不要忽略错误信息**: 及时处理下载失败的情况

## 开发与扩展

### 添加新功能

插件采用模块化设计，可轻松扩展新功能：

1. **新增下载协议**: 在 `validateUrl` 函数中添加支持
2. **增强安全检查**: 在下载前添加更多验证逻辑
3. **添加格式转换**: 在下载完成后进行格式处理

### 调试指南

启用调试模式查看详细日志：

```ini
DEBUG_MODE=true
```

调试信息将输出到 stderr，包括：
- 请求参数解析
- 下载进度跟踪
- 错误详细信息

## 更新日志

### v1.0.0
- ✨ 初始版本发布
- 🎯 支持单文件、批量、按类型下载
- 🛡️ 完善的安全控制机制
- ⚡ 并发下载支持
- 📝 详细的错误处理和日志记录

---

## 技术支持

如遇到问题或需要功能建议，请参考：
1. 检查配置文件设置
2. 查看调试日志输出
3. 确认网络连接状态
4. 验证目标目录权限 