"""AI Copilot router for VOLTIS Energy Intelligence Platform."""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.copilot import CopilotRequest, CopilotResponse
from app.services import copilot_service

logger = logging.getLogger("voltis.routes.copilot")

router = APIRouter(prefix="/api/copilot", tags=["Copilot"])


@router.post(
    "",
    response_model=CopilotResponse,
    summary="Ask AI Copilot Factory Energy Question",
    description="Processes natural language inquiries regarding factory energy consumption, machine performance, alerts, and recommendations.",
)
async def ask_copilot(
    request: CopilotRequest,
    db: Session = Depends(get_db),
):
    """
    POST /api/copilot
    Accepts: {"message": str}
    Returns: {"answer": str, "contributors": [{"machine": str, "contribution_percent": float}], "recommendations": [str]}
    """
    try:
        return await copilot_service.process_copilot_query(db, request.message)
    except Exception as e:
        logger.error(f"Error processing Copilot query: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process Copilot query.",
        )
