from typing import Optional
from pydantic import BaseModel, ConfigDict


class FactoryBasicInfo(BaseModel):
    id: str
    name: str
    industry: Optional[str] = None
    location: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class FactoryKPIs(BaseModel):
    energy_today_kwh: float
    cost_today: float
    energy_intensity: float
    co2_tonnes: float
    production_units: float

    model_config = ConfigDict(from_attributes=True)


class FactoryOverviewResponse(BaseModel):
    factory: FactoryBasicInfo
    kpis: FactoryKPIs

    model_config = ConfigDict(from_attributes=True)
