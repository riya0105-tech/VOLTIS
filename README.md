# VOLTIS — AI-Powered Energy Intelligence & Optimization Platform

**VOLTIS** is an industrial-grade energy intelligence, anomaly detection, and operational optimization platform designed specifically for Indian SME manufacturing plants (textiles, foundries, injection molding, metal fabrication). 

It connects factory telemetry, detects energy waste and bearing degradation, calculates actionable cost/carbon reductions through production rescheduling, provides an AI Copilot for energy managers, and exposes clean, typed REST APIs for modern React dashboards.

---

## 1. System Architecture & Data Flow

```text
┌────────────────────────────────────────────────────────┐
│             React Dashboard (Port 5173)                │
└──────────────────────────▲─────────────────────────────┘
                           │ HTTP / REST
┌──────────────────────────▼─────────────────────────────┐
│               VOLTIS FastAPI Backend (Port 8000)       │
│                                                        │
│  ┌───────────────────┐        ┌─────────────────────┐  │
│  │  REST API Layer   │        │ AI Copilot Service  │  │
│  └─────────┬─────────┘        └──────────┬──────────┘  │
│            │                             │             │
│  ┌─────────▼─────────┐        ┌──────────▼──────────┐  │
│  │ Ingestion Service │        │ What-If Optimizer   │  │
│  └─────────┬─────────┘        └──────────┬──────────┘  │
│            │                             │             │
│  ┌─────────▼─────────┐        ┌──────────▼──────────┐  │
│  │   BaseMLAdapter   │        │  SQLAlchemy Models  │  │
│  │ (Mock / External) │        │   (8 Core Tables)   │  │
│  └───────────────────┘        └──────────┬──────────┘  │
└──────────────────────────────────────────┼─────────────┘
                                           │
                               ┌───────────▼───────────┐
                               │ PostgreSQL (Port 5432)│
                               │   voltis_postgres     │
                               └───────────────────────┘

Future Industrial Telemetry Path:
ESP32 Current/Vibration Sensors ──► MQTT Broker (1883) ──► PahoMQTTAdapter ──► Telemetry Ingestion ──► PostgreSQL
```

---

## 2. Technology Stack

- **Framework**: FastAPI (Python 3.10+)
- **Server**: Uvicorn (ASGI)
- **Database**: PostgreSQL 15 (Docker) with SQLAlchemy 2.0 ORM
- **Validation**: Pydantic v2 (Strict Schema Enforcement)
- **Database Driver**: `psycopg2-binary`
- **MQTT Transport**: `paho-mqtt` (Decoupled transport boundary with Mock & Live adapters)
- **AI/ML Boundary**: Pluggable `BaseMLAdapter` with deterministic `MockMLService`
- **Testing**: Pytest (81 automated tests with zero live broker dependencies)

---

## 3. Project Structure

```text
voltis/
├── docker-compose.yml              # PostgreSQL 15 Alpine service (5432:5432)
├── PRD.md                          # Product requirements document
├── architecture.md                 # System architecture specification
├── system-design.md                # REST API & JSON contract specification
├── ANTIGRAVITY_BACKEND_MASTER_PROMPT.md
├── docs/
│   └── FRONTEND_HANDOFF.md         # Exhaustive API contracts for React frontend
└── backend/
    ├── requirements.txt            # Python dependencies
    ├── .env                        # Local development environment configuration (gitignored)
    ├── .env.example                # Template configuration
    ├── app/
    │   ├── main.py                 # FastAPI application, CORS, routers & exception handler
    │   ├── config.py               # Pydantic Settings (env loading)
    │   ├── database.py             # SQLAlchemy engine & session factory
    │   ├── models/                 # 8 SQLAlchemy ORM database models
    │   │   ├── factory.py
    │   │   ├── machine.py
    │   │   ├── sensor_reading.py
    │   │   ├── production_record.py
    │   │   ├── maintenance_record.py
    │   │   ├── alert.py
    │   │   ├── recommendation.py
    │   │   └── optimization_scenario.py
    │   ├── schemas/                # Pydantic request & response schemas
    │   │   ├── factory.py
    │   │   ├── machine.py
    │   │   ├── energy.py
    │   │   ├── alert.py
    │   │   ├── maintenance.py
    │   │   ├── recommendation.py
    │   │   ├── optimization.py
    │   │   ├── copilot.py
    │   │   ├── ml.py
    │   │   └── ingestion.py
    │   ├── routes/                 # FastAPI router endpoints
    │   │   ├── factory_routes.py
    │   │   ├── machine_routes.py
    │   │   ├── energy_routes.py
    │   │   ├── alert_routes.py
    │   │   ├── maintenance_routes.py
    │   │   ├── recommendation_routes.py
    │   │   ├── optimization_routes.py
    │   │   ├── copilot_routes.py
    │   │   ├── ml_routes.py
    │   │   └── ingestion_routes.py
    │   ├── services/               # Core analytical calculation services
    │   │   ├── factory_service.py
    │   │   ├── machine_service.py
    │   │   ├── energy_service.py
    │   │   ├── alert_service.py
    │   │   ├── maintenance_service.py
    │   │   ├── recommendation_service.py
    │   │   ├── optimization_service.py
    │   │   ├── copilot_service.py
    │   │   ├── ml_service.py
    │   │   └── ingestion_service.py
    │   ├── ml/                     # ML Adapter Interface & Mock Provider
    │   │   └── adapter.py
    │   ├── mqtt/                   # MQTT Adapter boundary & documentation
    │   │   ├── adapter.py
    │   │   └── README.md
    │   └── seed/                   # Deterministic mock dataset generator
    │       └── seed_data.py
    └── test_phase*.py              # Pytest test suites (Phases 4 through 11)
```

