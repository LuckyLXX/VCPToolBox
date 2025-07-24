#!/bin/bash

# VCP 云服务器一键部署脚本
# 适用于从GitHub仓库部署到云服务器

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
REPO_URL="https://github.com/LuckyLXX/VCPToolBox.git"
PROJECT_DIR="VCPToolBox"
COMPOSE_FILE="docker-compose.prod.yml"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# 检查系统环境
check_system() {
    log_info "检查系统环境..."
    
    # 检查操作系统
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        log_success "操作系统: Linux"
    else
        log_error "不支持的操作系统: $OSTYPE"
        exit 1
    fi
    
    # 检查是否为root用户
    if [[ $EUID -eq 0 ]]; then
        log_warning "当前为root用户，建议使用普通用户运行"
    fi
}

# 安装Docker
install_docker() {
    log_info "检查Docker环境..."
    
    if command -v docker &> /dev/null; then
        log_success "Docker已安装: $(docker --version)"
    else
        log_info "安装Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        log_success "Docker安装完成"
    fi
    
    if command -v docker-compose &> /dev/null; then
        log_success "Docker Compose已安装: $(docker-compose --version)"
    else
        log_info "安装Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        log_success "Docker Compose安装完成"
    fi
    
    # 启动Docker服务
    sudo systemctl start docker
    sudo systemctl enable docker
}

# 克隆代码
clone_repository() {
    log_info "克隆代码仓库..."
    
    if [ -d "$PROJECT_DIR" ]; then
        log_info "项目目录已存在，更新代码..."
        cd $PROJECT_DIR
        git pull origin main
        cd ..
    else
        log_info "克隆新仓库..."
        git clone $REPO_URL $PROJECT_DIR
    fi
    
    log_success "代码准备完成"
}

# 配置环境
setup_environment() {
    log_info "配置环境..."
    
    cd $PROJECT_DIR
    
    # 创建配置文件
    if [ ! -f "config.env" ]; then
        log_info "创建配置文件..."
        cp config.env.example config.env
        
        # 获取服务器公网IP
        PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP")
        
        # 基本配置替换
        sed -i "s/YOUR_SERVER_IP/$PUBLIC_IP/g" config.env
        sed -i "s/123456/$(openssl rand -hex 16)/g" config.env
        
        log_warning "请编辑 config.env 文件，配置以下重要参数："
        echo "  - API_Key: 您的AI服务API密钥"
        echo "  - VCP_Key: 已自动生成安全密钥"
        echo "  - VAR_HTTP_URL: 已设置为 http://$PUBLIC_IP"
        echo "  - 各种插件的API密钥"
        
        read -p "配置完成后按回车继续..."
    else
        log_success "配置文件已存在"
    fi
    
    # 创建插件配置文件
    create_plugin_configs
    
    # 创建必要目录
    mkdir -p {dailynote,image/{doubaogen,fluxgen,urlfetch,agentassistant},Plugin/VCPLog/log,DebugLog,VCPTimedContacts}
    
    log_success "环境配置完成"
}

# 创建插件配置文件
create_plugin_configs() {
    log_info "创建插件配置文件..."
    
    # DoubaoGen配置
    if [ ! -f "Plugin/DoubaoGen/config.env" ]; then
        cat > Plugin/DoubaoGen/config.env << EOF
DOUBAO_API_KEY=your_doubao_api_key_here
DebugMode=false
EOF
        log_info "已创建 Plugin/DoubaoGen/config.env"
    fi
    
    # FluxGen配置
    if [ ! -f "Plugin/FluxGen/config.env" ]; then
        cat > Plugin/FluxGen/config.env << EOF
SILICONFLOW_API_KEY=your_siliconflow_api_key_here
DebugMode=false
EOF
        log_info "已创建 Plugin/FluxGen/config.env"
    fi
    
    # VCPLog配置
    if [ ! -f "Plugin/VCPLog/config.env" ]; then
        cat > Plugin/VCPLog/config.env << EOF
VCP_Key=\${VCP_Key}
DebugMode=false
EOF
        log_info "已创建 Plugin/VCPLog/config.env"
    fi
    
    # WeatherReporter配置
    if [ ! -f "Plugin/WeatherReporter/config.env" ]; then
        cat > Plugin/WeatherReporter/config.env << EOF
WeatherKey=your_weather_api_key_here
WeatherUrl=https://api.qweather.com
DebugMode=false
EOF
        log_info "已创建 Plugin/WeatherReporter/config.env"
    fi
    
    # TavilySearch配置
    if [ ! -f "Plugin/TavilySearch/config.env" ]; then
        cat > Plugin/TavilySearch/config.env << EOF
TavilyKey=your_tavily_api_key_here
DebugMode=false
EOF
        log_info "已创建 Plugin/TavilySearch/config.env"
    fi
}

