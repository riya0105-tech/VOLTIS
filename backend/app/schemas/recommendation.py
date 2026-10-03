from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class RecommendationResponse(BaseModel):
    id: str
    machine_id: str
    machine_name: Optional[str] = None
    alert_id: Optional[str] = None
    problem: str
    likely_cause: str
    recommended_actions: List[str]
    potential_saving: float
    created_at: Optional[datetime] = None
    status: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
