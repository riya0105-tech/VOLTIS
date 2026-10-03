import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.optimization import (
    OptimizationSimulateRequest,
    OptimizationSimulateResponse,
    OptimizationApproveRequest,
    OptimizationApproveResponse,
)
from app.services import optimization_service

logger = logging.getLogger("voltis.routes.optimization")

router = APIRouter(prefix="/api/optimization", tags=["Optimization"])


@router.post(
    "/simulate",
    response_model=OptimizationSimulateResponse,
    summary="Simulate What-If Optimization Scenario",
    description="Simulates a production rescheduling scenario (e.g. moving a batch to off-peak hours) and compares current vs optimized energy, cost, CO2, and production output.",
)
def simulate_optimization(
    request: OptimizationSimulateRequest,
    db: Session = Depends(get_db),
):
    try:
        return optimization_service.simulate_optimization(db, request=request)
    except Exception as e:
        logger.error(f"Error simulating optimization scenario: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to run optimization simulation.",
        )


@router.post(
    "/approve",
    response_model=OptimizationApproveResponse,
    summary="Approve Optimization Scenario (Simulated)",
    description="Records approval of an optimization scenario and confirms simulated control instruction generation without sending commands to physical hardware.",
)
def approve_optimization(
    request: OptimizationApproveRequest,
    db: Session = Depends(get_db),
):
    try:
        result = optimization_service.approve_optimization(db, request=request)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Optimization scenario '{request.scenario_id}' not found.",
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving optimization scenario: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve optimization scenario.",
        )
