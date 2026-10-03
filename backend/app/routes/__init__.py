"""API Route Handlers."""

from app.routes.factory_routes import router as factory_router
from app.routes.machine_routes import router as machine_router
from app.routes.energy_routes import router as energy_router
from app.routes.alert_routes import router as alert_router
from app.routes.maintenance_routes import router as maintenance_router
from app.routes.recommendation_routes import router as recommendation_router
from app.routes.optimization_routes import router as optimization_router
from app.routes.copilot_routes import router as copilot_router
from app.routes.ml_routes import router as ml_router
from app.routes.ingestion_routes import router as ingestion_router

__all__ = [
    "factory_router",
    "machine_router",
    "energy_router",
    "alert_router",
    "maintenance_router",
    "recommendation_router",
    "optimization_router",
    "copilot_router",
    "ml_router",
    "ingestion_router",
]
