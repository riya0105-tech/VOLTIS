import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_today_energy_factory():
    """Verify GET /api/energy/today returns 24 hourly data points with actual, expected, cost, and intensity."""
    response = client.get("/api/energy/today")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 24, f"Expected 24 hourly data points, got {len(data)}"

    first_pt = data[0]
    assert "timestamp" in first_pt
    assert "actual_kwh" in first_pt and first_pt["actual_kwh"] > 0
    assert "expected_kwh" in first_pt and first_pt["expected_kwh"] > 0
    assert "cost" in first_pt and first_pt["cost"] > 0
    assert "energy_intensity" in first_pt

    print(f"\n[PASS] Today's energy series (24 points). First point: {first_pt}")


def test_get_today_energy_machine_anomaly():
    """Verify GET /api/energy/today?machine_id=compressor_02 returns elevated actual_kwh vs expected_kwh."""
    response = client.get("/api/energy/today?machine_id=compressor_02")
    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 24

    # For compressor_02, actual_kwh should exceed expected_kwh by ~30-40%
    latest = data[-1]
    assert latest["actual_kwh"] >= 20.0, f"Expected actual_kwh >= 20.0, got {latest['actual_kwh']}"
    assert latest["expected_kwh"] < 18.0, f"Expected baseline expected_kwh < 18.0, got {latest['expected_kwh']}"
    assert latest["actual_kwh"] > latest["expected_kwh"] * 1.25, "Expected actual to exceed expected by > 25%"

    print(f"[PASS] Compressor #02 anomaly confirmed in energy series: actual={latest['actual_kwh']} kWh vs expected={latest['expected_kwh']} kWh")


def test_get_energy_history_all():
    """Verify GET /api/energy/history returns all 48 historical data points."""
    response = client.get("/api/energy/history")
    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 48, f"Expected 48 historical points, got {len(data)}"
    print(f"[PASS] Energy history returned {len(data)} data points")


def test_get_energy_history_filtered():
    """Verify GET /api/energy/history with from, to, and machine_id parameters."""
    response = client.get(
        "/api/energy/history?from=2026-09-26T00:00:00Z&to=2026-09-26T12:00:00Z&machine_id=compressor_01"
    )
    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) > 0
    assert len(data) <= 13  # Hourly points between 00:00 and 12:00
    print(f"[PASS] Filtered energy history: {len(data)} points returned within range")


def test_get_energy_history_invalid_date():
    """Verify GET /api/energy/history with invalid date format returns 400 Bad Request."""
    response = client.get("/api/energy/history?from=invalid-date")
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "invalid 'from' timestamp" in data["detail"].lower()
    print("[PASS] Invalid date parameter returns 400 Bad Request")


def test_get_all_alerts():
    """Verify GET /api/alerts returns all 4 seeded alerts."""
    response = client.get("/api/alerts")
    assert response.status_code == 200
    alerts = response.json()

    assert isinstance(alerts, list)
    assert len(alerts) == 4

    # Verify compressor_02 anomaly alert
    c2_alert = next((a for a in alerts if a["machine_id"] == "compressor_02"), None)
    assert c2_alert is not None, "Compressor #02 alert not found"
    assert c2_alert["id"] == "alert_001"
    assert c2_alert["severity"] == "ANOMALY"
    assert c2_alert["status"] == "ACTIVE"
    assert c2_alert["estimated_waste_kwh"] == 74.0
    assert c2_alert["estimated_cost"] == 1140.0
    assert c2_alert["machine_name"] == "Air Compressor #02"

    print(f"\n[PASS] All 4 alerts returned. Compressor #02 alert: {c2_alert}")


def test_get_alerts_filter_severity():
    """Verify GET /api/alerts?severity=ANOMALY returns only anomaly alerts."""
    response = client.get("/api/alerts?severity=ANOMALY")
    assert response.status_code == 200
    alerts = response.json()

    assert len(alerts) == 1
    assert alerts[0]["id"] == "alert_001"
    assert alerts[0]["severity"] == "ANOMALY"
    print(f"[PASS] Filter severity=ANOMALY returned {len(alerts)} alert")


def test_get_alerts_filter_status():
    """Verify GET /api/alerts?status=ACTIVE returns only active alerts."""
    response = client.get("/api/alerts?status=ACTIVE")
    assert response.status_code == 200
    alerts = response.json()

    assert len(alerts) == 2
    for a in alerts:
        assert a["status"] == "ACTIVE"
    print(f"[PASS] Filter status=ACTIVE returned {len(alerts)} alerts")


def test_get_alerts_filter_machine():
    """Verify GET /api/alerts?machine_id=hvac_01 returns HVAC warning alert."""
    response = client.get("/api/alerts?machine_id=hvac_01")
    assert response.status_code == 200
    alerts = response.json()

    assert len(alerts) == 1
    assert alerts[0]["machine_id"] == "hvac_01"
    assert alerts[0]["severity"] == "WARNING"
    print(f"[PASS] Filter machine_id=hvac_01 returned {len(alerts)} alert")


def test_get_alerts_filter_empty():
    """Verify filtering with nonexistent machine_id returns empty list."""
    response = client.get("/api/alerts?machine_id=nonexistent_machine")
    assert response.status_code == 200
    alerts = response.json()
    assert alerts == []
    print("[PASS] Filter with no match returned []")


if __name__ == "__main__":
    test_get_today_energy_factory()
    test_get_today_energy_machine_anomaly()
    test_get_energy_history_all()
    test_get_energy_history_filtered()
    test_get_energy_history_invalid_date()
    test_get_all_alerts()
    test_get_alerts_filter_severity()
    test_get_alerts_filter_status()
    test_get_alerts_filter_machine()
    test_get_alerts_filter_empty()
    print("\nALL PHASE 5 TESTS PASSED SUCCESSFULLY!")
