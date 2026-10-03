import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import get_settings
from app.database import check_db_connection, create_tables

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("voltis.api")

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up VOLTIS Backend API...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Configured CORS origins: {settings.cors_origins_list}")
    if check_db_connection():
        create_tables()
    yield
    logger.info("Shutting down VOLTIS Backend API...")


app = FastAPI(
    title="VOLTIS API",
    description="AI-powered Energy Intelligence & Optimization Platform for Indian SMEs/Manufacturing Plants.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route Inclusions
from app.routes.factory_routes import router as factory_router
from app.routes.machine_routes import router as machine_router
from app.routes.energy_routes import router as energy_router
from app.routes.alert_routes import router as alert_router
from app.routes.maintenance_routes import router as maintenance_router
from app.routes.recommendation_routes import router as recommendation_router
from app.routes.optimization_routes import router as optimization_router
from app.routes.copilot_routes import router as copilot_router
from app.routes.ml_routes import router as ml_router
from app.routes.ingestion_routes import router as ingestion_router

app.include_router(factory_router)
app.include_router(machine_router)
app.include_router(energy_router)
app.include_router(alert_router)
app.include_router(maintenance_router)
app.include_router(recommendation_router)
app.include_router(optimization_router)
app.include_router(copilot_router)
app.include_router(ml_router)
app.include_router(ingestion_router)






@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred. Please try again later.",
        },
    )


@app.get("/", tags=["Health"])
def root():
    return {
        "name": "VOLTIS API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    db_ok = check_db_connection()
    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "version": "1.0.0",
    }
