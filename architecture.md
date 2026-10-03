# VOLTIS — System Architecture

**Version:** 1.0  
**Scope:** Hackathon MVP  
**Primary owner:** Backend + Frontend team  
**AI/ML owner:** Separate team member  
**Hardware owner:** Electrical team

---

## 1. Architectural Principle

VOLTIS is designed as a factory-to-AI-to-action loop:

**Factory → Data Acquisition → Ingestion → Validation → Storage → Digital Twin / Analytics → AI/ML → Recommendation → What-If → Optimization → Approval → Measurement → Feedback**

The architecture should remain simple enough for a hackathon.

---

## 2. High-Level Architecture

```text
                           ┌─────────────────────────┐
                           │      FACTORY / OT       │
                           │ Sensors / ESP32 / PLC   │
                           └────────────┬────────────┘
                                        │
                              MQTT / REST / CSV
                                        │
                                        ▼
                           ┌─────────────────────────┐
                           │       FASTAPI            │
                           │   Backend/API Layer      │
                           └────────────┬────────────┘
                                        │
                     ┌──────────────────┼──────────────────┐
                     │                  │                  │
                     ▼                  ▼                  ▼
               PostgreSQL         AI/ML Module       OR-Tools
               Data Layer          (Friend)        Optimization
                     │                  │                  │
                     └──────────────────┼──────────────────┘
                                        │
                                        ▼
                           ┌─────────────────────────┐
                           │       FASTAPI            │
                           │ Aggregation / Business   │
                           │ Logic / Response Layer   │
                           └────────────┬────────────┘
                                        │
                                REST / WebSocket
                                        │
                                        ▼
                           ┌─────────────────────────┐
                           │       REACT UI           │
                           │ Dashboard / Digital Twin │
                           │ Analytics / Copilot      │
                           └─────────────────────────┘
```

---

## 3. Technology Stack

### Frontend

| Technology | Responsibility |
|---|---|
| React | UI |
| TypeScript | Type safety |
| Tailwind CSS | Dashboard styling |
| Recharts | Energy/optimization charts |
| Lucide React | Icons |
| Framer Motion | Subtle animations |
| Axios | API communication |

### Backend

| Technology | Responsibility |
|---|---|
| Python | Core backend/AI |
| FastAPI | REST API |
| Pydantic | Validation |
| Uvicorn | API server |
| WebSockets | Real-time updates |

### Data

| Technology | Responsibility |
|---|---|
| PostgreSQL | Main database |
| TimescaleDB | Optional time-series capability |
| Redis | Optional live-state/cache capability |

For the hackathon, PostgreSQL alone is sufficient.

### IoT

| Technology | Responsibility |
|---|---|
| ESP32 | Sensor node |
| MQTT | Telemetry |
| Mosquitto | MQTT broker |
| Modbus | Industrial integration capability |
| OPC-UA | Future industrial integration |

The actual prototype can use ESP32 + MQTT + Mosquitto.

### AI/ML

| Technology | Responsibility |
|---|---|
| Pandas | Data processing |
| NumPy | Numerical computation |
| Scikit-learn | ML |
| Isolation Forest | Anomaly detection |
| XGBoost | Predictive maintenance |
| LLM API | AI Copilot |

### Optimization

| Technology | Responsibility |
|---|---|
| Google OR-Tools | Production scheduling |
| Python | What-If calculations |

---

## 4. Logical Layers

### Layer 1 — Industrial Layer

Sources:

- Current sensor
- Voltage measurement
- Temperature sensor
- Vibration sensor
- Production/runtime data
- Existing PLC/SCADA data

Prototype path:

**Sensors → ESP32 → Wi-Fi → MQTT**

---

### Layer 2 — Data Ingestion

Responsibilities:

- receive MQTT messages,
- receive REST data,
- accept CSV/existing data where required,
- validate payload shape,
- normalize timestamps,
- forward clean data to storage.

---

### Layer 3 — Data Validation

Raw data can contain:

- missing values,
- impossible values,
- sensor spikes,
- duplicate records,
- timestamp problems,
- communication failures.

Flow:

```text
RAW DATA
   ↓
VALIDATION
   ↓
CLEAN DATA
   ↓
DATABASE
```

---

### Layer 4 — Data Layer

Core entities:

```text
Factory
Machine
SensorReading
Production
Maintenance
Alert
Recommendation
OptimizationScenario
```

---

### Layer 5 — Digital Twin

The digital twin is a live digital representation of the factory state.

It should combine:

- machine identity,
- machine status,
- current power/energy,
- operating state,
- production association,
- alerts,
- relevant health indicators.

The frontend visualizes this state.

---

### Layer 6 — Analytics / AI

Analytics should support:

- machine baseline,
- energy intensity,
- actual vs expected energy,
- anomaly detection,
- energy waste detection,
- root-cause analysis,
- predictive maintenance.

