# Proposal: Kilo Session Manager

## Project Overview

**Project Name**: Kilo Session Manager  
**Type**: Web Application  
**Summary**: A web application for managing and visualizing historical session data from Kilo Code (an AI coding assistant similar to Cursor/Claude Code).  
**Target Users**: Developers who use Kilo Code and want to review, search, and archive their AI coding sessions.

---

## Problem Statement

Kilo Code stores extensive session data in a SQLite database, including conversations, messages, and tasks. However, this data is not easily accessible or searchable. Users need a way to:

- View all past sessions organized by project/time
- Search through conversation content
- Extract knowledge from sessions
- Export sessions for documentation

---

## Data Source

**Database**: SQLite at `~/.local/share/kilo/kilo.db` (read-only)

### Schema

| Table | Count | Columns |
|-------|-------|---------|
| session | 291 | id, project_id, title, directory, time_created, time_updated |
| message | 25,760 | id, session_id, time_created, data |
| part | 100,506 | id, message_id, session_id, data |
| project | 6 | id, name, directory |
| todo | 656 | session_id, content, status |

---

## Core Features

1. **Session List** - Display all sessions grouped by project and time, showing title, timestamp, and project name
2. **Keyword Search** - Full-text search across session content with keyword highlighting, showing matching sessions and messages
3. **Session Detail** - View complete conversation content with collapsible/expandable sections
4. **Knowledge Extraction** - AI-powered extraction of key knowledge (technical solutions, decisions, lessons learned)
5. **Archive Export** - Export sessions/knowledge as Markdown for knowledge base storage
6. **Statistics Panel** - Session count trends, popular projects, message volume statistics

---

## Technical Requirements

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Python FastAPI
- **Database**: Direct read of kilo.db (read-only)
- **Search**: SQLite FTS5 full-text search
- **Deployment**: Docker support

---

## Success Criteria

- [ ] Session list displays all 291 sessions grouped by project and time
- [ ] Search returns relevant results with keyword highlighting
- [ ] Session detail shows complete conversation with collapse/expand
- [ ] Knowledge extraction produces structured output
- [ ] Markdown export works for single sessions and batch
- [ ] Statistics show meaningful analytics
- [ ] Docker deployment works out of the box
