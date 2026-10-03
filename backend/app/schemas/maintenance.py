from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class MaintenanceRecordResponse(BaseModel):
    id: int
    machine_id: str
    machine_name: Optional[str] = None
    machine_type: Optional[str] = None
    maintenance_date: datetime
    issue: str
    severity: str
    notes: Optional[str] = None
    health_score: Optional[int] = None
    risk_level: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