---

### Layer 7 — Recommendation

The system converts analytics into actionable recommendations.

Example:

```text
Problem:
Compressor #02 is 24.7% above expected consumption.

Likely cause:
Excessive idle operation / possible compressed-air leakage.

Actions:
1. Reduce idle operation.
2. Inspect air leakage.
3. Schedule maintenance.
```

---

### Layer 8 — What-If / Optimization

```text
Current Plan
     ↓
Energy Model
Production Model
Tariff Model
Machine Constraints
Carbon Model
     ↓
Alternative Plan
     ↓
Optimization
     ↓
Current vs Optimized
```

---

### Layer 9 — Presentation

React dashboard displays:

- KPIs,
- digital twin,
- alerts,
- charts,
- recommendations,
- optimization comparison,
- factory impact,
- AI Copilot.

---

## 5. Data Flow

### Normal Sensor Flow

```text
Sensor
  ↓
ESP32
  ↓
MQTT
  ↓
FastAPI MQTT consumer
  ↓
Validation
  ↓
PostgreSQL
  ↓
Analytics / AI
  ↓
FastAPI
  ↓
React
```

### Development Flow Before Hardware

```text
Mock Sensor Generator
  ↓
FastAPI
  ↓
PostgreSQL
  ↓
React
```

The mock payload must use the same logical structure as the expected hardware payload.

---

## 6. AI/ML Boundary

The AI/ML team owns the internal implementation of:

- preprocessing where required,
- anomaly detection,
- energy prediction/baseline,
- predictive maintenance,
- health/risk output.

The backend owns:

- receiving input data,
- calling the ML module/service,
- storing prediction results if required,
- exposing predictions through APIs.

The frontend only consumes structured backend responses.

This allows AI/ML development to happen independently.

---

## 7. Optimization Boundary

The optimization engine receives structured factory information:

- production orders,
- machine capacity,
- machine availability,
- energy tariff,
- operating hours,
- maintenance constraints.

It returns a feasible optimized plan and associated impact calculations.

The LLM must not directly control factory equipment.

---

## 8. Safety / Control Boundary

The system follows:

```text
AI detects problem
      ↓
AI proposes action
      ↓
Simulation
      ↓
Manager reviews
      ↓
APPROVE
      ↓
Authorized/simulated control instruction
```

The hackathon prototype should demonstrate simulated control rather than autonomous physical control.

---

## 9. Frontend Architecture

```text
frontend/
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
└── App.tsx
```

---

## 10. Backend Architecture

```text
backend/
└── app/
    ├── main.py
    ├── database.py
    ├── models/
    ├── schemas/
    ├── routes/
    └── services/
```

Routes should be separated by business capability instead of creating one giant route file.

---

## 11. Deployment Architecture

Hackathon deployment can be containerized:

```text
docker-compose
├── frontend
├── backend
├── postgres
└── mqtt
```

Kubernetes and Kafka are explicitly out of scope for this MVP.

---

## 12. Architecture Decisions

### Decision 1
Use one FastAPI backend instead of microservices.

### Decision 2
Use PostgreSQL as the primary database.

### Decision 3
Use MQTT for the demonstrated IoT telemetry path.

### Decision 4
Use React instead of Streamlit for the final UI because the required design is a polished industrial command centre.

### Decision 5
Use mock data during parallel development so hardware and software teams do not block each other.

### Decision 6
Keep AI/ML behind a stable contract so it can be integrated later.

### Decision 7
Keep numerical calculations in deterministic backend/Python logic where possible; use the LLM for explanation and natural-language interaction.

---

## 13. Reference UI Architecture

The target dashboard should contain:

```text
┌───────────────────────────────────────────────────────────────┐
│ Header / VOLTIS / Factory Manager                            │
├────────────┬──────────────────────────────────────────────────┤
│ Sidebar    │ KPI Cards                                        │
│            ├──────────────────────────────┬───────────────────┤
│ Dashboard  │ Live Factory — Digital Twin │ AI Insights        │
│ Factory    │                              │ & Alerts           │
│ Energy     │                              ├───────────────────┤
│ AI         │                              │ AI Copilot         │
│ Optimize   ├──────────────┬───────────────┤                   │
│ Maintenance│ Energy Trend │ What-If       │                   │
│ Carbon     │              │ Optimization  │                   │
│ Settings   └──────────────┴───────────────┴───────────────────┤
└────────────┴───────────────────────────────────────────────────┘
```

---

## 14. Architecture Success Condition

A developer should be able to replace:

```text
Mock Data
```

with:

```text
ESP32 → MQTT
```

without rewriting the React application.

Likewise, a developer should be able to replace:

```text
Mock ML Response
```

with:

```text
Actual AI/ML Response
```

without redesigning the frontend.
