#!/bin/bash

# VCP 部署前检查脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo "🔍 VCP 部署前环境检查"
echo "======================"
echo ""

# 检查必需文件
log_info "检查必需文件..."

# 检查主配置文件
if [ -f "config.env" ]; then
    log_success "config.env 存在"
else
    log_error "config.env 不存在"
    if [ -f "config.env.example" ]; then
        log_info "发现 config.env.example，建议复制并配置："
        echo "  cp config.env.example config.env"
        echo "  nano config.env"
    fi
    exit 1
fi

# 检查Agent目录
if [ -d "Agent" ]; then
    log_success "Agent 目录存在"
    agent_count=$(ls -1 Agent/*.txt 2>/dev/null | wc -l)
    log_info "发现 $agent_count 个Agent配置文件"
else
    log_error "Agent 目录不存在"
    exit 1
fi

# 检查TVStxt目录
if [ -d "TVStxt" ]; then
    log_success "TVStxt 目录存在"
else
    log_error "TVStxt 目录不存在"
    exit 1
fi

# 检查Docker文件
if [ -f "Dockerfile" ]; then
    log_success "Dockerfile 存在"
else
    log_error "Dockerfile 不存在"
    exit 1
fi

if [ -f "docker-compose.prod.yml" ]; then
    log_success "docker-compose.prod.yml 存在"
else
    log_error "docker-compose.prod.yml 不存在"
    exit 1
fi

# 检查package.json
if [ -f "package.json" ]; then
    log_success "package.json 存在"
else
    log_error "package.json 不存在"
    exit 1
fi

# 检查requirements.txt
if [ -f "requirements.txt" ]; then
    log_success "requirements.txt 存在"
else
    log_warning "requirements.txt 不存在，Python依赖可能无法安装"
fi

echo ""
log_info "检查Docker环境..."

# 检查Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    log_success "Docker 已安装: $DOCKER_VERSION"
else
    log_error "Docker 未安装"
    exit 1
fi

# 检查Docker Compose
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    log_success "Docker Compose 已安装: $COMPOSE_VERSION"
else
    log_error "Docker Compose 未安装"
    exit 1
fi

# 检查Docker服务状态
if systemctl is-active --quiet docker 2>/dev/null; then
    log_success "Docker 服务运行中"
else
    log_warning "Docker 服务未运行，尝试启动..."
    sudo systemctl start docker || log_error "无法启动Docker服务"
fi

echo ""
log_info "检查端口占用..."

# 检查端口6005
if netstat -tlnp 2>/dev/null | grep -q ":6005 "; then
    log_warning "端口 6005 已被占用"
    netstat -tlnp 2>/dev/null | grep ":6005 "
else
    log_success "端口 6005 可用"
fi

# 检查端口5890
if netstat -tlnp 2>/dev/null | grep -q ":5890 "; then
    log_warning "端口 5890 已被占用"
    netstat -tlnp 2>/dev/null | grep ":5890 "
else
    log_success "端口 5890 可用"
fi

echo ""
log_info "检查配置文件内容..."

# 检查config.env中的关键配置
if grep -q "API_Key=" config.env; then
    API_KEY=$(grep "API_Key=" config.env | cut -d'=' -f2)
    if [ -n "$API_KEY" ] && [ "$API_KEY" != "your_api_key_here" ]; then
        log_success "API_Key 已配置"
    else
        log_warning "API_Key 未配置或使用默认值"
    fi
else
    log_warning "config.env 中未找到 API_Key"
fi

if grep -q "VCP_Key=" config.env; then
    VCP_KEY=$(grep "VCP_Key=" config.env | cut -d'=' -f2)
    if [ -n "$VCP_KEY" ] && [ "$VCP_KEY" != "123456" ]; then
        log_success "VCP_Key 已配置"
    else
        log_warning "VCP_Key 使用默认值，建议修改"
    fi
else
    log_warning "config.env 中未找到 VCP_Key"
fi

echo ""
log_info "检查磁盘空间..."

# 检查磁盘空间
AVAILABLE_SPACE=$(df -BG . | awk 'NR==2{print $4}' | sed 's/G//')
if [ $AVAILABLE_SPACE -ge 5 ]; then
    log_success "可用磁盘空间: ${AVAILABLE_SPACE}GB"
else
    log_warning "可用磁盘空间不足: ${AVAILABLE_SPACE}GB (建议至少5GB)"
fi

echo ""
log_info "检查内存..."

# 检查内存
TOTAL_MEM=$(free -g | awk '/^Mem:/{print $2}')
AVAILABLE_MEM=$(free -g | awk '/^Mem:/{print $7}')
if [ $TOTAL_MEM -ge 2 ]; then
    log_success "总内存: ${TOTAL_MEM}GB"
else
    log_warning "总内存不足: ${TOTAL_MEM}GB (建议至少2GB)"
fi

if [ $AVAILABLE_MEM -ge 1 ]; then
    log_success "可用内存: ${AVAILABLE_MEM}GB"
else
    log_warning "可用内存不足: ${AVAILABLE_MEM}GB"
fi

echo ""
echo "📋 检查完成总结"
echo "=================="

# 统计检查结果
ERRORS=$(grep -c "✗" /tmp/check_log 2>/dev/null || echo "0")
WARNINGS=$(grep -c "⚠" /tmp/check_log 2>/dev/null || echo "0")

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        log_success "所有检查通过，可以开始部署！"
        echo ""
        echo "🚀 建议的部署命令："
        echo "   ./deploy.sh"
    else
        log_warning "检查通过，但有 $WARNINGS 个警告"
        echo ""
        echo "🚀 可以尝试部署，但建议先处理警告："
        echo "   ./deploy.sh"
    fi
else
    log_error "发现 $ERRORS 个错误，请先解决后再部署"
    exit 1
fi

echo ""
