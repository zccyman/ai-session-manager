# Design: Kilo Session Manager

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │SessionList│ │ Search  │ │DetailView│ │ Stats    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP API
┌────────────────────────────┴────────────────────────────────┐
│                  Backend (FastAPI)                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │Sessions  │ │ Search   │ │Messages  │ │ Stats    │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
└────────────────────────────┬────────────────────────────────┘
                             │ SQL (read-only)
┌────────────────────────────┴────────────────────────────────┐
│              SQLite Database (kilo.db)                       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐     │
│  │session │ │message │ │  part  │ │project │ │  todo  │     │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Design (FastAPI)

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry
│   ├── config.py            # Configuration
│   ├── database.py          # SQLite connection
│   ├── models.py            # Pydantic models
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── sessions.py      # Session endpoints
│   │   ├── search.py        # Search endpoints
│   │   ├── messages.py      # Message endpoints
│   │   ├── projects.py      # Project endpoints
│   │   └── stats.py         # Statistics endpoints
│   └── services/
│       ├── __init__.py
│       ├── search_service.py
│       ├── knowledge_service.py
│       └── export_service.py
├── requirements.txt
├── Dockerfile
└── .env.example
```

### API Endpoints

#### Sessions
- `GET /api/sessions` - List all sessions (with pagination, filtering)
- `GET /api/sessions/{session_id}` - Get session details
- `GET /api/sessions/by-project/{project_id}` - Sessions for a project
- `GET /api/sessions/by-date/{date}` - Sessions for a date

#### Messages
- `GET /api/sessions/{session_id}/messages` - Get messages for session
- `GET /api/messages/{message_id}` - Get single message

#### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/{project_id}` - Get project details

#### Search
- `GET /api/search` - Full-text search with highlighting
- Query params: `q` (search term), `limit`, `offset`

#### Statistics
- `GET /api/stats/overview` - Overall statistics
- `GET /api/stats/trends` - Session trends over time
- `GET /api/stats/projects` - Per-project statistics
- `GET /api/stats/messages` - Message volume stats

#### Knowledge & Export
- `POST /api/knowledge/extract` - Extract knowledge from session
- `GET /api/export/markdown/{session_id}` - Export as Markdown
- `POST /api/export/batch` - Batch export multiple sessions

### Database Schema (FTS5)

```sql
-- Create FTS5 virtual table for full-text search
CREATE VIRTUAL TABLE sessions_fts USING fts5(
    session_title,
    message_content,
    content='',
    tokenize='porter unicode61'
);
```

---

## Frontend Design (React + TypeScript + Tailwind)

### Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── Sessions/
│   │   │   ├── SessionList.tsx
│   │   │   ├── SessionCard.tsx
│   │   │   └── SessionDetail.tsx
│   │   ├── Search/
│   │   │   ├── SearchBar.tsx
│   │   │   └── SearchResults.tsx
│   │   ├── Messages/
│   │   │   ├── MessageBubble.tsx
│   │   │   └── MessageThread.tsx
│   │   ├── Knowledge/
│   │   │   └── KnowledgeCard.tsx
│   │   ├── Stats/
│   │   │   ├── StatsPanel.tsx
│   │   │   └── Charts.tsx
│   │   └── Export/
│   │       └── ExportButton.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Sessions.tsx
│   │   ├── Search.tsx
│   │   ├── SessionDetail.tsx
│   │   └── Stats.tsx
│   ├── hooks/
│   │   ├── useSessions.ts
│   │   ├── useSearch.ts
│   │   └── useStats.ts
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── Dockerfile
└── .env.example
```

### UI/UX Design

#### Color Palette
- Primary: `#6366f1` (Indigo-500)
- Secondary: `#8b5cf6` (Violet-500)
- Background: `#0f172a` (Slate-900)
- Surface: `#1e293b` (Slate-800)
- Text Primary: `#f8fafc` (Slate-50)
- Text Secondary: `#94a3b8` (Slate-400)
- Accent: `#22d3ee` (Cyan-400)

#### Layout
- Sidebar (240px): Navigation, project list
- Main content: Session list/detail/search
- Right panel (optional): Quick stats

#### Components

1. **SessionCard**
   - Title, project name, timestamp
   - Message count badge
   - Click to view detail

2. **SearchBar**
   - Input with search icon
   - Real-time search suggestions
   - Filter by project/date

3. **MessageBubble**
   - Role (user/assistant) indicator
   - Timestamp
   - Copy button
   - Collapse/expand

4. **StatsPanel**
   - Charts using Recharts
   - Session trends line chart
   - Project distribution pie chart
   - Message volume bar chart

---

## Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ~/.local/share/kilo:/data:ro
    environment:
      - DB_PATH=/data/kilo.db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

---

## Data Models

### Session
```typescript
interface Session {
  id: number;
  project_id: number;
  title: string;
  directory: string;
  time_created: string;
  time_updated: string;
  message_count?: number;
  project_name?: string;
}
```

### Message
```typescript
interface Message {
  id: number;
  session_id: number;
  time_created: string;
  data: string; // JSON string with role, content
  parts?: Part[];
}

interface Part {
  id: number;
  message_id: number;
  session_id: number;
  data: string;
}
```

### Project
```typescript
interface Project {
  id: number;
  name: string;
  directory: string;
  session_count?: number;
}
```

### SearchResult
```typescript
interface SearchResult {
  session_id: number;
  session_title: string;
  message_id: number;
  snippet: string;
  highlights: string[];
}
```

---

## Knowledge Extraction

### Prompt Template

```
Analyze the following Kilo Code session and extract:

1. Technical Solutions - Any code solutions, patterns, or approaches used
2. Decisions - Important decisions made and their rationale
3. Lessons Learned - Any insights or lessons from this session
4. Key Files - Important files that were modified or discussed

Session Title: {title}
Messages:
{messages}

Provide a structured summary in Markdown format.
```

---

## Security Considerations

- Database is read-only (no write operations)
- API rate limiting for search
- CORS configuration for frontend
- Environment variable validation
- No sensitive data logging