---

## 4. Local Development Setup (Windows PowerShell)

### Step 1: Start PostgreSQL via Docker Compose
From the repository root directory:
```powershell
docker compose up -d postgres
```
Verify the container is healthy:
```powershell
docker ps
```
*Container `voltis_postgres` runs on `localhost:5432` with database `voltis`, user `voltis`, password `voltis_dev`.*

### Step 2: Configure Environment Variables
Inside `backend/`, copy the environment template:
```powershell
Copy-Item backend\.env.example backend\.env
```
Ensure `backend/.env` contains:
```ini
DATABASE_URL=postgresql+psycopg2://voltis:voltis_dev@localhost:5432/voltis
ENVIRONMENT=development
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
EMISSION_FACTOR=0.82
MQTT_BROKER_HOST=localhost
MQTT_BROKER_PORT=1883
MQTT_TOPIC=voltis/factory/+/machine/+/telemetry
MQTT_ENABLED=false
LLM_API_KEY=
```

### Step 3: Setup Virtual Environment & Install Dependencies
Navigate into `backend/`:
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Step 4: Seed / Reset Mock Data
Populate PostgreSQL with the deterministic 48-hour factory dataset (1 factory, 9 machines, 432 sensor readings, 48 production records, 4 maintenance logs, 4 alerts, 2 recommendations, 1 optimization scenario):
```powershell
.\.venv\Scripts\python -c "from app.seed.seed_data import run_seed; run_seed(clear_existing=True)"
```

### Step 5: Start the FastAPI Backend
```powershell
.\.venv\Scripts\uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 5. API Documentation & Health Check

When running, access the interactive OpenAPI documentation:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Raw OpenAPI JSON**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

```bash
curl http://localhost:8000/health
```
```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## 6. Running Automated Tests

Run the complete 81-test verification suite across all backend phases:
```powershell
cd backend
.\.venv\Scripts\pytest -v
```

Expected result:
```text
======================== 81 passed, 1 warning in 3.58s ========================
```

---

## 7. Key Backend API Groups

| Group | Method | Endpoint | Description |
|---|---|---|---|
| **Factory** | `GET` | `/api/factory/overview` | Factory KPIs (Today's kWh, Cost, CO2, Energy Intensity) |
| **Machines** | `GET` | `/api/machines` | All 9 machines with status, power, temperature, vibration |
| **Machines** | `GET` | `/api/machines/{machine_id}` | Detailed telemetry and 24h history for a single machine |
| **Energy** | `GET` | `/api/energy/today` | 24 hourly data points (actual vs expected kWh, cost, intensity) |
| **Energy** | `GET` | `/api/energy/history` | Historical energy comparison with date and machine filtering |
| **Alerts** | `GET` | `/api/alerts` | Anomaly/warning alerts filtered by severity, status, or machine |
| **Maintenance**| `GET` | `/api/maintenance` | Maintenance records, health scores, and risk ratings |
| **Maintenance**| `GET` | `/api/maintenance/{id}` | Single maintenance log details |
| **Recommendations**| `GET` | `/api/recommendations` | Actionable recommendations with potential daily INR savings |
| **Optimization**| `POST` | `/api/optimization/simulate` | What-If shift rescheduling simulation (energy, cost, CO2 reduction) |
| **Optimization**| `POST` | `/api/optimization/approve` | Simulated control approval (no physical actuator dispatch) |
| **Copilot** | `POST` | `/api/copilot` | Natural language energy assistant grounded in PostgreSQL data |
| **ML Adapter**| `POST` | `/api/ml/predict` | Evaluate telemetry feature vector for anomalies |
| **ML Adapter**| `GET` | `/api/ml/prediction/{id}` | Evaluate latest PostgreSQL telemetry for a machine |
| **ML Adapter**| `GET` | `/api/ml/predictions` | Health and anomaly predictions for all factory equipment |
| **Telemetry** | `POST` | `/api/telemetry/ingest` | Ingest sensor reading directly via REST |
| **Health** | `GET` | `/health` | Health and database connection status |

For exhaustive schema definitions, query parameters, and example JSON bodies, see **[`docs/FRONTEND_HANDOFF.md`](file:///c:/Users/riya%20sharma/OneDrive/Desktop/voltis/docs/FRONTEND_HANDOFF.md)**.

---

## 8. Hackathon Demonstration Scenario

The database comes pre-seeded with a complete, coherent anomaly and optimization scenario designed for live demonstration:

1. **The Anomaly**: `compressor_02` (Air Compressor #02) exhibits elevated power draw ($22.1\text{ kW}$ vs $15.2\text{ kW}$ baseline), high vibration ($4.8\text{ mm/s}$), and high discharge heat ($72.5^\circ\text{C}$).
2. **The Alert**: Active high-severity alert `alert_001` identifies $74\text{ kWh/day}$ avoidable waste and ₹1,140/day financial loss.
3. **The Maintenance Record**: `maint_001` flags shaft bearing degradation and casing vibration.
4. **The Recommendation**: `rec_001` prescribes pressure cutoff recalibration, pneumatic leak inspection, and bearing lubrication with ₹1,140/day potential savings.
5. **The ML Adapter**: Evaluates `compressor_02` to `ANOMALY` with anomaly score $0.87$ and health score $82$.
6. **The AI Copilot**: When asked *"Why did electricity consumption increase yesterday?"*, calculates that `compressor_02` surged by $+141.2\text{ kWh}$ ($+37.3\%$) and accounts for $57.8\%$ of total active waste.
7. **The What-If Optimizer**: Simulates moving Batch B to off-peak night hours ($22:00$), cutting energy by $11.69\%$, carbon by $11.88\%$, and cost by ₹20,400 with $0.0\%$ production loss.
