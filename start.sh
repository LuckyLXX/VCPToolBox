#!/bin/sh

# 启动脚本 - 确保Chromium可用并启动VCPToolBox

echo "=== VCPToolBox Startup Script ==="

# 检查Chromium是否安装
if ! command -v chromium >/dev/null 2>&1; then
    echo "Chromium not found, installing..."
    apk add --no-cache chromium
fi

# 验证Chromium安装
if command -v chromium >/dev/null 2>&1; then
    echo "Chromium version: $(chromium --version)"
    export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
    echo "PUPPETEER_EXECUTABLE_PATH set to: $PUPPETEER_EXECUTABLE_PATH"
else
    echo "ERROR: Chromium installation failed!"
    exit 1
fi

# 启动VCPToolBox
echo "Starting VCPToolBox..."
exec node server.js
