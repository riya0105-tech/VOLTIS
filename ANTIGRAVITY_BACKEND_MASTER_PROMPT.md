# VOLTIS — Antigravity Backend-Only Master Prompt

## ROLE

You are the backend engineering agent for the VOLTIS hackathon project.

Before writing code, read these files completely:

1. `PRD.md`
2. `architecture.md`
3. `system-design.md`

Treat them as the source of truth.

Your responsibility in this task is **BACKEND ONLY**.

Do NOT build, redesign, or modify the React frontend.

---

# 1. PROJECT

VOLTIS is an AI-powered Energy Intelligence & Optimization Platform for Indian SMEs/manufacturing factories.

The backend must support:

- factory overview
- machine telemetry
- energy analytics
- alerts
- maintenance
- recommendations
- What-If simulation
- optimization
- carbon calculations
- AI Copilot integration point
- future AI/ML integration
- future ESP32/MQTT integration

Core workflow:

**Sense → Collect → Clean → Understand → Detect → Diagnose → Predict → Simulate → Optimize → Recommend → Act → Measure → Learn**

---

# 2. TEAM BOUNDARIES

### Your scope

Build:

- FastAPI backend
- PostgreSQL data layer
- Pydantic schemas
- REST APIs
- business services
- mock/seed data
- optimization simulation endpoint
- carbon calculations
- AI Copilot mock/service interface
- ML adapter/interface
- MQTT-ready ingestion structure
- API documentation
- backend README/setup

### Do NOT build

- React UI
- Tailwind UI
- frontend components
- frontend charts
- frontend pages
- frontend styling
- actual ML models
- hardware firmware
- autonomous physical machine control

A separate teammate owns AI/ML.

The electrical team owns ESP32/sensors/hardware.

A separate frontend agent will consume the APIs you create.

---

# 3. MOST IMPORTANT RULE — API CONTRACT

The frontend will be built independently.

Therefore, the API contracts in `system-design.md` are an integration contract.

DO NOT casually rename endpoints or fields.

Preserve:

- endpoint names
- HTTP methods
- request structure
- response structure
- field meanings

If a change is genuinely necessary, document it clearly before making it.

The frontend must be able to use mock responses with the same schemas before the backend is connected.

---

# 4. TECHNOLOGY

Use:

- Python
- FastAPI
- Pydantic
- SQLAlchemy
- PostgreSQL
- Uvicorn

Keep the architecture simple.

Do NOT introduce:

- microservices
- Kafka
- Kubernetes
- unnecessary queues
- complex distributed systems

For the hackathon MVP, one FastAPI application is sufficient.

---

# 5. BACKEND STRUCTURE

Create/maintain:

```text
backend/
├── app/
│   ├── main.py
│   ├── database.py
│   ├── config.py
│   ├── models/
│   ├── schemas/
│   ├── routes/
│   ├── services/
│   └── seed/
├── requirements.txt
├── .env.example
└── README.md
```

Use separation between:

- models
- schemas
- routes
- services

Do not put all logic in `main.py`.

---

# 6. DATABASE

Implement these core entities from `system-design.md`:

## Factory

```text
id
name
industry
location
production_capacity
electricity_tariff
production_target
operating_hours
created_at
```

## Machine

```text
id
factory_id
name
type
rated_power_kw
status
operating_limit
production_association
created_at
```

## SensorReading

```text
id
machine_id
timestamp
power_kw
voltage
current
temperature
vibration
runtime_hours
production_units
```

## ProductionRecord

```text
id
factory_id
timestamp
line_id
batch_id
units_produced
operating_state
```

## MaintenanceRecord

```text
id
machine_id
maintenance_date
issue
severity
notes
```

## Alert

```text
id
machine_id
timestamp
severity
title
description
estimated_waste_kwh
estimated_cost
status
```

## Recommendation

```text
id
machine_id
alert_id
problem
likely_cause
recommended_actions
potential_saving
created_at
```

## OptimizationScenario

```text
id
name
created_at
current_energy_kwh
optimized_energy_kwh
current_cost
optimized_cost
current_co2
optimized_co2
production_change_percent
status
```

Use appropriate primary keys, foreign keys, timestamps and indexes.

At minimum, index sensor readings by:

- machine_id
- timestamp

---

# 7. SEED / MOCK DATA

Hardware is NOT ready yet.

Create deterministic mock data.

Required machines:

```text
Transformer
Compressor
Furnace
HVAC
Motors
Pumps
Production Line
```

Create both normal and abnormal situations.

Example anomaly:

```json
{
  "machine_id": "compressor_02",
  "power_kw": 21.2,
  "temperature": 72.4,
  "vibration": 4.8,
  "status": "ANOMALY"
}
```

The mock data should support the dashboard scenario described in the PRD.

Keep seed/mock generation separate from business logic.

---

# 8. REQUIRED API ENDPOINTS

## Factory

```http
GET /api/factory/overview
```

Example:

```json
{
  "factory": {
    "id": "factory_001",
    "name": "Shree Textiles Pvt. Ltd."
  },
  "kpis": {
    "energy_today_kwh": 8420,
    "cost_today": 68430,
    "energy_intensity": 3.82,
    "co2_tonnes": 4.1,
    "production_units": 2200
  }
}
```

---

## Machines

```http
GET /api/machines
GET /api/machines/{machine_id}
```

Return current machine state and relevant telemetry.

---

## Energy

```http
GET /api/energy/today
GET /api/energy/history
```

Support:

```text
from
to
machine_id
```

Example item:

```json
{
  "timestamp": "2026-09-25T06:00:00",
  "actual_kwh": 820,
  "expected_kwh": 760
}
```

