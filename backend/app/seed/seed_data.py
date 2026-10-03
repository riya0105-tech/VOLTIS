import logging
from datetime import datetime, timedelta, timezone
from typing import List
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal
from app.models import (
    Factory,
    Machine,
    SensorReading,
    ProductionRecord,
    MaintenanceRecord,
    Alert,
    Recommendation,
    OptimizationScenario,
)

logger = logging.getLogger("voltis.seed")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


def clear_database(db: Session) -> None:
    """Clear existing seed data in reverse dependency order."""
    logger.info("Clearing existing data from tables...")
    db.query(Recommendation).delete()
    db.query(Alert).delete()
    db.query(MaintenanceRecord).delete()
    db.query(SensorReading).delete()
    db.query(ProductionRecord).delete()
    db.query(Machine).delete()
    db.query(Factory).delete()
    db.query(OptimizationScenario).delete()
    db.commit()
    logger.info("Tables cleared.")


def seed_factory(db: Session, now: datetime) -> Factory:
    """Seed primary manufacturing factory."""
    factory = Factory(
        id="factory_001",
        name="Shree Textiles Pvt. Ltd.",
        industry="Textiles & Weaving",
        location="Surat Industrial Zone, Gujarat, India",
        production_capacity=3000.0,
        electricity_tariff=8.125,  # INR / kWh
        production_target=2500.0,
        operating_hours=24.0,
        created_at=now - timedelta(days=30),
    )
    db.add(factory)
    db.flush()
    logger.info(f"Seeded factory: {factory.name} (id={factory.id})")
    return factory


def seed_machines(db: Session, factory_id: str, now: datetime) -> List[Machine]:
    """Seed all 7 required machine categories."""
    machines_data = [
        {
            "id": "transformer_01",
            "name": "Main Step-Down Transformer",
            "type": "Transformer",
            "rated_power_kw": 150.0,
            "status": "NORMAL",
            "operating_limit": 140.0,
            "production_association": "Plant Substation",
        },
        {
            "id": "compressor_01",
            "name": "Air Compressor #01",
            "type": "Compressor",
            "rated_power_kw": 30.0,
            "status": "NORMAL",
            "operating_limit": 28.0,
            "production_association": "Weaving Line 1",
        },
        {
            "id": "compressor_02",
            "name": "Air Compressor #02",
            "type": "Compressor",
            "rated_power_kw": 25.0,
            "status": "ANOMALY",  # Primary anomaly machine for demonstration
            "operating_limit": 22.0,
            "production_association": "Weaving Line 2",
        },
        {
            "id": "furnace_01",
            "name": "Electric Heat-Setting Furnace",
            "type": "Furnace",
            "rated_power_kw": 80.0,
            "status": "NORMAL",
            "operating_limit": 75.0,
            "production_association": "Dyeing & Finishing",
        },
        {
            "id": "hvac_01",
            "name": "Factory Central HVAC & Chiller",
            "type": "HVAC",
            "rated_power_kw": 40.0,
            "status": "WARNING",  # High idle warning
            "operating_limit": 38.0,
            "production_association": "Main Facility",
        },
        {
            "id": "motor_01",
            "name": "Spinning Loom Motor #01",
            "type": "Motor",
            "rated_power_kw": 22.0,
            "status": "NORMAL",
            "operating_limit": 20.0,
            "production_association": "Spinning Section",
        },
        {
            "id": "motor_02",
            "name": "Warp Drive Motor #02",
            "type": "Motor",
            "rated_power_kw": 18.5,
            "status": "NORMAL",
            "operating_limit": 18.0,
            "production_association": "Weaving Line 1",
        },
        {
            "id": "pump_01",
            "name": "Effluent Water Recycling Pump",
            "type": "Pump",
            "rated_power_kw": 15.0,
            "status": "NORMAL",
            "operating_limit": 14.0,
            "production_association": "Water Treatment Unit",
        },
        {
            "id": "prod_line_01",
            "name": "Automated High-Speed Loom Line 01",
            "type": "Production Line",
            "rated_power_kw": 95.0,
            "status": "NORMAL",
            "operating_limit": 90.0,
            "production_association": "Weaving Hall A",
        },
    ]

    machines = []
    for item in machines_data:
        m = Machine(
            id=item["id"],
            factory_id=factory_id,
            name=item["name"],
            type=item["type"],
            rated_power_kw=item["rated_power_kw"],
            status=item["status"],
            operating_limit=item["operating_limit"],
            production_association=item["production_association"],
            created_at=now - timedelta(days=20),
        )
        db.add(m)
        machines.append(m)

    db.flush()
    logger.info(f"Seeded {len(machines)} machines.")
    return machines


