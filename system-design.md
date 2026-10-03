# VOLTIS — System Design Document

**Version:** 1.0  
**Purpose:** Implementation contract for the hackathon MVP  
**Primary scope:** Backend + Frontend/UI  
**Integration:** AI/ML and hardware are developed independently

---

# 1. Design Objectives

The implementation must:

1. Work with mock data before hardware is ready.
2. Expose stable APIs to the React frontend.
3. Keep AI/ML integration independent.
4. Keep the database structured around factory, machine, sensor and production data.
5. Support the Energy Digital Twin UI.
6. Support What-If/optimization flows.
7. Avoid unnecessary infrastructure.
8. Be easy for an AI coding agent to understand and modify.

---

# 2. Repository Structure

```text
VOLTIS/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── config.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routes/
│   │   ├── services/
│   │   └── seed/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── data/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── .env.example
│
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   └── system-design.md
│
├── README.md
└── .gitignore
```

---

# 3. Database Design

## 3.1 factories

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

---

## 3.2 machines

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

Suggested statuses:

```text
NORMAL
WARNING
ANOMALY
OFFLINE
```

---

## 3.3 sensor_readings

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

Indexes should prioritize:

- machine_id
- timestamp

---

## 3.4 production_records

```text
id
factory_id
timestamp
line_id
batch_id
units_produced
operating_state
```

---

## 3.5 maintenance_records

```text
id
machine_id
maintenance_date
issue
severity
notes
```

---

## 3.6 alerts

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

Suggested statuses:

```text
ACTIVE
ACKNOWLEDGED
RESOLVED
```

---

## 3.7 recommendations

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

---

## 3.8 optimization_scenarios

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

---

# 4. Pydantic Schemas

## SensorReadingCreate

```json
{
  "machine_id": "compressor_02",
  "timestamp": "2026-09-25T14:32:10",
  "power_kw": 18.2,
  "voltage": 230,
  "current": 79.1,
  "temperature": 72.4,
  "vibration": 4.8,
  "runtime_hours": 6.2,
  "production_units": 420
}
```

---

## MachineStatusResponse

```json
{
  "machine_id": "compressor_02",
  "name": "Compressor #02",
  "status": "WARNING",
  "power_kw": 18.2,
  "temperature": 72.4,
  "vibration": 4.8
}
```

---

## AlertResponse

```json
{
  "id": "alert_001",
  "machine_id": "compressor_02",
  "severity": "HIGH",
  "title": "High Energy Consumption",
  "description": "Consumption is above the expected baseline.",
  "estimated_waste_kwh": 74,
  "estimated_cost": 1110,
  "status": "ACTIVE"
}
```

---

## ML Prediction Response Contract

The following is the integration contract, not a claim about the final trained model:

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

---

# 5. REST API Contract

## Factory

### GET `/api/factory/overview`

Purpose:

Return the data required for the main dashboard.

Example response:

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

### GET `/api/machines`

Returns all machines and current status.

### GET `/api/machines/{machine_id}`

Returns machine details and current telemetry.

---

## Energy

### GET `/api/energy/today`

Returns today's energy time series.

### GET `/api/energy/history`

Query parameters can include:

```text
from
to
machine_id
```

Response should support charting:

```json
[
  {
    "timestamp": "2026-09-25T06:00:00",
    "actual_kwh": 820,
    "expected_kwh": 760
  }
]
```

---

## Alerts

### GET `/api/alerts`

Optional query parameters:

```text
severity
status
machine_id
```

---

## Maintenance

### GET `/api/maintenance`

Returns maintenance records and machine-health information available to the backend.

---

## Optimization

### POST `/api/optimization/simulate`

Example request:

```json
{
  "scenario_name": "Move Batch B to Off-Peak",
  "batch_id": "B-102",
  "new_start_time": "22:00"
}
```

Example response:

```json
{
  "scenario_name": "Move Batch B to Off-Peak",
  "current": {
    "energy_kwh": 12400,
    "cost": 118000,
    "co2_tonnes": 10.1,
    "production_units": 2200
  },
  "optimized": {
    "energy_kwh": 10950,
    "cost": 97600,
    "co2_tonnes": 8.9,
    "production_units": 2200
  },
  "energy_reduction_percent": 11.69,
  "co2_reduction_percent": 11.88
}
```

---

### POST `/api/optimization/approve`

This is a simulated approval for the hackathon.

Request:

```json
{
  "scenario_id": "scenario_001"
}
```

Response:

```json
{
  "status": "APPROVED",
  "message": "Optimization approved — simulated control instructions generated."
}
```

---

## AI Copilot

