import sys
from sqlalchemy import func
from app.database import SessionLocal, engine
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
from fastapi.testclient import TestClient
from app.main import app


def verify_phase3():
    db = SessionLocal()
    try:
        print("=== STEP 1: Verify Row Counts ===")
        counts = {
            "factories": db.query(Factory).count(),
            "machines": db.query(Machine).count(),
            "sensor_readings": db.query(SensorReading).count(),
            "production_records": db.query(ProductionRecord).count(),
            "maintenance_records": db.query(MaintenanceRecord).count(),
            "alerts": db.query(Alert).count(),
            "recommendations": db.query(Recommendation).count(),
            "optimization_scenarios": db.query(OptimizationScenario).count(),
        }

        for table, count in counts.items():
            print(f"  {table:25}: {count} rows")
            assert count > 0, f"Table {table} has 0 rows!"

        print("\n=== STEP 2: Verify Foreign Key Relationships ===")
        # Machine -> Factory
        machines = db.query(Machine).all()
        for m in machines:
            assert m.factory is not None, f"Machine {m.id} has no factory!"
            assert m.factory.id == "factory_001"
        print(f"  Verified {len(machines)} machines correctly link to factory {machines[0].factory.name}")

        # Sensor readings -> Machine
        sr_sample = db.query(SensorReading).filter(SensorReading.machine_id == "compressor_02").first()
        assert sr_sample is not None and sr_sample.machine.name == "Air Compressor #02"
        print("  Verified SensorReading -> Machine relationship")

        # Recommendation -> Alert & Machine
        rec = db.query(Recommendation).filter(Recommendation.id == "rec_001").first()
        assert rec is not None
        assert rec.machine.id == "compressor_02"
        assert rec.alert.id == "alert_001"
        assert len(rec.recommended_actions) == 3
        print(f"  Verified Recommendation {rec.id} links to Alert {rec.alert.id} and Machine {rec.machine.name}")

        print("\n=== STEP 3: Verify Normal vs Abnormal States ===")
        # Check machine statuses
        normal_machines = db.query(Machine).filter(Machine.status == "NORMAL").all()
        warning_machines = db.query(Machine).filter(Machine.status == "WARNING").all()
        anomaly_machines = db.query(Machine).filter(Machine.status == "ANOMALY").all()

        print(f"  NORMAL machines ({len(normal_machines)}): {[m.id for m in normal_machines]}")
        print(f"  WARNING machines ({len(warning_machines)}): {[m.id for m in warning_machines]}")
        print(f"  ANOMALY machines ({len(anomaly_machines)}): {[m.id for m in anomaly_machines]}")

        assert len(anomaly_machines) >= 1 and anomaly_machines[0].id == "compressor_02"
        assert len(warning_machines) >= 1 and warning_machines[0].id == "hvac_01"

        # Check Compressor #02 telemetry details
        latest_c2 = (
            db.query(SensorReading)
            .filter(SensorReading.machine_id == "compressor_02")
            .order_by(SensorReading.timestamp.desc())
            .first()
        )
        print(f"\n  Latest Compressor #02 Telemetry (Anomaly State):")
        print(f"    Power      : {latest_c2.power_kw} kW (Rated: 25.0 kW)")
        print(f"    Temperature: {latest_c2.temperature} °C (Elevated)")
        print(f"    Vibration  : {latest_c2.vibration} mm/s (Elevated)")

        assert latest_c2.power_kw >= 20.0, "Expected elevated power for compressor_02"
        assert latest_c2.temperature >= 70.0, "Expected elevated temperature for compressor_02"
        assert latest_c2.vibration >= 4.0, "Expected elevated vibration for compressor_02"

        # Check Alerts representation
        active_alerts = db.query(Alert).filter(Alert.status == "ACTIVE").all()
        ack_alerts = db.query(Alert).filter(Alert.status == "ACKNOWLEDGED").all()
        resolved_alerts = db.query(Alert).filter(Alert.status == "RESOLVED").all()
        print(f"\n  Alert distribution: ACTIVE={len(active_alerts)}, ACKNOWLEDGED={len(ack_alerts)}, RESOLVED={len(resolved_alerts)}")

        print("\n=== STEP 4: Verify Database Health & API Status ===")
        with TestClient(app) as client:
            res = client.get("/health")
            assert res.status_code == 200
            data = res.json()
            assert data["status"] == "healthy"
            assert data["database"] == "connected"
            print(f"  GET /health: {data}")

        print("\nPHASE 3 SEED & MOCK DATA ENGINE VERIFICATION SUCCESSFUL!")

    finally:
        db.close()


if __name__ == "__main__":
    verify_phase3()
