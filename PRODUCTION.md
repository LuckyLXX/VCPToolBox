# VCP 生产环境部署指南

## 🚀 快速部署

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 内存
- 至少 10GB 磁盘空间

### 一键部署

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 完整部署
./deploy.sh

# 或者分步执行
./deploy.sh build    # 构建镜像
./deploy.sh start    # 启动服务
```

## ⚙️ 配置说明

### 1. 主配置文件

确保 `config.env` 文件存在并配置正确：

```bash
# 如果没有配置文件，从示例复制
cp config.env.example config.env

# 编辑配置文件
nano config.env
```

**重要配置项**：
```env
# API密钥
API_Key=your_gemini_api_key_here
DOUBAO_API_KEY=your_doubao_api_key_here

# 服务器配置
VCP_Key=your_secure_key_here
VAR_HTTP_URL=http://your_server_ip
PORT=6005
WEBSOCKET_PORT=5890
```

### 2. 插件配置

确保以下插件配置文件存在（如果使用相应插件）：

- `Plugin/DoubaoGen/config.env`
- `Plugin/FluxGen/config.env`
- `Plugin/VCPLog/config.env`
- `Plugin/AgentAssistant/config.env`
- `Plugin/WeatherReporter/config.env`
- `Plugin/TavilySearch/config.env`
- `Plugin/FileDownloader/config.env`

## 🔧 管理命令

### 基本操作

```bash
# 查看服务状态
./deploy.sh status

# 查看日志
./deploy.sh logs

# 重启服务
./deploy.sh restart

# 停止服务
./deploy.sh stop
```

### 高级操作

```bash
# 进入容器
docker exec -it vcptoolbox-prod /bin/sh

# 查看资源使用
docker stats vcptoolbox-prod

# 备份数据
./deploy.sh backup

# 清理资源
./deploy.sh cleanup
```

## 📊 监控和维护

### 健康检查

服务包含自动健康检查：
- 检查间隔：30秒
- 超时时间：10秒
- 重试次数：3次

### 日志管理

日志自动轮转配置：
- 最大文件大小：10MB
- 保留文件数：3个

查看日志：
```bash
# 实时日志
./deploy.sh logs

# 查看特定时间的日志
docker-compose -f docker-compose.prod.yml logs --since="2024-01-01T00:00:00"
```

### 数据持久化

以下数据通过Docker volumes持久化：
- `vcptoolbox_dailynote` - 日记数据
- `vcptoolbox_images` - 图片文件
- `vcptoolbox_logs` - 调试日志
- `vcptoolbox_vcp_logs` - VCP日志
- `vcptoolbox_timed_contacts` - 定时联系数据

## 🔒 安全配置

### 资源限制

生产环境配置了资源限制：
- 内存限制：2GB
- CPU限制：1.0核心
- 内存预留：512MB
- CPU预留：0.5核心

### 网络安全

1. **防火墙配置**
   ```bash
   # Ubuntu/Debian
   sudo ufw allow 6005
   sudo ufw allow 5890
   
   # CentOS/RHEL
   sudo firewall-cmd --permanent --add-port=6005/tcp
   sudo firewall-cmd --permanent --add-port=5890/tcp
   sudo firewall-cmd --reload
   ```

2. **访问控制**
   - 使用强密码设置 `VCP_Key`
   - 考虑使用反向代理（Nginx）
   - 配置SSL证书

## 🚨 故障排除

### 常见问题

1. **容器启动失败**
   ```bash
   # 查看详细日志
   ./deploy.sh logs
   
   # 检查配置
   docker-compose -f docker-compose.prod.yml config
   ```

2. **端口冲突**
   ```bash
   # 检查端口占用
   netstat -tlnp | grep 6005
   
   # 修改端口配置
   nano docker-compose.prod.yml
   ```

3. **权限问题**
   ```bash
   # 检查文件权限
   ls -la config.env
   
   # 修复权限
   chmod 644 config.env
   ```

4. **内存不足**
   ```bash
   # 查看内存使用
   docker stats vcptoolbox-prod
   
   # 调整资源限制
   nano docker-compose.prod.yml
   ```

### 重新部署

如果需要完全重新部署：

```bash
# 停止并删除容器
./deploy.sh stop
docker-compose -f docker-compose.prod.yml down -v

# 重新部署
./deploy.sh
```

## 📈 性能优化

### 1. 镜像优化

Dockerfile已经使用多阶段构建优化镜像大小。

### 2. 资源调优

根据实际使用情况调整资源限制：

```yaml
# 在 docker-compose.prod.yml 中调整
deploy:
  resources:
    limits:
      memory: 4G      # 增加内存限制
      cpus: '2.0'     # 增加CPU限制
```

### 3. 数据库优化

如果使用外部数据库，确保：
- 连接池配置合理
- 索引优化
- 定期备份

## 🔄 更新升级

### 代码更新

```bash
# 拉取最新代码
git pull origin main

# 重新构建和部署
./deploy.sh build
./deploy.sh restart
```

### 依赖更新

```bash
# 更新Node.js依赖
npm update

# 更新Python依赖
pip install -r requirements.txt --upgrade

# 重新构建镜像
./deploy.sh build
```

## 📞 支持

如遇问题：

1. 查看日志：`./deploy.sh logs`
2. 检查状态：`./deploy.sh status`
3. 参考故障排除章节
4. 联系技术支持

---

**生产环境部署完成！** 🎉
