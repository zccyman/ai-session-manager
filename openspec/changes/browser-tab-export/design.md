# Design: Browser Tab Export

## 架构

```
Browser Extension
       |
       | HTTP POST /api/tab-contents
       v
Backend (FastAPI)
       |
       | SQLite
       v
Frontend (React)
```

## 后端设计

### 数据模型

```python
class TabContent(BaseModel):
    id: str
    title: str
    url: str
    markdown: str
    messages: List[Message]
    source: str  # "tabbit", "other"
    created_at: int
    updated_at: int
```

### API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/tab-contents | 创建标签页内容 |
| GET | /api/tab-contents | 获取列表 |
| GET | /api/tab-contents/{id} | 获取详情 |
| PUT | /api/tab-contents/{id} | 更新内容 |
| DELETE | /api/tab-contents/{id} | 删除内容 |
| GET | /api/tab-contents/search?q= | 搜索 |
| GET | /api/tab-contents/{id}/markdown | 导出单个 Markdown |
| POST | /api/tab-contents/export-to-directory | 批量导出到目录 |
| GET | /api/tab-contents/export-to-directory/progress/{task_id} | 查询导出进度 |

### 数据库表

```sql
CREATE TABLE tab_contents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT,
    markdown TEXT NOT NULL,
    messages TEXT,  -- JSON
    source TEXT DEFAULT 'tabbit',
    created_at INTEGER,
    updated_at INTEGER
);
```

## 前端设计

### 页面结构

```
TabContents
├── SearchBar
├── TabContentList (列表页)
│   └── TabContentCard
├── TabContentDetail (详情页)
│   ├── MarkdownPreview
│   ├── CopyButton
│   └── DownloadButton
└── BatchExportPanel (批量导出面板)
    ├── ExportDirInput (目录输入，默认 G:\knowledge\source\browser-export)
    └── ExportButton + ProgressDisplay
```

### 状态管理

使用 React Hooks 管理：
- tabContents: 列表数据
- selectedContent: 选中的内容
- searchQuery: 搜索关键词

## 浏览器扩展设计

### 修改内容

1. 在 popup.js 中添加"发送到 AI Session Manager"按钮
2. 添加配置项：API 地址
3. 发送 POST 请求到后端

### 配置

```javascript
const API_URL = 'http://localhost:8000/api/tab-contents';
```
