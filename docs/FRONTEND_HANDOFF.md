# VOLTIS — Frontend Integration & API Handoff Guide

This document is the definitive specification for the frontend engineer/agent developing the React dashboard for **VOLTIS**.

All endpoints, response shapes, query parameters, and data types documented below are **live, fully implemented, and verified** against PostgreSQL in the backend.

> [!IMPORTANT]
> **Schema Contract Rule**: The frontend **must** consume the exact API response shapes defined in this document and [`system-design.md`](file:///c:/Users/riya%20sharma/OneDrive/Desktop/voltis/system-design.md). Do **not** invent or assume different field names.

---

## 1. Quick Integration Info

- **Backend Base URL**: `http://localhost:8000`
- **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **OpenAPI Schema (JSON)**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)
- **Supported CORS Origins**: `http://localhost:5173` (Vite), `http://localhost:3000` (CRA), `http://127.0.0.1:5173`
- **Standard Date Format**: ISO-8601 UTC strings (e.g., `2026-09-25T14:32:10Z`)
- **Currency**: Indian Rupees (`INR` / `₹`)

---

## 2. Dashboard Component to API Endpoint Mapping

| UI Component / Screen | HTTP Method | Endpoint | Description |
|---|---|---|---|
| **Top KPI Summary Cards** | `GET` | `/api/factory/overview` | Factory name, today's kWh, energy cost, carbon footprint, intensity (EPI) |
| **Digital Twin Machine Grid** | `GET` | `/api/machines` | List of all 9 factory machines with live status, power, temp, and vibration |
| **Machine Telemetry Drawer** | `GET` | `/api/machines/{machine_id}` | Detailed telemetry and 24-hour sensor history for a selected machine |
| **Main Energy Chart (Today)**| `GET` | `/api/energy/today` | 24 hourly points: actual kWh vs expected baseline, cost, intensity |
| **Historical Trends Chart** | `GET` | `/api/energy/history` | Multi-day comparative energy time-series with date & machine filters |
| **Active Alerts Drawer** | `GET` | `/api/alerts` | Anomaly/warning alerts with estimated waste (kWh) and cost impact (₹) |
| **Predictive Maintenance** | `GET` | `/api/maintenance` | Maintenance records, health scores (0-100), and risk levels |
| **Actionable Recommendations**| `GET` | `/api/recommendations` | Prioritized energy-saving actions with calculated daily INR savings |
| **What-If Optimization Card** | `POST`| `/api/optimization/simulate` | Simulates production shift rescheduling (kWh, cost, CO2 comparison) |
| **Approve Optimization Modal**| `POST`| `/api/optimization/approve` | Simulated scenario approval (updates status to `APPROVED`) |
| **AI Energy Copilot Chat** | `POST`| `/api/copilot` | Natural language queries (answers, machine contributors, action recommendations) |
| **Machine ML Badges** | `GET` | `/api/ml/predictions` | Real-time health scores and anomaly classification across all equipment |
| **Status / Connectivity** | `GET` | `/health` | Live backend and PostgreSQL health status |

---

## 3. Exhaustive API Endpoint Contracts

### 3.1 Factory Overview

#### `GET /api/factory/overview`
Retrieves top-level KPIs for the main dashboard header.

- **Query Parameters**: `factory_id` (optional, string)
- **Sample Request**: `GET http://localhost:8000/api/factory/overview`
- **Response (`200 OK`)**:
```json
{
  "factory": {
    "id": "factory_001",
    "name": "Shree Textiles Pvt. Ltd.",
    "industry": "Textile Manufacturing (Spinning & Weaving)",
    "location": "Surat, Gujarat, India"
  },
  "kpis": {
    "energy_today_kwh": 8917.2,
    "cost_today": 72452.25,
    "energy_intensity": 4.05,
    "co2_tonnes": 7.31,
    "production_units": 2200.0
  }
}
```
- **Error Responses**:
  - `404 Not Found`: Factory ID not found.

---

### 3.2 Machines (Digital Twin)

#### `GET /api/machines`
Returns the status of all equipment for the factory layout / machine cards.

