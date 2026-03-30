from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import PlainTextResponse
from typing import List
from app.services.export_service import (
    export_session_markdown,
    export_batch_markdown,
    export_session_json,
)
from app.models import ExportRequest, ExportResponse

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get("/markdown/{session_id}", response_class=PlainTextResponse)
def export_markdown(
    session_id: str,
    source: str = Query("kilo", description="Data source: kilo or opencode"),
):
    md = export_session_markdown(session_id, source)
    if not md:
        raise HTTPException(status_code=404, detail="Session not found")
    return md


@router.post("/batch", response_model=ExportResponse)
def export_batch(
    request: ExportRequest,
    source: str = Query("kilo", description="Data source: kilo or opencode"),
):
    results = export_batch_markdown(request.session_ids, source)
    return ExportResponse(files=results)


@router.get("/json/{session_id}")
def export_json(
    session_id: str,
    source: str = Query("kilo", description="Data source: kilo or opencode"),
):
    data = export_session_json(session_id, source)
    if not data:
        raise HTTPException(status_code=404, detail="Session not found")
    return data
