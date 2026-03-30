# AI Session Manager

A tool for managing historical session data from Kilo Code and OpenCode.

## Features

- Centralized management of Kilo Code and OpenCode sessions
- Session search and filtering
- Message content viewing
- Project-based statistics
- Data export (JSON/Markdown)

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Start services
./start.sh docker

# Stop services
./start.sh stop
```

Access http://localhost:3000

### Option 2: Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
./start.sh backend
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Configuration

Backend environment variables (see `backend/.env.example`):
- `DATABASE_URL`: SQLite database path
- `OPENCODE_DB_PATH`: OpenCode database path

## API Docs

After starting backend, visit: http://localhost:8000/docs

## Tech Stack

- Backend: FastAPI + SQLite
- Frontend: React + TypeScript + Vite + TailwindCSS