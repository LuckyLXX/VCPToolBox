#!/bin/bash

# VCP 生产环境部署脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
COMPOSE_FILE="docker-compose.prod.yml"
CONTAINER_NAME="vcptoolbox-prod"

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

# 检查Docker环境
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    log_success "Docker环境检查通过"
}

# 检查配置文件
check_config() {
    if [ ! -f "config.env" ]; then
        log_warning "config.env不存在，请确保配置文件已准备好"
        if [ -f "config.env.example" ]; then
            log_info "发现config.env.example，可以复制并修改："
            echo "  cp config.env.example config.env"
            echo "  nano config.env"
        fi
        exit 1
    fi
    
    log_success "配置文件检查通过"
}

# 构建镜像
build_image() {
    log_info "构建Docker镜像..."
    docker-compose -f $COMPOSE_FILE build
    log_success "镜像构建完成"
}

# 启动服务
start_service() {
    log_info "启动VCP服务..."
    docker-compose -f $COMPOSE_FILE up -d
    log_success "服务启动完成"
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    check_health
}

# 停止服务
stop_service() {
    log_info "停止VCP服务..."
    docker-compose -f $COMPOSE_FILE down
    log_success "服务已停止"
}

# 重启服务
restart_service() {
    log_info "重启VCP服务..."
    docker-compose -f $COMPOSE_FILE restart
    log_success "服务重启完成"
    check_health
}

# 查看日志
show_logs() {
    log_info "显示服务日志..."
    docker-compose -f $COMPOSE_FILE logs -f --tail=100
}

# 健康检查
check_health() {
    log_info "检查服务健康状态..."
    
    # 检查容器状态
    if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
        log_success "容器运行正常"
    else
        log_error "容器未正常运行"
        docker-compose -f $COMPOSE_FILE ps
        return 1
    fi
    
    # 检查HTTP服务
    sleep 5
    if curl -f -s http://localhost:6005/ > /dev/null 2>&1; then
        log_success "HTTP服务正常 (端口6005)"
    else
        log_warning "HTTP服务可能未就绪，请稍后检查"
    fi
    
    show_info
}

# 显示服务信息
show_info() {
    echo ""
    log_success "=== VCP服务信息 ==="
    echo ""
    echo "🌐 服务地址:"
    echo "   HTTP API: http://localhost:6005"
    echo "   WebSocket: ws://localhost:5890"
    echo ""
    echo "📋 管理命令:"
    echo "   查看状态: docker-compose -f $COMPOSE_FILE ps"
    echo "   查看日志: ./deploy.sh logs"
    echo "   重启服务: ./deploy.sh restart"
    echo "   停止服务: ./deploy.sh stop"
    echo ""
    echo "🔧 容器管理:"
    echo "   进入容器: docker exec -it $CONTAINER_NAME /bin/sh"
    echo "   查看资源: docker stats $CONTAINER_NAME"
    echo ""
}

# 清理资源
cleanup() {
    log_info "清理Docker资源..."
    docker system prune -f
    log_success "清理完成"
}

# 备份数据
backup() {
    log_info "备份数据..."
    
    BACKUP_DIR="backup"
    DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/vcptoolbox_backup_$DATE.tar.gz"
    
    mkdir -p $BACKUP_DIR
    
    # 备份Docker volumes
    docker run --rm \
        -v vcptoolbox_dailynote:/data/dailynote \
        -v vcptoolbox_images:/data/images \
        -v vcptoolbox_logs:/data/logs \
        -v vcptoolbox_vcp_logs:/data/vcp_logs \
        -v $(pwd)/$BACKUP_DIR:/backup \
        alpine:latest \
        tar -czf /backup/vcptoolbox_volumes_$DATE.tar.gz -C /data .
    
    # 备份配置文件
    tar -czf $BACKUP_FILE \
        config.env \
        Plugin/*/config.env \
        Agent/ \
        TVStxt/ 2>/dev/null || true
    
    log_success "备份完成: $BACKUP_FILE"
}

# 显示帮助
show_help() {
    echo "VCP Docker 部署脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  deploy    完整部署（默认）"
    echo "  build     只构建镜像"
    echo "  start     启动服务"
    echo "  stop      停止服务"
    echo "  restart   重启服务"
    echo "  logs      查看日志"
    echo "  status    查看状态"
    echo "  cleanup   清理资源"
    echo "  backup    备份数据"
    echo "  help      显示帮助"
    echo ""
}

# 主函数
main() {
    case "$1" in
        build)
            check_docker
            check_config
            build_image
            ;;
        start)
            check_docker
            check_config
            start_service
            ;;
        stop)
            stop_service
            ;;
        restart)
            restart_service
            ;;
        logs)
            show_logs
            ;;
        status)
            docker-compose -f $COMPOSE_FILE ps
            ;;
        cleanup)
            cleanup
            ;;
        backup)
            backup
            ;;
        help)
            show_help
            ;;
        deploy|"")
            # 完整部署流程
            echo "🚀 VCP Docker 生产环境部署"
            echo "============================="
            echo ""
            check_docker
            check_config
            build_image
            start_service
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
