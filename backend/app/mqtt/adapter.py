"""MQTT Adapter and Telemetry Ingestion Boundary for VOLTIS.

Decouples network transport protocols (MQTT/TCP) from business and database logic.
Provides both:
1. MockMQTTAdapter: In-memory simulation adapter for testing and local development without a broker.
2. PahoMQTTAdapter: Production-ready adapter wrapping paho-mqtt for physical or Docker broker integration.

Topic Convention:
    voltis/factory/{factory_id}/machine/{machine_id}/telemetry

Conceptual Architecture:
    MQTT Broker
         ↓
    MQTT Adapter (BaseMQTTAdapter)
         ↓
    Telemetry Ingestion Service (ingest_sensor_reading)
         ↓
    Pydantic Validation (SensorReadingCreate)
         ↓
    PostgreSQL (sensor_readings)
         ↓
    ML Adapter / Downstream Services (Anomaly Evaluation)
"""

from abc import ABC, abstractmethod
import json
import logging
from typing import Any, Callable, Dict, List, Optional, Union

from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import SessionLocal
from app.schemas.ingestion import IngestionResult, SensorReadingCreate
from app.services.ingestion_service import ingest_sensor_reading, parse_telemetry_topic

logger = logging.getLogger("voltis.mqtt.adapter")
settings = get_settings()


class BaseMQTTAdapter(ABC):
    """Abstract Base Class for MQTT client adapters."""

    @abstractmethod
    def connect(self) -> bool:
        """Connect to the MQTT broker."""
        pass

    @abstractmethod
    def disconnect(self) -> None:
        """Disconnect from the MQTT broker."""
        pass

    @abstractmethod
    def publish(self, topic: str, payload: Union[str, Dict[str, Any]]) -> bool:
        """Publish a message to an MQTT topic."""
        pass

    @abstractmethod
    def subscribe(self, topic: str, callback: Callable[[str, str], None]) -> bool:
        """Subscribe to an MQTT topic with a message callback (topic, payload_str)."""
        pass

    @abstractmethod
    def is_connected(self) -> bool:
        """Return current connection status."""
        pass


class MockMQTTAdapter(BaseMQTTAdapter):
    """
    In-memory Mock MQTT transport for testing and local development.
    Does not require a running Mosquitto or network broker.
    """

    def __init__(self):
        self._connected: bool = False
        self._subscriptions: Dict[str, List[Callable[[str, str], None]]] = {}
        self._published_messages: List[Dict[str, Any]] = []

    def connect(self) -> bool:
        self._connected = True
        logger.info("MockMQTTAdapter connected (in-memory mode).")
        return True

    def disconnect(self) -> None:
        self._connected = False
        logger.info("MockMQTTAdapter disconnected.")

    def is_connected(self) -> bool:
        return self._connected

    def subscribe(self, topic: str, callback: Callable[[str, str], None]) -> bool:
        if topic not in self._subscriptions:
            self._subscriptions[topic] = []
        self._subscriptions[topic].append(callback)
        logger.info(f"MockMQTTAdapter subscribed to '{topic}'.")
        return True

    def publish(self, topic: str, payload: Union[str, Dict[str, Any]]) -> bool:
        payload_str = json.dumps(payload) if isinstance(payload, dict) else str(payload)
        self._published_messages.append({"topic": topic, "payload": payload_str})
        logger.info(f"MockMQTTAdapter received publish on '{topic}'.")

        # Deliver to matching subscribers (exact match or simple wildcard)
        delivered = False
        for sub_topic, callbacks in self._subscriptions.items():
            if sub_topic == topic or sub_topic.endswith("/#") or "+" in sub_topic:
                for cb in callbacks:
                    try:
                        cb(topic, payload_str)
                        delivered = True
                    except Exception as err:
                        logger.error(f"Error in MockMQTT callback for topic '{topic}': {err}")
        return True

    def simulate_incoming_telemetry(
        self,
        payload: Union[Dict[str, Any], str, SensorReadingCreate],
        topic: Optional[str] = None,
        db: Optional[Session] = None,
    ) -> IngestionResult:
        """
        Directly pipe a sensor telemetry reading through the ingestion service
        identically to how a live MQTT message callback would process it.
        """
        if db is not None:
            return ingest_sensor_reading(db, payload, topic=topic)

        # Use a managed session if none was passed
        with SessionLocal() as session:
            return ingest_sensor_reading(session, payload, topic=topic)


