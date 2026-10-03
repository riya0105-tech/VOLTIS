"""Telemetry Ingestion Schemas for VOLTIS."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.schemas.machine import SensorReadingCreate


class IngestionResult(BaseModel):
    """Result of processing and persisting a sensor reading."""

    success: bool = Field(..., description="Whether telemetry was successfully ingested and saved.")
    reading_id: Optional[int] = Field(None, description="Database ID of the inserted or updated SensorReading.")
    machine_id: str = Field(..., description="Target machine identifier.")
    timestamp: datetime = Field(..., description="Persisted timestamp of the sensor reading.")
    power_kw: float = Field(..., description="Persisted power reading in kW.")
    message: str = Field(..., description="Informational message describing the ingestion outcome.")
    anomaly_detected: Optional[bool] = Field(
        None,
        description="Whether an immediate anomaly status was flagged by downstream ML evaluation.",
    )


__all__ = ["SensorReadingCreate", "IngestionResult"]
