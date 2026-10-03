# VOLTIS MQTT Ingestion Architecture & Topic Conventions

This document describes the MQTT-ready telemetry ingestion boundary for the VOLTIS backend.

---

## 1. Topic Hierarchy Convention

VOLTIS uses a structured, standardized topic hierarchy for telemetry streaming:

```text
voltis/factory/{factory_id}/machine/{machine_id}/telemetry
```

### Examples:
- **Compressor #02 in Factory 001:**
  `voltis/factory/factory_001/machine/compressor_02/telemetry`
- **Electric Furnace in Factory 001:**
  `voltis/factory/factory_001/machine/furnace_01/telemetry`
- **HVAC Chiller in Factory 001:**
  `voltis/factory/factory_001/machine/hvac_01/telemetry`

### Wildcard Subscriptions:
The backend can listen to all telemetry from all machines across a plant using single-level wildcard `+`:
```text
voltis/factory/+/machine/+/telemetry
```
Or for a specific factory:
```text
voltis/factory/factory_001/machine/+/telemetry
```

---

## 2. Ingestion Data Contract (JSON Payload)

Every telemetry message published to the topic must contain a JSON payload matching the `SensorReadingCreate` schema:

```json
{
  "machine_id": "compressor_02",
  "timestamp": "2026-09-25T14:32:10",
  "power_kw": 18.2,
  "voltage": 230.0,
  "current": 79.1,
  "temperature": 72.4,
  "vibration": 4.8,
  "runtime_hours": 6.2,
  "production_units": 420.0
}
```

### Required Fields:
- `machine_id` (string): Identifies the equipment in the PostgreSQL registry.
- `power_kw` (float, $\ge 0$): Active power reading in kilowatts.

### Optional Telemetry:
- `timestamp` (ISO-8601 string): If omitted, current UTC time is assigned.
- `voltage` (float): Line voltage in Volts.
- `current` (float): Operating phase current in Amperes.
- `temperature` (float): Surface/bearing temperature in °C.
- `vibration` (float): RMS vibration velocity in mm/s.
- `runtime_hours` (float): Cumulative operational run hours.
- `production_units` (float): Units processed.

---

## 3. Telemetry Pipeline Architecture

```text
       ESP32 Industrial Sensor Node (or Mock Generator)
                             ↓
              Mosquitto MQTT Broker (1883)
                             ↓
                 PahoMQTTAdapter / MockMQTTAdapter
                             ↓
             Telemetry Ingestion Service Layer
               (ingest_sensor_reading)
                             ↓
                  Pydantic Validation
                (SensorReadingCreate)
                             ↓
            PostgreSQL: sensor_readings Table
                             ↓
          AI/ML Adapter Interface (BaseMLAdapter)
               (Real-time Anomaly Evaluation)
```

---

## 4. Safety & Operational Constraints

1. **Telemetry Ingestion Only**: VOLTIS does **NOT** dispatch remote actuator, shutdown, or PLC commands back over MQTT.
2. **Decoupled Transport**: Database logic does not depend on MQTT sockets; ingestion functions are transport-agnostic and work with MQTT, REST, and mock streams.
3. **No Auto-Connect**: The application does not block startup attempting to connect to external brokers unless explicitly started.
