# AI Session Manager

管理 Kilo Code 和 OpenCode 的历史会话数据。

## 功能特性

- 集中管理 Kilo Code 和 OpenCode 会话
- 会话搜索和过滤
- 消息内容查看
- 项目维度统计
- 数据导出 (JSON/Markdown)

## 快速开始

### 方式一：Docker 运行（推荐）

```bash
# 启动服务
./start.sh docker

# 停止服务
./start.sh stop
```

访问 http://localhost:3000

### 方式二：本地运行

**后端：**
```bash
cd backend
pip install -r requirements.txt
./start.sh backend
```

**前端：**
```bash
cd frontend
npm install
npm run dev
```

## 配置

后端环境变量（参考 `backend/.env.example`）：
- `DATABASE_URL`: SQLite 数据库路径
- `OPENCODE_DB_PATH`: OpenCode 数据库路径

## API 文档

启动后端后访问：http://localhost:8000/docs

## 技术栈

- 后端：FastAPI + SQLite
- 前端：React + TypeScript + Vite + TailwindCSS