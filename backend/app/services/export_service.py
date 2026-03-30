import json
from typing import List, Dict
from datetime import datetime
from app.database import get_db
from app.services.knowledge_service import extract_knowledge
from app.models import timestamp_to_str


def export_session_markdown(session_id: str, source: str = "kilo") -> str:
    """Export a single session as Markdown."""
    db = get_db(source)

    session = db.execute_query_one(
        "SELECT id, title, directory, time_created, time_updated FROM session WHERE id = ?",
        (session_id,),
    )

    if not session:
        return ""

    md = f"# {session[1]}\n\n"
    md += f"- **Directory**: {session[2]}\n"
    md += f"- **Created**: {timestamp_to_str(session[3])}\n"
    md += f"- **Updated**: {timestamp_to_str(session[4])}\n\n"

    messages_query = """
        SELECT data FROM message
        WHERE session_id = ?
        ORDER BY time_created ASC
    """
    message_rows = db.execute_query(messages_query, (session_id,))

    md += "## Messages\n\n"
    for row in message_rows:
        try:
            parsed = json.loads(row[0])
            role = parsed.get("role", "unknown")
            content = parsed.get("content", "")
            if content:
                md += f"### {role.upper()}\n\n{content}\n\n---\n\n"
        except:
            pass

    knowledge = extract_knowledge(session_id, source)

    if knowledge.technical_solutions:
        md += "## Technical Solutions\n\n"
        for sol in knowledge.technical_solutions:
            md += f"- {sol}\n"
        md += "\n"

    if knowledge.key_files:
        md += "## Key Files\n\n"
        for f in knowledge.key_files:
            md += f"- {f}\n"
        md += "\n"

    return md


def export_batch_markdown(session_ids: List[str], source: str = "kilo") -> List[Dict]:
    """Export multiple sessions as Markdown."""
    results = []

    for session_id in session_ids:
        md = export_session_markdown(session_id, source)
        results.append({"session_id": session_id, "markdown": md})

    return results


def export_session_json(session_id: str, source: str = "kilo") -> Dict:
    """Export a session as JSON."""
    db = get_db(source)

    session = db.execute_query_one(
        "SELECT id, project_id, title, directory, time_created, time_updated FROM session WHERE id = ?",
        (session_id,),
    )

    if not session:
        return {}

    messages_query = """
        SELECT id, time_created, data FROM message
        WHERE session_id = ?
        ORDER BY time_created ASC
    """
    message_rows = db.execute_query(messages_query, (session_id,))

    messages = []
    for row in message_rows:
        try:
            parsed = json.loads(row[2])
            messages.append({"id": row[0], "time_created": row[1], "data": parsed})
        except:
            messages.append({"id": row[0], "time_created": row[1], "data": row[2]})

    return {
        "session": {
            "id": session[0],
            "project_id": session[1],
            "title": session[2],
            "directory": session[3],
            "time_created": session[4],
            "time_updated": session[5],
        },
        "messages": messages,
    }
