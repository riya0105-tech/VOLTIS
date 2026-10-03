import logging
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.energy import EnergyDataPoint
from app.services import energy_service

logger = logging.getLogger("voltis.routes.energy")

router = APIRouter(prefix="/api/energy", tags=["Energy"])


@router.get(
    "/today",
    response_model=List[EnergyDataPoint],
    summary="Get Today's Energy Time-Series",
    description="Returns hourly actual vs expected energy consumption, cost, and energy intensity for today (last 24-hour cycle).",
)
def get_today_energy(
    machine_id: Optional[str] = Query(None, description="Filter by specific machine ID"),
    db: Session = Depends(get_db),
):
    try:
        return energy_service.get_today_energy(db, machine_id=machine_id)
    except Exception as e:
        logger.error(f"Error fetching today's energy: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve today's energy data.",
        )


@router.get(
    "/history",
    response_model=List[EnergyDataPoint],
    summary="Get Historical Energy Time-Series",
    description="Returns historical actual vs expected energy consumption supporting date range and machine filtering.",
)
def get_energy_history(
    from_date_str: Optional[str] = Query(None, alias="from", description="ISO start timestamp (e.g., 2026-09-25T00:00:00Z)"),
    to_date_str: Optional[str] = Query(None, alias="to", description="ISO end timestamp (e.g., 2026-09-27T00:00:00Z)"),
    machine_id: Optional[str] = Query(None, description="Filter by specific machine ID"),
    db: Session = Depends(get_db),
):
    from_date = None
    to_date = None

    if from_date_str:
        try:
            # Normalize ISO string with 'Z'
            from_date = datetime.fromisoformat(from_date_str.replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid 'from' timestamp format: '{from_date_str}'. Use ISO format (e.g. 2026-09-25T00:00:00Z).",
            )

    if to_date_str:
        try:
            to_date = datetime.fromisoformat(to_date_str.replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid 'to' timestamp format: '{to_date_str}'. Use ISO format (e.g. 2026-09-27T00:00:00Z).",
            )

    try:
        return energy_service.get_energy_history(
            db, from_date=from_date, to_date=to_date, machine_id=machine_id
        )
    except Exception as e:
        logger.error(f"Error fetching historical energy data: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve historical energy data.",
        )
