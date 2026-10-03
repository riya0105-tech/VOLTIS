import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_all_maintenance_records():
    """Verify GET /api/maintenance returns all 4 records with machine info and health score."""
    response = client.get("/api/maintenance")
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    records = response.json()

    assert isinstance(records, list)
    assert len(records) == 4

    first = records[0]
    assert "id" in first
    assert "machine_id" in first
    assert "machine_name" in first and first["machine_name"] is not None
    assert "maintenance_date" in first
    assert "issue" in first
    assert "severity" in first
    assert "health_score" in first
    assert "risk_level" in first

    print(f"\n[PASS] All 4 maintenance records returned. First record: {first}")


def test_get_maintenance_filter_machine_compressor():
    """Verify GET /api/maintenance?machine_id=compressor_02 returns Compressor #02's high severity log."""
    response = client.get("/api/maintenance?machine_id=compressor_02")
    assert response.status_code == 200
    records = response.json()

    assert len(records) == 1
    rec = records[0]
    assert rec["machine_id"] == "compressor_02"
    assert rec["machine_name"] == "Air Compressor #02"
    assert rec["severity"] == "HIGH"
    assert "bearing" in rec["issue"].lower()
    assert rec["health_score"] == 82
    assert rec["risk_level"] == "HIGH"

    print(f"[PASS] Compressor #02 maintenance record: severity={rec['severity']}, health_score={rec['health_score']}, risk={rec['risk_level']}")


def test_get_maintenance_filter_severity():
    """Verify GET /api/maintenance?severity=MEDIUM returns HVAC filter record."""
    response = client.get("/api/maintenance?severity=MEDIUM")
    assert response.status_code == 200
    records = response.json()

    assert len(records) == 1
    assert records[0]["machine_id"] == "hvac_01"
    assert records[0]["severity"] == "MEDIUM"
    assert records[0]["health_score"] == 88
    assert records[0]["risk_level"] == "MEDIUM"
    print("[PASS] Maintenance severity filter returned 1 record")


def test_get_maintenance_by_id_success():
    """Verify GET /api/maintenance/{id} returns specific record."""
    all_res = client.get("/api/maintenance")
    first_id = all_res.json()[0]["id"]

    response = client.get(f"/api/maintenance/{first_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == first_id
    assert "machine_name" in data
    print(f"[PASS] Single maintenance record retrieved by id {first_id}")


def test_get_maintenance_by_id_not_found():
    """Verify GET /api/maintenance/{id} with invalid id returns 404."""
    response = client.get("/api/maintenance/99999")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    print("[PASS] Nonexistent maintenance record returns 404")


def test_get_all_recommendations():
    """Verify GET /api/recommendations returns both seeded recommendations."""
    response = client.get("/api/recommendations")
    assert response.status_code == 200
    recs = response.json()

    assert isinstance(recs, list)
    assert len(recs) == 2

    # Check structure
    r = recs[0]
    assert "id" in r
    assert "machine_id" in r
    assert "machine_name" in r
    assert "problem" in r
    assert "likely_cause" in r
    assert "recommended_actions" in r
    assert isinstance(r["recommended_actions"], list)
    assert "potential_saving" in r
    assert "status" in r

    print(f"\n[PASS] All 2 recommendations returned. First recommendation: {r}")


def test_get_recommendations_filter_machine_compressor():
    """Verify GET /api/recommendations?machine_id=compressor_02 links to alert_001 with 1,140 INR saving."""
    response = client.get("/api/recommendations?machine_id=compressor_02")
    assert response.status_code == 200
    recs = response.json()

    assert len(recs) == 1
    r = recs[0]
    assert r["id"] == "rec_001"
    assert r["machine_id"] == "compressor_02"
    assert r["alert_id"] == "alert_001"
    assert r["potential_saving"] == 1140.0
    assert len(r["recommended_actions"]) == 3
    assert r["status"] == "ACTIVE"

    print(f"[PASS] Compressor #02 recommendation: alert={r['alert_id']}, saving={r['potential_saving']}, actions={len(r['recommended_actions'])}")


def test_get_recommendations_filter_alert():
    """Verify GET /api/recommendations?alert_id=alert_002 returns HVAC recommendation."""
    response = client.get("/api/recommendations?alert_id=alert_002")
    assert response.status_code == 200
    recs = response.json()

    assert len(recs) == 1
    assert recs[0]["id"] == "rec_002"
    assert recs[0]["machine_id"] == "hvac_01"
    assert recs[0]["potential_saving"] == 650.0
    print("[PASS] Alert-filtered recommendation verified")


def test_get_recommendation_by_id_success():
    """Verify GET /api/recommendations/{id} returns single recommendation."""
    response = client.get("/api/recommendations/rec_001")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "rec_001"
    assert data["machine_id"] == "compressor_02"
    print("[PASS] Recommendation rec_001 retrieved by id")


def test_get_recommendation_by_id_not_found():
    """Verify GET /api/recommendations/{id} with unknown ID returns 404."""
    response = client.get("/api/recommendations/unknown_rec_999")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    print("[PASS] Nonexistent recommendation returns 404")


if __name__ == "__main__":
    test_get_all_maintenance_records()
    test_get_maintenance_filter_machine_compressor()
    test_get_maintenance_filter_severity()
    test_get_maintenance_by_id_success()
    test_get_maintenance_by_id_not_found()
    test_get_all_recommendations()
    test_get_recommendations_filter_machine_compressor()
    test_get_recommendations_filter_alert()
    test_get_recommendation_by_id_success()
    test_get_recommendation_by_id_not_found()
    print("\nALL PHASE 6 TESTS PASSED SUCCESSFULLY!")
