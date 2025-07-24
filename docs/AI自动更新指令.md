# AI 自动更新指令手册

## 🎯 AI更新原则

### 核心原则
1. **保护优先**：永远优先保护用户的本地修改
2. **备份为王**：任何操作前都要先备份
3. **渐进更新**：分步骤执行，每步确认
4. **智能判断**：区分哪些文件可以更新，哪些需要保护

## 📋 AI执行检查清单

### 🔍 更新前必做检查
```markdown
- [ ] 检查git状态：`git status`
- [ ] 识别本地修改：`git diff --name-only`
- [ ] 检查未跟踪文件：`git ls-files --others --exclude-standard`
- [ ] 确认重要文件：config.env, Agent/, TVStxt/filetool.txt
```

### 💾 强制备份文件列表
```
必须备份的文件：
✅ config.env (主配置)
✅ Agent/*.txt (所有Agent文件)
✅ TVStxt/filetool.txt (工具说明)
✅ Plugin/*/config.env (插件配置)
✅ AppData/ (应用数据，如果存在)

可选备份：
⚠️ README.md (如有本地修改)
⚠️ package.json (如有本地修改)
⚠️ 自定义插件目录
```

## 🤖 AI标准更新流程

### 步骤1：环境检查
```bash
# AI执行命令序列
echo "🔍 开始更新前检查..."

# 检查当前目录
pwd

# 检查git状态
git status

# 检查是否有本地修改
LOCAL_CHANGES=$(git status --porcelain)
if [ ! -z "$LOCAL_CHANGES" ]; then
    echo "⚠️ 发现本地修改，需要备份"
    echo "$LOCAL_CHANGES"
fi
```

### 步骤2：智能备份
```bash
# 创建时间戳备份目录
BACKUP_DIR="backup/auto_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

echo "💾 备份重要文件到 $BACKUP_DIR"

# 备份核心配置文件
if [ -f "config.env" ]; then
    cp config.env $BACKUP_DIR/
    echo "✅ 已备份 config.env"
fi

# 备份Agent目录
if [ -d "Agent" ]; then
    cp -r Agent/ $BACKUP_DIR/
    echo "✅ 已备份 Agent/ 目录"
fi

# 备份工具说明
if [ -f "TVStxt/filetool.txt" ]; then
    mkdir -p $BACKUP_DIR/TVStxt
    cp TVStxt/filetool.txt $BACKUP_DIR/TVStxt/
    echo "✅ 已备份 TVStxt/filetool.txt"
fi

# 备份插件配置
find Plugin/ -name "config.env" -exec cp --parents {} $BACKUP_DIR/ \; 2>/dev/null
echo "✅ 已备份插件配置文件"
```

### 步骤3：安全暂存
```bash
# 暂存所有本地修改
echo "📦 暂存本地修改..."
git add .
git stash push -m "AI自动更新前备份 $(date +%Y%m%d_%H%M%S)"

# 确认暂存成功
STASH_COUNT=$(git stash list | wc -l)
echo "✅ 已创建第 $STASH_COUNT 个暂存"
```

### 步骤4：获取更新信息
```bash
# 获取远程更新
echo "🔄 获取远程更新..."
git fetch upstream

# 显示即将更新的内容
echo "📋 即将更新的内容："
git log --oneline HEAD..upstream/main

# 检查是否有更新
UPDATE_COUNT=$(git rev-list --count HEAD..upstream/main)
if [ $UPDATE_COUNT -eq 0 ]; then
    echo "ℹ️ 已是最新版本，无需更新"
    exit 0
fi

echo "🔢 发现 $UPDATE_COUNT 个新提交"
```

### 步骤5：执行更新
```bash
# 执行合并
echo "⚡ 执行更新..."
git merge upstream/main

# 检查合并结果
if [ $? -eq 0 ]; then
    echo "✅ 更新成功"
else
    echo "❌ 更新失败，可能存在冲突"
    git status
    echo "🔧 需要手动解决冲突"
fi
```

### 步骤6：智能恢复
```bash
# 恢复重要配置文件
echo "🔧 恢复重要配置..."

# 恢复主配置文件
if [ -f "$BACKUP_DIR/config.env" ]; then
    cp $BACKUP_DIR/config.env ./
    echo "✅ 已恢复 config.env"
fi

# 恢复Agent文件
if [ -d "$BACKUP_DIR/Agent" ]; then
    cp -r $BACKUP_DIR/Agent/* Agent/
    echo "✅ 已恢复 Agent 文件"
fi

# 恢复工具说明（需要智能合并）
if [ -f "$BACKUP_DIR/TVStxt/filetool.txt" ]; then
    # 检查是否有新的工具说明
    if ! diff -q TVStxt/filetool.txt $BACKUP_DIR/TVStxt/filetool.txt > /dev/null; then
        echo "⚠️ filetool.txt 有差异，需要智能合并"
        # 这里需要AI进行智能判断和合并
    fi
fi
```