def seed_sensor_readings(db: Session, machines: List[Machine], now: datetime) -> int:
    """
    Seed 48 hours of hourly readings for all machines.
    Includes deterministic shift patterns, baseline profiles, and an explicit anomaly for Compressor #02.
    """
    readings = []
    # Baseline normal power profiles per machine type/id
    base_profiles = {
        "transformer_01": {"base_kw": 110.0, "volt": 415.0, "temp": 52.0, "vib": 0.8},
        "compressor_01": {"base_kw": 16.5, "volt": 230.0, "temp": 59.0, "vib": 1.9},
        "compressor_02": {"base_kw": 15.2, "volt": 230.0, "temp": 60.0, "vib": 2.0},
        "furnace_01": {"base_kw": 62.0, "volt": 415.0, "temp": 145.0, "vib": 0.4},
        "hvac_01": {"base_kw": 28.0, "volt": 415.0, "temp": 24.0, "vib": 1.4},
        "motor_01": {"base_kw": 17.0, "volt": 415.0, "temp": 54.0, "vib": 1.8},
        "motor_02": {"base_kw": 14.5, "volt": 415.0, "temp": 50.0, "vib": 1.7},
        "pump_01": {"base_kw": 11.2, "volt": 230.0, "temp": 42.0, "vib": 1.2},
        "prod_line_01": {"base_kw": 78.0, "volt": 415.0, "temp": 48.0, "vib": 2.2},
    }

    # Generate 48 hourly steps (from 47 hours ago up to current hour)
    start_time = now - timedelta(hours=47)

    for step in range(48):
        current_ts = start_time + timedelta(hours=step)
        hour = current_ts.hour

        # Shift factor: Day shift (08:00 - 20:00) is peak, Night shift is lighter
        is_day_shift = 8 <= hour < 20
        shift_multiplier = 1.08 if is_day_shift else 0.92

        # Small deterministic sinusoidal oscillation for realistic telemetry
        oscillation = (step % 6) * 0.015

        for machine in machines:
            profile = base_profiles.get(machine.id, {"base_kw": 20.0, "volt": 230.0, "temp": 50.0, "vib": 1.5})
            
            # Default normal values
            power_kw = round(profile["base_kw"] * shift_multiplier * (1.0 + oscillation), 2)
            temperature = round(profile["temp"] + (2.5 if is_day_shift else -1.5) + (step % 3) * 0.4, 1)
            vibration = round(profile["vib"] + (step % 4) * 0.1, 2)
            voltage = profile["volt"]
            current = round((power_kw * 1000.0) / (voltage * 0.9 if voltage == 230 else voltage * 1.732 * 0.9), 1)
            runtime_hours = round((step % 24) * 0.95 + 0.5, 1)
            production_units = int(25 * shift_multiplier) if machine.type in ["Production Line", "Motor", "Compressor"] else 0

            # INJECT ANOMALY FOR COMPRESSOR #02 (Past 24 hours)
            # Consumes ~31% more energy than expected, elevated temp (72.4°C), vibration (4.8 mm/s)
            if machine.id == "compressor_02" and step >= 24:
                power_kw = round(21.2 + (step % 4) * 0.3, 2)  # ~35% higher than 15.2 kW base
                temperature = round(71.5 + (step % 3) * 0.5, 1)  # High thermal stress
                vibration = round(4.6 + (step % 3) * 0.1, 2)     # High bearing vibration
                current = round(79.1 + (step % 3) * 0.8, 1)
                production_units = 18

            # INJECT WARNING FOR HVAC (Extended idle in night shift hours)
            if machine.id == "hvac_01" and (hour >= 21 or hour <= 4):
                power_kw = round(26.5 + (step % 3) * 0.4, 2)  # Idle load running unnecessarily high
                vibration = round(2.3 + (step % 2) * 0.2, 2)

            readings.append(
                SensorReading(
                    machine_id=machine.id,
                    timestamp=current_ts,
                    power_kw=power_kw,
                    voltage=voltage,
                    current=current,
                    temperature=temperature,
                    vibration=vibration,
                    runtime_hours=runtime_hours,
                    production_units=production_units,
                )
            )

    db.bulk_save_objects(readings)
    db.flush()
    logger.info(f"Seeded {len(readings)} sensor reading records across {len(machines)} machines.")
    return len(readings)


