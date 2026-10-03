"""Phase 8 Verification Tests: AI Copilot Service.

Validates POST /api/copilot endpoint, response schemas, factual database grounding,
machine contributor calculations, and recommendation extraction.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_copilot_energy_increase_query():
    """Verify Copilot answers query about energy increase with grounded database facts."""
    payload = {"message": "Why did electricity consumption increase yesterday?"}
    response = client.post("/api/copilot", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "answer" in data
    assert "contributors" in data
    assert "recommendations" in data

    # Verify factual figures from PostgreSQL
    answer = data["answer"]
    assert "141.2" in answer
    assert "Air Compressor #02" in answer
    assert "37.3%" in answer
    assert "128.0" in answer

    # Verify contributors
    contributors = data["contributors"]
    assert len(contributors) >= 2
    contributor_machines = [c["machine"] for c in contributors]
    assert "Compressor" in contributor_machines
    assert "HVAC" in contributor_machines

    # Verify percentages are numeric and valid
    for c in contributors:
        assert isinstance(c["contribution_percent"], (int, float))
        assert c["contribution_percent"] > 0

    # Verify recommendations
    recs = data["recommendations"]
    assert isinstance(recs, list)
    assert len(recs) > 0
    assert any("air leakage" in r.lower() or "pressure cutoff" in r.lower() for r in recs)


def test_copilot_machine_contributors_query():
    """Verify query specifically asking for machine contributors."""
    payload = {"message": "Which machines contributed to the increase?"}
    response = client.post("/api/copilot", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert len(data["contributors"]) >= 2
    top_contributor = data["contributors"][0]
    assert top_contributor["machine"] == "Compressor"
    assert top_contributor["contribution_percent"] > 50.0


def test_copilot_problems_and_anomalies_query():
    """Verify query asking about current energy problems/anomalies."""
    payload = {"message": "What are the main current energy problems and anomalies?"}
    response = client.post("/api/copilot", json=payload)
    assert response.status_code == 200

    data = response.json()
    answer = data["answer"]
    assert "active/acknowledged energy anomalies" in answer
    assert "Air Compressor #02" in answer
    assert "HVAC" in answer
    assert "128.0 kWh" in answer


def test_copilot_recommendations_query():
    """Verify query asking for recommendations and savings."""
    payload = {"message": "What recommendations should the factory manager consider to save energy?"}
    response = client.post("/api/copilot", json=payload)
    assert response.status_code == 200

    data = response.json()
    answer = data["answer"]
    assert "potential saving" in answer.lower() or "active energy-saving measures" in answer.lower()
    assert "1,790" in answer  # Combined potential savings from rec_001 and rec_002
    assert len(data["recommendations"]) >= 2


def test_copilot_maintenance_and_alerts_query():
    """Verify query asking about maintenance records and equipment status."""
    payload = {"message": "What relevant maintenance and alert information exists?"}
    response = client.post("/api/copilot", json=payload)
    assert response.status_code == 200

    data = response.json()
    answer = data["answer"]
    assert "maintenance status records" in answer.lower()
    assert "Compressor" in answer
    assert "vibration" in answer.lower()


def test_copilot_general_status_query():
    """Verify general factory energy status query."""
    payload = {"message": "Give me an overview of the factory energy status"}
    response = client.post("/api/copilot", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert len(data["answer"]) > 20
    assert len(data["contributors"]) > 0
    assert len(data["recommendations"]) > 0


def test_copilot_empty_message_validation():
    """Verify 422 error when message is empty."""
    payload = {"message": ""}
    response = client.post("/api/copilot", json=payload)
    assert response.status_code == 422


def test_copilot_missing_message_field():
    """Verify 422 error when message field is omitted."""
    payload = {}
    response = client.post("/api/copilot", json=payload)
    assert response.status_code == 422