# 配置防火墙
setup_firewall() {
    log_info "配置防火墙..."
    
    # Ubuntu/Debian
    if command -v ufw &> /dev/null; then
        sudo ufw allow 6005
        sudo ufw allow 5890
        sudo ufw allow 22
        log_success "UFW防火墙配置完成"
    fi
    
    # CentOS/RHEL
    if command -v firewall-cmd &> /dev/null; then
        sudo firewall-cmd --permanent --add-port=6005/tcp
        sudo firewall-cmd --permanent --add-port=5890/tcp
        sudo firewall-cmd --permanent --add-port=22/tcp
        sudo firewall-cmd --reload
        log_success "Firewalld防火墙配置完成"
    fi
}

# 部署服务
deploy_service() {
    log_info "部署VCP服务..."
    
    # 构建镜像
    docker-compose -f $COMPOSE_FILE build
    
    # 启动服务
    docker-compose -f $COMPOSE_FILE up -d
    
    log_success "服务部署完成"
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 30
    
    # 健康检查
    check_service_health
}

# 健康检查
check_service_health() {
    log_info "检查服务健康状态..."
    
    # 检查容器状态
    if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
        log_success "容器运行正常"
    else
        log_error "容器未正常运行"
        docker-compose -f $COMPOSE_FILE logs
        return 1
    fi
    
    # 检查HTTP服务
    if curl -f -s http://localhost:6005/ > /dev/null; then
        log_success "HTTP服务正常"
    else
        log_warning "HTTP服务可能未就绪"
    fi
    
    show_deployment_info
}

# 显示部署信息
show_deployment_info() {
    PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "YOUR_SERVER_IP")
    
    echo ""
    log_success "=== VCP云服务器部署完成 ==="
    echo ""
    echo "🌐 服务访问地址:"
    echo "   HTTP API: http://$PUBLIC_IP:6005"
    echo "   WebSocket: ws://$PUBLIC_IP:5890"
    echo ""
    echo "📋 管理命令:"
    echo "   查看日志: docker-compose -f $COMPOSE_FILE logs -f"
    echo "   重启服务: docker-compose -f $COMPOSE_FILE restart"
    echo "   停止服务: docker-compose -f $COMPOSE_FILE down"
    echo "   更新代码: git pull && docker-compose -f $COMPOSE_FILE up -d --build"
    echo ""
    echo "🔧 容器管理:"
    echo "   查看状态: docker-compose -f $COMPOSE_FILE ps"
    echo "   进入容器: docker exec -it vcptoolbox-prod /bin/sh"
    echo ""
    echo "📁 重要文件:"
    echo "   主配置: ./config.env"
    echo "   插件配置: ./Plugin/*/config.env"
    echo "   日志目录: ./DebugLog/"
    echo ""
}

# 主函数
main() {
    echo "🚀 VCP 云服务器一键部署脚本"
    echo "=================================="
    echo "仓库地址: $REPO_URL"
    echo ""
    
    case "$1" in
        --update)
            cd $PROJECT_DIR
            git pull origin main
            docker-compose -f $COMPOSE_FILE up -d --build
            log_success "更新完成"
            ;;
        --logs)
            cd $PROJECT_DIR
            docker-compose -f $COMPOSE_FILE logs -f
            ;;
        --stop)
            cd $PROJECT_DIR
            docker-compose -f $COMPOSE_FILE down
            log_success "服务已停止"
            ;;
        --restart)
            cd $PROJECT_DIR
            docker-compose -f $COMPOSE_FILE restart
            log_success "服务已重启"
            ;;
        *)
            # 完整部署流程
            check_system
            install_docker
            clone_repository
            setup_environment
            setup_firewall
            deploy_service
            ;;
    esac
}

# 执行主函数
main "$@"
