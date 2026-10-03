import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.machine import MachineStatusResponse, MachineDetailResponse
from app.services import machine_service

logger = logging.getLogger("voltis.routes.machines")

router = APIRouter(prefix="/api/machines", tags=["Machines"])


@router.get(
    "",
    response_model=List[MachineStatusResponse],
    summary="Get All Machines",
    description="Returns list of all machines with current operating status, power, temperature, and vibration.",
)
def get_machines(db: Session = Depends(get_db)):
    try:
        return machine_service.get_all_machines(db)
    except Exception as e:
        logger.error(f"Error fetching machine list: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve machine list.",
        )


@router.get(
    "/{machine_id}",
    response_model=MachineDetailResponse,
    summary="Get Machine Details and Telemetry",
    description="Returns detailed machine identity, operating parameters, and recent telemetry data.",
)
def get_machine(machine_id: str, db: Session = Depends(get_db)):
    try:
        machine = machine_service.get_machine_by_id(db, machine_id=machine_id)
        if not machine:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Machine with id '{machine_id}' not found.",
            )
        return machine
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching machine '{machine_id}': {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve machine details for '{machine_id}'.",
        )