- **Response (`200 OK`)**:
```json
[
  {
    "machine_id": "compressor_02",
    "name": "Air Compressor #02",
    "type": "Compressor",
    "status": "ANOMALY",
    "power_kw": 22.1,
    "temperature": 72.5,
    "vibration": 4.8,
    "rated_power_kw": 25.0,
    "production_association": "Weaving Line 2"
  },
  {
    "machine_id": "furnace_01",
    "name": "Electric Heat-Setting Furnace",
    "type": "Furnace",
    "status": "NORMAL",
    "power_kw": 72.0,
    "temperature": 148.3,
    "vibration": 0.7,
    "rated_power_kw": 80.0,
    "production_association": "Dyeing & Finishing"
  },
  {
    "machine_id": "hvac_01",
    "name": "Factory Central HVAC & Chiller",
    "type": "HVAC",
    "status": "WARNING",
    "power_kw": 32.5,
    "temperature": 27.3,
    "vibration": 1.7,
    "rated_power_kw": 40.0,
    "production_association": "Main Facility"
  }
]
```

#### `GET /api/machines/{machine_id}`
Returns deep-dive telemetry and past 24 hours of sensor readings for a selected machine.

- **Path Parameter**: `machine_id` (string, e.g. `compressor_02`)
- **Response (`200 OK`)**:
```json
{
  "machine_id": "compressor_02",
  "factory_id": "factory_001",
  "name": "Air Compressor #02",
  "type": "Compressor",
  "rated_power_kw": 25.0,
  "status": "ANOMALY",
  "operating_limit": 22.0,
  "production_association": "Weaving Line 2",
  "power_kw": 22.1,
  "temperature": 72.5,
  "vibration": 4.8,
  "current_telemetry": {
    "id": 432,
    "machine_id": "compressor_02",
    "timestamp": "2026-09-27T09:00:00Z",
    "power_kw": 22.1,
    "voltage": 230.0,
    "current": 79.1,
    "temperature": 72.5,
    "vibration": 4.8,
    "runtime_hours": 6.2,
    "production_units": 420.0
  },
  "recent_readings": [
    {
      "id": 423,
      "machine_id": "compressor_02",
      "timestamp": "2026-09-27T08:00:00Z",
      "power_kw": 21.8,
      "voltage": 230.0,
      "current": 78.5,
      "temperature": 72.1,
      "vibration": 4.7,
      "runtime_hours": 5.2,
      "production_units": 380.0
    }
  ]
}
```
- **Error Responses**:
  - `404 Not Found`: Machine not found.

---

### 3.3 Energy Analytics

#### `GET /api/energy/today`
Returns 24 hourly time-series points representing the last 24-hour cycle. Ideal for double-line charts showing **Actual vs Expected** consumption.

- **Query Parameters**: `machine_id` (optional, filter by specific machine)
- **Response (`200 OK`)**:
```json
[
  {
    "timestamp": "2026-09-26T10:00:00Z",
    "actual_kwh": 385.4,
    "expected_kwh": 380.59,
    "cost": 3131.38,
    "energy_intensity": 4.19
  },
  {
    "timestamp": "2026-09-26T11:00:00Z",
    "actual_kwh": 391.2,
    "expected_kwh": 380.59,
    "cost": 3178.5,
    "energy_intensity": 4.25
  }
]
```

#### `GET /api/energy/history`
Multi-day historical trend data.

- **Query Parameters**:
  - `from` (optional, ISO string, e.g. `2026-09-25T00:00:00Z`)
  - `to` (optional, ISO string, e.g. `2026-09-27T00:00:00Z`)
  - `machine_id` (optional, string)
- **Response (`200 OK`)**: Array of `EnergyDataPoint` identical to `/today`.
- **Error Responses**:
  - `400 Bad Request`: If `from` or `to` date string is malformed.

---

### 3.4 Alerts

#### `GET /api/alerts`
Returns anomaly and warning alerts.

- **Query Parameters**:
  - `severity` (optional: `ANOMALY`, `HIGH`, `WARNING`, `NORMAL`)
  - `status` (optional: `ACTIVE`, `ACKNOWLEDGED`, `RESOLVED`)
  - `machine_id` (optional: string)
