import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.maintenance import MaintenanceRecordResponse
from app.services import maintenance_service

logger = logging.getLogger("voltis.routes.maintenance")

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance"])


@router.get(
    "",
    response_model=List[MaintenanceRecordResponse],
    summary="Get Maintenance Records",
    description="Returns maintenance logs with machine context, health score, and risk indicators. Supports filtering by machine_id and severity.",
)
def get_maintenance_records(
    machine_id: Optional[str] = Query(None, description="Filter by machine ID"),
    severity: Optional[str] = Query(None, description="Filter by severity: LOW, MEDIUM, HIGH, CRITICAL"),
    db: Session = Depends(get_db),
):
    try:
        return maintenance_service.get_maintenance_records(
            db, machine_id=machine_id, severity=severity
        )
    except Exception as e:
        logger.error(f"Error retrieving maintenance records: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve maintenance records.",
        )


@router.get(
    "/{maintenance_id}",
    response_model=MaintenanceRecordResponse,
    summary="Get Maintenance Record by ID",
    description="Returns a single maintenance record with machine information and health indicators.",
)
def get_maintenance_record(maintenance_id: int, db: Session = Depends(get_db)):
    try:
        record = maintenance_service.get_maintenance_record_by_id(db, record_id=maintenance_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Maintenance record with id '{maintenance_id}' not found.",
            )
        return record
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving maintenance record {maintenance_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve maintenance record {maintenance_id}.",
        )