## 🧠 AI智能判断规则

### 文件处理策略

#### 🔒 完全保护（直接恢复备份）
```
config.env - 用户个人配置，完全保护
Agent/*.txt - 用户自定义Agent，完全保护
Plugin/*/config.env - 插件个人配置，完全保护
```

#### 🔄 智能合并（需要AI判断）
```
TVStxt/filetool.txt - 可能有新工具，需要合并
README.md - 可能有新功能说明，需要合并
package.json - 可能有新依赖，需要检查
```

#### ⚡ 直接更新（接受远程版本）
```
server.js - 核心服务器代码
Plugin.js - 插件管理器
WebSocketServer.js - WebSocket服务
Plugin/*/plugin-manifest.json - 插件清单
Plugin/*/*.js - 插件代码（非config.env）
```

### AI合并判断逻辑

#### 对于 filetool.txt
```javascript
// AI判断逻辑
if (本地版本有新增工具说明 && 远程版本也有新增) {
    // 需要合并两者的新增内容
    合并策略：保留本地新增 + 添加远程新增
} else if (本地版本有新增工具说明) {
    // 保留本地版本
    使用本地备份版本
} else {
    // 使用远程版本
    接受更新
}
```

#### 对于 Agent 文件
```javascript
// AI判断逻辑
for (每个Agent文件) {
    if (文件在备份中存在) {
        // 完全保护用户自定义
        恢复备份版本
    } else if (远程有新的Agent文件) {
        // 新增的官方Agent可以添加
        保留远程新增
    }
}
```

## 📝 AI执行模板

### 完整更新命令序列
```bash
#!/bin/bash
# AI自动更新脚本模板

set -e  # 遇到错误立即停止

echo "🚀 开始AI自动更新流程"

# 1. 环境检查
echo "1️⃣ 环境检查..."
pwd
git status

# 2. 创建备份
echo "2️⃣ 创建备份..."
BACKUP_DIR="backup/ai_$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# 备份重要文件
[ -f "config.env" ] && cp config.env $BACKUP_DIR/
[ -d "Agent" ] && cp -r Agent/ $BACKUP_DIR/
[ -f "TVStxt/filetool.txt" ] && mkdir -p $BACKUP_DIR/TVStxt && cp TVStxt/filetool.txt $BACKUP_DIR/TVStxt/

# 3. 暂存修改
echo "3️⃣ 暂存本地修改..."
git add .
git stash push -m "AI更新前备份 $(date)"

# 4. 获取更新
echo "4️⃣ 获取远程更新..."
git fetch upstream
git log --oneline HEAD..upstream/main

# 5. 执行更新
echo "5️⃣ 执行更新..."
git merge upstream/main

# 6. 恢复配置
echo "6️⃣ 恢复重要配置..."
[ -f "$BACKUP_DIR/config.env" ] && cp $BACKUP_DIR/config.env ./
[ -d "$BACKUP_DIR/Agent" ] && cp -r $BACKUP_DIR/Agent/* Agent/

echo "✅ 更新完成！"
echo "📁 备份位置: $BACKUP_DIR"
echo "🔄 如需完全回滚: git reset --hard HEAD~1 && git stash pop"
```

## 🆘 AI故障处理

### 常见问题及AI处理方案

#### 1. 合并冲突
```bash
if git status | grep -q "both modified"; then
    echo "❌ 发现合并冲突"
    echo "🔧 冲突文件："
    git status | grep "both modified"
    
    # AI应该提示用户手动处理
    echo "⚠️ 需要用户手动解决冲突"
    echo "💡 建议操作："
    echo "   1. 编辑冲突文件"
    echo "   2. git add <解决的文件>"
    echo "   3. git commit"
fi
```

#### 2. 重要文件丢失
```bash
# 检查重要文件是否存在
for file in "config.env" "Agent" "TVStxt/filetool.txt"; do
    if [ ! -e "$file" ]; then
        echo "⚠️ 重要文件丢失: $file"
        if [ -e "$BACKUP_DIR/$file" ]; then
            cp -r $BACKUP_DIR/$file ./
            echo "✅ 已从备份恢复: $file"
        fi
    fi
done
```

#### 3. 更新失败回滚
```bash
if [ $? -ne 0 ]; then
    echo "❌ 更新失败，执行回滚..."
    git merge --abort 2>/dev/null || true
    git reset --hard HEAD
    git stash pop
    echo "🔄 已回滚到更新前状态"
fi
```

## 💡 AI最佳实践

1. **始终确认**：每个关键步骤都要确认成功
2. **详细日志**：记录每个操作的结果
3. **用户友好**：用清晰的emoji和消息提示用户
4. **错误处理**：为每种可能的错误准备处理方案
5. **可回滚**：确保任何操作都可以安全回滚

记住：**AI的职责是保护用户数据，而不是盲目更新！** 🛡️