---

## Alerts

```http
GET /api/alerts
```

Optional filters:

```text
severity
status
machine_id
```

---

## Maintenance

```http
GET /api/maintenance
```

---

## Optimization

```http
POST /api/optimization/simulate
POST /api/optimization/approve
```

Simulation input:

```json
{
  "scenario_name": "Move Batch B to Off-Peak",
  "batch_id": "B-102",
  "new_start_time": "22:00"
}
```

Return current vs optimized:

```text
energy
cost
CO2
production
percentage changes
```

Approval is simulated only.

Do NOT control physical machinery.

---

## AI Copilot

```http
POST /api/copilot
```

Request:

```json
{
  "message": "Why did electricity consumption increase yesterday?"
}
```

Return structured information containing:

- answer
- contributors
- recommendations
- optional metrics

Initially use a deterministic mock service.

Keep it replaceable by a real LLM service later.

---

# 9. CALCULATIONS

## Energy Intensity

```text
Energy Intensity = Energy Consumed / Production Output
```

Example:

```text
10,500 kWh / 1,000 units
= 10.5 kWh/unit
```

## CO2

```text
CO2e = Energy × Configurable Emission Factor
```

Do not hard-code an unverified real-world emission factor as a scientific claim.

Make the emission factor configurable.

## Savings

Use deterministic backend calculations.

Do not ask an LLM to calculate numerical savings.

---

# 10. AI/ML ADAPTER

Do NOT implement actual ML models.

Create an interface/adapter that can later be replaced.

Conceptual input:

```text
machine_id
timestamp
power_kw
voltage
current
temperature
vibration
runtime_hours
production_units
```

Conceptual output:

```json
{
  "machine_id": "compressor_02",
  "status": "ANOMALY",
  "anomaly_score": 0.87,
  "health_score": 82,
  "risk": "MEDIUM",
  "possible_issue": "Bearing degradation"
}
```

Also allow:

```text
expected_energy
energy_deviation_percent
estimated_waste_kwh
estimated_cost
recommended_actions
```

Create a mock implementation now.

The frontend must not know whether the result came from:

```text
MockMLService
```

or:

```text
ActualMLService
```

---

# 11. MQTT-READY DESIGN

The eventual path is:

```text
ESP32
 ↓
MQTT
 ↓
FastAPI
 ↓
Validation
 ↓
PostgreSQL
```

For now, use mock data.

If MQTT is not already available, do not make it a blocker.

Create a clean ingestion boundary so an MQTT adapter can be added later.

---

# 12. VALIDATION

Use Pydantic.

Validate:

- required fields
- numeric ranges where appropriate
- timestamps
- machine IDs
- request bodies

Do not silently accept malformed data.

---

# 13. ERROR HANDLING

Use proper HTTP status codes.

Return structured errors.

Do not expose raw stack traces.

Examples:

```text
404 — machine not found
400/422 — invalid request
500 — unexpected server error
```

---

# 14. CORS

Configure CORS using environment variables.

Example:

```text
CORS_ORIGINS=http://localhost:5173
```

Do not hard-code production secrets.

---

# 15. ENVIRONMENT

Create:

```text
.env.example
```

with:

```text
DATABASE_URL=
MQTT_BROKER_URL=
LLM_API_KEY=
CORS_ORIGINS=
```

Do not commit `.env`.

---

# 16. TESTING

At minimum verify:

- FastAPI starts
- database connection works
- seed data loads
- factory overview works
- machine APIs work
- energy APIs work
- alerts API works
- maintenance API works
- optimization simulation works
- optimization approval works
- copilot endpoint works
- invalid requests return useful errors

Use FastAPI/OpenAPI docs to inspect endpoints.

If practical, add a small set of API tests.

---

# 17. OPENAPI / FRONTEND HANDOFF

The backend must expose clean OpenAPI documentation.

After implementation, produce a concise API handoff summary containing:

```text
Endpoint
Method
Request
Response
Notes
```

This handoff will be used by the frontend agent.

---

# 18. IMPLEMENTATION ORDER

Do not attempt everything blindly in one huge operation.

Implement in phases:

### Phase 1
Backend project setup.

### Phase 2
Database configuration and models.

### Phase 3
Seed/mock data.

### Phase 4
Factory and machine APIs.

### Phase 5
Energy and alert APIs.

### Phase 6
Maintenance and recommendation APIs.

### Phase 7
Optimization simulation.

### Phase 8
Copilot mock service.

### Phase 9
ML adapter.

### Phase 10
MQTT-ready ingestion boundary.

### Phase 11
Testing and API verification.

### Phase 12
README and frontend handoff.

After each major phase, run the backend and fix errors before continuing.

---

# 19. DEFINITION OF DONE

Backend is complete when:

- FastAPI starts successfully.
- PostgreSQL connection works.
- Seed data works.
- All required API endpoints exist.
- API response shapes match `system-design.md`.
- Mock data is deterministic and realistic enough for the demo.
- Optimization simulation works.
- Copilot endpoint works.
- ML adapter exists.
- MQTT integration boundary exists without blocking the MVP.
- Errors are handled.
- `.env` is protected.
- OpenAPI docs work.
- README explains setup.
- Frontend developer can integrate without guessing endpoint contracts.

---

# 20. FINAL RULE

Do NOT build the frontend.

Do NOT create React files.

Do NOT change the visual design.

Do NOT redesign API contracts because of frontend preferences.

Build a stable backend that another frontend agent can consume.

Before making major architectural changes, explain the change and why it is necessary.

When complete, provide a concise summary of:

- files created/changed
- APIs available
- database setup
- how to run
- test results
- frontend integration notes
