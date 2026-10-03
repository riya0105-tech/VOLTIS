import logging
from datetime import timedelta
from typing import Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.config import get_settings
from app.models import Factory, SensorReading, ProductionRecord
from app.schemas.factory import (
    FactoryBasicInfo,
    FactoryKPIs,
    FactoryOverviewResponse,
)

logger = logging.getLogger("voltis.services.factory")
settings = get_settings()


def get_factory_overview(db: Session, factory_id: Optional[str] = None) -> Optional[FactoryOverviewResponse]:
    """
    Retrieve factory metadata and compute top-level KPIs:
    - energy_today_kwh
    - cost_today (INR)
    - energy_intensity (EPI = Energy / Production)
    - co2_tonnes
    - production_units
    """
    query = db.query(Factory)
    if factory_id:
        factory = query.filter(Factory.id == factory_id).first()
    else:
        factory = query.first()

    if not factory:
        logger.warning(f"Factory not found (factory_id={factory_id})")
        return None

    # Determine 24-hour time window based on latest available telemetry
    latest_reading = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).first()
    if latest_reading:
        window_start = latest_reading.timestamp - timedelta(hours=24)
    else:
        window_start = None

    # Calculate Energy Consumed in the last 24h
    if window_start:
        energy_today = (
            db.query(func.sum(SensorReading.power_kw))
            .filter(SensorReading.timestamp >= window_start)
            .scalar()
            or 0.0
        )
        # Calculate Production Units in the last 24h
        production_today = (
            db.query(func.sum(ProductionRecord.units_produced))
            .filter(
                ProductionRecord.factory_id == factory.id,
                ProductionRecord.timestamp >= window_start,
            )
            .scalar()
            or 0.0
        )
    else:
        energy_today = 0.0
        production_today = 0.0

    # If no recent production records found, fall back to daily target
    if production_today == 0.0 and factory.production_target:
        production_today = factory.production_target

    energy_today_kwh = round(float(energy_today), 2)
    tariff = factory.electricity_tariff if factory.electricity_tariff else 8.0
    cost_today = round(energy_today_kwh * tariff, 2)

    # Energy Intensity: EPI = Energy Consumed / Production Output
    energy_intensity = (
        round(energy_today_kwh / production_today, 2)
        if production_today > 0
        else 0.0
    )

    # Carbon Emissions: CO2e = Energy * Configurable Emission Factor (in kg) / 1000 for tonnes
    co2_tonnes = round((energy_today_kwh * settings.EMISSION_FACTOR) / 1000.0, 2)

    return FactoryOverviewResponse(
        factory=FactoryBasicInfo(
            id=factory.id,
            name=factory.name,
            industry=factory.industry,
            location=factory.location,
        ),
        kpis=FactoryKPIs(
            energy_today_kwh=energy_today_kwh,
            cost_today=cost_today,
            energy_intensity=energy_intensity,
            co2_tonnes=co2_tonnes,
            production_units=round(float(production_today), 1),
        ),
    )
