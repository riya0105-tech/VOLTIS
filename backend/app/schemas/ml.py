"""Pydantic schemas for the AI/ML Adapter Interface.

Defines the feature vector input contract and the structured prediction output contract
matching system-design.md and ANTIGRAVITY_BACKEND_MASTER_PROMPT.md.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class MLTelemetryInput(BaseModel):
    """
    Conceptual telemetry feature vector input for the ML anomaly detection and
    health assessment model.
    """

    machine_id: str = Field(..., min_length=1, description="Unique identifier of the target machine.")
    timestamp: Optional[datetime] = Field(None, description="Timestamp of the telemetry reading.")
    power_kw: float = Field(..., ge=0.0, description="Active power consumption in kilowatts.")
    voltage: Optional[float] = Field(None, ge=0.0, description="Operating line voltage in Volts.")
    current: Optional[float] = Field(None, ge=0.0, description="Operating current in Amperes.")
    temperature: Optional[float] = Field(None, description="Operating surface or bearing temperature in Celsius.")
    vibration: Optional[float] = Field(None, ge=0.0, description="RMS vibration velocity in mm/s.")
    runtime_hours: Optional[float] = Field(None, ge=0.0, description="Cumulative or shift operating hours.")
    production_units: Optional[float] = Field(None, ge=0.0, description="Associated unit production volume.")


class MLPredictionResult(BaseModel):
    """
    Structured ML prediction response contract.
    Must adhere strictly to system-design.md integration contract.
    """

    machine_id: str = Field(..., description="Target machine identifier.")
    status: str = Field(..., description="Operational status: 'ANOMALY', 'WARNING', or 'NORMAL'.")
    anomaly_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score for anomaly presence (0.0 = nominal, 1.0 = extreme anomaly).",
    )
    health_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Overall machine condition score (0 = critical failure, 100 = optimal).",
    )
    risk: str = Field(
        ...,
        description="Risk categorization: 'LOW', 'MEDIUM', 'HIGH', or 'CRITICAL'.",
    )
    possible_issue: Optional[str] = Field(
        None,
        description="Identified mechanical/electrical failure mode or null if nominal.",
    )

    # Extended optional analytical attributes supported by ANTIGRAVITY_BACKEND_MASTER_PROMPT Section 10
    expected_energy: Optional[float] = Field(
        None,
        description="Expected baseline power/energy consumption under nominal operation (kW or kWh).",
    )
    energy_deviation_percent: Optional[float] = Field(
        None,
        description="Percentage deviation from expected energy baseline.",
    )
    estimated_waste_kwh: Optional[float] = Field(
        None,
        description="Estimated energy waste in kWh resulting from the detected issue.",
    )
    estimated_cost: Optional[float] = Field(
        None,
        description="Estimated economic cost impact of energy waste in INR.",
    )
    recommended_actions: Optional[List[str]] = Field(
        None,
        description="Recommended remedial maintenance and operational procedures.",
    )
