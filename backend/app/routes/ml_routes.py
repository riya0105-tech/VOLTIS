"""ML Router for VOLTIS.

Exposes endpoints for evaluating machine telemetry against the AI/ML adapter interface.
Decoupled from model implementation details: works identically with the MockMLService
or any future production model plugged into the BaseMLAdapter boundary.
"""

import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.ml import MLPredictionResult, MLTelemetryInput
from app.services import ml_service

logger = logging.getLogger("voltis.routes.ml")

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])


@router.post(
    "/predict",
    response_model=MLPredictionResult,
    summary="Predict Machine Anomaly & Health from Telemetry",
    description="Evaluates a machine telemetry feature vector against the registered ML model adapter.",
)
def predict_telemetry_endpoint(
    telemetry: MLTelemetryInput,
):
    """
    POST /api/ml/predict
    Evaluates telemetry features (power_kw, voltage, current, temperature, vibration, etc.).
    """
    try:
        return ml_service.predict_telemetry(telemetry)
    except Exception as e:
        logger.error(f"Error executing ML prediction: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to execute ML prediction.",
        )


@router.get(
    "/prediction/{machine_id}",
    response_model=MLPredictionResult,
    summary="Get ML Prediction for Latest Machine Telemetry",
    description="Loads the latest sensor telemetry for machine_id from PostgreSQL and evaluates it through the ML adapter.",
)
def predict_machine_endpoint(
    machine_id: str,
    db: Session = Depends(get_db),
):
    """
    GET /api/ml/prediction/{machine_id}
    Retrieves latest telemetry from PostgreSQL for machine_id and generates prediction.
    """
    prediction = ml_service.predict_machine_from_db(db, machine_id)
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machine '{machine_id}' not found.",
        )
    return prediction


@router.get(
    "/predictions",
    response_model=List[MLPredictionResult],
    summary="Get ML Predictions for All Machines",
    description="Retrieves latest telemetry for all factory machines and generates predictions through the ML adapter.",
)
def predict_all_machines_endpoint(
    db: Session = Depends(get_db),
):
    """
    GET /api/ml/predictions
    Generates health and anomaly predictions for all factory machines.
    """
    try:
        return ml_service.predict_all_machines(db)
    except Exception as e:
        logger.error(f"Error predicting for all machines: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate ML predictions for machines.",
        )
