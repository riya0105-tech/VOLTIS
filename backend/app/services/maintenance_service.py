import logging
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models import MaintenanceRecord, Machine
from app.schemas.maintenance import MaintenanceRecordResponse

logger = logging.getLogger("voltis.services.maintenance")


def _compute_machine_health_and_risk(machine: Optional[Machine], record_severity: str) -> Tuple[int, str]:
    """
    Compute machine health score (0-100) and risk level (LOW, MEDIUM, HIGH)
    based on machine operational state and recorded maintenance severity.
    """
    severity_upper = record_severity.upper() if record_severity else "LOW"
    status_upper = machine.status.upper() if machine and machine.status else "NORMAL"

    if status_upper == "ANOMALY" or severity_upper in ["HIGH", "CRITICAL"]:
        return 82, "HIGH"
    elif status_upper == "WARNING" or severity_upper == "MEDIUM":
        return 88, "MEDIUM"
    else:
        return 96, "LOW"


def get_maintenance_records(
    db: Session,
    machine_id: Optional[str] = None,
    severity: Optional[str] = None,
) -> List[MaintenanceRecordResponse]:
    """
    Retrieve maintenance records joined with machine information.
    Supports filtering by machine_id and severity.
    """
    query = db.query(MaintenanceRecord, Machine).join(
        Machine, MaintenanceRecord.machine_id == Machine.id, isouter=True
    )

    if machine_id:
        query = query.filter(MaintenanceRecord.machine_id == machine_id.strip())

    if severity:
        query = query.filter(MaintenanceRecord.severity.ilike(severity.strip()))

    records = query.order_by(MaintenanceRecord.maintenance_date.desc()).all()

    results = []
    for m_record, machine in records:
        health_score, risk_level = _compute_machine_health_and_risk(machine, m_record.severity)
        results.append(
            MaintenanceRecordResponse(
                id=m_record.id,
                machine_id=m_record.machine_id,
                machine_name=machine.name if machine else None,
                machine_type=machine.type if machine else None,
                maintenance_date=m_record.maintenance_date,
                issue=m_record.issue,
                severity=m_record.severity,
                notes=m_record.notes,
                health_score=health_score,
                risk_level=risk_level,
            )
        )

    return results


def get_maintenance_record_by_id(
    db: Session, record_id: int
) -> Optional[MaintenanceRecordResponse]:
    """Retrieve single maintenance record by ID with machine context."""
    result = (
        db.query(MaintenanceRecord, Machine)
        .join(Machine, MaintenanceRecord.machine_id == Machine.id, isouter=True)
        .filter(MaintenanceRecord.id == record_id)
        .first()
    )

    if not result:
        return None

    m_record, machine = result
    health_score, risk_level = _compute_machine_health_and_risk(machine, m_record.severity)

    return MaintenanceRecordResponse(
        id=m_record.id,
        machine_id=m_record.machine_id,
        machine_name=machine.name if machine else None,
        machine_type=machine.type if machine else None,
        maintenance_date=m_record.maintenance_date,
        issue=m_record.issue,
        severity=m_record.severity,
        notes=m_record.notes,
        health_score=health_score,
        risk_level=risk_level,
    )
