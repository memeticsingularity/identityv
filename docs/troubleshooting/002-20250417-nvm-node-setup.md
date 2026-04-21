# 002 — nvm / Node.js 环境配置排错记录

> 文档编号：002  
> 创建日期：2025-04-17  
> 最后更新：2025-04-17 01:30

---

## 版本记录

| 版本 | 日期 | 更新内容 | 作者 |
|------|------|----------|------|
| v1.0 | 2025-04-17 | 初始版本，记录 PowerShell 执行策略问题及解决方案 | Claude |

---

## 环境

- OS: Windows 11
- Node 版本管理器: nvm-windows
- 目标 Node 版本: 24.15.0
- 终端: PowerShell

## 问题描述

在使用 nvm 安装 Node.js `24.15.0` 后，PowerShell 中执行 `npm` 命令报错：

```powershell
npm : 无法加载文件 J:\nvm4w\nodejs\npm.ps1，因为在此系统上禁止运行脚本。
有关详细信息，请参阅 https:/go.microsoft.com/fwlink/?LinkID=135170 中的 about_Execution_Policies。
```

错误码：`PSSecurityException` / `UnauthorizedAccess`

## 原因分析

Windows PowerShell 默认执行策略为 `Restricted`，禁止运行任何 `.ps1` 脚本。`npm` 在 Windows 上安装时生成了 `npm.ps1` 文件，PowerShell 优先调用该文件而非 `.cmd`，从而触发安全拦截。

## 解决方案

### 方案 A：修改 PowerShell 执行策略（推荐）

在 PowerShell 中以管理员身份执行：

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

输入 `Y` 确认即可。

- `RemoteSigned`：允许运行本地脚本，从网络下载的脚本需签名。
- `Scope CurrentUser`：仅影响当前用户，不修改系统全局策略。

### 方案 B：绕过 PowerShell，使用 CMD / Git Bash

直接打开 `cmd.exe` 或 Git Bash，执行 `npm` 命令。这两种终端不依赖 `.ps1` 脚本，因此不受执行策略影响。

```bash
cd J:/memeticsingularity/IdeaProjects/identityv
npm install
npm run dev
```

## 验证

执行以下命令确认环境正常：

```bash
node -v   # 预期输出：v24.15.0
npm -v    # 预期输出：10.x.x
```

## 后续建议

- 若团队内多人协作，可在 `README.md` 的「快速开始」中备注 Windows 用户需检查 PowerShell 执行策略。
- 若 CI/CD 使用 Windows runner，提前在流水线中配置执行策略或统一使用 `cmd`。
