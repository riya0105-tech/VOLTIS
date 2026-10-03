# VOLTIS — Antigravity Master Build Prompt

## ROLE

You are the primary coding agent for the VOLTIS hackathon project.

Before writing code, read these three project documents completely:

1. `PRD.md`
2. `architecture.md`
3. `system-design.md`

Treat those documents as the source of truth for product requirements, architecture, API contracts, database design, scope, and implementation constraints.

Also use the supplied VOLTIS dashboard reference image as the visual direction for the frontend.

---

# 1. PROJECT CONTEXT

VOLTIS is an AI-powered Energy Intelligence & Optimization Platform for Indian SMEs/manufacturing factories.

The product helps a factory manager understand:

- current energy consumption,
- machine operating state,
- abnormal energy consumption,
- possible causes,
- financial impact,
- machine-health risk,
- What-If scenarios,
- optimized production/energy plans,
- energy/cost/CO₂ impact,
- and recommendations.

The core product loop is:

**Measure → Explain → Predict → Recommend → Optimise**

The complete conceptual workflow is:

**Sense → Collect → Clean → Understand → Detect → Diagnose → Predict → Simulate → Optimize → Recommend → Act → Measure → Learn**

---

# 2. IMPORTANT TEAM BOUNDARY

This coding task is ONLY for:

## FRONTEND + BACKEND

The developer using this prompt owns:

- React frontend
- TypeScript
- Tailwind CSS
- Recharts
- frontend component architecture
- FastAPI backend
- Python
- Pydantic
- PostgreSQL
- REST APIs
- mock data
- backend/frontend integration
- API contracts for future AI/ML integration

### DO NOT implement the actual AI/ML models.

A separate teammate owns AI/ML.

That teammate will later integrate:

- anomaly detection,
- energy baseline/prediction,
- predictive maintenance,
- machine health/risk,
- additional AI outputs.

Design clean interfaces so the AI/ML implementation can be plugged in later without redesigning the frontend.

### DO NOT wait for hardware.

The electrical team owns:

- sensors,
- ESP32,
- electrical measurements,
- hardware prototype,
- MQTT hardware-side setup.

For now, use mock data with the same logical schema as the eventual hardware data.

Later the data source can change from:

`Mock Data → FastAPI`

to:

`ESP32 → MQTT → FastAPI`

without requiring a rewrite of the React UI.

---

# 3. FIRST ACTION — INSPECT BEFORE CODING

Before creating files:

1. Inspect the existing repository.
2. Identify whether a frontend/backend project already exists.
3. Do not delete existing useful files.
4. Reuse existing setup where reasonable.
5. Check installed dependencies.
6. Read the three project specification files.
7. Build an implementation plan.
8. Then implement incrementally.

Do not blindly regenerate the entire repository.

---

# 4. PRIMARY MVP

Build a polished, working VOLTIS Factory Command Centre.

The most important screen is the Dashboard.

It must visually communicate:

- Today's Energy
- Cost Today
- Energy Intensity
- CO₂ Emissions
- Production Output
- Live Factory — Energy Digital Twin
- AI Insights & Alerts
- Energy Consumption Trend
- Production Scheduling — What If?
- Factory Impact
- VOLTIS AI Copilot

The final product should feel like:

**Industrial Control Centre + Premium AI SaaS**

It must NOT look like:

- a generic admin dashboard,
- a generic Bootstrap dashboard,
- a simple CRUD application,
- or a basic AI-generated template.

---

# 5. VISUAL REFERENCE

Use the supplied VOLTIS dashboard reference image as the visual target.

The reference has:

- very dark navy/black background,
- premium dark cards,
- subtle borders,
- rounded panels,
- green as the main positive/energy accent,
- cyan/blue for data visualization,
- amber/orange for warnings,
- red for anomalies,
- white primary text,
- muted gray secondary text,
- left navigation,
- KPI cards across the top,
- central factory/digital-twin visualization,
- AI Insights & Alerts on the right,
- AI Copilot on the far right,
- charts and impact cards below.

Do NOT literally copy the image or reproduce it as a static screenshot.

Build real React components and real data-driven UI.

---

# 6. FRONTEND STACK

Use:

- React
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React
- Framer Motion only where useful
- Axios or a clean fetch-based API service

Do not add unnecessary UI frameworks or dependencies.

---

# 7. FRONTEND STRUCTURE

Use a maintainable structure similar to:

