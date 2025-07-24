#!/bin/bash

# VCP代码上传到GitHub脚本

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

echo "🚀 VCP代码上传到GitHub脚本"
echo "================================"
echo ""

# 检查Git是否安装
if ! command -v git &> /dev/null; then
    log_error "Git未安装，请先安装Git"
    exit 1
fi

log_success "Git环境检查通过"

# 检查是否已初始化Git仓库
if [ ! -d ".git" ]; then
    log_info "初始化Git仓库..."
    git init
    log_success "Git仓库初始化完成"
else
    log_success "Git仓库已存在"
fi

# 设置远程仓库
log_info "配置远程仓库..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/LuckyLXX/VCPToolBox.git
log_success "远程仓库配置完成"

# 检查敏感文件
log_info "检查敏感文件..."
if [ -f "config.env" ]; then
    log_warning "发现 config.env 文件，已在.gitignore中排除"
fi
if [ -f "Plugin/DoubaoGen/config.env" ]; then
    log_warning "发现插件配置文件，已在.gitignore中排除"
fi
log_success "敏感文件检查完成"

# 添加文件到暂存区
log_info "添加文件到暂存区..."
git add .
log_success "文件添加完成"

# 检查是否有变更
if git diff --cached --quiet; then
    log_info "没有检测到文件变更"
    echo "📊 当前状态："
    git status --porcelain
    exit 0
fi

# 显示将要提交的文件
echo "📋 将要提交的文件："
git diff --cached --name-status
echo ""

# 提交变更
read -p "💬 请输入提交信息（直接回车使用默认信息）: " commit_message
if [ -z "$commit_message" ]; then
    commit_message="Update VCP codebase for cloud deployment"
fi

log_info "提交变更..."
git commit -m "$commit_message"
log_success "提交完成"

# 推送到GitHub
log_info "推送到GitHub..."
log_warning "如果是首次推送，可能需要输入GitHub用户名和密码/Token"
echo ""

if git push -u origin main; then
    log_success "推送完成"
else
    log_error "推送失败，尝试强制推送..."
    log_warning "这将覆盖远程仓库的内容"
    read -p "是否继续强制推送？(y/N): " force_push
    if [[ $force_push =~ ^[Yy]$ ]]; then
        if git push -u origin main --force; then
            log_success "强制推送完成"
        else
            log_error "强制推送也失败了"
            echo "💡 可能的解决方案："
            echo "   1. 检查网络连接"
            echo "   2. 验证GitHub仓库地址"
            echo "   3. 确认GitHub访问权限"
            echo "   4. 检查Git凭据"
            exit 1
        fi
    else
        log_error "用户取消推送"
        exit 1
    fi
fi

# 显示成功信息
echo ""
log_success "🎉 代码上传成功！"
echo "================================"
echo ""
echo "📍 GitHub仓库地址："
echo "   https://github.com/LuckyLXX/VCPToolBox"
echo ""
echo "🚀 云服务器部署命令："
echo "   curl -fsSL https://raw.githubusercontent.com/LuckyLXX/VCPToolBox/main/deploy-cloud.sh -o deploy-cloud.sh"
echo "   chmod +x deploy-cloud.sh"
echo "   ./deploy-cloud.sh"
echo ""
echo "📋 下一步操作："
echo "   1. 登录您的云服务器"
echo "   2. 执行上述部署命令"
echo "   3. 根据提示配置API密钥"
echo "   4. 访问 http://您的服务器IP:6005"
echo ""
