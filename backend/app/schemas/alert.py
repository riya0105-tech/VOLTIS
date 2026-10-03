from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AlertResponse(BaseModel):
    id: str
    machine_id: str
    severity: str
    title: str
    description: str
    estimated_waste_kwh: float
    estimated_cost: float
    status: str
    timestamp: Optional[datetime] = None
    machine_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
