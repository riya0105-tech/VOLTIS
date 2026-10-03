import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_factory_overview_success():
    """Verify GET /api/factory/overview returns expected factory metadata and calculated KPIs."""
    response = client.get("/api/factory/overview")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()

    # Factory basic info
    assert "factory" in data, "Missing 'factory' in response"
    assert data["factory"]["id"] == "factory_001"
    assert data["factory"]["name"] == "Shree Textiles Pvt. Ltd."
    assert "location" in data["factory"]

    # KPIs verification
    assert "kpis" in data, "Missing 'kpis' in response"
    kpis = data["kpis"]
    assert kpis["energy_today_kwh"] > 0, "energy_today_kwh should be positive"
    assert kpis["cost_today"] > 0, "cost_today should be positive"
    assert kpis["energy_intensity"] > 0, "energy_intensity should be positive"
    assert kpis["co2_tonnes"] > 0, "co2_tonnes should be positive"
    assert kpis["production_units"] > 0, "production_units should be positive"
    print(f"\n[PASS] Factory Overview: {data}")


def test_factory_overview_nonexistent():
    """Verify GET /api/factory/overview with invalid factory_id returns 404."""
    response = client.get("/api/factory/overview?factory_id=invalid_factory_999")
    assert response.status_code == 404
    print("[PASS] Nonexistent factory returns 404")


def test_get_all_machines():
    """Verify GET /api/machines returns all machines with status and live telemetry."""
    response = client.get("/api/machines")
    assert response.status_code == 200
    machines = response.json()
    assert isinstance(machines, list)
    assert len(machines) == 9, f"Expected 9 machines, got {len(machines)}"

    # Check required machine types
    types = {m["type"] for m in machines}
    expected_types = {"Transformer", "Compressor", "Furnace", "HVAC", "Motor", "Pump", "Production Line"}
    assert expected_types.issubset(types), f"Missing machine types: {expected_types - types}"

    # Verify Compressor #02 has ANOMALY status
    c2 = next((m for m in machines if m["machine_id"] == "compressor_02"), None)
    assert c2 is not None, "compressor_02 not found in list"
    assert c2["status"] == "ANOMALY", f"Expected ANOMALY, got {c2['status']}"
    assert c2["power_kw"] >= 20.0, f"Expected elevated power_kw >= 20.0, got {c2['power_kw']}"
    assert c2["temperature"] >= 70.0, f"Expected elevated temp >= 70.0, got {c2['temperature']}"
    assert c2["vibration"] >= 4.0, f"Expected elevated vibration >= 4.0, got {c2['vibration']}"

    # Verify HVAC has WARNING status
    hvac = next((m for m in machines if m["machine_id"] == "hvac_01"), None)
    assert hvac is not None
    assert hvac["status"] == "WARNING"

    print(f"\n[PASS] All {len(machines)} machines verified. Compressor #02 status: {c2['status']}")


def test_get_machine_detail_success():
    """Verify GET /api/machines/{machine_id} for Compressor #02 returns full details and telemetry."""
    response = client.get("/api/machines/compressor_02")
    assert response.status_code == 200
    data = response.json()

    assert data["machine_id"] == "compressor_02"
    assert data["name"] == "Air Compressor #02"
    assert data["status"] == "ANOMALY"
    assert data["rated_power_kw"] == 25.0
    assert data["power_kw"] >= 20.0

    # Telemetry checks
    assert "current_telemetry" in data and data["current_telemetry"] is not None
    curr = data["current_telemetry"]
    assert curr["power_kw"] >= 20.0
    assert curr["temperature"] >= 70.0
    assert curr["vibration"] >= 4.0

    # Recent readings checks
    assert "recent_readings" in data
    assert isinstance(data["recent_readings"], list)
    assert len(data["recent_readings"]) > 0
    print(f"\n[PASS] Machine detail for compressor_02: status={data['status']}, telemetry points={len(data['recent_readings'])}")


def test_get_machine_detail_not_found():
    """Verify GET /api/machines/{machine_id} for nonexistent machine returns 404."""
    response = client.get("/api/machines/unknown_machine_999")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "not found" in data["detail"].lower()
    print("[PASS] Nonexistent machine returns 404 with detail message")


if __name__ == "__main__":
    test_factory_overview_success()
    test_factory_overview_nonexistent()
    test_get_all_machines()
    test_get_machine_detail_success()
    test_get_machine_detail_not_found()
    print("\nALL PHASE 4 TESTS PASSED SUCCESSFULLY!")
