"""AI/ML Adapter Interface and Mock ML Provider for VOLTIS.

Provides an abstract integration boundary (BaseMLAdapter) that decouples the backend
API layer from the underlying machine learning model implementation.

A separate ML model developed by another team member can be plugged in by implementing
BaseMLAdapter and registering it via set_ml_adapter(), with ZERO changes required to the
FastAPI route handlers or downstream consumers.

Conceptual Flow:
    PostgreSQL sensor data
             ↓
    ML Adapter Interface (BaseMLAdapter)
             ↓
    Friend's ML Model (e.g. IsolationForest, XGBoost, or Microservice)
             ↓
    Structured Prediction (MLPredictionResult)
             ↓
    Backend services / APIs
"""

from abc import ABC, abstractmethod
import logging
from typing import Dict, List, Optional
from app.schemas.ml import MLPredictionResult, MLTelemetryInput

logger = logging.getLogger("voltis.ml.adapter")


class BaseMLAdapter(ABC):
    """
    Abstract Base Class defining the contract for all ML model providers.

    Any trained production model (Isolation Forest, XGBoost, Autoencoder, etc.)
    must inherit from this interface and implement the `predict` method.
    """

    @abstractmethod
    def predict(self, telemetry: MLTelemetryInput) -> MLPredictionResult:
        """
        Evaluate a single machine telemetry feature vector and return a structured
        anomaly and health assessment.

        Args:
            telemetry: Validated MLTelemetryInput feature vector.

        Returns:
            MLPredictionResult matching system-design.md integration contract.
        """
        pass

    def predict_batch(self, telemetries: List[MLTelemetryInput]) -> List[MLPredictionResult]:
        """
        Evaluate a batch of telemetry feature vectors.
        Can be overridden by subclasses for vectorized GPU/batch inference.
        """
        return [self.predict(t) for t in telemetries]


class MockMLService(BaseMLAdapter):
    """
    Deterministic Mock/Demo ML Provider for development, testing, and UI integration.

    NOTE: This is NOT a trained production model. It provides deterministic, structured
    responses aligned with the seeded VOLTIS factory scenarios (e.g. Compressor #02 anomaly,
    HVAC warning, and nominal equipment baseline).
    """

    # Baseline nominal power ratings (kW)
    NOMINAL_BASELINES: Dict[str, float] = {
        "transformer_01": 110.0,
        "compressor_01": 16.5,
        "compressor_02": 15.2,  # Nominal baseline before anomaly
        "furnace_01": 62.0,
        "hvac_01": 28.0,
        "motor_01": 17.0,
        "motor_02": 14.5,
        "pump_01": 11.2,
        "prod_line_01": 78.0,
    }

    def predict(self, telemetry: MLTelemetryInput) -> MLPredictionResult:
        """
        Deterministic evaluation of machine telemetry against known operational boundaries.
        """
        m_id = telemetry.machine_id.lower().strip()
        power = telemetry.power_kw
        vibration = telemetry.vibration or 0.0
        temp = telemetry.temperature or 0.0

        # Case 1: Seeded Compressor #02 Anomaly Scenario
        if m_id == "compressor_02":
            return MLPredictionResult(
                machine_id=telemetry.machine_id,
                status="ANOMALY",
                anomaly_score=0.87,
                health_score=82,
                risk="MEDIUM",
                possible_issue="Bearing degradation",
                expected_energy=15.2,
                energy_deviation_percent=31.0,
                estimated_waste_kwh=74.0,
                estimated_cost=1140.0,
                recommended_actions=[
                    "Reduce unloaded idle running hours via automatic pressure cutoff calibration",
                    "Inspect delivery manifold and pneumatic lines for compressed-air leakage",
                    "Schedule mechanical bearing lubrication and vibration spectrum analysis",
                ],
            )

        # Case 2: Seeded HVAC #01 Warning Scenario (High idle operation)
        if m_id == "hvac_01":
            return MLPredictionResult(
                machine_id=telemetry.machine_id,
                status="WARNING",
                anomaly_score=0.45,
                health_score=88,
                risk="LOW",
                possible_issue="High idle operation / schedule override",
                expected_energy=28.0,
                energy_deviation_percent=14.3,
                estimated_waste_kwh=42.0,
                estimated_cost=650.0,
                recommended_actions=[
                    "Re-enable automated temperature setback schedule for non-operational hours",
                    "Inspect condenser coil intake for airflow restrictions",
                    "Calibrate ambient enthalpy sensors",
                ],
            )

        # Case 3: Generic dynamic anomaly check for unseen machines or extreme test vectors
        # Note: Furnaces normally operate at high temperatures (150-200°C), so ignore temp for furnaces
        is_furnace = "furnace" in m_id
        if vibration >= 4.5 or (not is_furnace and temp >= 80.0 and power >= 20.0):
            return MLPredictionResult(
                machine_id=telemetry.machine_id,
                status="ANOMALY",
                anomaly_score=0.92,
                health_score=65,
                risk="HIGH",
                possible_issue="Severe mechanical vibration / thermal overload",
                expected_energy=self.NOMINAL_BASELINES.get(m_id, power * 0.75),
                energy_deviation_percent=33.3,
                estimated_waste_kwh=round(power * 0.3 * 24, 1),
                estimated_cost=round(power * 0.3 * 24 * 8.125, 1),
                recommended_actions=[
                    "Emergency shutdown and mechanical inspection",
                    "Check lubrication and bearing alignment",
                ],
            )

        # Case 4: Nominal Operation (Furnace, Motors, Pumps, Production Line, Transformer)
        baseline = self.NOMINAL_BASELINES.get(m_id, power)
        return MLPredictionResult(
            machine_id=telemetry.machine_id,
            status="NORMAL",
            anomaly_score=0.08,
            health_score=96,
            risk="LOW",
            possible_issue=None,
            expected_energy=baseline,
            energy_deviation_percent=0.0,
            estimated_waste_kwh=0.0,
            estimated_cost=0.0,
            recommended_actions=None,
        )


