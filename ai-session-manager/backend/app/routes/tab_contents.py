from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
import json
import time
import uuid

from app.database import get_db
from app.models import (
    TabContent,
    TabContentCreate,
    TabContentWithStats,
    TabContentMessage,
    timestamp_to_str,
)

router = APIRouter(prefix="/api/tab-contents", tags=["tab-contents"])


def get_app_db():
    """Get the app's own database for storing tab contents."""
    from app.database import Database
    import os

    db_path = os.environ.get("APP_DB_PATH", "data/app.db")
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    db = Database(db_path)
    db.execute_query("""
        CREATE TABLE IF NOT EXISTS tab_contents (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            url TEXT,
            markdown TEXT NOT NULL,
            messages TEXT,
            source TEXT DEFAULT 'tabbit',
            created_at INTEGER,
            updated_at INTEGER
        )
    """)
    return db


@router.post("", response_model=TabContent)
def create_tab_content(content: TabContentCreate):
    db = get_app_db()
    content_id = f"tab_{uuid.uuid4().hex[:12]}"
    now = int(time.time() * 1000)
    messages_json = json.dumps([m.model_dump() for m in content.messages])

    db.execute_query(
        """INSERT INTO tab_contents (id, title, url, markdown, messages, source, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            content_id,
            content.title,
            content.url,
            content.markdown,
            messages_json,
            content.source,
            now,
            now,
        ),
    )

    return TabContent(
        id=content_id,
        title=content.title,
        url=content.url,
        markdown=content.markdown,
        messages=content.messages,
        source=content.source,
        created_at=now,
        updated_at=now,
    )


@router.get("", response_model=List[TabContentWithStats])
def list_tab_contents(
    source: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    db = get_app_db()

    query = "SELECT id, title, url, markdown, messages, source, created_at, updated_at FROM tab_contents"
    params = []

    if source:
        query += " WHERE source = ?"
        params.append(source)

    query += " ORDER BY updated_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    rows = db.execute_query(query, tuple(params))

    contents = []
    for row in rows:
        messages = []
        if row[4]:
            try:
                messages = [TabContentMessage(**m) for m in json.loads(row[4])]
            except:
                messages = []

        contents.append(
            TabContentWithStats(
                id=row[0],
                title=row[1],
                url=row[2],
                markdown=row[3],
                messages=messages,
                source=row[5] or "tabbit",
                created_at=row[6],
                updated_at=row[7],
                message_count=len(messages),
                char_count=len(row[3]) if row[3] else 0,
                created_at_str=timestamp_to_str(row[6]) if row[6] else None,
                updated_at_str=timestamp_to_str(row[7]) if row[7] else None,
            )
        )

    return contents


@router.get("/search", response_model=List[TabContentWithStats])
def search_tab_contents(
    q: str = Query(..., min_length=1), limit: int = Query(50, ge=1, le=500)
):
    db = get_app_db()
    search_term = f"%{q}%"

    query = """
        SELECT id, title, url, markdown, messages, source, created_at, updated_at
        FROM tab_contents
        WHERE title LIKE ? OR markdown LIKE ?
        ORDER BY updated_at DESC
        LIMIT ?
    """

    rows = db.execute_query(query, (search_term, search_term, limit))

    contents = []
    for row in rows:
        messages = []
        if row[4]:
            try:
                messages = [TabContentMessage(**m) for m in json.loads(row[4])]
            except:
                messages = []

        contents.append(
            TabContentWithStats(
                id=row[0],
                title=row[1],
                url=row[2],
                markdown=row[3],
                messages=messages,
                source=row[5] or "tabbit",
                created_at=row[6],
                updated_at=row[7],
                message_count=len(messages),
                char_count=len(row[3]) if row[3] else 0,
                created_at_str=timestamp_to_str(row[6]) if row[6] else None,
                updated_at_str=timestamp_to_str(row[7]) if row[7] else None,
            )
        )

    return contents


@router.get("/{content_id}", response_model=TabContentWithStats)
def get_tab_content(content_id: str):
    db = get_app_db()

    row = db.execute_query_one(
        "SELECT id, title, url, markdown, messages, source, created_at, updated_at FROM tab_contents WHERE id = ?",
        (content_id,),
    )

    if not row:
        raise HTTPException(status_code=404, detail="Tab content not found")

    messages = []
    if row[4]:
        try:
            messages = [TabContentMessage(**m) for m in json.loads(row[4])]
        except:
            messages = []

    return TabContentWithStats(
        id=row[0],
        title=row[1],
        url=row[2],
        markdown=row[3],
        messages=messages,
        source=row[5] or "tabbit",
        created_at=row[6],
        updated_at=row[7],
        message_count=len(messages),
        char_count=len(row[3]) if row[3] else 0,
        created_at_str=timestamp_to_str(row[6]) if row[6] else None,
        updated_at_str=timestamp_to_str(row[7]) if row[7] else None,
    )


@router.put("/{content_id}", response_model=TabContent)
def update_tab_content(content_id: str, content: TabContentCreate):
    db = get_app_db()
    now = int(time.time() * 1000)
    messages_json = json.dumps([m.model_dump() for m in content.messages])

    existing = db.execute_query_one(
        "SELECT id FROM tab_contents WHERE id = ?", (content_id,)
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Tab content not found")

    db.execute_query(
        """UPDATE tab_contents SET title=?, url=?, markdown=?, messages=?, source=?, updated_at=?
           WHERE id=?""",
        (
            content.title,
            content.url,
            content.markdown,
            messages_json,
            content.source,
            now,
            content_id,
        ),
    )

    return TabContent(
        id=content_id,
        title=content.title,
        url=content.url,
        markdown=content.markdown,
        messages=content.messages,
        source=content.source,
        created_at=existing[6] if len(existing) > 6 else now,
        updated_at=now,
    )


@router.delete("/{content_id}")
def delete_tab_content(content_id: str):
    db = get_app_db()

    existing = db.execute_query_one(
        "SELECT id FROM tab_contents WHERE id = ?", (content_id,)
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Tab content not found")

    db.execute_query("DELETE FROM tab_contents WHERE id = ?", (content_id,))

    return {"message": "Deleted successfully"}


@router.get("/{content_id}/markdown")
def export_markdown(content_id: str):
    db = get_app_db()

    row = db.execute_query_one(
        "SELECT title, markdown FROM tab_contents WHERE id = ?", (content_id,)
    )

    if not row:
        raise HTTPException(status_code=404, detail="Tab content not found")

    return {"title": row[0], "markdown": row[1]}
