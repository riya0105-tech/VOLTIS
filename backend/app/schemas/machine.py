from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SensorReadingCreate(BaseModel):
    """
    Sensor reading payload contract for MQTT and REST ingestion.
    Matches system-design.md Section 4.
    """

    machine_id: str = Field(..., min_length=1, description="Machine identifier")
    timestamp: Optional[datetime] = Field(
        None,
        description="Reading timestamp; defaults to current UTC time if not supplied.",
    )
    power_kw: float = Field(..., ge=0.0, description="Active power in kW")
    voltage: Optional[float] = Field(None, ge=0.0, description="Line voltage in Volts")
    current: Optional[float] = Field(None, ge=0.0, description="Operating current in Amperes")
    temperature: Optional[float] = Field(None, description="Temperature in Celsius")
    vibration: Optional[float] = Field(None, ge=0.0, description="Vibration velocity in mm/s")
    runtime_hours: Optional[float] = Field(None, ge=0.0, description="Runtime hours")
    production_units: Optional[float] = Field(None, ge=0.0, description="Production units")


class SensorReadingResponse(BaseModel):
    id: Optional[int] = None
    machine_id: str
    timestamp: datetime
    power_kw: float
    voltage: Optional[float] = None
    current: Optional[float] = None
    temperature: Optional[float] = None
    vibration: Optional[float] = None
    runtime_hours: Optional[float] = None
    production_units: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class MachineStatusResponse(BaseModel):
    machine_id: str
    name: str
    type: str
    status: str
    power_kw: float
    temperature: Optional[float] = None
    vibration: Optional[float] = None
    rated_power_kw: Optional[float] = None
    production_association: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MachineDetailResponse(BaseModel):
    machine_id: str
    factory_id: str
    name: str
    type: str
    rated_power_kw: float
    status: str
    operating_limit: Optional[float] = None
    production_association: Optional[str] = None
    power_kw: float
    temperature: Optional[float] = None
    vibration: Optional[float] = None
    current_telemetry: Optional[SensorReadingResponse] = None
    recent_readings: List[SensorReadingResponse] = []

    model_config = ConfigDict(from_attributes=True)
