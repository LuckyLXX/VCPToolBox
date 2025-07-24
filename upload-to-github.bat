@echo off
chcp 65001 >nul
echo 🚀 VCP代码上传到GitHub脚本
echo ================================
echo.

REM 检查Git是否安装
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未找到Git，请先安装Git
    echo 下载地址：https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✅ Git环境检查通过
echo.

REM 检查是否已初始化Git仓库
if not exist ".git" (
    echo 📦 初始化Git仓库...
    git init
    echo ✅ Git仓库初始化完成
) else (
    echo ✅ Git仓库已存在
)

REM 设置远程仓库
echo 🔗 配置远程仓库...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/LuckyLXX/VCPToolBox.git
echo ✅ 远程仓库配置完成

REM 检查敏感文件
echo 🔒 检查敏感文件...
if exist "config.env" (
    echo ⚠️  发现 config.env 文件，已在.gitignore中排除
)
if exist "Plugin\DoubaoGen\config.env" (
    echo ⚠️  发现插件配置文件，已在.gitignore中排除
)
echo ✅ 敏感文件检查完成

REM 添加文件到暂存区
echo 📁 添加文件到暂存区...
git add .
echo ✅ 文件添加完成

REM 检查是否有变更
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo ℹ️  没有检测到文件变更
    echo 📊 当前状态：
    git status --porcelain
    pause
    exit /b 0
)

REM 显示将要提交的文件
echo 📋 将要提交的文件：
git diff --cached --name-status
echo.

REM 提交变更
set /p commit_message="💬 请输入提交信息（直接回车使用默认信息）: "
if "%commit_message%"=="" (
    set commit_message=Update VCP codebase for cloud deployment
)

echo 💾 提交变更...
git commit -m "%commit_message%"
if %errorlevel% neq 0 (
    echo ❌ 提交失败
    pause
    exit /b 1
)
echo ✅ 提交完成

REM 推送到GitHub
echo 🌐 推送到GitHub...
echo ⚠️  如果是首次推送，可能需要输入GitHub用户名和密码/Token
echo.

git push -u origin main
if %errorlevel% neq 0 (
    echo ❌ 推送失败，尝试强制推送...
    echo ⚠️  这将覆盖远程仓库的内容
    set /p force_push="是否继续强制推送？(y/N): "
    if /i "%force_push%"=="y" (
        git push -u origin main --force
        if %errorlevel% neq 0 (
            echo ❌ 强制推送也失败了
            echo 💡 可能的解决方案：
            echo    1. 检查网络连接
            echo    2. 验证GitHub仓库地址
            echo    3. 确认GitHub访问权限
            echo    4. 检查Git凭据
            pause
            exit /b 1
        )
    ) else (
        echo ❌ 用户取消推送
        pause
        exit /b 1
    )
)

echo ✅ 推送完成
echo.

REM 显示成功信息
echo 🎉 代码上传成功！
echo ================================
echo.
echo 📍 GitHub仓库地址：
echo    https://github.com/LuckyLXX/VCPToolBox
echo.
echo 🚀 云服务器部署命令：
echo    curl -fsSL https://raw.githubusercontent.com/LuckyLXX/VCPToolBox/main/deploy-cloud.sh -o deploy-cloud.sh
echo    chmod +x deploy-cloud.sh
echo    ./deploy-cloud.sh
echo.
echo 📋 下一步操作：
echo    1. 登录您的云服务器
echo    2. 执行上述部署命令
echo    3. 根据提示配置API密钥
echo    4. 访问 http://您的服务器IP:6005
echo.

pause
