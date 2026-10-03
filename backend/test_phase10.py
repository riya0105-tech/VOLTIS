"""Phase 10 Verification Tests: MQTT-Ready Ingestion Boundary.

Validates:
- Valid telemetry ingestion and validation
- Database persistence in PostgreSQL sensor_readings
- Unknown machine ID handling
- Timestamp parsing and UTC auto-assignment
- Idempotent duplicate/repeated payload updates
- Mock MQTT transport message flow -> ingestion service -> PostgreSQL
- REST telemetry ingestion endpoint
- PahoMQTTAdapter safety (no auto-connect on import or initialization)
"""

from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func

from app.database import SessionLocal
from app.main import app
from app.models import SensorReading
from app.mqtt.adapter import (
    BaseMQTTAdapter,
    MockMQTTAdapter,
    PahoMQTTAdapter,
    get_mqtt_adapter,
    reset_mqtt_adapter,
)
from app.schemas.ingestion import SensorReadingCreate
from app.services.ingestion_service import ingest_sensor_reading, parse_telemetry_topic

client = TestClient(app)


@pytest.fixture(autouse=True)
def isolate_sensor_readings():
    """Fixture ensuring any test sensor readings created in PostgreSQL are cleaned up."""
    db = SessionLocal()
    max_id_before = db.query(func.max(SensorReading.id)).scalar() or 0
    db.close()

    yield

    db = SessionLocal()
    # Delete any readings created during test execution
    db.query(SensorReading).filter(SensorReading.id > max_id_before).delete()
    db.commit()
    db.close()


def test_valid_telemetry_ingestion_direct():
    """Verify ingestion service validates and processes sensor reading."""
    db = SessionLocal()
    payload = {
        "machine_id": "compressor_02",
        "timestamp": "2026-09-25T14:32:10Z",
        "power_kw": 18.2,
        "voltage": 230.0,
        "current": 79.1,
        "temperature": 72.4,
        "vibration": 4.8,
        "runtime_hours": 6.2,
        "production_units": 420.0,
    }
    result = ingest_sensor_reading(db, payload)
    db.close()

    assert result.success is True
    assert result.reading_id is not None
    assert result.machine_id == "compressor_02"
    assert result.power_kw == 18.2
    assert result.anomaly_detected is True  # Evaluated by downstream ML adapter


def test_database_persistence_verification():
    """Verify that an ingested reading physically appears in PostgreSQL sensor_readings."""
    db = SessionLocal()
    payload = SensorReadingCreate(
        machine_id="compressor_01",
        timestamp=datetime(2026, 9, 25, 16, 0, 0, tzinfo=timezone.utc),
        power_kw=17.8,
        voltage=415.0,
        current=28.4,
        temperature=61.5,
        vibration=2.1,
        runtime_hours=12.0,
        production_units=500.0,
    )
    result = ingest_sensor_reading(db, payload)
    assert result.success is True
    assert result.reading_id is not None

    # Query PostgreSQL directly
    persisted = db.query(SensorReading).filter(SensorReading.id == result.reading_id).first()
    db.close()

    assert persisted is not None
    assert persisted.machine_id == "compressor_01"
    assert persisted.power_kw == 17.8
    assert persisted.temperature == 61.5
    assert persisted.vibration == 2.1
    assert persisted.voltage == 415.0


def test_invalid_telemetry_payload_negative_power():
    """Verify validation failure when payload contains invalid power value."""
    db = SessionLocal()
    payload = {
        "machine_id": "compressor_02",
        "power_kw": -25.0,
    }
    result = ingest_sensor_reading(db, payload, raise_on_error=False)
    db.close()

    assert result.success is False
    assert "Validation failed" in result.message


def test_unknown_machine_id_rejection():
    """Verify ingestion rejects unknown machine IDs not in factory registry."""
    db = SessionLocal()
    payload = {
        "machine_id": "unregistered_machine_999",
        "power_kw": 15.0,
    }
    result = ingest_sensor_reading(db, payload, raise_on_error=False)
    db.close()

    assert result.success is False
    assert "does not exist in factory registry" in result.message


def test_timestamp_auto_assignment():
    """Verify that omitting timestamp automatically assigns current UTC datetime."""
    db = SessionLocal()
    payload = {
        "machine_id": "pump_01",
        "power_kw": 12.0,
    }
    before = datetime.now(timezone.utc)
    result = ingest_sensor_reading(db, payload)
    after = datetime.now(timezone.utc)
    db.close()

    assert result.success is True
    assert result.timestamp is not None
    assert before <= result.timestamp <= after


