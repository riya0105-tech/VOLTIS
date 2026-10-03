"""ML Service Layer for VOLTIS.

Orchestrates database queries to fetch live telemetry for machines from PostgreSQL,
maps them to MLTelemetryInput feature vectors, and evaluates them using the registered
ML adapter interface.
"""

import logging
from typing import List, Optional
from sqlalchemy.orm import Session

from app.ml.adapter import get_ml_adapter
from app.models import Machine, SensorReading
from app.schemas.ml import MLPredictionResult, MLTelemetryInput

logger = logging.getLogger("voltis.services.ml")


def predict_telemetry(telemetry: MLTelemetryInput) -> MLPredictionResult:
    """
    Directly evaluate a provided telemetry feature vector against the active ML adapter.
    """
    adapter = get_ml_adapter()
    return adapter.predict(telemetry)


def predict_machine_from_db(db: Session, machine_id: str) -> Optional[MLPredictionResult]:
    """
    Fetch the latest sensor reading for a machine from PostgreSQL and evaluate it
    using the active ML adapter.

    Returns None if machine_id does not exist in the database.
    """
    machine = db.query(Machine).filter(Machine.id == machine_id).first()
    if not machine:
        logger.warning(f"Machine '{machine_id}' not found in database.")
        return None

    # Fetch latest telemetry reading
    latest_reading = (
        db.query(SensorReading)
        .filter(SensorReading.machine_id == machine_id)
        .order_by(SensorReading.timestamp.desc())
        .first()
    )

    if latest_reading:
        telemetry = MLTelemetryInput(
            machine_id=machine.id,
            timestamp=latest_reading.timestamp,
            power_kw=latest_reading.power_kw,
            voltage=latest_reading.voltage,
            current=latest_reading.current,
            temperature=latest_reading.temperature,
            vibration=latest_reading.vibration,
            runtime_hours=latest_reading.runtime_hours,
            production_units=latest_reading.production_units,
        )
    else:
        # Fallback to machine rated power if no telemetry exists yet
        telemetry = MLTelemetryInput(
            machine_id=machine.id,
            power_kw=machine.rated_power_kw or 20.0,
        )

    return get_ml_adapter().predict(telemetry)


def predict_all_machines(db: Session) -> List[MLPredictionResult]:
    """
    Evaluate all machines in the factory against the active ML adapter.
    """
    machines = db.query(Machine).all()
    results = []
    for m in machines:
        pred = predict_machine_from_db(db, m.id)
        if pred:
            results.append(pred)
    return results
