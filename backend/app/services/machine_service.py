import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import Machine, SensorReading
from app.schemas.machine import (
    SensorReadingResponse,
    MachineStatusResponse,
    MachineDetailResponse,
)

logger = logging.getLogger("voltis.services.machine")


def get_all_machines(db: Session) -> List[MachineStatusResponse]:
    """
    Retrieve all machines with their latest live telemetry status
    (power_kw, temperature, vibration) for the Digital Twin and Machine Cards.
    """
    machines = db.query(Machine).order_by(Machine.id).all()
    results = []

    for m in machines:
        # Get latest telemetry reading for current power, temp, vibration
        latest_reading = (
            db.query(SensorReading)
            .filter(SensorReading.machine_id == m.id)
            .order_by(SensorReading.timestamp.desc())
            .first()
        )

        power_kw = latest_reading.power_kw if latest_reading else 0.0
        temperature = latest_reading.temperature if latest_reading else None
        vibration = latest_reading.vibration if latest_reading else None

        results.append(
            MachineStatusResponse(
                machine_id=m.id,
                name=m.name,
                type=m.type,
                status=m.status,
                power_kw=power_kw,
                temperature=temperature,
                vibration=vibration,
                rated_power_kw=m.rated_power_kw,
                production_association=m.production_association,
            )
        )

    return results


def get_machine_by_id(db: Session, machine_id: str) -> Optional[MachineDetailResponse]:
    """
    Retrieve detailed machine profile and recent telemetry stream.
    Returns None if machine_id does not exist.
    """
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        logger.warning(f"Machine with id '{machine_id}' not found.")
        return None

    # Fetch latest reading
    latest_reading = (
        db.query(SensorReading)
        .filter(SensorReading.machine_id == machine_id)
        .order_by(SensorReading.timestamp.desc())
        .first()
    )

    # Fetch recent readings (last 24 data points)
    recent_readings = (
        db.query(SensorReading)
        .filter(SensorReading.machine_id == machine_id)
        .order_by(SensorReading.timestamp.desc())
        .limit(24)
        .all()
    )
    # Order chronologically for charts
    recent_readings_chronological = sorted(recent_readings, key=lambda r: r.timestamp)

    current_telemetry = (
        SensorReadingResponse.model_validate(latest_reading) if latest_reading else None
    )
    recent_schemas = [
        SensorReadingResponse.model_validate(r) for r in recent_readings_chronological
    ]

    return MachineDetailResponse(
        machine_id=machine.id,
        factory_id=machine.factory_id,
        name=machine.name,
        type=machine.type,
        rated_power_kw=machine.rated_power_kw,
        status=machine.status,
        operating_limit=machine.operating_limit,
        production_association=machine.production_association,
        power_kw=latest_reading.power_kw if latest_reading else 0.0,
        temperature=latest_reading.temperature if latest_reading else None,
        vibration=latest_reading.vibration if latest_reading else None,
        current_telemetry=current_telemetry,
        recent_readings=recent_schemas,
    )
