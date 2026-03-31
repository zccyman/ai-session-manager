from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import (
    sessions,
    messages,
    projects,
    search,
    stats,
    knowledge,
    export,
    sources,
    tab_contents,
)

app = FastAPI(
    title="AI Session Manager",
    description="Session management for Kilo Code and OpenCode",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router)
app.include_router(messages.router)
app.include_router(projects.router)
app.include_router(search.router)
app.include_router(stats.router)
app.include_router(knowledge.router)
app.include_router(export.router)
app.include_router(sources.router)
app.include_router(tab_contents.router)


@app.get("/")
def root():
    return {"name": "AI Session Manager", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
