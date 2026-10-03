import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import OptimizationScenario

client = TestClient(app)


def test_optimization_simulate_success():
    """Verify POST /api/optimization/simulate returns current vs optimized comparison and reduction metrics."""
    payload = {
        "scenario_name": "Move Batch B to Off-Peak",
        "batch_id": "B-102",
        "new_start_time": "22:00",
    }
    response = client.post("/api/optimization/simulate", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()

    assert data["scenario_name"] == "Move Batch B to Off-Peak"
    assert "current" in data
    assert "optimized" in data

    # Check Current values
    curr = data["current"]
    assert curr["energy_kwh"] == 12400.0
    assert curr["cost"] == 118000.0
    assert curr["co2_tonnes"] == 10.1
    assert curr["production_units"] == 2200.0

    # Check Optimized values
    opt = data["optimized"]
    assert opt["energy_kwh"] == 10950.0
    assert opt["cost"] == 97600.0
    assert opt["co2_tonnes"] == 8.9
    assert opt["production_units"] == 2200.0

    # Mathematical reduction checks
    # Energy: (12400 - 10950) / 12400 = 1450 / 12400 = 11.6935...%
    assert data["energy_reduction_percent"] == 11.69
    # CO2: (10.1 - 8.9) / 10.1 = 1.2 / 10.1 = 11.8811...%
    assert data["co2_reduction_percent"] == 11.88
    # Cost savings: 118000 - 97600 = 20400
    assert data["cost_saving"] == 20400.0
    # Throughput preserved
    assert data["production_change_percent"] == 0.0

    print(f"\n[PASS] Optimization simulation result: energy_reduction={data['energy_reduction_percent']}%, co2_reduction={data['co2_reduction_percent']}%, savings=Rs.{data['cost_saving']}")


def test_optimization_approve_success():
    """Verify POST /api/optimization/approve records approval in DB and confirms simulated control instruction."""
    payload = {"scenario_id": "scenario_001"}
    response = client.post("/api/optimization/approve", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "APPROVED"
    assert "Optimization approved" in data["message"]
    assert "simulated control" in data["message"].lower()

    # Verify state updated in PostgreSQL database
    db = SessionLocal()
    scenario = db.query(OptimizationScenario).filter(OptimizationScenario.id == "scenario_001").first()
    assert scenario is not None
    assert scenario.status == "APPROVED"
    db.close()

    print(f"[PASS] Optimization scenario approved: status={data['status']}, DB confirmed status={scenario.status}")


def test_optimization_approve_not_found():
    """Verify POST /api/optimization/approve with unknown scenario ID returns 404."""
    payload = {"scenario_id": "nonexistent_scenario_999"}
    response = client.post("/api/optimization/approve", json=payload)
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "not found" in data["detail"].lower()

    print("[PASS] Nonexistent scenario returns 404")


if __name__ == "__main__":
    test_optimization_simulate_success()
    test_optimization_approve_success()
    test_optimization_approve_not_found()
    print("\nALL PHASE 7 TESTS PASSED SUCCESSFULLY!")
