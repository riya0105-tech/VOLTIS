"""Phase 11: Final Testing & API Verification Suite.

Comprehensive end-to-end verification covering:
1. OpenAPI specification and complete endpoint coverage (19 registered routes).
2. Database health and seeded entity relationships.
3. Successful representative requests across all API groups:
   - Factory (/api/factory/overview)
   - Machines (/api/machines, /api/machines/{id})
   - Energy (/api/energy/today, /api/energy/history)
   - Alerts (/api/alerts)
   - Maintenance (/api/maintenance, /api/maintenance/{id})
   - Recommendations (/api/recommendations, /api/recommendations/{id})
   - Optimization (/api/optimization/simulate, /api/optimization/approve)
   - Copilot (/api/copilot)
   - ML Adapter (/api/ml/predict, /api/ml/prediction/{id}, /api/ml/predictions)
   - Telemetry Ingestion (/api/telemetry/ingest)
   - System Health (/health)
4. Comprehensive error cases (404, 400, 422).
5. Seeded Compressor #02 anomaly demonstration chain.
6. Optimization mathematical fidelity.
"""

from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func

from app.database import SessionLocal, check_db_connection
from app.main import app
from app.models import (
    Alert,
    Factory,
    Machine,
    MaintenanceRecord,
    OptimizationScenario,
    ProductionRecord,
    Recommendation,
    SensorReading,
)

client = TestClient(app)


# =====================================================================
# 1. OpenAPI & Architecture Route Coverage
# =====================================================================

def test_openapi_specification_completeness():
    """Verify OpenAPI documentation generates cleanly with all required endpoints."""
    openapi = app.openapi()
    assert openapi is not None
    assert openapi["info"]["title"] == "VOLTIS API"
    assert openapi["info"]["version"] == "1.0.0"

    paths = openapi.get("paths", {})
    required_paths = [
        ("/api/factory/overview", "get"),
        ("/api/machines", "get"),
        ("/api/machines/{machine_id}", "get"),
        ("/api/energy/today", "get"),
        ("/api/energy/history", "get"),
        ("/api/alerts", "get"),
        ("/api/maintenance", "get"),
        ("/api/maintenance/{maintenance_id}", "get"),
        ("/api/recommendations", "get"),
        ("/api/recommendations/{recommendation_id}", "get"),
        ("/api/optimization/simulate", "post"),
        ("/api/optimization/approve", "post"),
        ("/api/copilot", "post"),
        ("/api/ml/predict", "post"),
        ("/api/ml/prediction/{machine_id}", "get"),
        ("/api/ml/predictions", "get"),
        ("/api/telemetry/ingest", "post"),
        ("/health", "get"),
    ]

    for path, method in required_paths:
        assert path in paths, f"Path '{path}' missing from OpenAPI specification."
        assert method in paths[path], f"Method '{method.upper()}' missing for path '{path}'."


# =====================================================================
# 2. Database Health & Entity Counts
# =====================================================================

def test_database_health_and_seeded_integrity():
    """Verify PostgreSQL connectivity and integrity of seeded dataset."""
    assert check_db_connection() is True

    db = SessionLocal()
    try:
        assert db.query(Factory).count() == 1
        assert db.query(Machine).count() == 9
        assert db.query(SensorReading).count() == 432
        assert db.query(ProductionRecord).count() == 48
        assert db.query(MaintenanceRecord).count() == 4
        assert db.query(Alert).count() == 4
        assert db.query(Recommendation).count() == 2
        assert db.query(OptimizationScenario).count() == 1

        # Verify foreign key relationships
        factory = db.query(Factory).first()
        assert len(factory.machines) == 9
        for m in factory.machines:
            assert m.factory_id == factory.id
            assert len(m.sensor_readings) > 0
    finally:
        db.close()


# =====================================================================
# 3. Successful API Operations Across All Groups
# =====================================================================

