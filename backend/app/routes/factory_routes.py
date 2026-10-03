import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.factory import FactoryOverviewResponse
from app.services import factory_service

logger = logging.getLogger("voltis.routes.factory")

router = APIRouter(prefix="/api/factory", tags=["Factory"])


@router.get(
    "/overview",
    response_model=FactoryOverviewResponse,
    summary="Get Factory Overview and Top-Level KPIs",
    description="Returns factory metadata and real-time aggregate KPIs (energy today, cost, energy intensity, CO2, production).",
)
def get_factory_overview(
    factory_id: Optional[str] = Query(None, description="Optional factory ID filter"),
    db: Session = Depends(get_db),
):
    try:
        overview = factory_service.get_factory_overview(db, factory_id=factory_id)
        if not overview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Factory '{factory_id or 'default'}' not found.",
            )
        return overview
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching factory overview: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve factory overview.",
        )