def seed_production_records(db: Session, factory_id: str, now: datetime) -> int:
    """Seed production output records for yesterday and today (totaling ~2,200 units today)."""
    records = []
    start_time = now - timedelta(hours=47)

    # 48 hourly production batches
    for step in range(48):
        current_ts = start_time + timedelta(hours=step)
        hour = current_ts.hour
        is_day_shift = 8 <= hour < 20
        batch_num = "B-101" if step < 24 else "B-102"

        # Today's units target ~2,200 units across 24 hours (avg ~91 units/hour)
        if step >= 24:
            base_units = 105.0 if is_day_shift else 78.0
            units = base_units + ((step % 5) - 2) * 3
        else:
            base_units = 98.0 if is_day_shift else 72.0
            units = base_units + ((step % 4) - 2) * 4

        records.append(
            ProductionRecord(
                factory_id=factory_id,
                timestamp=current_ts,
                line_id="Weaving Line 01",
                batch_id=batch_num,
                units_produced=round(units, 0),
                operating_state="RUNNING",
            )
        )

    db.bulk_save_objects(records)
    db.flush()
    logger.info(f"Seeded {len(records)} production records.")
    return len(records)


def seed_maintenance_records(db: Session, now: datetime) -> int:
    """Seed historical and upcoming maintenance logs."""
    logs = [
        {
            "machine_id": "compressor_02",
            "date": now - timedelta(days=2),
            "issue": "Abnormal bearing vibration and elevated discharge temperature (72.4°C)",
            "severity": "HIGH",
            "notes": "Bearing degradation detected on motor shaft coupling. Inspection and grease replacement recommended.",
        },
        {
            "machine_id": "hvac_01",
            "date": now - timedelta(days=5),
            "issue": "Air intake pressure differential alert",
            "severity": "MEDIUM",
            "notes": "Air filters partially clogged. Cleaned pre-filters; main HEPA filter replacement ordered.",
        },
        {
            "machine_id": "furnace_01",
            "date": now - timedelta(days=12),
            "issue": "Routine 6-month thermal refractory inspection",
            "severity": "LOW",
            "notes": "Thermal insulation elements inspected. Temperature uniform within +/- 1.5°C tolerance.",
        },
        {
            "machine_id": "motor_02",
            "date": now - timedelta(days=18),
            "issue": "Belt drive realignment",
            "severity": "LOW",
            "notes": "V-belt tension adjusted to standard 45 N. Normal operating sound restored.",
        },
    ]

    for item in logs:
        m = MaintenanceRecord(
            machine_id=item["machine_id"],
            maintenance_date=item["date"],
            issue=item["issue"],
            severity=item["severity"],
            notes=item["notes"],
        )
        db.add(m)

    db.flush()
    logger.info(f"Seeded {len(logs)} maintenance records.")
    return len(logs)