def test_duplicate_payload_idempotent_update():
    """Verify that sending duplicate readings with same (machine_id, timestamp) updates existing record."""
    db = SessionLocal()
    ts = datetime(2026, 9, 25, 18, 0, 0, tzinfo=timezone.utc)
    payload1 = SensorReadingCreate(
        machine_id="furnace_01",
        timestamp=ts,
        power_kw=60.0,
        temperature=145.0,
    )
    res1 = ingest_sensor_reading(db, payload1)
    assert res1.success is True
    first_id = res1.reading_id

    # Second ingestion with identical timestamp but updated power
    payload2 = SensorReadingCreate(
        machine_id="furnace_01",
        timestamp=ts,
        power_kw=68.5,
        temperature=155.0,
    )
    res2 = ingest_sensor_reading(db, payload2)
    assert res2.success is True
    assert res2.reading_id == first_id  # Idempotent update on same row
    assert res2.power_kw == 68.5

    # Check database state
    row = db.query(SensorReading).filter(SensorReading.id == first_id).first()
    db.close()
    assert row.power_kw == 68.5
    assert row.temperature == 155.0


def test_mock_mqtt_to_ingestion_pipeline():
    """Verify mock MQTT adapter routes message through ingestion service to PostgreSQL."""
    mqtt_adapter = get_mqtt_adapter()
    payload = {
        "machine_id": "motor_01",
        "timestamp": "2026-09-25T19:00:00Z",
        "power_kw": 18.0,
        "temperature": 58.0,
        "vibration": 2.2,
    }
    result = mqtt_adapter.simulate_incoming_telemetry(
        payload,
        topic="voltis/factory/factory_001/machine/motor_01/telemetry",
    )
    assert result.success is True
    assert result.reading_id is not None

    # Verify persisted in PostgreSQL
    db = SessionLocal()
    reading = db.query(SensorReading).filter(SensorReading.id == result.reading_id).first()
    db.close()
    assert reading is not None
    assert reading.machine_id == "motor_01"
    assert reading.power_kw == 18.0


def test_mock_mqtt_publish_subscribe_events():
    """Verify in-memory publish/subscribe event dispatching."""
    adapter = MockMQTTAdapter()
    adapter.connect()
    assert adapter.is_connected() is True

    received_messages = []

    def on_telemetry(topic, payload):
        received_messages.append({"topic": topic, "payload": payload})

    topic = "voltis/factory/factory_001/machine/compressor_02/telemetry"
    adapter.subscribe(topic, on_telemetry)

    test_payload = {"machine_id": "compressor_02", "power_kw": 21.0}
    adapter.publish(topic, test_payload)

    assert len(received_messages) == 1
    assert received_messages[0]["topic"] == topic
    assert "compressor_02" in received_messages[0]["payload"]


def test_topic_parsing_helper():
    """Verify standard MQTT topic hierarchy parser."""
    topic = "voltis/factory/factory_001/machine/compressor_02/telemetry"
    meta = parse_telemetry_topic(topic)
    assert meta["factory_id"] == "factory_001"
    assert meta["machine_id"] == "compressor_02"


def test_rest_ingestion_endpoint_success():
    """Verify POST /api/telemetry/ingest endpoint."""
    payload = {
        "machine_id": "prod_line_01",
        "timestamp": "2026-09-25T20:00:00Z",
        "power_kw": 88.0,
        "voltage": 415.0,
        "current": 140.0,
        "temperature": 52.0,
        "vibration": 2.4,
        "production_units": 850.0,
    }
    response = client.post("/api/telemetry/ingest", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert data["reading_id"] is not None
    assert data["machine_id"] == "prod_line_01"
    assert data["power_kw"] == 88.0


def test_rest_ingestion_endpoint_unknown_machine_404():
    """Verify POST /api/telemetry/ingest returns 404 for unknown machine."""
    payload = {
        "machine_id": "ghost_machine_404",
        "power_kw": 50.0,
    }
    response = client.post("/api/telemetry/ingest", json=payload)
    assert response.status_code == 404
    assert "does not exist" in response.json()["detail"]


def test_paho_mqtt_adapter_safety_no_autoconnect():
    """Verify PahoMQTTAdapter does NOT silently connect on import or creation."""
    adapter = PahoMQTTAdapter(broker_host="nonexistent.broker.local", broker_port=1883)
    assert adapter.is_connected() is False
    # Verifies safety boundary: client remains disconnected until connect() is explicitly called
