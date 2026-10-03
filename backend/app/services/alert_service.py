import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Alert, Machine
from app.schemas.alert import AlertResponse

logger = logging.getLogger("voltis.services.alert")


def get_alerts(
    db: Session,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    machine_id: Optional[str] = None,
) -> List[AlertResponse]:
    """
    Retrieve factory alerts with optional filtering by severity, status, and machine_id.
    Includes machine name context and estimated waste/cost impacts.
    """
    query = db.query(Alert, Machine.name.label("machine_name")).join(
        Machine, Alert.machine_id == Machine.id, isouter=True
    )

    if severity:
        query = query.filter(Alert.severity.ilike(severity.strip()))

    if status:
        query = query.filter(Alert.status.ilike(status.strip()))

    if machine_id:
        query = query.filter(Alert.machine_id == machine_id.strip())

    results = query.order_by(Alert.timestamp.desc()).all()

    alert_responses = []
    for alert_obj, machine_name in results:
        alert_responses.append(
            AlertResponse(
                id=alert_obj.id,
                machine_id=alert_obj.machine_id,
                severity=alert_obj.severity,
                title=alert_obj.title,
                description=alert_obj.description,
                estimated_waste_kwh=alert_obj.estimated_waste_kwh,
                estimated_cost=alert_obj.estimated_cost,
                status=alert_obj.status,
                timestamp=alert_obj.timestamp,
                machine_name=machine_name,
            )
        )

    return alert_responses
