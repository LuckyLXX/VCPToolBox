# VCPToolBox Fork 更新工作流指南

## 当前情况
- 本地fork仓库：`LuckyLXX/VCPToolBox`
- 上游仓库：`lioensky/VCPToolBox`
- 网络问题导致git命令无法直接拉取更新

## 方法1：手动下载合并（推荐）

### 步骤1：下载最新版本
1. 访问 https://github.com/lioensky/VCPToolBox
2. 点击绿色的 "Code" 按钮
3. 选择 "Download ZIP"
4. 解压到临时目录

### 步骤2：对比并合并
1. 使用文件对比工具（如WinMerge、Beyond Compare等）对比文件差异
2. 手动复制需要的新文件和更新
3. 注意保留您的自定义配置文件

### 步骤3：提交更改
```bash
git add .
git commit -m "手动合并上游更新"
git push origin main
```

## 方法2：修复网络连接后的Git操作

### 步骤1：检查网络设置
```bash
# 检查当前远程仓库配置
git remote -v

# 检查代理设置
git config --global --list | grep proxy
```

### 步骤2：尝试不同的连接方式
```bash
# 方式1：使用GitHub官方地址
git remote set-url upstream https://github.com/lioensky/VCPToolBox.git

# 方式2：使用镜像站点
git remote set-url upstream https://gitclone.com/github.com/lioensky/VCPToolBox.git

# 方式3：使用代理
git remote set-url upstream https://ghproxy.com/https://github.com/lioensky/VCPToolBox.git
```

### 步骤3：拉取并合并更新
```bash
# 获取上游更新
git fetch upstream

# 查看差异
git log --oneline --graph upstream/main..main

# 合并更新
git checkout main
git merge upstream/main

# 推送到自己的fork
git push origin main
```

## 方法3：重新配置Git网络设置

### 如果使用代理
```bash
git config --global http.proxy http://proxy.example.com:8080
git config --global https.proxy https://proxy.example.com:8080
```

### 如果需要取消代理
```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### 增加超时时间
```bash
git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999
```

## 故障排除

### 常见错误及解决方案

1. **Connection was reset**
   - 尝试使用不同的DNS（如8.8.8.8）
   - 检查防火墙设置
   - 尝试使用手机热点

2. **Permission denied (publickey)**
   - 检查SSH密钥配置
   - 改用HTTPS协议

3. **504 Gateway Timeout**
   - 镜像站点不可用，尝试其他镜像或官方地址

## 建议的定期更新流程

1. 每周检查一次上游更新
2. 优先使用Git命令（网络正常时）
3. 网络问题时使用手动下载方式
4. 保持本地配置文件的备份

## 注意事项

- 合并前请备份重要配置
- 检查是否有冲突的自定义修改
- 测试新功能是否正常工作
- 更新后记得重启相关服务 