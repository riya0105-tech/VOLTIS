# VOLTIS — Product Requirements Document (PRD)

**Version:** 1.0  
**Purpose:** Hackathon MVP specification  
**Primary implementation scope:** Backend + Frontend/UI  
**AI/ML:** Separate team member; final integration happens after the backend/UI layer is ready  
**Hardware:** Separate electrical team

---

## 1. Product Overview

VOLTIS is an AI-powered Energy Intelligence & Optimization Platform for Indian SMEs/manufacturing factories.

Its purpose is not only to show how much energy a factory consumes, but to help the factory understand:

- where energy is being consumed,
- where consumption is abnormal,
- why the abnormality may be happening,
- what it may cost,
- what could happen if the production schedule/process changes,
- and how to optimize energy use while maintaining production output.

The core product loop is:

**Measure → Explain → Predict → Recommend → Optimise**

The broader end-to-end workflow is:

**Sense → Collect → Clean → Understand → Detect → Diagnose → Predict → Simulate → Optimize → Recommend → Act → Measure → Learn**

---

## 2. Problem

Factories, especially SMEs, may have energy data from sensors, PLCs, existing production records and electricity/billing data, but raw measurements alone do not tell a manager:

- which machine is responsible for unusual consumption,
- whether high consumption is actually abnormal for the current production load,
- what the financial impact is,
- whether the issue may indicate machine-health degradation,
- or what schedule/process change could reduce energy use without reducing production.

VOLTIS converts factory telemetry and production context into actionable intelligence.

---

## 3. Primary User

### Factory Manager / Plant Manager

The manager needs a single command centre where they can:

1. See current factory energy and production KPIs.
2. Understand machine status.
3. Identify energy anomalies.
4. Review AI-generated insights and alerts.
5. Inspect maintenance-related risks.
6. Run a What-If scenario.
7. Compare current and optimized plans.
8. Review cost, energy and CO₂ impact.
9. Approve a proposed optimization.
10. View the measured result.

---

## 4. Product Goals

### MVP Goals

- Provide a polished industrial command-centre dashboard.
- Represent the factory digitally through an Energy Digital Twin view.
- Show energy, cost, energy intensity, CO₂ and production KPIs.
- Show machine operating states.
- Show energy trends and actual-vs-expected information.
- Show AI insights/alerts using a defined backend contract.
- Provide a What-If/optimization experience.
- Provide factory-level impact metrics.
- Provide an AI Copilot interface.
- Keep the backend ready for ESP32/MQTT sensor data.
- Keep the backend ready for the separate AI/ML module.

### Non-Goals for the first MVP

Do not overbuild:

- Kubernetes
- Kafka
- Microservices
- Custom LLM training
- Full industrial protocol implementation
- A universal predictive-maintenance system for every machine
- Autonomous control of real industrial equipment
- A production-grade industrial safety/control system

For the hackathon prototype, ESP32 + MQTT + FastAPI is sufficient for the demonstrated IoT path.

---

## 5. Core Product Modules

### 5.1 Factory Command Centre / Dashboard

The dashboard is the primary screen.

Required information:

- Today's Energy
- Cost Today
- Energy Intensity
- CO₂ Emissions
- Production Output
- Live Factory / Energy Digital Twin
- AI Insights & Alerts
- Energy Consumption Trend
- Production Scheduling — What If?
- Factory Impact
- VOLTIS AI Copilot

---

### 5.2 Factory View / Energy Digital Twin

The digital twin is a live digital representation of the factory's machines, operating states and energy-related data.

The UI should visually represent machines such as:

- Transformer
- Compressor
- Furnace
- HVAC
- Motors
- Pumps
- Production Line

Each machine can show:

- machine name,
- current power/energy value,
- status,
- alert state where applicable.

The digital twin does not need to be a full 3D industrial simulation for the MVP. The objective is to make the current factory state understandable through the command-centre UI.

---

### 5.3 Energy Analytics

The system should support:

- current energy consumption,
- historical energy consumption,
- actual vs expected energy,
- energy intensity,
- energy deviation,
- cost impact.

Energy intensity is:

**EPI = Energy Consumed / Production Output**

Example from the workflow:

- Yesterday: 10,500 kWh / 1,000 units = 10.5 kWh/unit
- Today: 11,800 kWh / 1,020 units = 11.57 kWh/unit

---

### 5.4 AI Insights & Alerts

The UI should display actionable alerts rather than only raw measurements.

Example:

**Motor #2 — Abnormal Consumption**
- Consuming 31% more energy than expected.
- Possible bearing degradation.
- Estimated waste: ₹1,140/day.

Example:

**Compressor — High Idle Time**
- Running 2.3 hours longer than required.
- Estimated saving: ₹18,200/month.

Alerts should have a severity/status such as:

- NORMAL
- WARNING
- ANOMALY / CRITICAL

The exact ML logic is owned by the AI/ML team; the frontend/backend must consume a stable result contract.

