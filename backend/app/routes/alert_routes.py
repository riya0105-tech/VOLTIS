import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.alert import AlertResponse
from app.services import alert_service

logger = logging.getLogger("voltis.routes.alerts")

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get(
    "",
    response_model=List[AlertResponse],
    summary="Get Alerts",
    description="Returns factory alerts with optional filters for severity (ANOMALY, WARNING, NORMAL), status (ACTIVE, ACKNOWLEDGED, RESOLVED), and machine_id.",
)
def get_alerts(
    severity: Optional[str] = Query(None, description="Filter by severity: ANOMALY, WARNING, NORMAL, HIGH"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: ACTIVE, ACKNOWLEDGED, RESOLVED"),
    machine_id: Optional[str] = Query(None, description="Filter by machine ID"),
    db: Session = Depends(get_db),
):
    try:
        return alert_service.get_alerts(
            db, severity=severity, status=status_filter, machine_id=machine_id
        )
    except Exception as e:
        logger.error(f"Error fetching alerts: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve alerts.",
        )
