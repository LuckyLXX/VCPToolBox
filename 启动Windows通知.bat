@echo off
chcp 65001 >nul
echo 🔔 启动VCP Windows通知服务...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未找到Python，请先安装Python
    pause
    exit /b 1
)

REM 检查依赖库
echo 📦 检查依赖库...
python -c "import win10toast, websocket" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  缺少依赖库，正在安装...
    pip install win10toast websocket-client
    if %errorlevel% neq 0 (
        echo ❌ 依赖库安装失败，请手动执行：
        echo    pip install win10toast websocket-client
        pause
        exit /b 1
    )
)

echo ✅ 依赖库检查完成
echo.

REM 显示配置信息
echo 📋 当前配置：
echo    VCP_Key: lxx98120
echo    WebSocket地址: ws://127.0.0.1:5890
echo    连接URL: ws://127.0.0.1:5890/VCPlog/VCP_Key=lxx98120
echo.

echo 🚀 启动Windows通知客户端...
echo 💡 提示：保持此窗口打开以接收通知
echo 🛑 按 Ctrl+C 可以停止服务
echo.

REM 启动Python脚本
python VCPWinNotify.Py

echo.
echo 📴 通知服务已停止
pause
