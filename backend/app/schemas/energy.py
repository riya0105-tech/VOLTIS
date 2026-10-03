from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class EnergyDataPoint(BaseModel):
    timestamp: datetime
    actual_kwh: float
    expected_kwh: float
    cost: Optional[float] = None
    energy_intensity: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
