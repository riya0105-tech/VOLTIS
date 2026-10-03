"""Telemetry Ingestion Route Handler for VOLTIS.

Exposes REST ingestion endpoint supporting direct HTTP posts from sensor gateways
or edge nodes alongside the MQTT ingestion pipeline.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.ingestion import IngestionResult, SensorReadingCreate
from app.services import ingestion_service

logger = logging.getLogger("voltis.routes.ingestion")

router = APIRouter(prefix="/api/telemetry", tags=["Telemetry Ingestion"])


@router.post(
    "/ingest",
    response_model=IngestionResult,
    summary="Ingest Machine Sensor Telemetry",
    description="Validates and persists a sensor reading into PostgreSQL and triggers downstream anomaly evaluation.",
)
def ingest_telemetry_endpoint(
    payload: SensorReadingCreate,
    db: Session = Depends(get_db),
):
    """
    POST /api/telemetry/ingest
    Accepts: SensorReadingCreate payload
    Returns: IngestionResult
    """
    result = ingestion_service.ingest_sensor_reading(db, payload)
    if not result.success:
        if "does not exist" in result.message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.message,
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.message,
        )
    return result