```text
frontend/
└── src/
    ├── components/
    │   ├── Sidebar
    │   ├── Header
    │   ├── KPICard
    │   ├── FactoryTwin
    │   ├── MachineCard
    │   ├── AlertPanel
    │   ├── AICopilot
    │   ├── EnergyChart
    │   ├── OptimizationChart
    │   ├── ImpactCard
    │   └── RecommendationCard
    │
    ├── pages/
    │   ├── Dashboard
    │   ├── FactoryView
    │   ├── EnergyAnalytics
    │   ├── AIInsights
    │   ├── Optimization
    │   ├── Maintenance
    │   └── CarbonReport
    │
    ├── services/
    │   └── api.ts
    │
    ├── types/
    ├── data/
    ├── App.tsx
    └── main.tsx
```

Avoid giant files.

Use reusable components.

---

# 8. FRONTEND PAGES

Implement these pages:

## Dashboard

Primary command centre.

## Factory View

Digital Twin / machine overview.

## Energy Analytics

Energy trends and actual-vs-expected data.

## AI Insights

Alerts, anomalies, recommendations and AI explanations.

## Optimization

Current vs optimized plan and What-If simulation.

## Maintenance

Machine health/risk information.

## Carbon Report

Energy and CO₂ impact.

## Settings

A basic polished settings page may be added if time permits.

---

# 9. DASHBOARD LAYOUT

The dashboard should follow this information hierarchy:

```text
┌─────────────────────────────────────────────────────────────┐
│ VOLTIS HEADER                                               │
├──────────┬──────────────────────────────────────────────────┤
│          │ KPI  KPI  KPI  KPI  KPI                         │
│ SIDEBAR  ├───────────────────────┬──────────────────────────┤
│          │                       │ AI INSIGHTS & ALERTS    │
│ Dashboard│ LIVE FACTORY          │                          │
│ Factory  │ ENERGY DIGITAL TWIN   ├──────────────────────────┤
│ Energy   │                       │ AI COPILOT               │
│ AI       │                       │                          │
│ Optimize ├───────────────┬───────┤                          │
│ Maint.   │ ENERGY TREND  │ WHAT-IF                          │
│ Carbon   │               │ OPTIMIZATION                     │
│ Settings │               │                                  │
└──────────┴───────────────┴──────────────────────────────────┘
```

Adapt responsively, but desktop/laptop is the primary hackathon target.

---

# 10. KPI CARDS

Show:

### Today's Energy
Example:
`8,420 kWh`

### Cost Today
Example:
`₹68,430`

### Energy Intensity
Example:
`3.82 kWh/unit`

### CO₂ Emissions
Example:
`4.1 tonnes`

### Production Output
Example:
`2,200 units`

Each card may show a comparison such as:

- vs yesterday
- vs last month

Use semantic indicators.

---

# 11. DIGITAL TWIN

Create a `FactoryTwin` component.

The MVP does NOT require a real 3D industrial simulation.

A polished factory visual can be used as the background while dynamic machine overlays are positioned on top.

Machines should include:

- Transformer
- Compressor
- Furnace
- HVAC
- Motors
- Pumps
- Production Line

Each overlay should show:

- machine name,
- status,
- current power/energy,
- optionally temperature or another key metric.

Statuses:

```text
NORMAL
WARNING
ANOMALY
OFFLINE
```

Use semantic visual states:

- green = normal
- amber = warning
- red = anomaly
- muted = offline

The digital twin must be data-driven, not a static image with fake text embedded inside it.

---

# 12. AI INSIGHTS & ALERTS

Create an `AlertPanel`.

Example alert:

```text
Motor #2
Abnormal Consumption

Consuming 31% more energy than expected.

Possible bearing degradation.

Estimated waste:
₹1,140/day
```

Another:

```text
Compressor
High Idle Time

Running 2.3 hours longer than required.

Estimated saving:
₹18,200/month
```

Normal state:

```text
Furnace
Operating Normally

Efficiency within expected range.
No action required.
```

Buttons can include:

- Investigate
- Optimize
- View details

These actions should navigate to the relevant screen or open the relevant panel.

---

# 13. ENERGY CHART

Use Recharts.

Show:

- Actual
- Expected

Use a clean line/area chart.

Provide a time range control such as:

- Today
- 7 Days
- 30 Days

The backend should provide chart data.

Do not hard-code chart points directly into the UI component.

---

# 14. OPTIMIZATION / WHAT-IF UI

Create a `Production Scheduling — What If?` panel.

Show:

```text
Current Plan
vs
Optimized Plan
```

Compare:

- Energy (kWh)
- Cost (₹)
- CO₂ (kg or tonnes)
- Production output