class PahoMQTTAdapter(BaseMQTTAdapter):
    """
    Live MQTT Adapter wrapping paho-mqtt client.
    Designed for ESP32 and Mosquitto integration.

    IMPORTANT SAFETY CONSTRAINT:
    Does NOT connect automatically on import or application startup.
    Must be explicitly configured and started via connect().
    """

    def __init__(
        self,
        broker_host: Optional[str] = None,
        broker_port: Optional[int] = None,
        username: Optional[str] = None,
        password: Optional[str] = None,
        client_id: str = "voltis_backend_ingestor",
    ):
        self.broker_host = broker_host or settings.MQTT_BROKER_HOST
        self.broker_port = broker_port or settings.MQTT_BROKER_PORT
        self.username = username or settings.MQTT_USERNAME
        self.password = password or settings.MQTT_PASSWORD
        self.client_id = client_id

        self._client = None
        self._connected = False
        self._subscriptions: Dict[str, List[Callable[[str, str], None]]] = {}

    def _init_client(self):
        try:
            import paho.mqtt.client as mqtt
            self._client = mqtt.Client(client_id=self.client_id)
            if self.username:
                self._client.username_pw_set(self.username, self.password)

            self._client.on_connect = self._on_connect
            self._client.on_disconnect = self._on_disconnect
            self._client.on_message = self._on_message
        except ImportError:
            logger.warning("paho-mqtt library is not installed. PahoMQTTAdapter unavailable.")

    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self._connected = True
            logger.info(f"PahoMQTTAdapter successfully connected to broker at {self.broker_host}:{self.broker_port}")
            # Re-subscribe to active topics
            for topic in self._subscriptions.keys():
                client.subscribe(topic)
        else:
            logger.error(f"PahoMQTTAdapter connection failed with result code {rc}")

    def _on_disconnect(self, client, userdata, rc):
        self._connected = False
        logger.info(f"PahoMQTTAdapter disconnected from broker (rc={rc})")

    def _on_message(self, client, userdata, msg):
        topic = msg.topic
        payload_str = msg.payload.decode("utf-8")
        logger.info(f"PahoMQTT received message on topic '{topic}'")

        # Route to registered callbacks
        for sub_topic, callbacks in self._subscriptions.items():
            for cb in callbacks:
                try:
                    cb(topic, payload_str)
                except Exception as err:
                    logger.error(f"Error executing MQTT callback for '{topic}': {err}")

    def connect(self) -> bool:
        if self._client is None:
            self._init_client()
        if self._client is None:
            return False

        try:
            self._client.connect(self.broker_host, self.broker_port, keepalive=60)
            self._client.loop_start()
            return True
        except Exception as err:
            logger.warning(f"Could not connect to MQTT broker ({err}). Continuing without live broker.")
            return False

    def disconnect(self) -> None:
        if self._client:
            self._client.loop_stop()
            self._client.disconnect()
            self._connected = False

    def is_connected(self) -> bool:
        return self._connected

    def subscribe(self, topic: str, callback: Callable[[str, str], None]) -> bool:
        if topic not in self._subscriptions:
            self._subscriptions[topic] = []
        self._subscriptions[topic].append(callback)
        if self._client and self._connected:
            self._client.subscribe(topic)
        return True

    def publish(self, topic: str, payload: Union[str, Dict[str, Any]]) -> bool:
        if not self._client or not self._connected:
            logger.warning("PahoMQTTAdapter publish skipped: client not connected.")
            return False
        payload_str = json.dumps(payload) if isinstance(payload, dict) else str(payload)
        self._client.publish(topic, payload_str)
        return True


# =====================================================================
# MQTT Adapter Registry / Dependency Injection Boundary
# =====================================================================

_current_mqtt_adapter: Optional[BaseMQTTAdapter] = None


def get_mqtt_adapter() -> BaseMQTTAdapter:
    """
    Retrieve the active MQTT adapter.
    Defaults to MockMQTTAdapter for zero-broker local development and automated testing.
    """
    global _current_mqtt_adapter
    if _current_mqtt_adapter is None:
        _current_mqtt_adapter = MockMQTTAdapter()
        _current_mqtt_adapter.connect()
    return _current_mqtt_adapter


def set_mqtt_adapter(adapter: BaseMQTTAdapter) -> None:
    """Register a custom or external MQTT transport adapter."""
    global _current_mqtt_adapter
    if not isinstance(adapter, BaseMQTTAdapter):
        raise TypeError(f"Adapter must inherit from BaseMQTTAdapter, got {type(adapter)}")
    _current_mqtt_adapter = adapter
    logger.info(f"Registered active MQTT Adapter: {adapter.__class__.__name__}")


def reset_mqtt_adapter() -> None:
    """Reset active MQTT adapter back to default MockMQTTAdapter."""
    global _current_mqtt_adapter
    _current_mqtt_adapter = MockMQTTAdapter()
    _current_mqtt_adapter.connect()
