from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class OptimizationSimulateRequest(BaseModel):
    scenario_name: str = Field(..., description="Descriptive name of the What-If scenario")
    batch_id: Optional[str] = Field("B-102", description="Production batch ID to reschedule")
    new_start_time: Optional[str] = Field("22:00", description="Target start time in HH:MM format")
    scenario_id: Optional[str] = Field(None, description="Optional existing scenario ID")


class ScenarioMetrics(BaseModel):
    energy_kwh: float
    cost: float
    co2_tonnes: float
    production_units: float

    model_config = ConfigDict(from_attributes=True)


class OptimizationSimulateResponse(BaseModel):
    scenario_name: str
    scenario_id: Optional[str] = None
    current: ScenarioMetrics
    optimized: ScenarioMetrics
    energy_reduction_percent: float
    co2_reduction_percent: float
    cost_saving: Optional[float] = None
    production_change_percent: float = 0.0

    model_config = ConfigDict(from_attributes=True)


class OptimizationApproveRequest(BaseModel):
    scenario_id: str = Field(..., description="ID of the optimization scenario to approve")


class OptimizationApproveResponse(BaseModel):
    status: str
    message: str