- **Response (`200 OK`)**:
```json
[
  {
    "id": "alert_001",
    "machine_id": "compressor_02",
    "severity": "ANOMALY",
    "title": "Air Compressor #02 — Anomaly Detected",
    "description": "Compressor #02 power draw is 35% above normal baseline for current pneumatic load.",
    "estimated_waste_kwh": 74.0,
    "estimated_cost": 1140.0,
    "status": "ACTIVE",
    "machine_name": "Air Compressor #02"
  },
  {
    "id": "alert_002",
    "machine_id": "hvac_01",
    "severity": "WARNING",
    "title": "HVAC Chiller — High Idle Operation",
    "description": "Central HVAC system ran 2.3 hours longer than required during night shift low-occupancy window.",
    "estimated_waste_kwh": 42.0,
    "estimated_cost": 650.0,
    "status": "ACTIVE",
    "machine_name": "Factory Central HVAC & Chiller"
  }
]
```

---

### 3.5 Predictive Maintenance

#### `GET /api/maintenance`
Returns maintenance logs with calculated equipment health scores.

- **Query Parameters**:
  - `machine_id` (optional, string)
  - `severity` (optional: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- **Response (`200 OK`)**:
```json
[
  {
    "id": 1,
    "machine_id": "compressor_02",
    "maintenance_date": "2026-09-27T06:00:00Z",
    "issue": "Abnormal bearing vibration and elevated discharge temperature (72.4°C)",
    "severity": "HIGH",
    "notes": "Bearing degradation detected on motor shaft coupling. Emergency inspection scheduled.",
    "machine_name": "Air Compressor #02",
    "health_score": 82,
    "risk_level": "HIGH"
  },
  {
    "id": 2,
    "machine_id": "hvac_01",
    "maintenance_date": "2026-09-26T22:00:00Z",
    "issue": "Air intake pressure differential alert",
    "severity": "MEDIUM",
    "notes": "Air filters partially clogged. Cleaned pre-filters.",
    "machine_name": "Factory Central HVAC & Chiller",
    "health_score": 88,
    "risk_level": "MEDIUM"
  }
]
```

#### `GET /api/maintenance/{maintenance_id}`
Returns a single maintenance record by numeric ID.
- **Path Parameter**: `maintenance_id` (integer)

---

### 3.6 Actionable Recommendations

#### `GET /api/recommendations`
Returns actionable measures prioritized by potential cost savings.

- **Query Parameters**:
  - `machine_id` (optional, string)
  - `alert_id` (optional, string)
- **Response (`200 OK`)**:
```json
[
  {
    "id": "rec_001",
    "machine_id": "compressor_02",
    "alert_id": "alert_001",
    "problem": "Air Compressor #02 is drawing 21.2 kW, operating 31% above normal thermal and electrical baseline.",
    "likely_cause": "Probable air leak in primary pneumatic distribution loop or fouled intake filter causing continuous compressor overwork.",
    "recommended_actions": [
      "Reduce unloaded idle running hours via automatic pressure cutoff calibration",
      "Inspect delivery manifold and pneumatic lines for compressed-air leakage",
      "Schedule mechanical bearing lubrication and vibration spectrum analysis"
    ],
    "potential_saving": 1140.0,
    "machine_name": "Air Compressor #02"
  },
  {
    "id": "rec_002",
    "machine_id": "hvac_01",
    "alert_id": "alert_002",
    "problem": "Chiller unit operating continuously at 28 kW during low-load non-production window.",
    "likely_cause": "Manual thermostat override left engaged following weekend maintenance.",
    "recommended_actions": [
      "Re-enable automated temperature setback schedule for non-operational hours",
      "Inspect condenser coil intake for airflow restrictions",
      "Calibrate ambient enthalpy sensors"
    ],
    "potential_saving": 650.0,
    "machine_name": "Factory Central HVAC & Chiller"
  }
]
```

---

### 3.7 What-If Optimization Engine

#### `POST /api/optimization/simulate`
Simulates shifting production batches to off-peak tariff periods.

- **Request Body**:
```json
{
  "scenario_name": "Move Batch B to Off-Peak",
  "batch_id": "B-102",
  "new_start_time": "22:00"
}
```
- **Response (`200 OK`)**:
```json
{
  "scenario_name": "Move Batch B to Off-Peak",
  "current": {
    "energy_kwh": 12400.0,
    "cost": 118000.0,
    "co2_tonnes": 10.1,
    "production_units": 2200.0
  },
  "optimized": {
    "energy_kwh": 10950.0,
    "cost": 97600.0,
    "co2_tonnes": 8.9,
    "production_units": 2200.0
  },
  "energy_reduction_percent": 11.69,
  "co2_reduction_percent": 11.88
}
```

#### `POST /api/optimization/approve`
Approves the simulated scenario.
- **Request Body**:
```json
{
  "scenario_id": "scenario_001"
}
```
- **Response (`200 OK`)**:
```json
{
  "status": "APPROVED",
  "message": "Optimization approved — simulated control instructions generated."
}
```

---

### 3.8 AI Energy Copilot

#### `POST /api/copilot`
Natural language assistant grounded in PostgreSQL factory telemetry, active alerts, and recommendations.

- **Request Body**:
```json
{
  "message": "Why did electricity consumption increase yesterday?"
}
```
- **Response (`200 OK`)**:
```json
{
  "answer": "Factory electricity consumption increased by +141.2 kWh (+1.61%) over the last 24-hour cycle, rising from 8,776.1 kWh to 8,917.2 kWh. The primary driver of the surge was Air Compressor #02 (+141.2 kWh, +37.3%), caused by continuous cycling and suspected pneumatic line leakage. Across active anomalies, 128.0 kWh of avoidable energy waste (estimated cost: INR 1,970/day) was detected, led by Compressor (57.8%) and HVAC (32.8%).",
  "contributors": [
    {
      "machine": "Compressor",
      "contribution_percent": 57.8
    },
    {
      "machine": "HVAC",
      "contribution_percent": 32.8
    },
    {
      "machine": "Motor",
      "contribution_percent": 9.4
    }
  ],
  "recommendations": [
    "Reduce unloaded idle running hours via automatic pressure cutoff calibration",
    "Inspect delivery manifold and pneumatic lines for compressed-air leakage",
    "Schedule mechanical bearing lubrication and vibration spectrum analysis"
  ]
}
```

---

### 3.9 Machine Learning Adapter

#### `GET /api/ml/predictions`
Returns real-time ML anomaly and health assessments across all 9 factory machines.

- **Response (`200 OK`)**:
```json
[
  {
    "machine_id": "compressor_02",
    "status": "ANOMALY",
    "anomaly_score": 0.87,
    "health_score": 82,
    "risk": "MEDIUM",
    "possible_issue": "Bearing degradation",
    "expected_energy": 15.2,
    "energy_deviation_percent": 31.0,
    "estimated_waste_kwh": 74.0,
    "estimated_cost": 1140.0,
    "recommended_actions": [
      "Reduce unloaded idle running hours via automatic pressure cutoff calibration",
      "Inspect delivery manifold and pneumatic lines for compressed-air leakage",
      "Schedule mechanical bearing lubrication and vibration spectrum analysis"
    ]
  },
  {
    "machine_id": "hvac_01",
    "status": "WARNING",
    "anomaly_score": 0.45,
    "health_score": 88,
    "risk": "LOW",
    "possible_issue": "High idle operation / schedule override",
    "expected_energy": 28.0,
    "energy_deviation_percent": 14.3,
    "estimated_waste_kwh": 42.0,
    "estimated_cost": 650.0
  },
  {
    "machine_id": "furnace_01",
    "status": "NORMAL",
    "anomaly_score": 0.08,
    "health_score": 96,
    "risk": "LOW",
    "possible_issue": null
  }
]
```

---

### 3.10 Telemetry Ingestion (REST Gateway)

#### `POST /api/telemetry/ingest`
Allows an edge sensor or simulator to ingest a reading directly via HTTP.

- **Request Body**:
```json
{
  "machine_id": "compressor_02",
  "timestamp": "2026-09-25T14:32:10Z",
  "power_kw": 18.2,
  "voltage": 230.0,
  "current": 79.1,
  "temperature": 72.4,
  "vibration": 4.8,
  "runtime_hours": 6.2,
  "production_units": 420.0
}
```
- **Response (`200 OK`)**:
```json
{
  "success": true,
  "reading_id": 433,
  "machine_id": "compressor_02",
  "timestamp": "2026-09-25T14:32:10Z",
  "power_kw": 18.2,
  "message": "Persisted new sensor reading for machine compressor_02.",
  "anomaly_detected": true
}
```

---

## 4. UI Design & Component State Guidance

### 4.1 Status & Severity Color Conventions

| Entity | Status / Severity Value | Recommended Badge Color | Meaning |
|---|---|---|---|
| **Machine** | `NORMAL` | Green (`#10B981`) | Operating within nominal thermal & electrical envelope |
| **Machine** | `WARNING` | Amber (`#F59E0B`) | Moderate threshold breach / high idle run |
| **Machine** | `ANOMALY` | Red (`#EF4444`) | Severe anomaly / bearing degradation / air leak |
| **Alert** | `ACTIVE` | Red or Amber | Action required; currently generating avoidable waste |
| **Alert** | `ACKNOWLEDGED` | Blue (`#3B82F6`) | Maintenance team has acknowledged the event |
| **Alert** | `RESOLVED` | Gray (`#6B7280`) | Normal baseline restored |
| **Risk Level** | `HIGH` / `CRITICAL`| Red | Urgent maintenance required |
| **Risk Level** | `MEDIUM` | Amber | Schedule service within shift |
| **Risk Level** | `LOW` | Green | Normal scheduled maintenance |

### 4.2 Handling Component States

1. **Loading State**:
   Render skeleton card / pulsing wireframe loaders while `fetch()` is in progress. Do not show blank cards.
2. **Error State**:
   Catch HTTP `4xx` and `5xx` errors and display a toast banner with a **"Retry"** button. The backend returns standard structured error JSON:
   ```json
   {
     "detail": "Machine 'compressor_99' not found."
   }
   ```
3. **Empty State**:
   If `/api/alerts` returns an empty list `[]`, display: *"All machinery operating within nominal parameters. Zero active alerts."*
4. **Read-Only vs State-Changing Operations**:
   - `GET` endpoints are read-only and safe to poll every 5–15 seconds.
   - `POST /api/optimization/approve` changes scenario state to `APPROVED` in PostgreSQL. Disable the approve button after clicking and show a green confirmation checkmark.
   - `POST /api/copilot` and `POST /api/optimization/simulate` are on-demand calculations. Show a spinner while the model or optimizer calculates the response.

---

## 5. Live Demonstration Storyline

When demonstrating VOLTIS to judges or stakeholders:

```text
1. Header KPIs (`GET /api/factory/overview`):
   Show 8,917.2 kWh consumed today, ₹72,452 cost, 4.05 EPI.

2. Digital Twin Grid (`GET /api/machines`):
   Point out Compressor #02 glowing RED (ANOMALY, 22.1 kW, 4.8 mm/s vibration).
   Point out HVAC glowing AMBER (WARNING, high idle operation).

3. Alert Drawer (`GET /api/alerts`):
   Highlight alert_001: 74 kWh avoidable waste, ₹1,140/day loss.

4. Actionable Recommendations (`GET /api/recommendations`):
   Show rec_001: Inspect air manifold for pneumatic leakage, lubricate bearings.

5. AI Copilot (`POST /api/copilot`):
   Ask: "Why did electricity consumption increase yesterday?"
   Copilot explains: Compressor #02 surged by +37.3%, driving 57.8% of active plant waste.

6. What-If Optimization (`POST /api/optimization/simulate`):
   Simulate moving Batch B to off-peak (22:00):
   Demonstrate 11.69% energy reduction, 11.88% CO2 cut, ₹20,400 cost savings, 0% production loss.
   Click "Approve" (`POST /api/optimization/approve`) to record simulated schedule approval!
```

---

## 6. Safety & Boundary Constraints

- **No Remote Physical Control**: Optimization approval and recommendations generate **simulated** instructions. No actuator, PLC, or inverter commands are sent over the network.
- **Deterministic Math**: Financial savings, CO2 tonnage, and percentage reductions are computed deterministically in Python/PostgreSQL. The LLM is used strictly for natural language synthesis and explanations.
- **Pluggable ML Boundary**: The ML layer exposes clean, typed predictions. When the dedicated ML model is ready, it swaps into the existing `BaseMLAdapter` interface without modifying the REST API layer.
