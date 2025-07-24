#!/bin/sh

# VCP Docker 容器启动脚本

set -e

echo "🚀 Starting VCP ToolBox..."
echo "=========================="

# 检查必要文件
echo "📋 Checking required files..."

if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found"
    exit 1
fi

if [ ! -f "config.env" ]; then
    echo "⚠️  Warning: config.env not found, using defaults"
else
    echo "✅ config.env found"
fi

if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    exit 1
fi

# 检查node_modules
if [ ! -d "node_modules" ]; then
    echo "❌ Error: node_modules not found"
    echo "💡 This usually means the Docker build failed"
    exit 1
fi

# 检查关键依赖
echo "🔍 Checking critical dependencies..."
if [ ! -d "node_modules/ws" ]; then
    echo "❌ Error: ws module not found in node_modules"
    echo "📦 Available modules:"
    ls -la node_modules/ | head -10
    exit 1
fi

if [ ! -d "node_modules/express" ]; then
    echo "❌ Error: express module not found in node_modules"
    exit 1
fi

echo "✅ Critical dependencies check passed"
echo "✅ Basic file check passed"

# 检查端口环境变量
PORT=${PORT:-6005}
echo "🌐 Server will start on port: $PORT"

# 设置Node.js环境
export NODE_ENV=${NODE_ENV:-production}
echo "🔧 Node environment: $NODE_ENV"

# 尝试使用pm2-runtime启动
echo "🔄 Attempting to start with pm2-runtime..."
if [ -f "node_modules/.bin/pm2-runtime" ] && [ -x "node_modules/.bin/pm2-runtime" ]; then
    echo "✅ pm2-runtime found, starting with PM2..."
    exec node_modules/.bin/pm2-runtime start server.js --name "vcptoolbox"
else
    echo "⚠️  pm2-runtime not found or not executable, falling back to node..."
    
    # 检查是否有全局pm2
    if command -v pm2 >/dev/null 2>&1; then
        echo "✅ Global pm2 found, starting with global PM2..."
        exec pm2-runtime start server.js --name "vcptoolbox"
    else
        echo "📦 Starting with direct node..."
        exec node server.js
    fi
fi