class ExternalMLModelAdapter(BaseMLAdapter):
    """
    Template / Scaffold adapter for plugging in a trained production model.

    To use:
    1. Implement inference logic in predict() using the teammate's trained model
       (e.g., joblib.load('isolation_forest.joblib') or an external inference API).
    2. Register the adapter instance at application startup:
       `set_ml_adapter(ExternalMLModelAdapter(...))`
    """

    def __init__(self, model_artifact: Optional[object] = None, model_name: str = "TrainedAnomalyModel"):
        self.model = model_artifact
        self.model_name = model_name
        logger.info(f"Initialized ExternalMLModelAdapter ({self.model_name})")

    def predict(self, telemetry: MLTelemetryInput) -> MLPredictionResult:
        if self.model is None:
            raise RuntimeError(
                f"ExternalMLModelAdapter ({self.model_name}) has no model artifact loaded."
            )
        # Real model inference call would happen here, mapping features -> prediction.
        # This illustrates the seamless integration contract.
        raise NotImplementedError("Production model inference not yet loaded.")


# =====================================================================
# Adapter Registry / Dependency Injection Boundary
# =====================================================================

_current_adapter: Optional[BaseMLAdapter] = None


def get_ml_adapter() -> BaseMLAdapter:
    """
    Retrieve the currently registered ML adapter.
    Defaults to MockMLService for development and testing.
    """
    global _current_adapter
    if _current_adapter is None:
        _current_adapter = MockMLService()
    return _current_adapter


def set_ml_adapter(adapter: BaseMLAdapter) -> None:
    """
    Register a custom or external ML adapter (e.g. teammate's trained model).
    Allows hot-swapping providers at runtime without touching any API code.
    """
    global _current_adapter
    if not isinstance(adapter, BaseMLAdapter):
        raise TypeError(f"Adapter must inherit from BaseMLAdapter, got {type(adapter)}")
    _current_adapter = adapter
    logger.info(f"Registered active ML Adapter: {adapter.__class__.__name__}")


def reset_ml_adapter() -> None:
    """Reset active ML adapter to default MockMLService."""
    global _current_adapter
    _current_adapter = MockMLService()
