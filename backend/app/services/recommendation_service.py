import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Recommendation, Machine, Alert
from app.schemas.recommendation import RecommendationResponse

logger = logging.getLogger("voltis.services.recommendation")


def get_recommendations(
    db: Session,
    machine_id: Optional[str] = None,
    alert_id: Optional[str] = None,
) -> List[RecommendationResponse]:
    """
    Retrieve recommendations joined with machine name and alert status.
    Supports filtering by machine_id and alert_id.
    """
    query = (
        db.query(Recommendation, Machine.name.label("machine_name"), Alert.status.label("alert_status"))
        .join(Machine, Recommendation.machine_id == Machine.id, isouter=True)
        .join(Alert, Recommendation.alert_id == Alert.id, isouter=True)
    )

    if machine_id:
        query = query.filter(Recommendation.machine_id == machine_id.strip())

    if alert_id:
        query = query.filter(Recommendation.alert_id == alert_id.strip())

    records = query.order_by(Recommendation.created_at.desc()).all()

    results = []
    for rec, machine_name, alert_status in records:
        actions = rec.recommended_actions if isinstance(rec.recommended_actions, list) else [str(rec.recommended_actions)]
        results.append(
            RecommendationResponse(
                id=rec.id,
                machine_id=rec.machine_id,
                machine_name=machine_name,
                alert_id=rec.alert_id,
                problem=rec.problem,
                likely_cause=rec.likely_cause,
                recommended_actions=actions,
                potential_saving=rec.potential_saving,
                created_at=rec.created_at,
                status=alert_status or "ACTIVE",
            )
        )

    return results


def get_recommendation_by_id(
    db: Session, rec_id: str
) -> Optional[RecommendationResponse]:
    """Retrieve single recommendation by ID with machine and alert context."""
    result = (
        db.query(Recommendation, Machine.name.label("machine_name"), Alert.status.label("alert_status"))
        .join(Machine, Recommendation.machine_id == Machine.id, isouter=True)
        .join(Alert, Recommendation.alert_id == Alert.id, isouter=True)
        .filter(Recommendation.id == rec_id)
        .first()
    )

    if not result:
        return None

    rec, machine_name, alert_status = result
    actions = rec.recommended_actions if isinstance(rec.recommended_actions, list) else [str(rec.recommended_actions)]

    return RecommendationResponse(
        id=rec.id,
        machine_id=rec.machine_id,
        machine_name=machine_name,
        alert_id=rec.alert_id,
        problem=rec.problem,
        likely_cause=rec.likely_cause,
        recommended_actions=actions,
        potential_saving=rec.potential_saving,
        created_at=rec.created_at,
        status=alert_status or "ACTIVE",
    )
