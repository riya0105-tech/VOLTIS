"""Pydantic Request & Response Schemas for VOLTIS."""

from app.schemas.factory import (
    FactoryBasicInfo,
    FactoryKPIs,
    FactoryOverviewResponse,
)
from app.schemas.machine import (
    SensorReadingResponse,
    MachineStatusResponse,
    MachineDetailResponse,
)
from app.schemas.energy import EnergyDataPoint
from app.schemas.alert import AlertResponse
from app.schemas.maintenance import MaintenanceRecordResponse
from app.schemas.recommendation import RecommendationResponse
from app.schemas.optimization import (
    OptimizationSimulateRequest,
    ScenarioMetrics,
    OptimizationSimulateResponse,
    OptimizationApproveRequest,
    OptimizationApproveResponse,
)
from app.schemas.copilot import (
    CopilotRequest,
    MachineContributor,
    CopilotResponse,
)
from app.schemas.ml import (
    MLTelemetryInput,
    MLPredictionResult,
)
from app.schemas.ingestion import (
    SensorReadingCreate,
    IngestionResult,
)

__all__ = [
    "FactoryBasicInfo",
    "FactoryKPIs",
    "FactoryOverviewResponse",
    "SensorReadingCreate",
    "SensorReadingResponse",
    "MachineStatusResponse",
    "MachineDetailResponse",
    "EnergyDataPoint",
    "AlertResponse",
    "MaintenanceRecordResponse",
    "RecommendationResponse",
    "OptimizationSimulateRequest",
    "ScenarioMetrics",
    "OptimizationSimulateResponse",
    "OptimizationApproveRequest",
    "OptimizationApproveResponse",
    "CopilotRequest",
    "MachineContributor",
    "CopilotResponse",
    "MLTelemetryInput",
    "MLPredictionResult",
    "IngestionResult",
]