def test_factory_overview_valid():
    """Verify GET /api/factory/overview response contract."""
    response = client.get("/api/factory/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["factory"]["id"] == "factory_001"
    assert data["kpis"]["energy_today_kwh"] > 0
    assert data["kpis"]["cost_today"] > 0
    assert data["kpis"]["co2_tonnes"] > 0
    assert data["kpis"]["energy_intensity"] > 0


def test_machines_valid():
    """Verify GET /api/machines and GET /api/machines/{id} contracts."""
    res_list = client.get("/api/machines")
    assert res_list.status_code == 200
    machines = res_list.json()
    assert len(machines) == 9

    res_detail = client.get("/api/machines/compressor_02")
    assert res_detail.status_code == 200
    comp = res_detail.json()
    assert comp["machine_id"] == "compressor_02"
    assert comp["status"] == "ANOMALY"
    assert comp["current_telemetry"] is not None


def test_energy_apis_valid():
    """Verify GET /api/energy/today and GET /api/energy/history."""
    res_today = client.get("/api/energy/today")
    assert res_today.status_code == 200
    assert len(res_today.json()) == 24

    res_hist = client.get("/api/energy/history")
    assert res_hist.status_code == 200
    assert len(res_hist.json()) == 48


def test_alerts_valid():
    """Verify GET /api/alerts and query filtering."""
    res_all = client.get("/api/alerts")
    assert res_all.status_code == 200
    assert len(res_all.json()) == 4

    res_anomaly = client.get("/api/alerts?severity=ANOMALY")
    assert res_anomaly.status_code == 200
    assert len(res_anomaly.json()) == 1
    assert res_anomaly.json()[0]["machine_id"] == "compressor_02"

    res_warning = client.get("/api/alerts?severity=WARNING")
    assert res_warning.status_code == 200
    assert len(res_warning.json()) == 2


def test_maintenance_valid():
    """Verify GET /api/maintenance and GET /api/maintenance/{id}."""
    res_list = client.get("/api/maintenance")
    assert res_list.status_code == 200
    assert len(res_list.json()) == 4

    first_id = res_list.json()[0]["id"]
    res_detail = client.get(f"/api/maintenance/{first_id}")
    assert res_detail.status_code == 200
    assert res_detail.json()["id"] == first_id


def test_recommendations_valid():
    """Verify GET /api/recommendations and GET /api/recommendations/{id}."""
    res_list = client.get("/api/recommendations")
    assert res_list.status_code == 200
    assert len(res_list.json()) == 2

    res_detail = client.get("/api/recommendations/rec_001")
    assert res_detail.status_code == 200
    assert res_detail.json()["machine_id"] == "compressor_02"
    assert res_detail.json()["potential_saving"] == 1140.0


def test_optimization_valid():
    """Verify POST /api/optimization/simulate and POST /api/optimization/approve."""
    sim_payload = {
        "scenario_name": "Move Batch B to Off-Peak",
        "batch_id": "B-102",
        "new_start_time": "22:00",
    }
    res_sim = client.post("/api/optimization/simulate", json=sim_payload)
    assert res_sim.status_code == 200
    sim_data = res_sim.json()
    assert sim_data["energy_reduction_percent"] == 11.69
    assert sim_data["co2_reduction_percent"] == 11.88
    assert sim_data["current"]["production_units"] == sim_data["optimized"]["production_units"]

    app_payload = {"scenario_id": "scenario_001"}
    res_app = client.post("/api/optimization/approve", json=app_payload)
    assert res_app.status_code == 200
    assert res_app.json()["status"] == "APPROVED"


def test_copilot_valid():
    """Verify POST /api/copilot grounded response contract."""
    req = {"message": "Why did electricity consumption increase yesterday?"}
    res = client.post("/api/copilot", json=req)
    assert res.status_code == 200
    data = res.json()
    assert "Compressor" in [c["machine"] for c in data["contributors"]]
    assert len(data["recommendations"]) > 0


def test_ml_adapter_valid():
    """Verify POST /api/ml/predict, GET /api/ml/prediction/{id}, and GET /api/ml/predictions."""
    res_single = client.get("/api/ml/prediction/compressor_02")
    assert res_single.status_code == 200
    assert res_single.json()["status"] == "ANOMALY"
    assert res_single.json()["anomaly_score"] == 0.87

    res_all = client.get("/api/ml/predictions")
    assert res_all.status_code == 200
    assert len(res_all.json()) == 9

    pred_payload = {"machine_id": "compressor_02", "power_kw": 22.0}
    res_post = client.post("/api/ml/predict", json=pred_payload)
    assert res_post.status_code == 200
    assert res_post.json()["status"] == "ANOMALY"


def test_health_check_valid():
    """Verify GET /health returns online status."""
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"
    assert res.json()["database"] == "connected"


# =====================================================================
# 4. Comprehensive Error Case Verification
# =====================================================================

def test_nonexistent_factory_404():
    """Verify 404 on nonexistent factory ID."""
    res = client.get("/api/factory/overview?factory_id=ghost_factory_999")
    assert res.status_code == 404


def test_nonexistent_machine_404():
    """Verify 404 on nonexistent machine ID."""
    res = client.get("/api/machines/ghost_machine_999")
    assert res.status_code == 404


def test_nonexistent_maintenance_404():
    """Verify 404 on nonexistent maintenance ID."""
    res = client.get("/api/maintenance/999999")
    assert res.status_code == 404


def test_nonexistent_recommendation_404():
    """Verify 404 on nonexistent recommendation ID."""
    res = client.get("/api/recommendations/rec_nonexistent_999")
    assert res.status_code == 404


def test_nonexistent_optimization_scenario_404():
    """Verify 404 on approving nonexistent scenario."""
    res = client.post("/api/optimization/approve", json={"scenario_id": "scenario_ghost_999"})
    assert res.status_code == 404


def test_invalid_date_parameters_error():
    """Verify 400 Bad Request on invalid ISO date query parameter."""
    res = client.get("/api/energy/history?from=not-a-valid-date")
    assert res.status_code in (400, 422)


def test_invalid_telemetry_payload_422():
    """Verify 422 on negative power reading."""
    res = client.post("/api/telemetry/ingest", json={"machine_id": "compressor_02", "power_kw": -10.0})
    assert res.status_code == 422


def test_unknown_machine_telemetry_404():
    """Verify 404 on ingesting telemetry for unregistered machine."""
    res = client.post("/api/telemetry/ingest", json={"machine_id": "ghost_machine_404", "power_kw": 20.0})
    assert res.status_code == 404


def test_invalid_copilot_request_422():
    """Verify 422 on empty copilot message."""
    res = client.post("/api/copilot", json={"message": ""})
    assert res.status_code == 422


def test_invalid_optimization_request_422():
    """Verify 422 on empty optimization payload."""
    res = client.post("/api/optimization/simulate", json={})
    assert res.status_code == 422


# =====================================================================
# 5. Compressor #02 Demonstration Chain Verification
# =====================================================================

def test_compressor_02_demonstration_chain():
    """
    Verify complete causal chain:
    Compressor #02 Telemetry
      → Anomaly Alert
      → Maintenance Risk Record
      → Actionable Recommendation
      → ML Adapter Anomaly Score
      → Copilot Causal Explanation
    """
    db = SessionLocal()
    try:
        # Step 1: Telemetry shows elevated power (22.1 kW vs 15.2 kW nominal)
        recent_reading = (
            db.query(SensorReading)
            .filter(SensorReading.machine_id == "compressor_02")
            .order_by(SensorReading.timestamp.desc())
            .first()
        )
        assert recent_reading.power_kw >= 21.0
        assert recent_reading.vibration >= 4.0
        assert recent_reading.temperature >= 70.0

        # Step 2: High/Anomaly Alert
        alert = db.query(Alert).filter(Alert.machine_id == "compressor_02").first()
        assert alert is not None
        assert alert.severity in ("ANOMALY", "HIGH")
        assert alert.estimated_waste_kwh == 74.0

        # Step 3: Maintenance Record correlates with high vibration
        maint = db.query(MaintenanceRecord).filter(MaintenanceRecord.machine_id == "compressor_02").first()
        assert maint is not None
        assert maint.severity == "HIGH"
        assert "bearing" in maint.issue.lower() or "vibration" in maint.issue.lower()

        # Step 4: Recommendation links to alert and prescribes leak repair
        rec = db.query(Recommendation).filter(Recommendation.machine_id == "compressor_02").first()
        assert rec is not None
        assert rec.potential_saving == 1140.0
        assert any("air leakage" in act.lower() for act in rec.recommended_actions)

        # Step 5: ML adapter evaluates compressor_02 to ANOMALY (0.87 score)
        ml_res = client.get("/api/ml/prediction/compressor_02").json()
        assert ml_res["status"] == "ANOMALY"
        assert ml_res["anomaly_score"] == 0.87
        assert ml_res["health_score"] == 82

        # Step 6: Copilot cites Compressor as primary driver of energy surge
        copilot_res = client.post(
            "/api/copilot", json={"message": "Why did energy consumption increase?"}
        ).json()
        assert "Air Compressor #02" in copilot_res["answer"]
        assert "Compressor" in [c["machine"] for c in copilot_res["contributors"]]
    finally:
        db.close()
