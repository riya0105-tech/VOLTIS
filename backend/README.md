# VOLTIS — Backend

AI-powered Energy Intelligence & Optimization Platform for Indian SMEs/Manufacturing Plants.

## Tech Stack
- **Python 3.10+**
- **FastAPI**
- **SQLAlchemy**
- **Pydantic v2**
- **PostgreSQL / SQLite (fallback)**
- **Uvicorn**

---

## Directory Structure
```text
backend/
├── app/
│   ├── main.py          # FastAPI application & lifecycle
│   ├── config.py        # Configuration with Pydantic Settings
│   ├── database.py      # SQLAlchemy connection & session dependency
│   ├── models/          # SQLAlchemy ORM models
│   ├── schemas/         # Pydantic schemas (request & response)
│   ├── routes/          # REST API endpoints
│   ├── services/        # Business logic & calculation services
│   └── seed/            # Deterministic mock data generation
├── requirements.txt     # Python dependencies
├── .env.example         # Environment template
└── README.md
```

---

## Quickstart

### 1. Setup Virtual Environment
```bash
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# Linux/macOS
source .venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
Copy `.env.example` to `.env` and configure your database and port:
```bash
cp .env.example .env
```

### 4. Run the Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Access Interactive API Documentation
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)
