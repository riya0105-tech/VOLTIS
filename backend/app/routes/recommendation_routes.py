import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.recommendation import RecommendationResponse
from app.services import recommendation_service

logger = logging.getLogger("voltis.routes.recommendations")

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get(
    "",
    response_model=List[RecommendationResponse],
    summary="Get Recommendations",
    description="Returns AI/expert recommendations with machine context, associated alert, root cause, actionable steps, and potential savings.",
)
def get_recommendations(
    machine_id: Optional[str] = Query(None, description="Filter by machine ID"),
    alert_id: Optional[str] = Query(None, description="Filter by alert ID"),
    db: Session = Depends(get_db),
):
    try:
        return recommendation_service.get_recommendations(
            db, machine_id=machine_id, alert_id=alert_id
        )
    except Exception as e:
        logger.error(f"Error retrieving recommendations: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve recommendations.",
        )


@router.get(
    "/{recommendation_id}",
    response_model=RecommendationResponse,
    summary="Get Recommendation by ID",
    description="Returns a single recommendation by its unique identifier.",
)
def get_recommendation(recommendation_id: str, db: Session = Depends(get_db)):
    try:
        rec = recommendation_service.get_recommendation_by_id(db, rec_id=recommendation_id)
        if not rec:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Recommendation with id '{recommendation_id}' not found.",
            )
        return rec
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving recommendation '{recommendation_id}': {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve recommendation '{recommendation_id}'.",
        )