def seed_alerts_and_recommendations(db: Session, now: datetime) -> None:
    """Seed alert states and corresponding prescriptive recommendations."""
    # Alert 1: Compressor #02 (Primary Anomaly Demo Case)
    alert_1 = Alert(
        id="alert_001",
        machine_id="compressor_02",
        timestamp=now - timedelta(hours=3),
        severity="ANOMALY",
        title="Motor #2 — Abnormal Consumption Detected",
        description="Air Compressor #02 is consuming 31% more energy than expected baseline. Telemetry reveals bearing degradation signatures and elevated discharge heat.",
        estimated_waste_kwh=74.0,
        estimated_cost=1140.0,  # ₹1,140/day waste as in PRD
        status="ACTIVE",
    )
    db.add(alert_1)

    rec_1 = Recommendation(
        id="rec_001",
        machine_id="compressor_02",
        alert_id="alert_001",
        problem="Air Compressor #02 is drawing 21.2 kW (rated: 25 kW), operating 31% above normal thermal and electrical baseline.",
        likely_cause="Excessive unloaded idle time, internal compressed-air valve leakage, and motor shaft bearing wear.",
        recommended_actions=[
            "Reduce unloaded idle running hours via automatic pressure cutoff calibration",
            "Inspect delivery manifold and pneumatic lines for compressed-air leakage",
            "Schedule mechanical bearing lubrication and vibration spectrum analysis",
        ],
        potential_saving=1140.0,
        created_at=now - timedelta(hours=3),
    )
    db.add(rec_1)

    # Alert 2: HVAC Chiller (Warning)
    alert_2 = Alert(
        id="alert_002",
        machine_id="hvac_01",
        timestamp=now - timedelta(hours=8),
        severity="WARNING",
        title="HVAC Chiller — High Idle Operation",
        description="Central HVAC system ran 2.3 hours longer than required during night shift low-occupancy window.",
        estimated_waste_kwh=42.0,
        estimated_cost=650.0,
        status="ACTIVE",
    )
    db.add(alert_2)

    rec_2 = Recommendation(
        id="rec_002",
        machine_id="hvac_01",
        alert_id="alert_002",
        problem="Chiller unit operating continuously at 28 kW during low-load non-production window.",
        likely_cause="Manual thermostat override left engaged following weekend maintenance.",
        recommended_actions=[
            "Re-enable automated temperature setback schedule for non-operational hours",
            "Inspect condenser coil intake for airflow restrictions",
            "Calibrate ambient enthalpy sensors",
        ],
        potential_saving=650.0,
        created_at=now - timedelta(hours=8),
    )
    db.add(rec_2)

    # Alert 3: Motor #02 (Acknowledged Warning)
    alert_3 = Alert(
        id="alert_003",
        machine_id="motor_02",
        timestamp=now - timedelta(hours=14),
        severity="WARNING",
        title="Motor #02 — Brief Current Inrush",
        description="Peak startup current exceeded nominal rating by 18% during high-torque startup.",
        estimated_waste_kwh=12.0,
        estimated_cost=180.0,
        status="ACKNOWLEDGED",
    )
    db.add(alert_3)

    # Alert 4: Furnace #01 (Resolved)
    alert_4 = Alert(
        id="alert_004",
        machine_id="furnace_01",
        timestamp=now - timedelta(days=1),
        severity="NORMAL",
        title="Furnace #01 — Temperature Curve Stabilized",
        description="Preheating temperature ramp-up completed within optimal thermal envelope.",
        estimated_waste_kwh=0.0,
        estimated_cost=0.0,
        status="RESOLVED",
    )
    db.add(alert_4)

    db.flush()
    logger.info("Seeded 4 alerts and 2 recommendations.")


def seed_optimization_scenarios(db: Session, now: datetime) -> None:
    """Seed baseline optimization scenario matching system design example."""
    scenario = OptimizationScenario(
        id="scenario_001",
        name="Move Batch B to Off-Peak (22:00)",
        created_at=now - timedelta(hours=6),
        current_energy_kwh=12400.0,
        optimized_energy_kwh=10950.0,
        current_cost=118000.0,  # INR
        optimized_cost=97600.0,  # INR
        current_co2=10.1,  # Tonnes
        optimized_co2=8.9,  # Tonnes
        production_change_percent=0.0,  # Zero production loss
        status="SIMULATED",
    )
    db.add(scenario)
    db.flush()
    logger.info(f"Seeded optimization scenario: {scenario.name} (id={scenario.id})")


def run_seed(clear_existing: bool = True) -> None:
    """Execute complete deterministic seed pipeline."""
    logger.info("--- Starting VOLTIS Database Seeding Engine ---")
    db: Session = SessionLocal()
    try:
        now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)

        if clear_existing:
            clear_database(db)

        factory = seed_factory(db, now)
        machines = seed_machines(db, factory.id, now)
        seed_sensor_readings(db, machines, now)
        seed_production_records(db, factory.id, now)
        seed_maintenance_records(db, now)
        seed_alerts_and_recommendations(db, now)
        seed_optimization_scenarios(db, now)

        db.commit()
        logger.info("--- VOLTIS Database Seeding Completed Successfully ---")
    except Exception as e:
        db.rollback()
        logger.error(f"Error during seeding: {e}", exc_info=True)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed(clear_existing=True)