Example:

```text
Energy
12,400 → 10,950 kWh

Cost
₹1,18,000 → ₹97,600

CO₂
10.1 → 8.9 t

Production
No Change
```

Include a clear:

`Simulate`

button.

Then show:

`Approve Optimization`

after a scenario has been simulated.

Approval is simulated and must NOT control physical machinery.

---

# 15. FACTORY IMPACT

Create a clear impact card.

Show:

- Estimated annual/monthly savings
- Energy avoided
- CO₂ avoided
- Production loss

Example:

```text
₹2.43 Lakh
Estimated annual savings

18,420 kWh
Energy avoided

14.2 t CO₂e
Emissions avoided

0%
Production loss
```

Use data from the backend.

---

# 16. AI COPILOT

Create a polished chat interface.

Example conversation:

User:

> Why did our electricity consumption increase yesterday?

Assistant:

> Electricity consumption increased by 14.7% yesterday.

Then:

```text
Primary contributors:
• Compressor: +8.2%
• Furnace: +4.1%
• HVAC: +2.4%

The compressor operated 2.3 hours longer
than the production schedule required.

Estimated avoidable consumption:
74 kWh (₹620/day)
```

Then:

User:

> What should I do?

Assistant:

```text
Recommended actions:
1. Reduce compressor idle operation
2. Inspect for air leakage
3. Schedule maintenance

Estimated monthly saving:
₹18,200–₹24,600
```

For the first implementation, use a mock backend response.

Later the actual LLM can replace it.

---

# 17. BACKEND STACK

Use:

- Python
- FastAPI
- Pydantic
- PostgreSQL
- Uvicorn

Keep the backend as one clean FastAPI application.

Do NOT build microservices.

---

# 18. BACKEND STRUCTURE

Use:

```text
backend/
└── app/
    ├── main.py
    ├── database.py
    ├── config.py
    ├── models/
    ├── schemas/
    ├── routes/
    ├── services/
    └── seed/
```

Routes should be separated by capability.

---

# 19. DATABASE

Create these core entities:

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

---

# 20. API CONTRACT

Implement these endpoints.

## Factory

```http
GET /api/factory/overview
```

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

```http
GET /api/machines
GET /api/machines/{machine_id}
```

---

## Energy

```http
GET /api/energy/today
GET /api/energy/history
```

History may support:

```text
from
to
machine_id
```

Example chart item:

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

Simulation request:

```json
{
  "scenario_name": "Move Batch B to Off-Peak",
  "batch_id": "B-102",
  "new_start_time": "22:00"
}
```

Return current vs optimized metrics.

Approval must be simulated.

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

Return a structured response containing:

- answer,
- contributors,
- recommendations,
- optional metrics.

---

# 21. MOCK DATA

Implement a mock data/seed layer.

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

Include both:

- normal states,
- warning states,
- anomaly states.

Example:

```json
{
  "machine_id": "compressor_02",
  "power_kw": 21.2,
  "temperature": 72.4,
  "vibration": 4.8,
  "status": "ANOMALY"
}
```

The mock data must be replaceable later by the actual MQTT/hardware pipeline.

---

# 22. AI/ML INTEGRATION CONTRACT

DO NOT implement the actual ML algorithms in this task.

Create a clean adapter/interface.

Expected conceptual input:

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

Expected conceptual output:

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

Additional outputs may include:

```text
expected_energy
energy_deviation_percent
estimated_waste_kwh
estimated_cost
recommended_actions
```

Create a mock implementation now.

Do not couple routes directly to a specific ML library.

---

# 23. MQTT / HARDWARE INTEGRATION

Do not make hardware integration a blocker.

Design the backend so the eventual flow is:

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
 ↓
Analytics / ML
```

For now:

```text
Mock Generator
 ↓
FastAPI
 ↓