### POST `/api/copilot`

Request:

```json
{
  "message": "Why did electricity consumption increase yesterday?"
}
```

Response:

```json
{
  "answer": "Electricity consumption increased by 14.7% yesterday.",
  "contributors": [
    {
      "machine": "Compressor",
      "contribution_percent": 8.2
    },
    {
      "machine": "Furnace",
      "contribution_percent": 4.1
    },
    {
      "machine": "HVAC",
      "contribution_percent": 2.4
    }
  ],
  "recommendations": [
    "Reduce compressor idle operation",
    "Inspect for air leakage",
    "Schedule maintenance"
  ]
}
```

The actual LLM integration can be added later.

---

# 6. Mock Data Layer

Until hardware is available, create a deterministic mock-data service.

Required machines for the dashboard:

```text
Transformer
Compressor
Furnace
HVAC
Motors
Pumps
Production Line
```

Mock data should contain both normal and abnormal states.

Example normal:

```json
{
  "machine_id": "compressor_02",
  "power_kw": 15.2,
  "temperature": 60,
  "vibration": 2.0,
  "status": "NORMAL"
}
```

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

This allows the UI to be developed before the electrical team finishes the ESP32/sensor pipeline.

---

# 7. Backend Services

Recommended services:

```text
energy_service.py
machine_service.py
alert_service.py
maintenance_service.py
optimization_service.py
carbon_service.py
copilot_service.py
ml_service.py
```

The ML service should initially use a mock adapter.

Later:

```text
MockMLService
       ↓
ActualMLService
```

without changing the route contract.

---

# 8. Frontend Pages

## Dashboard

Components:

```text
Header
Sidebar
KPICard × 5
FactoryTwin
AIInsightsPanel
AICopilot
EnergyTrendChart
OptimizationChart
FactoryImpactCard
```

---

## Factory View

Show:

- factory representation,
- machine locations,
- machine status,
- current power,
- alerts.

---

## Energy Analytics

Show:

- actual vs expected,
- daily/weekly/monthly trends,
- energy intensity,
- machine-wise consumption.

---

## AI Insights

Show:

- active anomalies,
- severity,
- estimated waste,
- estimated cost,
- likely cause,
- recommended action.

---

## Optimization

Show:

```text
CURRENT PLAN
vs
OPTIMIZED PLAN
```

with:

- Energy
- Cost
- CO₂
- Production
- Savings

---

## Maintenance

Show:

- machine health score,
- risk,
- possible issue,
- maintenance recommendation.

---

## Carbon Report

Show:

- current energy,
- current CO₂,
- optimized energy,
- optimized CO₂,
- avoided CO₂.

---

## AI Copilot

Chat UI:

```text
User message
     ↓
POST /api/copilot
     ↓
Backend
     ↓
LLM / mock response
     ↓
Chat response
```

---

# 9. UI Design System

## Visual direction

Use the supplied VOLTIS dashboard reference as the visual target.

### Background

Very dark navy/near-black.

### Cards

Dark blue/gray cards with subtle borders and rounded corners.

### Semantic colors

- Green = normal / savings / positive
- Blue/cyan = data / analytics
- Amber/orange = warning
- Red = anomaly/critical
- White = primary text
- Muted gray = secondary text

Do not use excessive gradients or decorative animation.

The interface should feel like:

**Industrial Control Centre + Premium AI SaaS**

---

# 10. Digital Twin Component

Component name:

```text
FactoryTwin
```

Input:

```typescript
type MachineTwin = {
  id: string;
  name: string;
  type: string;
  powerKw: number;
  status: "NORMAL" | "WARNING" | "ANOMALY" | "OFFLINE";
};
```

Output:

A visual factory representation with machine overlays.

For the hackathon MVP, the factory background can be a static visual asset while the machine overlays are dynamic.

---

# 11. State Management

Keep state simple for the MVP.

Recommended approach:

- React state for local UI state.
- API service layer for backend calls.
- Avoid introducing Redux unless the generated application actually needs it.

Core frontend API functions:

```text
getFactoryOverview()
getMachines()
getMachine(id)
getEnergyToday()
getEnergyHistory()
getAlerts()
getMaintenance()
simulateOptimization()
approveOptimization()
sendCopilotMessage()
```

---

# 12. Real-Time Update Design

Future/live flow:

```text
ESP32
 ↓
MQTT
 ↓
FastAPI
 ↓
WebSocket
 ↓
React
```

For the first UI implementation, simulate live changes with mock data.

Do not make WebSockets a blocker for the initial dashboard.

---

# 13. Error Handling

Backend:

