#!/bin/sh

echo "=== VCPToolBox Initialization Script ==="

# 检查是否为root用户
if [ "$(id -u)" != "0" ]; then
    echo "ERROR: This script must be run as root"
    exit 1
fi

# 检查apk是否可用
if ! command -v apk >/dev/null 2>&1; then
    echo "ERROR: apk package manager not found"
    exit 1
fi

# 安装Chromium
echo "Installing Chromium..."
if apk add --no-cache chromium; then
    echo "Chromium installed successfully"
    chromium --version
else
    echo "ERROR: Failed to install Chromium"
    exit 1
fi

# 设置环境变量
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

echo "Environment variables set:"
echo "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=$PUPPETEER_SKIP_CHROMIUM_DOWNLOAD"
echo "PUPPETEER_EXECUTABLE_PATH=$PUPPETEER_EXECUTABLE_PATH"

# 验证Chromium可用性
if command -v chromium >/dev/null 2>&1; then
    echo "Chromium verification: OK"
else
    echo "ERROR: Chromium verification failed"
    exit 1
fi

# 启动VCPToolBox
echo "Starting VCPToolBox server..."
exec node server.js