---

### 5.5 Predictive Maintenance

The MVP can focus on one machine category such as motors or compressors.

Expected information:

- Machine health score
- Risk level
- Possible issue
- Recommended maintenance action

If training data is synthetic/representative, results must be presented as prototype predictions, not validated industrial failure predictions.

---

### 5.6 What-If Simulation

The manager should be able to ask a scenario such as:

> What if I move an energy-intensive batch to off-peak hours?

The simulation should compare:

- energy consumption,
- electricity cost,
- peak demand where available,
- production output,
- CO₂ emissions,
- machine utilization.

The simulation must not directly change real industrial equipment.

---

### 5.7 Optimization

The optimization layer should compare:

**Current Plan vs Optimized Plan**

Subject to constraints such as:

- production target,
- machine capacity,
- machine availability,
- maintenance constraints.

The project proposes Google OR-Tools for production scheduling/optimization.

For the hackathon prototype, optimization approval should lead to a simulated/authorized control instruction rather than autonomous physical machine control.

---

### 5.8 Carbon Impact

CO₂ calculation:

**CO₂e = Energy × Emission Factor**

The emission factor should be configurable.

Dashboard comparison should include:

- current CO₂,
- optimized CO₂,
- CO₂ avoided/reduction.

---

### 5.9 AI Copilot

The AI Copilot is a conversational interface for factory questions.

Example:

> Why did our electricity consumption increase yesterday?

The backend should retrieve relevant factory data and provide it to the LLM layer.

The LLM is responsible primarily for:

- explanation,
- root-cause narrative,
- recommendations,
- natural-language queries,
- report generation.

Numerical calculations should remain in backend/Python logic rather than being delegated to the LLM.

---

## 6. Data Sources

The system is designed to support multiple sources:

- Sensors
- ESP32
- PLC data
- Existing data
- CSV/API
- Electricity bills
- Production records

For the actual hackathon prototype:

**ESP32 → MQTT → FastAPI**

is sufficient for the live IoT path.

For development before hardware is ready, the backend/frontend will use mock sensor data with the same schema as the eventual sensor payload.

---

## 7. Key Sensor/Factory Data

A sensor reading may contain:

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

The exact electrical sensor payload will be finalized with the hardware team.

---

## 8. Frontend Requirements

The visual target is a premium dark industrial command-centre dashboard.

The supplied reference design establishes:

- dark navy/black background,
- glass/dark cards,
- green energy indicators,
- blue/cyan visualizations,
- orange/yellow warnings,
- red anomaly states,
- rounded panels,
- dense but readable information hierarchy,
- left navigation,
- central digital twin,
- right-side AI insights,
- right-side AI Copilot,
- charts and impact cards.

The UI should be responsive and usable on desktop/laptop screens.

---

## 9. Required Frontend Pages

1. Dashboard
2. Factory View
3. Energy Analytics
4. AI Insights
5. Optimization
6. Maintenance
7. Carbon Report
8. Settings (basic MVP screen if time permits)

---

## 10. Backend Requirements

Backend technology:

- Python
- FastAPI
- Pydantic
- PostgreSQL
- Uvicorn

Backend responsibilities:

- data ingestion,
- validation,
- database access,
- factory/machine APIs,
- energy APIs,
- alert APIs,
- maintenance APIs,
- optimization APIs,
- carbon calculations,
- AI/ML integration points,
- AI Copilot API,
- future MQTT integration.

---

## 11. AI/ML Integration Boundary

The AI/ML module is developed independently.

The backend must provide a clean interface so the ML implementation can be integrated later without redesigning the frontend.

Conceptual flow:

**Factory Data → Backend → ML Service/Module → Structured Prediction → Backend → Frontend**

Example ML response:

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

This is an integration contract for the hackathon and not a claim that these exact model outputs are already available.

---

## 12. Success Criteria

The MVP is successful if a judge can understand the following story without reading the code:

1. Factory is operating normally.
2. Machine/sensor data enters VOLTIS.
3. VOLTIS identifies an abnormal condition.
4. Dashboard explains the issue.
5. Financial impact is shown.
6. Maintenance risk/recommendation is shown.
7. Manager runs a What-If scenario.
8. Current and optimized plans are compared.
9. Energy/cost/CO₂ impact is shown.
10. Production remains unchanged in the demonstrated scenario.
11. Manager approves the simulated optimization.
12. Result is measured and shown.

---

## 13. Hackathon Demo Narrative

The recommended 5–7 minute demo flow is:

1. Factory starts normally.
2. Inject abnormal compressor data.
3. VOLTIS detects the anomaly.
4. AI explains why.
5. Financial impact is calculated.
6. Predictive-maintenance result appears.
7. Manager opens What-If.
8. Optimization compares current and optimized plans.
9. Manager approves.
10. Result shows energy/cost/CO₂ improvement with no production loss.
11. VOLTIS updates the baseline/learning loop.

