import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.models import OptimizationScenario, Factory, ProductionRecord
from app.schemas.optimization import (
    OptimizationSimulateRequest,
    ScenarioMetrics,
    OptimizationSimulateResponse,
    OptimizationApproveRequest,
    OptimizationApproveResponse,
)

logger = logging.getLogger("voltis.services.optimization")


def simulate_optimization(
    db: Session, request: OptimizationSimulateRequest
) -> OptimizationSimulateResponse:
    """
    Run a What-If optimization simulation comparing:
    - Current: energy (kWh), cost (INR), CO2 (Tonnes), production (units)
    AGAINST
    - Optimized: energy (kWh), cost (INR), CO2 (Tonnes), production (units)

    Calculates:
    - energy_reduction_percent
    - co2_reduction_percent
    - cost savings
    - 0% production loss (preserves throughput)
    """
    # Check if a specific or existing scenario record matches
    scenario = None
    if request.scenario_id:
        scenario = db.query(OptimizationScenario).filter(OptimizationScenario.id == request.scenario_id).first()
    if not scenario:
        scenario = db.query(OptimizationScenario).first()

    # Determine baseline metrics from database or canonical model
    if scenario:
        curr_energy = scenario.current_energy_kwh
        opt_energy = scenario.optimized_energy_kwh
        curr_cost = scenario.current_cost
        opt_cost = scenario.optimized_cost
        curr_co2 = scenario.current_co2
        opt_co2 = scenario.optimized_co2
        scenario_id = scenario.id
    else:
        # Fallback to standard canonical baseline
        curr_energy = 12400.0
        opt_energy = 10950.0
        curr_cost = 118000.0
        opt_cost = 97600.0
        curr_co2 = 10.1
        opt_co2 = 8.9
        scenario_id = "scenario_001"

    # Production output remains preserved with 0% loss
    production_units = 2200.0

    # Mathematically exact reduction percentages
    energy_reduction_pct = round(((curr_energy - opt_energy) / curr_energy) * 100.0, 2)
    co2_reduction_pct = round(((curr_co2 - opt_co2) / curr_co2) * 100.0, 2)
    cost_saving = round(curr_cost - opt_cost, 2)

    return OptimizationSimulateResponse(
        scenario_name=request.scenario_name,
        scenario_id=scenario_id,
        current=ScenarioMetrics(
            energy_kwh=curr_energy,
            cost=curr_cost,
            co2_tonnes=curr_co2,
            production_units=production_units,
        ),
        optimized=ScenarioMetrics(
            energy_kwh=opt_energy,
            cost=opt_cost,
            co2_tonnes=opt_co2,
            production_units=production_units,
        ),
        energy_reduction_percent=energy_reduction_pct,
        co2_reduction_percent=co2_reduction_pct,
        cost_saving=cost_saving,
        production_change_percent=0.0,
    )


def approve_optimization(
    db: Session, request: OptimizationApproveRequest
) -> Optional[OptimizationApproveResponse]:
    """
    Simulated optimization approval:
    Records the decision by updating the scenario status in the database.
    SAFETY BOUNDARY: No physical hardware or industrial control signals are sent.
    """
    scenario = (
        db.query(OptimizationScenario)
        .filter(OptimizationScenario.id == request.scenario_id.strip())
        .first()
    )

    if not scenario:
        logger.warning(f"Scenario id '{request.scenario_id}' not found for approval.")
        return None

    # Update state to APPROVED in database
    scenario.status = "APPROVED"
    db.commit()
    db.refresh(scenario)

    logger.info(f"Optimization scenario '{scenario.id}' successfully approved (simulated control instruction generated).")

    return OptimizationApproveResponse(
        status="APPROVED",
        message="Optimization approved — simulated control instructions generated.",
    )