- Validate all request bodies.
- Return appropriate HTTP status codes.
- Never expose raw stack traces to the frontend.

Frontend:

- Show loading states.
- Show empty states.
- Show API error states.
- Do not render broken charts when data is missing.

---

# 14. Configuration

Use environment variables.

Backend:

```text
DATABASE_URL
MQTT_BROKER_URL
LLM_API_KEY
CORS_ORIGINS
```

Frontend:

```text
VITE_API_BASE_URL
```

Never commit API keys.

Provide `.env.example`.

---

# 15. Integration Contract With AI/ML Teammate

The AI/ML teammate should provide a module/service with a stable interface.

Minimum conceptual input:

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

Minimum conceptual output:

```text
machine_id
status
anomaly_score
health_score
risk
possible_issue
```

Additional outputs can include:

```text
expected_energy
energy_deviation_percent
estimated_waste_kwh
estimated_cost
recommended_actions
```

The backend should consume these outputs without depending on the ML model's internal implementation.

---

# 16. Git Workflow

Recommended branches:

```text
main
develop
```

Optional:

```text
feature/backend
feature/frontend
```

Suggested commits:

```text
chore: initialize VOLTIS repository
feat: setup FastAPI backend
feat: add PostgreSQL models
feat: add factory APIs
feat: add machine APIs
feat: add energy APIs
feat: add mock sensor data
feat: initialize React dashboard
feat: add VOLTIS design system
feat: add digital twin
feat: add energy analytics
feat: add alerts panel
feat: add optimization UI
feat: add AI copilot UI
feat: connect frontend to backend
```

---

# 17. Implementation Order

### Sprint 1 — Foundation

1. Repository
2. Backend setup
3. Frontend setup
4. Database connection
5. Environment configuration

### Sprint 2 — Core Data

6. Factory model
7. Machine model
8. Sensor reading model
9. Production model
10. Mock data

### Sprint 3 — APIs

11. Factory overview
12. Machines
13. Energy
14. Alerts
15. Maintenance

### Sprint 4 — Main UI

16. Dashboard layout
17. Sidebar/header
18. KPI cards
19. Digital Twin
20. Machine status
21. Energy chart
22. Alerts panel

### Sprint 5 — Intelligence UI

23. AI Insights
24. Maintenance
25. Optimization
26. Factory Impact
27. AI Copilot

### Sprint 6 — Integration

28. Connect React to FastAPI
29. Replace mock API responses where possible
30. Add AI/ML adapter
31. Add MQTT adapter
32. Test end-to-end demo

---

# 18. Definition of Done

The frontend/backend portion is considered complete when:

- FastAPI starts successfully.
- PostgreSQL connection works.
- Factory and machine data can be retrieved.
- Mock sensor readings are available.
- Dashboard loads without hardcoded UI-only data.
- KPI cards receive backend data.
- Digital Twin receives machine data.
- Alerts receive backend data.
- Energy charts receive backend data.
- Optimization screen can display current vs optimized data.
- AI Copilot UI can call its endpoint.
- Error/loading states work.
- `.env` secrets are excluded from Git.
- The project can be cloned and started using documented setup instructions.

---

# 19. Explicit Constraints for the Coding Agent

The coding agent MUST:

- Prefer simple, maintainable architecture.
- Keep backend and frontend clearly separated.
- Reuse components.
- Avoid giant files.
- Avoid unnecessary dependencies.
- Avoid microservices.
- Avoid Kubernetes.
- Avoid Kafka.
- Avoid building a custom LLM.
- Avoid implementing every industrial protocol.
- Keep mock data replaceable.
- Keep AI/ML integration modular.
- Keep numerical calculations deterministic.
- Never allow the LLM to directly control physical industrial equipment.
- Never hard-code secrets.
- Preserve the API contracts in this document.
- Prioritize a polished working MVP over speculative features.

The coding agent SHOULD:

- build incrementally,
- run the application after major changes,
- fix build/type/runtime errors,
- maintain a clear README,
- keep the UI visually close to the provided VOLTIS dashboard reference.

---

# 20. Final End-to-End Demo

```text
Mock/Real Factory Data
        ↓
Data Ingestion
        ↓
Validation
        ↓
PostgreSQL
        ↓
Digital Twin + Analytics
        ↓
AI/ML
        ↓
Anomaly / Health / Recommendation
        ↓
What-If Simulation
        ↓
Optimization
        ↓
Current vs Optimized
        ↓
Cost + Energy + CO₂
        ↓
Manager Approval
        ↓
Simulated Action
        ↓
Measure Result
        ↓
Update Baseline
```

This is the implementation target for the hackathon MVP.
