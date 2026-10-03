"""Database ORM Models for VOLTIS."""

from app.models.factory import Factory
from app.models.machine import Machine
from app.models.sensor_reading import SensorReading
from app.models.production_record import ProductionRecord
from app.models.maintenance_record import MaintenanceRecord
from app.models.alert import Alert
from app.models.recommendation import Recommendation
from app.models.optimization_scenario import OptimizationScenario

__all__ = [
    "Factory",
    "Machine",
    "SensorReading",
    "ProductionRecord",
    "MaintenanceRecord",
    "Alert",
    "Recommendation",
    "OptimizationScenario",
]
