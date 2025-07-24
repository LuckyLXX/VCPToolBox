# VCP 云服务器部署指南

## 🚀 一键部署

### 快速开始

在您的云服务器上执行以下命令：

```bash
# 下载部署脚本
curl -fsSL https://raw.githubusercontent.com/LuckyLXX/VCPToolBox/main/deploy-cloud.sh -o deploy-cloud.sh

# 给脚本执行权限
chmod +x deploy-cloud.sh

# 运行一键部署
./deploy-cloud.sh
```

### 部署过程

脚本将自动完成：

1. ✅ **环境检查** - 检查系统兼容性
2. ✅ **安装Docker** - 自动安装Docker和Docker Compose
3. ✅ **克隆代码** - 从GitHub获取最新代码
4. ✅ **配置环境** - 创建配置文件和目录
5. ✅ **防火墙设置** - 开放必要端口
6. ✅ **服务部署** - 构建镜像并启动服务

## ⚙️ 配置说明

### 主要配置文件

部署完成后，请编辑以下配置文件：

#### 1. 主配置文件 `config.env`
```env
# API配置
API_Key=your_gemini_api_key_here
DOUBAO_API_KEY=your_doubao_api_key_here

# 服务器配置
VCP_Key=auto_generated_secure_key
VAR_HTTP_URL=http://your_server_ip

# 其他配置...
```

#### 2. 插件配置文件
- `Plugin/DoubaoGen/config.env` - 豆包图像生成
- `Plugin/FluxGen/config.env` - Flux图像生成
- `Plugin/WeatherReporter/config.env` - 天气服务
- `Plugin/TavilySearch/config.env` - 搜索服务

### 必需的API密钥

请准备以下API密钥：

| 服务 | 配置项 | 说明 |
|------|--------|------|
| Gemini | `API_Key` | Google Gemini API密钥 |
| 豆包 | `DOUBAO_API_KEY` | 字节跳动豆包API密钥 |
| 硅基流动 | `SILICONFLOW_API_KEY` | Flux图像生成API密钥 |
| 和风天气 | `WeatherKey` | 天气API密钥（可选） |
| Tavily | `TavilyKey` | 搜索API密钥（可选） |

## 🌐 访问服务

部署完成后，您可以通过以下地址访问：

- **HTTP API**: `http://your_server_ip:6005`
- **WebSocket**: `ws://your_server_ip:5890`
- **健康检查**: `http://your_server_ip:6005/health`

## 🔧 管理命令

### 常用操作

```bash
# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
./deploy-cloud.sh --logs

# 重启服务
./deploy-cloud.sh --restart

# 停止服务
./deploy-cloud.sh --stop

# 更新代码
./deploy-cloud.sh --update
```

### 高级操作

```bash
# 进入容器
docker exec -it vcptoolbox-prod /bin/sh

# 查看资源使用
docker stats vcptoolbox-prod

# 备份数据
docker-compose -f docker-compose.prod.yml exec vcptoolbox tar -czf /tmp/backup.tar.gz dailynote image Plugin/VCPLog/log
```

## 🔒 安全建议

### 防火墙配置

确保只开放必要端口：
- `22` - SSH访问
- `6005` - VCP HTTP服务
- `5890` - VCP WebSocket服务

### 访问控制

1. **使用强密码**
   - 设置复杂的VCP_Key
   - 使用强SSH密码或密钥认证

2. **IP白名单**（可选）
   ```bash
   # 只允许特定IP访问
   sudo ufw allow from YOUR_IP to any port 6005
   ```

3. **SSL证书**（推荐）
   - 使用Let's Encrypt免费证书
   - 配置HTTPS访问

## 📊 监控和维护

### 日志管理

```bash
# 查看实时日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.prod.yml logs vcptoolbox

# 清理日志
docker system prune -f
```

### 数据备份

```bash
# 创建备份脚本
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/vcptoolbox"
mkdir -p $BACKUP_DIR

# 备份配置和数据
tar -czf $BACKUP_DIR/vcptoolbox_$DATE.tar.gz \
    config.env \
    Plugin/*/config.env \
    dailynote/ \
    image/ \
    Plugin/VCPLog/log/

echo "备份完成: $BACKUP_DIR/vcptoolbox_$DATE.tar.gz"
EOF

chmod +x backup.sh
```

### 自动更新

```bash
# 设置定时更新（可选）
echo "0 2 * * 0 cd /path/to/VCPToolBox && ./deploy-cloud.sh --update" | crontab -
```

## 🚨 故障排除

### 常见问题

1. **容器启动失败**
   ```bash
   # 查看详细错误
   docker-compose -f docker-compose.prod.yml logs
   
   # 检查配置
   docker-compose -f docker-compose.prod.yml config
   ```

2. **端口访问问题**
   ```bash
   # 检查端口占用
   netstat -tlnp | grep 6005
   
   # 检查防火墙
   sudo ufw status
   ```

3. **权限问题**
   ```bash
   # 修复权限
   sudo chown -R $USER:$USER ./
   chmod -R 755 ./
   ```

### 获取帮助

- 查看日志：`./deploy-cloud.sh --logs`
- 检查状态：`docker-compose -f docker-compose.prod.yml ps`
- 重新部署：`./deploy-cloud.sh`

## 📞 支持

如遇问题，请：

1. 查看部署日志
2. 检查配置文件
3. 参考GitHub Issues
4. 联系技术支持

---

**祝您部署顺利！** 🎉