PostgreSQL
```

If MQTT infrastructure is not already available, do not spend excessive time setting it up.

---

# 24. REAL-TIME DESIGN

Future:

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

For MVP:

- simulate live updates if useful,
- do not make WebSockets a blocker,
- ensure the component architecture can support live updates later.

---

# 25. DESIGN RULES

The UI must:

- look premium,
- look industrial,
- have strong visual hierarchy,
- avoid clutter,
- use consistent spacing,
- use reusable cards,
- use consistent status indicators,
- use meaningful empty/loading/error states,
- avoid excessive animations.

Do NOT:

- use random gradients everywhere,
- use excessive glassmorphism,
- use giant headings that waste space,
- use generic dashboard templates,
- use placeholder lorem ipsum,
- create fake functionality that cannot be connected later.

---

# 26. RESPONSIVENESS

Primary target:

- desktop
- laptop

Still support:

- tablet

Mobile can be simplified, but the desktop experience has priority because this is a hackathon factory command-centre dashboard.

---

# 27. CODE QUALITY

Follow these rules:

- TypeScript for frontend.
- Type hints in Python.
- Pydantic schemas for API validation.
- Environment variables for secrets/config.
- No API keys in source code.
- No duplicated components.
- No giant monolithic React file.
- No giant monolithic FastAPI file.
- Clear naming.
- Clear separation of routes/services/models/schemas.
- Reusable UI components.
- Keep mock data separate from production-facing logic.

---

# 28. ERROR HANDLING

Backend:

- validate requests,
- return proper HTTP status codes,
- provide structured error responses,
- do not expose raw stack traces.

Frontend:

- loading states,
- empty states,
- API error states,
- safe chart rendering when data is unavailable.

---

# 29. ENVIRONMENT

Backend `.env.example`:

```text
DATABASE_URL=
MQTT_BROKER_URL=
LLM_API_KEY=
CORS_ORIGINS=
```

Frontend `.env.example`:

```text
VITE_API_BASE_URL=
```

Never commit real secrets.

---

# 30. GIT / PROJECT HYGIENE

Do not commit:

```text
.env
node_modules/
__pycache__/
dist/
build/
venv/
```

Maintain a useful README with:

- project overview,
- architecture,
- setup instructions,
- environment variables,
- run commands,
- API summary.

---

# 31. DEVELOPMENT STRATEGY

Implement in this order:

### Phase 1
Inspect repository and specifications.

### Phase 2
Backend foundation.

### Phase 3
Database models and seed data.

### Phase 4
Factory/machine/energy/alert APIs.

### Phase 5
Frontend foundation and design system.

### Phase 6
Main Dashboard.

### Phase 7
Digital Twin.

### Phase 8
Energy Analytics.

### Phase 9
AI Insights / Alerts.

### Phase 10
Maintenance.

### Phase 11
Optimization / What-If.

### Phase 12
Carbon Report.

### Phase 13
AI Copilot.

### Phase 14
Frontend ↔ Backend integration.

### Phase 15
End-to-end testing.

### Phase 16
README and cleanup.

Do not jump to advanced infrastructure before the dashboard and APIs work.

---

# 32. DEFINITION OF DONE

Backend/frontend implementation is complete when:

- FastAPI starts.
- PostgreSQL works.
- Seed/mock data works.
- Factory API works.
- Machine API works.
- Energy API works.
- Alert API works.
- Maintenance API works.
- Optimization simulation works.
- Copilot endpoint works with mock response.
- React dashboard loads.
- KPI cards use backend data.
- Digital Twin uses backend machine data.
- Energy charts use backend data.
- Alerts use backend data.
- Optimization UI uses backend data.
- Copilot calls the backend.
- Loading/error states work.
- No secrets are committed.
- Project is documented.
- AI/ML can later replace the mock adapter without changing the frontend contract.

---

# 33. FINAL DEMO STORY

The implementation should support this demo:

```text
Factory is operating
        ↓
Dashboard shows normal state
        ↓
Compressor data becomes abnormal
        ↓
Alert appears
        ↓
Digital Twin changes machine state
        ↓
AI Insight explains the issue
        ↓
Financial impact appears
        ↓
Maintenance risk appears
        ↓
Manager opens What-If
        ↓
Current vs Optimized plan
        ↓
Energy / Cost / CO₂ comparison
        ↓
Production remains unchanged
        ↓
Manager approves simulation
        ↓
Impact/result displayed
```

---

# 34. FINAL INSTRUCTION TO THE CODING AGENT

Build the project as a **real, runnable hackathon MVP**, not as a static mockup.

Prioritize:

1. Working architecture
2. Clean API contracts
3. Real backend/frontend connection
4. Polished VOLTIS visual identity
5. Data-driven Digital Twin
6. Mock data that can later be replaced
7. Clean AI/ML integration boundary
8. Working What-If flow
9. Demo reliability
10. Maintainability

When a feature is not necessary for the MVP, prefer a clean extension point over implementing unnecessary complexity.

Do not invent new product features that conflict with the PRD, architecture, or system-design documents.

When there is ambiguity, prefer the existing project documents and preserve their terminology.

Build incrementally, run/test after major changes, and fix errors before moving to the next phase.
