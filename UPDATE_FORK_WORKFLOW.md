# VCPToolBox 更新与提交工作流指南

> 适用于：已 **fork** 本仓库并在本地进行二次开发的场景。
>
> 目标：
> 1. 拉取上游 (upstream) 最新代码。
> 2. 合并并同步到本地，解决公共模块差异。
> 3. 将本地改动提交并推送回自己的 fork (origin)。

---

## 1. 环境准备

| 条件 | 说明 |
|------|------|
| `origin` | 指向 **自己的 fork**，拥有写权限 |
| `upstream` | 指向 **官方仓库** (`https://github.com/lioensky/VCPToolBox.git`) |
| Git ≥ 2.x | 保证命令可用 |

检查远程：
```bash
git remote -v
```
输出应类似：
```txt
origin   https://github.com/<your-name>/VCPToolBox.git (fetch)
origin   https://github.com/<your-name>/VCPToolBox.git (push)
upstream https://github.com/lioensky/VCPToolBox.git      (fetch)
upstream https://github.com/lioensky/VCPToolBox.git      (push)
```

### 可选：配置镜像以应对网络不佳
```bash
# 临时使用 gitclone 镜像
git config --global url."https://gitclone.com/github.com/".insteadOf "https://github.com/"
# 完成更新后可取消
# git config --global --unset url."https://gitclone.com/github.com/".insteadOf
```

---

## 2. 拉取上游最新更新
```bash
# 拉取全部分支最新提交
git fetch upstream

# 合并上游 main 分支到本地 main
git checkout main           # 确保位于主分支
git merge upstream/main     # 若有冲突请按提示解决并 git add <file>
```
> 合并完成后，本地即包含上游最新代码。

---

## 3. 更新本地公共部分
根据项目约定，公共文件 (如 `config.env.example`、公共主题、脚本工具等) 在合并后需要统一：
1. **审查差异**
   ```bash
   git status     # 查看未暂存 / 冲突文件
   git diff       # 根据需要调整
   ```
2. **全量暂存**（确认无误后）：
   ```bash
   git add -A
   ```

---

## 4. 提交并推送到自己的 fork
```bash
# 提交
git commit -m "同步上游更新 + 本地调整描述"

# 推送到 origin/main
git push origin main
```
完成后，你的 fork 即与上游保持同步，并包含任何本地改进。

---

## 5. 常见问题
| 场景 | 解决方案 |
|-------|-----------|
| **GitHub 连接 443 超时** | 使用上面的 *镜像配置* 或代理工具 |
| **合并冲突** | 依提示编辑冲突文件 → `git add` → `git merge --continue` |
| **推送 502 / 503** | 重试、检查代理或临时切回官方域名 |

---

> 以上流程已在 2025-07-03 的实际操作中验证，可直接复制命令使用。 