"""Telemetry Ingestion Service for VOLTIS.

Core ingestion engine responsible for:
- Validating incoming sensor payloads (JSON strings, dicts, or Pydantic models).
- Identifying target machines against PostgreSQL registry.
- Idempotently persisting sensor readings into PostgreSQL.
- Feeding telemetry downstream to the AI/ML adapter interface for anomaly evaluation.
- Decoupled completely from transport protocols (MQTT, HTTP, Modbus, etc.).
"""

from datetime import datetime, timezone
import json
import logging
from typing import Any, Dict, Optional, Union
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.ml.adapter import get_ml_adapter
from app.models import Machine, SensorReading
from app.schemas.ingestion import IngestionResult, SensorReadingCreate
from app.schemas.ml import MLTelemetryInput

logger = logging.getLogger("voltis.services.ingestion")


def parse_telemetry_topic(topic: str) -> Dict[str, str]:
    """
    Extract metadata from standard VOLTIS MQTT topics:
    voltis/factory/{factory_id}/machine/{machine_id}/telemetry
    """
    parts = topic.strip("/").split("/")
    result = {}
    if len(parts) >= 6 and parts[0] == "voltis" and parts[1] == "factory" and parts[3] == "machine":
        result["factory_id"] = parts[2]
        result["machine_id"] = parts[4]
    return result


def ingest_sensor_reading(
    db: Session,
    payload: Union[Dict[str, Any], str, SensorReadingCreate],
    topic: Optional[str] = None,
    raise_on_error: bool = False,
) -> IngestionResult:
    """
    Validate, persist, and process a single telemetry sensor reading.

    Args:
        db: SQLAlchemy session.
        payload: Sensor payload (JSON string, dict, or SensorReadingCreate model).
        topic: Optional MQTT topic from which message was received.
        raise_on_error: If True, raises exceptions (ValidationError, ValueError) on failure.
                        If False, returns an IngestionResult with success=False.

    Returns:
        IngestionResult detailing persistence status, reading_id, and anomaly flag.
    """
    # 1. Parse and Validate Payload
    try:
        if isinstance(payload, str):
            raw_dict = json.loads(payload)
            reading = SensorReadingCreate(**raw_dict)
        elif isinstance(payload, dict):
            reading = SensorReadingCreate(**payload)
        elif isinstance(payload, SensorReadingCreate):
            reading = payload
        else:
            raise ValueError(f"Unsupported payload type: {type(payload)}")
    except (json.JSONDecodeError, ValidationError, ValueError) as err:
        logger.warning(f"Payload validation failed: {err}")
        if raise_on_error:
            raise
        now = datetime.now(timezone.utc)
        return IngestionResult(
            success=False,
            reading_id=None,
            machine_id=getattr(payload, "machine_id", "unknown") if not isinstance(payload, str) else "unknown",
            timestamp=now,
            power_kw=0.0,
            message=f"Validation failed: {str(err)}",
            anomaly_detected=False,
        )

    # 2. Topic Consistency Check (if topic provided)
    if topic:
        meta = parse_telemetry_topic(topic)
        if meta.get("machine_id") and meta["machine_id"] != reading.machine_id:
            logger.warning(
                f"Topic machine_id '{meta['machine_id']}' differs from payload '{reading.machine_id}'"
            )

    # 3. Identify Machine in Database
    machine = db.query(Machine).filter(Machine.id == reading.machine_id).first()
    if not machine:
        msg = f"Machine '{reading.machine_id}' does not exist in factory registry."
        logger.warning(msg)
        if raise_on_error:
            raise ValueError(msg)
        now = reading.timestamp or datetime.now(timezone.utc)
        return IngestionResult(
            success=False,
            reading_id=None,
            machine_id=reading.machine_id,
            timestamp=now,
            power_kw=reading.power_kw,
            message=msg,
            anomaly_detected=False,
        )

    # 4. Handle Timestamp
    ts = reading.timestamp
    if ts is None:
        ts = datetime.now(timezone.utc)
    elif ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)

    # 5. Check for Duplicate/Repeated Reading at identical (machine_id, timestamp)
    existing_reading = (
        db.query(SensorReading)
        .filter(
            SensorReading.machine_id == reading.machine_id,
            SensorReading.timestamp == ts,
        )
        .first()
    )

    if existing_reading:
        # Update existing record idempotently
        existing_reading.power_kw = reading.power_kw
        existing_reading.voltage = reading.voltage
        existing_reading.current = reading.current
        existing_reading.temperature = reading.temperature
        existing_reading.vibration = reading.vibration
        existing_reading.runtime_hours = reading.runtime_hours
        existing_reading.production_units = reading.production_units
        db_reading = existing_reading
        outcome_msg = f"Idempotently updated existing sensor reading (id={db_reading.id}) for {reading.machine_id}."
    else:
        # Insert new reading
        db_reading = SensorReading(
            machine_id=reading.machine_id,
            timestamp=ts,
            power_kw=reading.power_kw,
            voltage=reading.voltage,
            current=reading.current,
            temperature=reading.temperature,
            vibration=reading.vibration,
            runtime_hours=reading.runtime_hours,
            production_units=reading.production_units,
        )
        db.add(db_reading)
        outcome_msg = f"Persisted new sensor reading for machine {reading.machine_id}."

    db.commit()
    db.refresh(db_reading)
    logger.info(f"{outcome_msg} (id={db_reading.id}, timestamp={db_reading.timestamp})")

    # 6. Evaluate Anomaly Status via ML Adapter Boundary
    anomaly_detected = False
    try:
        ml_adapter = get_ml_adapter()
        ml_pred = ml_adapter.predict(
            MLTelemetryInput(
                machine_id=db_reading.machine_id,
                timestamp=db_reading.timestamp,
                power_kw=db_reading.power_kw,
                voltage=db_reading.voltage,
                current=db_reading.current,
                temperature=db_reading.temperature,
                vibration=db_reading.vibration,
                runtime_hours=db_reading.runtime_hours,
                production_units=db_reading.production_units,
            )
        )
        anomaly_detected = (ml_pred.status == "ANOMALY")
    except Exception as exc:
        logger.warning(f"Downstream ML evaluation skipped: {exc}")

    return IngestionResult(
        success=True,
        reading_id=db_reading.id,
        machine_id=db_reading.machine_id,
        timestamp=db_reading.timestamp,
        power_kw=db_reading.power_kw,
        message=outcome_msg,
        anomaly_detected=anomaly_detected,
    )
