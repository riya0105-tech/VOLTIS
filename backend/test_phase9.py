"""Phase 9 Verification Tests: AI/ML Adapter Interface.

Validates:
- Structured ML prediction output contract
- Compressor #02 anomaly scenario
- Normal equipment baselines
- Invalid/missing feature validation
- Pluggable adapter interface replaceability and hot-swapping
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.ml.adapter import (
    BaseMLAdapter,
    MockMLService,
    get_ml_adapter,
    reset_ml_adapter,
    set_ml_adapter,
)
from app.schemas.ml import MLPredictionResult, MLTelemetryInput

client = TestClient(app)


def test_compressor_02_anomaly_from_db():
    """Verify Compressor #02 produces the exact ANOMALY demo contract from PostgreSQL telemetry."""
    response = client.get("/api/ml/prediction/compressor_02")
    assert response.status_code == 200

    data = response.json()
    assert data["machine_id"] == "compressor_02"
    assert data["status"] == "ANOMALY"
    assert data["anomaly_score"] == 0.87
    assert data["health_score"] == 82
    assert data["risk"] == "MEDIUM"
    assert data["possible_issue"] == "Bearing degradation"
    assert data["expected_energy"] == 15.2
    assert data["energy_deviation_percent"] == 31.0
    assert data["estimated_waste_kwh"] == 74.0
    assert data["estimated_cost"] == 1140.0
    assert isinstance(data["recommended_actions"], list)
    assert len(data["recommended_actions"]) > 0


def test_normal_machine_from_db():
    """Verify normal machines produce nominal/non-anomalous predictions."""
    for m_id in ["furnace_01", "transformer_01", "pump_01", "motor_01"]:
        response = client.get(f"/api/ml/prediction/{m_id}")
        assert response.status_code == 200

        data = response.json()
        assert data["machine_id"] == m_id
        assert data["status"] == "NORMAL"
        assert data["anomaly_score"] < 0.2
        assert data["health_score"] >= 90
        assert data["risk"] == "LOW"
        assert data["possible_issue"] is None


def test_hvac_warning_from_db():
    """Verify HVAC produces WARNING prediction reflecting high idle operation."""
    response = client.get("/api/ml/prediction/hvac_01")
    assert response.status_code == 200

    data = response.json()
    assert data["machine_id"] == "hvac_01"
    assert data["status"] == "WARNING"
    assert data["anomaly_score"] == 0.45
    assert data["risk"] == "LOW"
    assert "idle" in data["possible_issue"].lower()


def test_post_predict_valid_telemetry():
    """Verify POST /api/ml/predict with explicit feature vector."""
    payload = {
        "machine_id": "compressor_02",
        "power_kw": 21.5,
        "voltage": 230.0,
        "current": 78.5,
        "temperature": 72.0,
        "vibration": 4.8,
        "runtime_hours": 6.5,
        "production_units": 450.0,
    }
    response = client.post("/api/ml/predict", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["machine_id"] == "compressor_02"
    assert data["status"] == "ANOMALY"
    assert data["anomaly_score"] == 0.87
    assert data["health_score"] == 82


def test_post_predict_extreme_vibration():
    """Verify generic machine with extreme vibration is flagged as ANOMALY."""
    payload = {
        "machine_id": "generic_motor_99",
        "power_kw": 25.0,
        "vibration": 5.2,
        "temperature": 85.0,
    }
    response = client.post("/api/ml/predict", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ANOMALY"
    assert data["anomaly_score"] > 0.8
    assert data["risk"] == "HIGH"


def test_invalid_telemetry_negative_power():
    """Verify validation error when power_kw is negative."""
    payload = {
        "machine_id": "compressor_02",
        "power_kw": -10.0,
    }
    response = client.post("/api/ml/predict", json=payload)
    assert response.status_code == 422


def test_missing_machine_id_validation():
    """Verify validation error when machine_id is omitted."""
    payload = {
        "power_kw": 15.0,
    }
    response = client.post("/api/ml/predict", json=payload)
    assert response.status_code == 422


def test_machine_not_found_404():
    """Verify 404 error when querying prediction for non-existent machine."""
    response = client.get("/api/ml/prediction/nonexistent_machine_xyz")
    assert response.status_code == 404


def test_all_machines_predictions():
    """Verify GET /api/ml/predictions returns predictions for all 9 factory machines."""
    response = client.get("/api/ml/predictions")
    assert response.status_code == 200

    data = response.json()
    assert len(data) == 9
    machine_ids = {p["machine_id"] for p in data}
    assert "compressor_02" in machine_ids
    assert "furnace_01" in machine_ids
    assert "transformer_01" in machine_ids


def test_adapter_replaceability_hot_swap():
    """
    Verify that the ML adapter can be replaced at runtime by an external implementation
    without modifying API endpoints or service consumers.
    """
    class CustomTeammateAdapter(BaseMLAdapter):
        def predict(self, telemetry: MLTelemetryInput) -> MLPredictionResult:
            return MLPredictionResult(
                machine_id=telemetry.machine_id,
                status="CUSTOM_EVALUATION",
                anomaly_score=0.42,
                health_score=99,
                risk="LOW",
                possible_issue="Evaluated by external model",
            )

    try:
        # Hot-swap the active adapter
        set_ml_adapter(CustomTeammateAdapter())
        assert isinstance(get_ml_adapter(), CustomTeammateAdapter)

        # Call prediction endpoint and verify custom model output is returned
        response = client.get("/api/ml/prediction/compressor_02")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "CUSTOM_EVALUATION"
        assert data["health_score"] == 99
        assert data["possible_issue"] == "Evaluated by external model"

    finally:
        # Reset back to default MockMLService
        reset_ml_adapter()
        assert isinstance(get_ml_adapter(), MockMLService)

        # Confirm default behavior restored
        response = client.get("/api/ml/prediction/compressor_02")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ANOMALY"
        assert data["health_score"] == 82
