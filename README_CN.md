# AI Session Manager

[English](README.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AI 编程助手会话管理工具，支持 Kilo Code、OpenCode 和 TabBitBrowser，提供搜索、导出和批量提取功能。

## 功能特性

- **集中管理** — 在一个地方查看来自 Kilo Code 和 OpenCode 的所有会话
- **会话搜索** — 全文搜索会话内容，支持关键词高亮
- **消息查看** — 浏览完整的对话历史，支持折叠/展开
- **项目统计** — 会话数量、消息量和热门项目分析
- **数据导出** — 将会话导出为 Markdown 或 JSON 格式
- **多数据源** — 支持在 Kilo Code 和 OpenCode 数据源之间切换
- **浏览器标签页导出** — 通过浏览器扩展提取并保存 TabBitBrowser 聊天内容

## 截图

> **说明：** 截图将在首个版本发布后补充。

| 会话列表 | 会话详情 |
|:---:|:---:|
| *截图占位符* | *截图占位符* |

## 快速开始

### 方式一：Docker 运行（推荐）

```bash
# 克隆仓库
git clone https://github.com/zccyman/ai-session-manager.git
cd ai-session-manager

# 启动服务
./start.sh docker

# 停止服务
./start.sh stop
```

访问 http://localhost:3000

### 方式二：本地运行

**后端：**
```bash
cd ai-session-manager/backend
pip install -r requirements.txt
./start.sh backend
```

**前端：**
```bash
cd ai-session-manager/frontend
npm install
npm run dev
```

## 配置

后端环境变量（参考 `ai-session-manager/backend/.env.example`）：
- `DATABASE_URL`: SQLite 数据库路径
- `OPENCODE_DB_PATH`: OpenCode 数据库路径

## API 文档

启动后端后访问：http://localhost:8000/docs

## 项目结构

```
ai-session-manager/
├── .kilocode/                          # Kilo 配置
│   ├── skills/
│   │   └── dev-workflow/
│   │       └── SKILL.md                # 开发工作流技能
│   └── workflows/
├── ai-session-manager/                 # 主应用代码
│   ├── backend/                        # FastAPI 后端
│   │   ├── app/
│   │   │   ├── routes/                 # API 路由
│   │   │   ├── services/               # 业务逻辑
│   │   │   ├── models.py               # 数据模型
│   │   │   ├── database.py             # 数据库连接
│   │   │   └── main.py                 # FastAPI 应用
│   │   └── requirements.txt
│   ├── frontend/                       # React 前端
│   │   ├── src/
│   │   │   ├── components/             # UI 组件
│   │   │   ├── hooks/                  # React Hooks
│   │   │   ├── services/               # API 客户端
│   │   │   └── types/                  # TypeScript 类型
│   │   └── package.json
│   └── extension/                      # 浏览器扩展
│       ├── manifest.json               # 扩展配置
│       ├── popup.html                  # 弹窗界面
│       ├── popup.js                    # 弹窗逻辑
│       ├── content.js                  # 内容脚本
│       └── styles.css                  # 扩展样式
├── openspec/                           # OpenSpec 规格
│   ├── changes/                        # 变更提案
│   └── specs/                          # 项目规格
├── docker-compose.yml
├── start.sh                            # 启动脚本
└── README.md
```

## 浏览器扩展

浏览器扩展允许您从 TabBitBrowser 提取聊天内容并发送到 AI Session Manager。

### 安装步骤

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 右上角开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `ai-session-manager/extension` 文件夹

### 使用方法

1. 访问 TabBitBrowser 聊天页面（`https://web.tabbitbrowser.com/chat/*`）
2. 点击工具栏中的扩展图标
3. 选择以下操作之一：
   - **提取当前标签页** — 提取当前标签页的聊天内容
   - **提取所有标签页** — 提取所有打开的 TabBitBrowser 标签页
4. 点击 **发送到 AI Session Manager** 或 **一键发送所有** 保存内容

### 功能特点

- **单标签页提取** — 提取当前标签页的对话
- **批量提取** — 一键提取所有 TabBitBrowser 标签页
- **复制到剪贴板** — 直接复制 Markdown 内容
- **下载为文件** — 保存为 `.md` 文件
- **API 配置** — 在扩展弹窗中配置 API 地址

## 技术栈

| 组件 | 技术 |
|------|------|
| 后端 | FastAPI + SQLite |
| 前端 | React + TypeScript + Vite + TailwindCSS |
| 搜索 | SQLite FTS5 |
| 部署 | Docker + Docker Compose |

## 开发指南

### 本地开发环境搭建

```bash
# 克隆仓库
git clone https://github.com/zccyman/ai-session-manager.git
cd ai-session-manager

# 启动后端
cd ai-session-manager/backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# 启动前端（另开终端）
cd ai-session-manager/frontend
npm install
npm run dev
```

### 调试方法

- **后端 API 文档**: http://localhost:8000/docs
- **前端开发服务器**: http://localhost:5173
- **后端日志**: 查看运行 uvicorn 的终端
- **前端日志**: 查看浏览器 DevTools 控制台

## 开源协议

本项目基于 [MIT 协议](LICENSE) 开源。

## 致谢

- 为管理 [Kilo Code](https://kilo.ai/) 和 [OpenCode](https://github.com/opencode-ai/opencode) 会话数据而构建
- 源于提取和归档 AI 编程知识的需求
