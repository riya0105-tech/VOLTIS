import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models import Factory, Machine, SensorReading, ProductionRecord
from app.schemas.energy import EnergyDataPoint

logger = logging.getLogger("voltis.services.energy")

# Deterministic machine baseline power ratings (kW) representing expected normal operation
EXPECTED_BASELINES: Dict[str, float] = {
    "transformer_01": 110.0,
    "compressor_01": 16.5,
    "compressor_02": 15.2,  # Normal expected baseline before anomaly
    "furnace_01": 62.0,
    "hvac_01": 28.0,
    "motor_01": 17.0,
    "motor_02": 14.5,
    "pump_01": 11.2,
    "prod_line_01": 78.0,
}


def _calculate_hourly_expected_kwh(machine_ids: List[str], hour: int) -> float:
    """
    Calculate expected baseline energy consumption for a 1-hour interval,
    applying normal operational shift multipliers.
    Day shift (08:00 - 20:00) = 1.08x, Night shift = 0.92x.
    Sampling interval is exactly 1 hour: kWh = kW * 1.0 h.
    """
    shift_multiplier = 1.08 if 8 <= hour < 20 else 0.92
    total_base_kw = sum(EXPECTED_BASELINES.get(m_id, 20.0) for m_id in machine_ids)
    expected_kw = total_base_kw * shift_multiplier
    # kWh = kW * delta_t (where delta_t = 1.0 hour)
    return round(expected_kw * 1.0, 2)


def get_today_energy(db: Session, machine_id: Optional[str] = None) -> List[EnergyDataPoint]:
    """
    Retrieve hourly time-series energy consumption for 'today' (the last 24-hour cycle).
    Computes actual_kwh, expected_kwh, cost, and hourly energy intensity.
    Supports filtering by machine_id.
    """
    latest_reading = db.query(SensorReading).order_by(SensorReading.timestamp.desc()).first()
    if not latest_reading:
        return []

    # 24-hour window from (latest - 23 hours) to latest
    start_window = latest_reading.timestamp - timedelta(hours=23)

    return _get_energy_series(db, start_window, latest_reading.timestamp, machine_id)


def get_energy_history(
    db: Session,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    machine_id: Optional[str] = None,
) -> List[EnergyDataPoint]:
    """
    Retrieve historical time-series energy comparison (actual vs expected).
    Supports date range filtering and machine_id filtering.
    """
    return _get_energy_series(db, from_date, to_date, machine_id)


def _get_energy_series(
    db: Session,
    start_time: Optional[datetime],
    end_time: Optional[datetime],
    machine_id: Optional[str],
) -> List[EnergyDataPoint]:
    """
    Core calculation engine for energy time-series aggregation.
    Respects verified 1-hour sampling interval (kWh = kW * 1.0 h).
    """
    factory = db.query(Factory).first()
    tariff = factory.electricity_tariff if factory and factory.electricity_tariff else 8.125

    # Determine applicable machines
    if machine_id:
        machines = db.query(Machine).filter(Machine.id == machine_id).all()
    else:
        machines = db.query(Machine).all()

    machine_ids = [m.id for m in machines]
    if not machine_ids:
        return []

    # Query sensor readings within time range
    query = db.query(SensorReading).filter(SensorReading.machine_id.in_(machine_ids))
    if start_time:
        query = query.filter(SensorReading.timestamp >= start_time)
    if end_time:
        query = query.filter(SensorReading.timestamp <= end_time)

    readings = query.order_by(SensorReading.timestamp.asc()).all()
    if not readings:
        return []

    # Query production records for energy intensity calculation
    prod_query = db.query(ProductionRecord)
    if start_time:
        prod_query = prod_query.filter(ProductionRecord.timestamp >= start_time)
    if end_time:
        prod_query = prod_query.filter(ProductionRecord.timestamp <= end_time)

    prod_records = prod_query.all()
    hourly_production: Dict[datetime, float] = {
        pr.timestamp: pr.units_produced for pr in prod_records
    }

    # Group readings by timestamp (each group represents one 1-hour time slice)
    grouped_by_time: Dict[datetime, List[SensorReading]] = {}
    for r in readings:
        grouped_by_time.setdefault(r.timestamp, []).append(r)

    results: List[EnergyDataPoint] = []
    # Sort timestamps chronologically
    sorted_timestamps = sorted(grouped_by_time.keys())

    for ts in sorted_timestamps:
        time_readings = grouped_by_time[ts]
        # Mathematical conversion: kWh = sum(power_kw * delta_t_hours). Here delta_t = 1.0 hour.
        actual_kwh = round(sum(r.power_kw * 1.0 for r in time_readings), 2)
        expected_kwh = _calculate_hourly_expected_kwh(machine_ids, ts.hour)

        # Cost = kWh * tariff
        cost = round(actual_kwh * tariff, 2)

        # Hourly Energy Intensity (kWh/unit)
        units_in_hour = hourly_production.get(ts, 0.0)
        energy_intensity = (
            round(actual_kwh / units_in_hour, 2) if units_in_hour > 0 else None
        )

        results.append(
            EnergyDataPoint(
                timestamp=ts,
                actual_kwh=actual_kwh,
                expected_kwh=expected_kwh,
                cost=cost,
                energy_intensity=energy_intensity,
            )
        )

    return results
