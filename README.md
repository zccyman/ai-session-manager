# AI Session Manager

[中文文档](README_CN.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A web application for managing and visualizing historical session data from Kilo Code and OpenCode AI coding assistants.

## Features

- **Centralized Management** — View all sessions from Kilo Code and OpenCode in one place
- **Session Search** — Full-text search across session content with keyword highlighting
- **Message Viewing** — Browse complete conversation history with expandable sections
- **Project Statistics** — Analytics on session count, message volume, and popular projects
- **Data Export** — Export sessions as Markdown or JSON for documentation and archiving
- **Multi-Source Support** — Switch between Kilo Code and OpenCode data sources

## Screenshots

> **Note:** Screenshots will be added after the first release.

| Session List | Session Detail |
|:---:|:---:|
| *Screenshot placeholder* | *Screenshot placeholder* |

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/zccyman/ai-session-manager.git
cd ai-session-manager

# Start services
./start.sh docker

# Stop services
./start.sh stop
```

Access http://localhost:3000

### Option 2: Local Development

**Backend:**
```bash
cd ai-session-manager/backend
pip install -r requirements.txt
./start.sh backend
```

**Frontend:**
```bash
cd ai-session-manager/frontend
npm install
npm run dev
```

## Configuration

Backend environment variables (see `ai-session-manager/backend/.env.example`):
- `DATABASE_URL`: SQLite database path
- `OPENCODE_DB_PATH`: OpenCode database path

## API Documentation

After starting the backend, visit: http://localhost:8000/docs

## Project Structure

```
ai-session-manager/
├── .kilocode/                          # Kilo configuration
│   ├── skills/
│   │   └── dev-workflow/
│   │       └── SKILL.md                # Dev workflow skill
│   └── workflows/
├── ai-session-manager/                 # Main application code
│   ├── backend/                        # FastAPI backend
│   │   ├── app/
│   │   │   ├── routes/                 # API routes
│   │   │   ├── services/               # Business logic
│   │   │   ├── models.py               # Data models
│   │   │   ├── database.py             # Database connection
│   │   │   └── main.py                 # FastAPI app
│   │   └── requirements.txt
│   └── frontend/                       # React frontend
│       ├── src/
│       │   ├── components/             # UI components
│       │   ├── hooks/                  # React hooks
│       │   ├── services/               # API client
│       │   └── types/                  # TypeScript types
│       └── package.json
├── openspec/                           # OpenSpec specifications
│   ├── changes/                        # Change proposals
│   └── specs/                          # Project specifications
├── docker-compose.yml
├── start.sh                            # Startup scripts
└── README.md
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | FastAPI + SQLite |
| Frontend | React + TypeScript + Vite + TailwindCSS |
| Search | SQLite FTS5 |
| Deployment | Docker + Docker Compose |

## Development

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/zccyman/ai-session-manager.git
cd ai-session-manager

# Start backend
cd ai-session-manager/backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Start frontend (in another terminal)
cd ai-session-manager/frontend
npm install
npm run dev
```

### Debugging

- **Backend API docs**: http://localhost:8000/docs
- **Frontend dev server**: http://localhost:5173
- **Backend logs**: Check terminal running uvicorn
- **Frontend logs**: Check browser DevTools console

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for managing [Kilo Code](https://kilo.ai/) and [OpenCode](https://github.com/opencode-ai/opencode) session data
- Inspired by the need to extract and archive AI coding knowledge
